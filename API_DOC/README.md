# Daraa API Documentation

Welcome to the Daraa API documentation! This folder contains comprehensive documentation for all API endpoints in the Daraa application.

## 📁 Contents

### Authentication API

- **[authentication-api.md](auth/authentication-api.md)** - Complete API documentation for the authentication system
  - Overview of the authentication system
  - All API endpoints with detailed specifications
  - Request/response examples
  - Data models and validation rules
  - Security information
  - Code examples in JavaScript/TypeScript
  - cURL examples for testing

- **[auth-endpoints.postman_collection.json](auth/auth-endpoints.postman_collection.json)** - Postman collection for testing
  - Pre-configured requests for all endpoints
  - Organized folders for different flows
  - Automated tests for validating responses
  - Environment variables for easy configuration

---

## 🚀 Quick Start

### Using the Markdown Documentation

1. Open [auth/authentication-api.md](auth/authentication-api.md)
2. Browse the table of contents to find the endpoint you need
3. Review the request/response format
4. Copy the code examples (JavaScript or cURL)
5. Integrate into your application

### Using the Postman Collection

1. **Import the Collection**:
   - Open Postman
   - Click "Import" button
   - Select `auth-endpoints.postman_collection.json`
   - Click "Import"

2. **Configure Environment Variables**:
   - The collection includes default variables:
     - `baseUrl`: `http://localhost:3001/api`
     - `phoneNumber`: `+1234567890`
     - `otp`: `123456`
   - Update these values as needed

3. **Run Requests**:
   - Navigate through the folders (Registration Flow, Login & Logout, etc.)
   - Click on a request to view details
   - Click "Send" to execute the request
   - View the response and test results

4. **Testing Flows**:
   - **Registration Flow**: Run requests 1 → 2 → 3 in order
   - **Login Flow**: Run Login → Get Current User → Logout
   - **Password Reset Flow**: Run requests 1 → 2 → 3 in order

---

## 📖 Documentation Structure

### Authentication API Documentation

The authentication API documentation is organized into the following sections:

1. **Overview** - Introduction to the authentication system
2. **Authentication Flow** - Visual diagrams of registration, login, and password reset flows
3. **API Endpoints** - Detailed documentation for each endpoint:
   - HTTP method and path
   - Authentication requirements
   - Request body schema with validation rules
   - Success and error responses
   - cURL and JavaScript examples
4. **Data Models** - User and OTP data structures
5. **Validation Rules** - Input validation requirements
6. **Error Responses** - Common error messages and status codes
7. **Security** - Security features and best practices
8. **Code Examples** - Complete flow examples in JavaScript/TypeScript

---

## 🔑 Key Features

### Authentication System

- ✅ **Multi-step Registration**: 3-step process with OTP verification
- ✅ **Phone Number Authentication**: Login using phone number and password
- ✅ **JWT Tokens**: Secure authentication with 7-day expiration
- ✅ **HTTP-only Cookies**: XSS protection
- ✅ **Password Reset**: Secure password reset with OTP verification
- ✅ **Session Management**: Login/logout with automatic token management

### Security Features

- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ JWT tokens stored in HTTP-only cookies
- ✅ Secure and SameSite cookie attributes
- ✅ OTP expiration (5 minutes)
- ✅ Rate limiting on OTP attempts (max 3)
- ✅ Generic error messages (prevents user enumeration)
- ✅ Comprehensive input validation

---

## 🌐 Base URL

**Development**: `http://localhost:3001/api`  
**Production**: Update to your production URL

---

## 📝 API Endpoints Summary

### Registration Flow

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register/step1` | POST | Send registration OTP |
| `/auth/register/verify-otp` | POST | Verify registration OTP |
| `/auth/register/complete-profile` | POST | Complete registration |

### Login & Logout

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | Login with credentials |
| `/auth/logout` | POST | Logout user |

### Protected Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/me` | GET | Get current user |

### Password Reset Flow

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/forgot-password` | POST | Request password reset OTP |
| `/auth/forgot-password/verify-otp` | POST | Verify password reset OTP |
| `/auth/reset-password` | POST | Reset password |

---

## 🧪 Testing

### Using cURL

Check the [authentication-api.md](auth/authentication-api.md) file for complete cURL examples for each endpoint.

**Example - Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "SecurePass123!"
  }' \
  -c cookies.txt
```

### Using Postman

1. Import the `auth-endpoints.postman_collection.json` file
2. Update environment variables if needed
3. Run requests individually or use the Collection Runner for automated testing

### Using JavaScript/Fetch

Check the [authentication-api.md](auth/authentication-api.md) file for complete JavaScript examples.

**Example - Login**:
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    phoneNumber: '+1234567890',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
console.log('Login successful:', data.user);
```

---

## 🔐 Authentication

Most endpoints use JWT tokens stored in HTTP-only cookies for authentication.

### How It Works

1. **Login/Registration**: Server sets `access_token` cookie with JWT
2. **Subsequent Requests**: Browser automatically sends cookie with requests
3. **Protected Routes**: Server validates JWT from cookie
4. **Logout**: Server clears the `access_token` cookie

### Important Notes

- Always include `credentials: 'include'` in fetch requests
- Use `-c cookies.txt` and `-b cookies.txt` flags in cURL
- JWT tokens expire after 7 days
- Cookies are HTTP-only (not accessible via JavaScript)

---

## ⚠️ Common Issues

### Issue: "Unauthorized" error on protected routes

**Solution**: Make sure you're logged in and sending cookies with the request.

- **Fetch**: Add `credentials: 'include'`
- **cURL**: Use `-b cookies.txt` flag
- **Postman**: Enable "Send cookies" in settings

### Issue: OTP verification fails

**Solution**: 
- Check server logs for the actual OTP code (development mode)
- Ensure OTP hasn't expired (5-minute window)
- Verify you haven't exceeded max attempts (3 attempts)

### Issue: Validation errors

**Solution**: Review the validation rules in the documentation:
- Phone number must be in international format (e.g., `+1234567890`)
- Password must be at least 8 characters with uppercase, lowercase, number, and special character
- OTP must be exactly 6 digits

---

## 📚 Additional Resources

- **Server Logs**: Check OTP codes during development
  ```bash
  docker-compose logs -f server | grep "OTP"
  ```

- **Database**: View users and OTPs in MongoDB
  ```bash
  docker-compose exec mongodb mongosh daraa-auth --eval "db.users.find().pretty()"
  ```

- **Environment Variables**: See `.env` file for configuration options

---

## 🤝 Support

For issues or questions:
1. Review the detailed documentation in [authentication-api.md](auth/authentication-api.md)
2. Check the error response message for details
3. Verify your request matches the examples
4. Check server logs for debugging information

---

## 📄 License

This documentation is part of the Daraa project.

---

**Last Updated**: November 1, 2025  
**Version**: 1.0.0

