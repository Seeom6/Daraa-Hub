# Postman Collection Guide

This guide will help you import and use the Daraa Authentication API Postman collection.

---

## 📥 Importing the Collection

### Method 1: Import from File

1. **Open Postman**
   - Launch the Postman application or open [Postman Web](https://web.postman.co/)

2. **Click Import**
   - Click the "Import" button in the top-left corner
   - Or use keyboard shortcut: `Ctrl+O` (Windows/Linux) or `Cmd+O` (Mac)

3. **Select File**
   - Click "Upload Files" or drag and drop
   - Navigate to `API_DOC/auth/auth-endpoints.postman_collection.json`
   - Click "Open"

4. **Confirm Import**
   - Review the collection details
   - Click "Import"

5. **Success!**
   - The collection will appear in your Collections sidebar
   - Named: "Daraa Authentication API"

---

## ⚙️ Configuring Environment Variables

The collection includes default variables that you can customize:

### Collection Variables

1. **View Variables**:
   - Click on the collection name
   - Go to the "Variables" tab

2. **Default Variables**:
   - `baseUrl`: `http://localhost:3001/api`
   - `phoneNumber`: `+1234567890`
   - `otp`: `123456`

3. **Update Variables**:
   - Change the "Current Value" column
   - Click "Save"

### Creating an Environment (Optional)

For managing multiple environments (dev, staging, production):

1. **Create Environment**:
   - Click "Environments" in the sidebar
   - Click "+" to create new environment
   - Name it (e.g., "Daraa Development")

2. **Add Variables**:
   ```
   baseUrl: http://localhost:3001/api
   phoneNumber: +1234567890
   otp: 123456
   ```

3. **Select Environment**:
   - Use the environment dropdown in the top-right
   - Select your environment

---

## 🚀 Using the Collection

### Collection Structure

```
Daraa Authentication API
├── Registration Flow
│   ├── 1. Send Registration OTP
│   ├── 2. Verify Registration OTP
│   └── 3. Complete Registration Profile
├── Login & Logout
│   ├── Login
│   └── Logout
├── Protected Routes
│   └── Get Current User
├── Password Reset Flow
│   ├── 1. Request Password Reset OTP
│   ├── 2. Verify Password Reset OTP
│   └── 3. Reset Password
└── Error Cases
    ├── Login with Invalid Credentials
    ├── Verify Invalid OTP
    ├── Access Protected Route Without Auth
    └── Register with Existing Phone Number
```

---

## 📝 Testing Flows

### Complete Registration Flow

1. **Send Registration OTP**:
   - Open "Registration Flow" → "1. Send Registration OTP"
   - Click "Send"
   - Response: `{ "message": "OTP sent successfully..." }`

2. **Get OTP from Server Logs**:
   ```bash
   docker-compose logs -f server | grep "Generated OTP"
   ```
   - Copy the 6-digit OTP code

3. **Update OTP Variable**:
   - Click on collection → Variables tab
   - Update `otp` variable with the actual OTP
   - Click "Save"

4. **Verify Registration OTP**:
   - Open "Registration Flow" → "2. Verify Registration OTP"
   - Click "Send"
   - Response: `{ "message": "OTP verified successfully", "verified": true }`

5. **Complete Registration**:
   - Open "Registration Flow" → "3. Complete Registration Profile"
   - Review/edit the request body (email, password)
   - Click "Send"
   - Response: User object with JWT cookie set
   - Check "Cookies" tab to see `access_token`

---

### Complete Login Flow

1. **Login**:
   - Open "Login & Logout" → "Login"
   - Update phone number and password in request body
   - Click "Send"
   - Response: `{ "message": "Login successful", "user": {...} }`
   - JWT cookie is automatically set

2. **Get Current User**:
   - Open "Protected Routes" → "Get Current User"
   - Click "Send"
   - Response: `{ "user": { "userId": "...", "phoneNumber": "..." } }`
   - Cookie is automatically sent with request

3. **Logout**:
   - Open "Login & Logout" → "Logout"
   - Click "Send"
   - Response: `{ "message": "Logout successful" }`
   - JWT cookie is automatically cleared

---

### Complete Password Reset Flow

1. **Request Password Reset OTP**:
   - Open "Password Reset Flow" → "1. Request Password Reset OTP"
   - Click "Send"
   - Response: Generic message (security feature)

2. **Get OTP from Server Logs**:
   ```bash
   docker-compose logs -f server | grep "password reset OTP"
   ```
   - Copy the 6-digit OTP code

3. **Update OTP Variable**:
   - Update the `otp` collection variable
   - Click "Save"

4. **Verify Password Reset OTP**:
   - Open "Password Reset Flow" → "2. Verify Password Reset OTP"
   - Click "Send"
   - Response: `{ "message": "OTP verified successfully...", "verified": true }`

5. **Reset Password**:
   - Open "Password Reset Flow" → "3. Reset Password"
   - Update the password in request body
   - Click "Send"
   - Response: `{ "message": "Password reset successfully..." }`

6. **Login with New Password**:
   - Go to "Login & Logout" → "Login"
   - Update password to the new one
   - Click "Send"
   - Should login successfully

---

## ✅ Automated Tests

Each request includes automated tests that run after the response is received.

### Viewing Test Results

1. **Send a Request**
   - Click "Send" on any request

2. **View Test Results**
   - Go to the "Test Results" tab in the response section
   - Green checkmarks (✓) indicate passed tests
   - Red X marks (✗) indicate failed tests

### Example Tests

**Login Request Tests**:
- ✓ Status code is 200
- ✓ Login successful
- ✓ JWT cookie is set
- ✓ User object does not contain password

**OTP Verification Tests**:
- ✓ Status code is 200
- ✓ OTP verified successfully
- ✓ Response time is less than 1000ms

---

## 🔄 Running Collection with Collection Runner

For automated testing of all endpoints:

1. **Open Collection Runner**:
   - Click on collection → "Run" button
   - Or right-click collection → "Run collection"

2. **Configure Run**:
   - Select requests to run (or select all)
   - Set iterations (default: 1)
   - Set delay between requests (e.g., 500ms)

3. **Run Collection**:
   - Click "Run Daraa Authentication API"
   - Watch tests execute automatically

4. **View Results**:
   - See pass/fail status for each request
   - View detailed test results
   - Export results if needed

**Note**: For flows that require OTP, you'll need to run them manually and update the OTP variable between steps.

---

## 🍪 Cookie Management

### Viewing Cookies

1. **After Login/Registration**:
   - Send a login or registration request
   - Go to "Cookies" tab in the response section
   - You'll see `access_token` cookie

2. **Cookie Details**:
   - Name: `access_token`
   - Value: JWT token (long string)
   - Domain: `localhost`
   - Path: `/`
   - HttpOnly: `true`
   - Secure: `false` (development) / `true` (production)
   - SameSite: `Strict`

### Managing Cookies

- **Automatic**: Postman automatically sends cookies with subsequent requests
- **Manual**: You can view/edit cookies in the Cookies manager
- **Clear**: Cookies are cleared after logout

---

## 🧪 Testing Error Cases

The collection includes error case tests:

### 1. Login with Invalid Credentials

- **Request**: Login with wrong password
- **Expected**: 401 Unauthorized
- **Test**: Verifies error message

### 2. Verify Invalid OTP

- **Request**: OTP verification with wrong code
- **Expected**: 400 Bad Request
- **Test**: Verifies error message and remaining attempts

### 3. Access Protected Route Without Auth

- **Request**: Get current user without JWT cookie
- **Expected**: 401 Unauthorized
- **Test**: Verifies unauthorized error

### 4. Register with Existing Phone Number

- **Request**: Registration with already registered phone
- **Expected**: 400 Bad Request
- **Test**: Verifies "already exists" error

---

## 💡 Tips & Best Practices

### 1. Use Variables

- Store frequently used values in variables
- Update `phoneNumber` variable for different test users
- Use `{{variableName}}` syntax in requests

### 2. Check Server Logs

- Always check server logs for OTP codes during development
- Use: `docker-compose logs -f server | grep "OTP"`

### 3. Cookie Persistence

- Cookies persist across requests in the same session
- Clear cookies manually if needed (Cookies manager)
- Logout endpoint automatically clears cookies

### 4. Request Order

- Follow the numbered order for flows (1 → 2 → 3)
- Complete OTP verification before profile completion
- Login before accessing protected routes

### 5. Response Validation

- Always check the "Test Results" tab
- Green checkmarks = all tests passed
- Review response body for detailed information

### 6. Environment Switching

- Create separate environments for dev/staging/production
- Switch environments using the dropdown
- Update `baseUrl` for each environment

---

## 🔧 Troubleshooting

### Issue: "Could not send request"

**Solution**: 
- Ensure the server is running: `docker-compose ps`
- Check the `baseUrl` variable is correct
- Verify network connectivity

### Issue: "Unauthorized" on protected routes

**Solution**:
- Login first to get JWT cookie
- Ensure cookies are enabled in Postman settings
- Check cookie hasn't expired (7 days)

### Issue: OTP verification fails

**Solution**:
- Get the actual OTP from server logs
- Update the `otp` variable with the correct code
- Ensure OTP hasn't expired (5 minutes)
- Check you haven't exceeded max attempts (3)

### Issue: Tests failing

**Solution**:
- Review the test results for specific failures
- Check response status code and body
- Ensure request body matches expected format
- Verify all required fields are provided

---

## 📚 Additional Resources

- **API Documentation**: See [authentication-api.md](authentication-api.md) for detailed endpoint documentation
- **Server Logs**: `docker-compose logs -f server`
- **Database**: `docker-compose exec mongodb mongosh daraa-auth`
- **Postman Documentation**: [Postman Learning Center](https://learning.postman.com/)

---

## 🎯 Quick Commands

```bash
# Start the server
docker-compose up -d

# View server logs (for OTP codes)
docker-compose logs -f server | grep "OTP"

# Check server status
docker-compose ps

# View database users
docker-compose exec mongodb mongosh daraa-auth --eval "db.users.find().pretty()"

# Stop the server
docker-compose down
```

---

**Happy Testing! 🚀**

If you encounter any issues, refer to the [authentication-api.md](authentication-api.md) documentation or check the server logs for debugging information.

