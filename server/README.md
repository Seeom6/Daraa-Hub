# Daraa Authentication Server

A complete NestJS backend application with phone number-based authentication, OTP verification via Twilio, and JWT token management.

## 🚀 Features

### Authentication System
- **Multi-step Registration Flow**
  - Step 1: Phone number submission & OTP generation
  - Step 2: OTP verification with attempt limits
  - Step 3: Profile completion (full name, email, password)
- **Login System**: Phone number + password authentication
- **Password Reset Flow**
  - Forgot password with OTP verification
  - Secure password reset
- **JWT Authentication**: HTTP-only cookies for secure token storage
- **Protected Routes**: JWT guard for authenticated endpoints

### Security Features
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ HTTP-only cookies (secure, sameSite: strict)
- ✅ OTP expiration (5 minutes default)
- ✅ OTP attempt limits (3 attempts default)
- ✅ Automatic OTP cleanup (TTL indexes)
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ Global exception handling
- ✅ Request/response logging

### Technical Stack
- **Framework**: NestJS 10.x with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **SMS**: Twilio (with simulation mode for development)
- **Validation**: class-validator & class-transformer
- **Configuration**: @nestjs/config with environment variables

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Twilio account (optional for development)

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` file

3. **Start MongoDB**:
   ```bash
   # Make sure MongoDB is running on localhost:27017
   # Or update MONGODB_URI in .env
   ```

4. **Run the application**:
   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## 🔧 Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/daraa-auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cookie Configuration
COOKIE_SECRET=your-super-secret-cookie-key-change-this-in-production

# Twilio Configuration (Optional for development)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_LENGTH=6
```

### Important Notes:
- **Development Mode**: If Twilio credentials are not configured, SMS sending will be simulated and OTPs will be logged to the console
- **Production Mode**: Make sure to set strong secrets for JWT_SECRET and COOKIE_SECRET
- **Twilio**: Account SID must start with "AC" for validation

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Health Check
```http
GET /api
```

### Authentication Endpoints

#### 1. Register - Step 1 (Send OTP)
```http
POST /api/auth/register/step1
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

**Response**:
```json
{
  "message": "OTP sent successfully to +1234567890",
  "expiresIn": 300
}
```

#### 2. Register - Step 2 (Verify OTP)
```http
POST /api/auth/register/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response**:
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

#### 3. Register - Step 3 (Complete Profile)
```http
POST /api/auth/register/complete-profile
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "message": "Registration completed successfully",
  "user": {
    "_id": "...",
    "phoneNumber": "+1234567890",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isVerified": true
  }
}
```
*Sets JWT token in HTTP-only cookie*

#### 4. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "password": "SecurePassword123!"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "phoneNumber": "+1234567890",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```
*Sets JWT token in HTTP-only cookie*

#### 5. Logout
```http
POST /api/auth/logout
```

**Response**:
```json
{
  "message": "Logout successful"
}
```
*Clears JWT cookie*

#### 6. Get Current User (Protected)
```http
GET /api/auth/me
```

**Response**:
```json
{
  "_id": "...",
  "phoneNumber": "+1234567890",
  "fullName": "John Doe",
  "email": "john@example.com",
  "isVerified": true
}
```
*Requires valid JWT token in cookie*

#### 7. Forgot Password - Step 1 (Send OTP)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

**Response**:
```json
{
  "message": "Password reset OTP sent successfully",
  "expiresIn": 300
}
```

#### 8. Forgot Password - Step 2 (Verify OTP)
```http
POST /api/auth/forgot-password/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Response**:
```json
{
  "message": "OTP verified successfully",
  "verified": true
}
```

#### 9. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "newPassword": "NewSecurePassword123!"
}
```

**Response**:
```json
{
  "message": "Password reset successful"
}
```

## 🗄️ Database Schema

### User Collection
```typescript
{
  fullName: string;
  phoneNumber: string; // unique, indexed
  email?: string;
  password: string; // bcrypt hashed
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### OTP Collection
```typescript
{
  phoneNumber: string; // indexed
  otp: string; // bcrypt hashed
  expiresAt: Date; // TTL index for auto-deletion
  attempts: number;
  isUsed: boolean;
  type: 'registration' | 'forgot-password';
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testing

### Development Testing
In development mode, OTPs are logged to the console:
```
[SmsService] [SIMULATED SMS] To: +1234567890, Message: Your Daraa verification code is: 123456...
```

### Production Testing
For production, configure valid Twilio credentials in `.env` file.

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file to version control
2. **JWT Secret**: Use a strong, random secret (minimum 32 characters)
3. **Cookie Secret**: Use a different strong secret for cookies
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CLIENT_URL to match your frontend domain
6. **Rate Limiting**: Consider adding rate limiting for production
7. **MongoDB**: Use authentication and SSL for MongoDB in production

## 📁 Project Structure

```
server/
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── guards/          # JWT auth guard
│   │   ├── schemas/         # OTP schema
│   │   ├── strategies/      # JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/               # Users module
│   │   ├── schemas/         # User schema
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── sms/                 # SMS/Twilio module
│   │   ├── sms.service.ts
│   │   └── sms.module.ts
│   ├── common/              # Shared utilities
│   │   ├── filters/         # Exception filters
│   │   └── interceptors/    # Logging interceptors
│   ├── config/              # Configuration
│   │   └── configuration.ts
│   ├── app.module.ts
│   └── main.ts
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment file
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🐳 Docker Deployment

For containerized deployment with Docker and Docker Compose, see the [Docker Deployment Guide](../DOCKER.md).

**Quick Start with Docker:**

```bash
# From the root directory
docker-compose up -d
```

This will start both the NestJS server and MongoDB in containers with persistent data storage.

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET and COOKIE_SECRET
- [ ] Configure valid Twilio credentials
- [ ] Use MongoDB with authentication
- [ ] Enable HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up database backups

## 📝 License

This project is part of the Daraa application.

## 🤝 Support

For issues or questions, please contact the development team.

