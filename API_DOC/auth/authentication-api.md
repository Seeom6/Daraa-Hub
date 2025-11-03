# Authentication API Documentation

**Version**: 1.0.0  
**Base URL**: `http://localhost:3001/api`  
**Last Updated**: November 1, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [API Endpoints](#api-endpoints)
   - [Registration Flow](#registration-flow)
   - [Login & Logout](#login--logout)
   - [Password Reset Flow](#password-reset-flow)
   - [Protected Routes](#protected-routes)
4. [Data Models](#data-models)
5. [Validation Rules](#validation-rules)
6. [Error Responses](#error-responses)
7. [Security](#security)
8. [Code Examples](#code-examples)

---

## Overview

The Daraa Authentication API provides a secure, phone number-based authentication system with the following features:

- **Multi-step Registration**: 3-step registration process with OTP verification
- **Phone Number Authentication**: Login using phone number and password
- **JWT Tokens**: Secure authentication using JWT stored in HTTP-only cookies
- **Password Reset**: Secure password reset flow with OTP verification
- **Session Management**: Login/logout with automatic token management

### Key Features

- ✅ OTP-based phone verification via SMS (Twilio)
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ HTTP-only, Secure, SameSite cookies
- ✅ Rate limiting on OTP attempts (max 3)
- ✅ OTP expiration (5 minutes)
- ✅ Comprehensive input validation
- ✅ Generic error messages (prevents user enumeration)

---

## Authentication Flow

### Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► Step 1: Send OTP
    │   POST /api/auth/register/step1
    │   Body: { fullName, phoneNumber, countryCode }
    │   Response: { message: "OTP sent successfully..." }
    │
    ├─► Step 2: Verify OTP
    │   POST /api/auth/register/verify-otp
    │   Body: { phoneNumber, otp }
    │   Response: { message: "OTP verified...", verified: true }
    │
    └─► Step 3: Complete Profile
        POST /api/auth/register/complete-profile
        Body: { phoneNumber, email, password }
        Response: { message: "Registration completed...", user: {...} }
        Cookie: access_token (JWT)
```

### Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                            │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► Login
    │   POST /api/auth/login
    │   Body: { phoneNumber, password }
    │   Response: { message: "Login successful", user: {...} }
    │   Cookie: access_token (JWT)
    │
    ├─► Access Protected Routes
    │   GET /api/auth/me
    │   Cookie: access_token
    │   Response: { user: { userId, phoneNumber } }
    │
    └─► Logout
        POST /api/auth/logout
        Cookie: access_token
        Response: { message: "Logout successful" }
        Cookie: access_token (cleared)
```

### Password Reset Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  PASSWORD RESET FLOW                        │
└─────────────────────────────────────────────────────────────┘
    │
    ├─► Step 1: Request Reset OTP
    │   POST /api/auth/forgot-password
    │   Body: { phoneNumber }
    │   Response: { message: "If this phone number is registered..." }
    │
    ├─► Step 2: Verify Reset OTP
    │   POST /api/auth/forgot-password/verify-otp
    │   Body: { phoneNumber, otp }
    │   Response: { message: "OTP verified...", verified: true }
    │
    └─► Step 3: Reset Password
        POST /api/auth/reset-password
        Body: { phoneNumber, password }
        Response: { message: "Password reset successfully..." }
```

---

## API Endpoints

### Registration Flow

#### 1. Send Registration OTP

**Endpoint**: `POST /api/auth/register/step1`  
**Authentication**: Not required  
**Description**: Initiates the registration process by sending an OTP to the provided phone number.

**Request Body**:
```json
{
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "countryCode": "+1"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `fullName` | string | Yes | Min 2 characters | User's full name |
| `phoneNumber` | string | Yes | International format: `^\+?[1-9]\d{1,14}$` | User's phone number |
| `countryCode` | string | Yes | - | Country code (e.g., "+1", "+44") |

**Success Response** (200 OK):
```json
{
  "message": "OTP sent successfully to your phone number"
}
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | User already exists or validation failed |
| 500 | Internal Server Error | Failed to send OTP |

**Example Error Response** (400):
```json
{
  "statusCode": 400,
  "timestamp": "2025-11-01T13:30:00.000Z",
  "path": "/api/auth/register/step1",
  "method": "POST",
  "message": "User with this phone number already exists",
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/register/step1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "countryCode": "+1"
  }'
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/register/step1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    phoneNumber: '+1234567890',
    countryCode: '+1'
  })
});

const data = await response.json();
console.log(data.message);
```

---

#### 2. Verify Registration OTP

**Endpoint**: `POST /api/auth/register/verify-otp`  
**Authentication**: Not required  
**Description**: Verifies the OTP sent to the user's phone number during registration.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|-------------|-------------|
| `phoneNumber` | string | Yes | - | User's phone number |
| `otp` | string | Yes | Exactly 6 digits: `^\d{6}$` | OTP code received via SMS |

**Success Response** (200 OK):
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid OTP, expired OTP, or max attempts exceeded |

**Example Error Responses**:

**Invalid OTP** (400):
```json
{
  "statusCode": 400,
  "timestamp": "2025-11-01T13:30:00.000Z",
  "path": "/api/auth/register/verify-otp",
  "method": "POST",
  "message": "Invalid OTP. 2 attempt(s) remaining.",
  "error": "Bad Request"
}
```

**Expired OTP** (400):
```json
{
  "statusCode": 400,
  "message": "OTP has expired. Please request a new one.",
  "error": "Bad Request"
}
```

**Max Attempts Exceeded** (400):
```json
{
  "statusCode": 400,
  "message": "Maximum OTP verification attempts exceeded. Please request a new OTP.",
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/register/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    otp: '123456'
  })
});

const data = await response.json();
if (data.verified) {
  console.log('OTP verified successfully!');
}
```

---

#### 5. Logout

**Endpoint**: `POST /api/auth/logout`
**Authentication**: Required (JWT cookie)
**Description**: Logs out the user by clearing the JWT cookie.

**Request Headers**:
```
Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

**Response Headers**:
```
Set-Cookie: access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | No valid JWT token provided |

**Example Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Important: Include cookies
});

const data = await response.json();
console.log(data.message); // "Logout successful"
// JWT cookie is automatically cleared
```

---

### Password Reset Flow

#### 6. Request Password Reset OTP

**Endpoint**: `POST /api/auth/forgot-password`
**Authentication**: Not required
**Description**: Sends a password reset OTP to the user's phone number.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phoneNumber` | string | Yes | - | User's registered phone number |

**Success Response** (200 OK):
```json
{
  "message": "If this phone number is registered, you will receive an OTP shortly."
}
```

**Note**: The response is intentionally generic to prevent user enumeration attacks.

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Validation failed |
| 500 | Internal Server Error | Failed to send OTP |

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890"
  }'
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890'
  })
});

const data = await response.json();
console.log(data.message);
```

---

#### 7. Verify Password Reset OTP

**Endpoint**: `POST /api/auth/forgot-password/verify-otp`
**Authentication**: Not required
**Description**: Verifies the OTP sent for password reset.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phoneNumber` | string | Yes | - | User's phone number |
| `otp` | string | Yes | Exactly 6 digits: `^\d{6}$` | OTP code received via SMS |

**Success Response** (200 OK):
```json
{
  "message": "OTP verified successfully. You can now reset your password.",
  "verified": true
}
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Invalid OTP, expired OTP, or max attempts exceeded |

**Example Error Responses**:

**Invalid OTP** (400):
```json
{
  "statusCode": 400,
  "message": "Invalid OTP. 2 attempt(s) remaining.",
  "error": "Bad Request"
}
```

**Expired OTP** (400):
```json
{
  "statusCode": 400,
  "message": "OTP has expired. Please request a new one.",
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/forgot-password/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    otp: '123456'
  })
});

const data = await response.json();
if (data.verified) {
  console.log('OTP verified! You can now reset your password.');
}
```

---

#### 8. Reset Password

**Endpoint**: `POST /api/auth/reset-password`
**Authentication**: Not required (but OTP must be verified first)
**Description**: Resets the user's password after OTP verification.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "password": "NewSecurePass456!"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phoneNumber` | string | Yes | - | User's phone number |
| `password` | string | Yes | Min 8 chars, must contain uppercase, lowercase, number, special char | New password |

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)
- Pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]`

**Success Response** (200 OK):
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | OTP not verified, OTP expired, or validation failed |

**Example Error Responses**:

**OTP Not Verified** (400):
```json
{
  "statusCode": 400,
  "message": "Please verify OTP before resetting password.",
  "error": "Bad Request"
}
```

**OTP Verification Expired** (400):
```json
{
  "statusCode": 400,
  "message": "OTP verification expired. Please start the process again.",
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "NewSecurePass456!"
  }'
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    password: 'NewSecurePass456!'
  })
});

const data = await response.json();
console.log(data.message);
```

---

### Protected Routes

#### 9. Get Current User

**Endpoint**: `GET /api/auth/me`
**Authentication**: Required (JWT cookie)
**Description**: Retrieves the currently authenticated user's information.

**Request Headers**:
```
Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "user": {
    "userId": "690608b48a405b85894b9a2a",
    "phoneNumber": "+1234567890"
  }
}
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | No valid JWT token provided |

**Example Error Response** (401):
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/me', {
  method: 'GET',
  credentials: 'include' // Important: Include cookies
});

const data = await response.json();
if (response.ok) {
  console.log('Current user:', data.user);
}
```

---

## Data Models

### User Model

```typescript
{
  _id: string;              // MongoDB ObjectId
  fullName: string;         // User's full name
  phoneNumber: string;      // Unique phone number (international format)
  email?: string;           // Optional email address
  password: string;         // Bcrypt hashed password (not returned in responses)
  isVerified: boolean;      // Phone verification status
  createdAt: Date;          // Account creation timestamp
  updatedAt: Date;          // Last update timestamp
  __v: number;              // MongoDB version key
}
```

**Example**:
```json
{
  "_id": "690608b48a405b85894b9a2a",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "isVerified": true,
  "createdAt": "2025-11-01T13:18:44.253Z",
  "updatedAt": "2025-11-01T13:18:44.253Z",
  "__v": 0
}
```

**Note**: The `password` field is never returned in API responses for security.

---

### OTP Model

```typescript
{
  _id: string;              // MongoDB ObjectId
  phoneNumber: string;      // Phone number (indexed)
  otp: string;              // Bcrypt hashed OTP
  expiresAt: Date;          // OTP expiration timestamp
  attempts: number;         // Number of verification attempts (max 3)
  isUsed: boolean;          // Whether OTP has been used
  type: string;             // 'registration' or 'forgot-password'
  createdAt: Date;          // OTP creation timestamp
  updatedAt: Date;          // Last update timestamp
}
```

**Example**:
```json
{
  "_id": "690608b48a405b85894b9a2b",
  "phoneNumber": "+1234567890",
  "otp": "$2b$10$N9xZFWCo3DSJ.ABAbKdNCu...",
  "expiresAt": "2025-11-01T13:25:00.000Z",
  "attempts": 0,
  "isUsed": false,
  "type": "registration",
  "createdAt": "2025-11-01T13:20:00.000Z",
  "updatedAt": "2025-11-01T13:20:00.000Z"
}
```

**Note**: OTPs are automatically deleted after expiration using MongoDB TTL index.

---

### JWT Payload

```typescript
{
  sub: string;              // User ID (MongoDB ObjectId)
  phoneNumber: string;      // User's phone number
  iat: number;              // Issued at (Unix timestamp)
  exp: number;              // Expiration (Unix timestamp)
}
```

**Example**:
```json
{
  "sub": "690608b48a405b85894b9a2a",
  "phoneNumber": "+1234567890",
  "iat": 1762003882,
  "exp": 1762608682
}
```

---

## Validation Rules

### Phone Number Validation

- **Format**: International format with optional `+` prefix
- **Pattern**: `^\+?[1-9]\d{1,14}$`
- **Examples**:
  - ✅ Valid: `+1234567890`, `+447911123456`, `+919876543210`
  - ❌ Invalid: `1234567890` (missing country code), `+0123456789` (starts with 0)

### Password Validation

- **Minimum Length**: 8 characters
- **Required Characters**:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one digit (0-9)
  - At least one special character (@$!%*?&)
- **Pattern**: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]`
- **Examples**:
  - ✅ Valid: `SecurePass123!`, `MyP@ssw0rd`, `Test1234!`
  - ❌ Invalid: `password` (no uppercase, number, special char), `PASSWORD123` (no lowercase, special char)

### OTP Validation

- **Format**: Exactly 6 digits
- **Pattern**: `^\d{6}$`
- **Examples**:
  - ✅ Valid: `123456`, `000000`, `999999`
  - ❌ Invalid: `12345` (too short), `1234567` (too long), `12345a` (contains letter)

### Email Validation

- **Format**: Standard email format
- **Required**: No (optional field)
- **Examples**:
  - ✅ Valid: `user@example.com`, `john.doe@company.co.uk`
  - ❌ Invalid: `invalid-email`, `@example.com`, `user@`

### Full Name Validation

- **Minimum Length**: 2 characters
- **Type**: String
- **Examples**:
  - ✅ Valid: `John Doe`, `李明`, `José García`
  - ❌ Invalid: `J` (too short)

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{
  "statusCode": number,
  "timestamp": "ISO 8601 timestamp",
  "path": "API endpoint path",
  "method": "HTTP method",
  "message": "Error message or array of validation errors",
  "error": "Error type"
}
```

### Common HTTP Status Codes

| Status Code | Meaning | When It Occurs |
|-------------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input, validation failed, or business logic error |
| 401 | Unauthorized | Authentication required or failed |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Validation Error Response

When multiple validation errors occur:

```json
{
  "statusCode": 400,
  "timestamp": "2025-11-01T13:30:00.000Z",
  "path": "/api/auth/register/step1",
  "method": "POST",
  "message": [
    "Full name must be at least 2 characters long",
    "Phone number must be a valid international format",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request"
}
```

### Common Error Messages

#### Registration Errors

| Error Message | Status | Cause |
|---------------|--------|-------|
| "User with this phone number already exists" | 400 | Phone number already registered |
| "Failed to send OTP. Please try again." | 400 | SMS service failure |
| "No OTP found for this phone number" | 400 | OTP not requested or expired |
| "OTP has expired. Please request a new one." | 400 | OTP older than 5 minutes |
| "Invalid OTP. X attempt(s) remaining." | 400 | Wrong OTP code |
| "Maximum OTP verification attempts exceeded. Please request a new OTP." | 400 | 3 failed attempts |
| "Phone number not verified. Please complete OTP verification first." | 400 | Trying to complete profile without OTP verification |
| "OTP verification expired. Please start registration again." | 400 | OTP verified more than 10 minutes ago |

#### Login Errors

| Error Message | Status | Cause |
|---------------|--------|-------|
| "Invalid phone number or password" | 401 | Wrong credentials |
| "Unauthorized" | 401 | No JWT token or invalid token |

#### Password Reset Errors

| Error Message | Status | Cause |
|---------------|--------|-------|
| "If this phone number is registered, you will receive an OTP shortly." | 200 | Generic response (security) |
| "No OTP found for password reset" | 400 | OTP not requested |
| "Please verify OTP before resetting password." | 400 | Trying to reset without OTP verification |
| "OTP verification expired. Please start the process again." | 400 | OTP verified more than 10 minutes ago |

---

## Security

### Authentication Mechanism

- **JWT Tokens**: JSON Web Tokens for stateless authentication
- **Storage**: HTTP-only cookies (not accessible via JavaScript)
- **Expiration**: 7 days (604800 seconds)
- **Algorithm**: HS256 (HMAC with SHA-256)

### Cookie Configuration

```javascript
{
  httpOnly: true,           // Prevents XSS attacks
  secure: true,             // HTTPS only (in production)
  sameSite: 'strict',       // CSRF protection
  maxAge: 604800000         // 7 days in milliseconds
}
```

### Password Security

- **Hashing Algorithm**: Bcrypt
- **Salt Rounds**: 10
- **Storage**: Hashed passwords only (never plain text)
- **Validation**: Server-side only

### OTP Security

- **Hashing**: OTPs are hashed with Bcrypt before storage
- **Expiration**: 5 minutes
- **Attempt Limiting**: Maximum 3 verification attempts
- **Auto-Cleanup**: Expired OTPs automatically deleted via MongoDB TTL index
- **One-Time Use**: OTPs marked as used after successful verification

### CORS Configuration

- **Allowed Origin**: `http://localhost:3000` (development)
- **Credentials**: Enabled (allows cookies)
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization

### Rate Limiting

- **OTP Attempts**: Maximum 3 attempts per OTP
- **OTP Requests**: New OTP can be requested after previous one expires

### Security Best Practices

1. ✅ **Password Hashing**: Bcrypt with 10 salt rounds
2. ✅ **HTTP-only Cookies**: JWT not accessible via JavaScript
3. ✅ **Secure Cookies**: HTTPS only in production
4. ✅ **SameSite Cookies**: CSRF protection
5. ✅ **Generic Error Messages**: Prevents user enumeration
6. ✅ **OTP Expiration**: 5-minute window
7. ✅ **Attempt Limiting**: Max 3 OTP verification attempts
8. ✅ **Input Validation**: All inputs validated with class-validator
9. ✅ **JWT Expiration**: 7-day token lifetime
10. ✅ **Auto-Cleanup**: Expired OTPs automatically deleted

---

## Code Examples

### Complete Registration Flow (JavaScript)

```javascript
// Step 1: Send OTP
async function sendRegistrationOTP(fullName, phoneNumber, countryCode) {
  const response = await fetch('http://localhost:3001/api/auth/register/step1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, phoneNumber, countryCode })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message); // "OTP sent successfully..."
  return data;
}

// Step 2: Verify OTP
async function verifyRegistrationOTP(phoneNumber, otp) {
  const response = await fetch('http://localhost:3001/api/auth/register/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message); // "OTP verified successfully"
  return data.verified;
}

// Step 3: Complete Profile
async function completeRegistration(phoneNumber, email, password) {
  const response = await fetch('http://localhost:3001/api/auth/register/complete-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({ phoneNumber, email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log('User registered:', data.user);
  // JWT token is automatically stored in HTTP-only cookie
  return data.user;
}

// Complete flow
async function registerUser() {
  try {
    // Step 1
    await sendRegistrationOTP('John Doe', '+1234567890', '+1');

    // User receives OTP via SMS
    const userOTP = prompt('Enter OTP received via SMS:');

    // Step 2
    const verified = await verifyRegistrationOTP('+1234567890', userOTP);

    if (verified) {
      // Step 3
      const user = await completeRegistration(
        '+1234567890',
        'john@example.com',
        'SecurePass123!'
      );

      console.log('Registration complete!', user);
    }
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}
```

---

### Complete Login Flow (JavaScript)

```javascript
async function login(phoneNumber, password) {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important: Include cookies
    body: JSON.stringify({ phoneNumber, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log('Login successful:', data.user);
  // JWT token is automatically stored in HTTP-only cookie
  return data.user;
}

async function getCurrentUser() {
  const response = await fetch('http://localhost:3001/api/auth/me', {
    method: 'GET',
    credentials: 'include' // Important: Include cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  return data.user;
}

async function logout() {
  const response = await fetch('http://localhost:3001/api/auth/logout', {
    method: 'POST',
    credentials: 'include' // Important: Include cookies
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message); // "Logout successful"
  // JWT cookie is automatically cleared
}

// Usage
async function loginFlow() {
  try {
    // Login
    const user = await login('+1234567890', 'SecurePass123!');

    // Get current user
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);

    // Logout
    await logout();
  } catch (error) {
    console.error('Login flow failed:', error.message);
  }
}
```

---

### Complete Password Reset Flow (JavaScript)

```javascript
// Step 1: Request Password Reset OTP
async function requestPasswordReset(phoneNumber) {
  const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message);
  return data;
}

// Step 2: Verify Password Reset OTP
async function verifyPasswordResetOTP(phoneNumber, otp) {
  const response = await fetch('http://localhost:3001/api/auth/forgot-password/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, otp })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message);
  return data.verified;
}

// Step 3: Reset Password
async function resetPassword(phoneNumber, newPassword) {
  const response = await fetch('http://localhost:3001/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, password: newPassword })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message);
  }

  console.log(data.message);
  return data;
}

// Complete flow
async function passwordResetFlow() {
  try {
    // Step 1
    await requestPasswordReset('+1234567890');

    // User receives OTP via SMS
    const userOTP = prompt('Enter OTP received via SMS:');

    // Step 2
    const verified = await verifyPasswordResetOTP('+1234567890', userOTP);

    if (verified) {
      // Step 3
      await resetPassword('+1234567890', 'NewSecurePass456!');
      console.log('Password reset complete! You can now login with your new password.');
    }
  } catch (error) {
    console.error('Password reset failed:', error.message);
  }
}
```

---

### React Hook Example

```typescript
// useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  userId: string;
  phoneNumber: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError('Failed to check authentication');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(phoneNumber: string, password: string) {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNumber, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user
  };
}

// Usage in component
function LoginPage() {
  const { login, loading, error } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(phoneNumber, password);
      // Redirect to dashboard
    } catch (err) {
      // Error is already set in the hook
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="tel"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Phone Number"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

---

### Error Handling Example

```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include' // Always include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different error types
      switch (response.status) {
        case 400:
          // Validation error or business logic error
          if (Array.isArray(data.message)) {
            // Multiple validation errors
            throw new Error(data.message.join(', '));
          } else {
            throw new Error(data.message);
          }

        case 401:
          // Unauthorized - redirect to login
          window.location.href = '/login';
          throw new Error('Please login to continue');

        case 404:
          throw new Error('Resource not found');

        case 500:
          throw new Error('Server error. Please try again later.');

        default:
          throw new Error(data.message || 'An error occurred');
      }
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
}

// Usage
async function loginWithErrorHandling(phoneNumber, password) {
  try {
    const data = await apiCall('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password })
    });

    console.log('Login successful:', data.user);
    return data.user;
  } catch (error) {
    console.error('Login failed:', error.message);
    // Show error to user
    alert(error.message);
  }
}
```

---

## Testing with cURL

### Complete Registration Flow

```bash
# Step 1: Send OTP
curl -X POST http://localhost:3001/api/auth/register/step1 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "phoneNumber": "+1234567890",
    "countryCode": "+1"
  }'

# Check server logs for OTP code
docker-compose logs -f server | grep "Generated OTP"

# Step 2: Verify OTP (replace 123456 with actual OTP from logs)
curl -X POST http://localhost:3001/api/auth/register/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'

# Step 3: Complete Profile
curl -X POST http://localhost:3001/api/auth/register/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt \
  -v
```

### Complete Login Flow

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt \
  -v

# Get current user
curl -X GET http://localhost:3001/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

### Complete Password Reset Flow

```bash
# Step 1: Request Password Reset
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890"
  }'

# Check server logs for OTP
docker-compose logs -f server | grep "password reset OTP"

# Step 2: Verify OTP (replace 123456 with actual OTP)
curl -X POST http://localhost:3001/api/auth/forgot-password/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "otp": "123456"
  }'

# Step 3: Reset Password
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "NewSecurePass456!"
  }'

# Login with new password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "NewSecurePass456!"
  }' \
  -c cookies.txt
```

---

## Quick Reference

### Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register/step1` | No | Send registration OTP |
| POST | `/api/auth/register/verify-otp` | No | Verify registration OTP |
| POST | `/api/auth/register/complete-profile` | No* | Complete registration |
| POST | `/api/auth/login` | No | Login with credentials |
| POST | `/api/auth/logout` | Yes | Logout user |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/forgot-password` | No | Request password reset OTP |
| POST | `/api/auth/forgot-password/verify-otp` | No | Verify password reset OTP |
| POST | `/api/auth/reset-password` | No* | Reset password |

**Note**: * = Requires prior OTP verification

---

## Environment Variables

The following environment variables are required for the authentication system:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://mongodb:27017/daraa-auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECRET=your-super-secret-cookie-key-change-this-in-production

# Twilio SMS Configuration (Optional - uses simulation if not provided)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_LENGTH=6

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

---

## Support

For issues or questions:
- Check the error response message for details
- Review the validation rules section
- Ensure all required fields are provided
- Verify phone number format (international format)
- Check server logs for OTP codes during development

---

**End of Documentation**

#### 3. Complete Registration Profile

**Endpoint**: `POST /api/auth/register/complete-profile`  
**Authentication**: Not required (but OTP must be verified first)  
**Description**: Completes the registration by creating the user account with email and password.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phoneNumber` | string | Yes | - | User's verified phone number |
| `email` | string | No | Valid email format | User's email address (optional) |
| `password` | string | Yes | Min 8 chars, must contain uppercase, lowercase, number, special char | User's password |

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)
- Pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]`

**Success Response** (201 Created):
```json
{
  "message": "Registration completed successfully",
  "user": {
    "fullName": "User",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "isVerified": true,
    "_id": "690608b48a405b85894b9a2a",
    "createdAt": "2025-11-01T13:18:44.253Z",
    "updatedAt": "2025-11-01T13:18:44.253Z",
    "__v": 0
  }
}
```

**Response Headers**:
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Strict
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Phone not verified, OTP expired, or validation failed |

**Example Error Response** (400):
```json
{
  "statusCode": 400,
  "message": "Phone number not verified. Please complete OTP verification first.",
  "error": "Bad Request"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/register/complete-profile \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/register/complete-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log('User registered:', data.user);
// JWT token is automatically stored in HTTP-only cookie
```

---

### Login & Logout

#### 4. Login

**Endpoint**: `POST /api/auth/login`  
**Authentication**: Not required  
**Description**: Authenticates a user with phone number and password.

**Request Body**:
```json
{
  "phoneNumber": "+1234567890",
  "password": "SecurePass123!"
}
```

**Request Body Schema**:

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `phoneNumber` | string | Yes | - | User's registered phone number |
| `password` | string | Yes | - | User's password |

**Success Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "_id": "690608b48a405b85894b9a2a",
    "fullName": "User",
    "phoneNumber": "+1234567890",
    "email": "john@example.com",
    "isVerified": true,
    "createdAt": "2025-11-01T13:18:44.253Z",
    "updatedAt": "2025-11-01T13:18:44.253Z",
    "__v": 0
  }
}
```

**Response Headers**:
```
Set-Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; 
            Max-Age=604800; Path=/; HttpOnly; Secure; SameSite=Strict
```

**Error Responses**:

| Status Code | Error | Description |
|-------------|-------|-------------|
| 401 | Unauthorized | Invalid phone number or password |

**Example Error Response** (401):
```json
{
  "statusCode": 401,
  "timestamp": "2025-11-01T13:30:00.000Z",
  "path": "/api/auth/login",
  "method": "POST",
  "message": "Invalid phone number or password",
  "error": "Unauthorized"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

**JavaScript/Fetch Example**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: Include cookies
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
if (response.ok) {
  console.log('Login successful:', data.user);
  // JWT token is automatically stored in HTTP-only cookie
}
```

---


