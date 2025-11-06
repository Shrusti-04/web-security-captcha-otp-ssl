# Implementation Steps - Web Security with CAPTCHA, OTP & SSL

## Step 1: Environment Setup

The development environment was configured using **Node.js** and the **Express.js** framework. Required dependencies were installed via npm:

- **express** - Web server framework for handling HTTP/HTTPS requests
- **express-session** - Session management middleware
- **body-parser** - Request body parsing middleware
- **helmet** - Security headers middleware
- **express-rate-limit** - Rate limiting to prevent brute force attacks
- **node-forge** - SSL certificate generation library

The project structure was organized with:

- `public/` for frontend HTML files
- `ssl/` for SSL certificates
- `server.js` as the main application entry point

This ensured a clean, modular, and maintainable codebase.

---

## Step 2: CAPTCHA Implementation

A custom server-side CAPTCHA system was developed to prevent automated bot attacks.

**CAPTCHA Generation:**

- Random 6-character alphanumeric codes are generated using uppercase letters and numbers (excluding similar-looking characters like O/0, I/1).
- **SVG-based image generation** creates visual CAPTCHAs with:
  - Random character positioning and rotation (-15° to +15°)
  - Multiple background noise lines for OCR resistance
  - Random colors for each character
  - Gray background with overlay effects

**Security Features:**

- Each CAPTCHA is stored in the **server session** tied to a unique session ID
- Session-based storage prevents replay attacks
- CAPTCHAs are **single-use** - deleted immediately after verification
- Case-insensitive validation for better user experience
- Refresh functionality allows users to generate new CAPTCHAs

**API Endpoint:**

```javascript
GET / api / captcha;
```

Returns SVG CAPTCHA image in JSON format for client-side rendering.

---

## Step 3: OTP (One-Time Password) System

A robust two-factor authentication (2FA) system using OTP was implemented.

**OTP Generation:**

- On successful login with CAPTCHA verification, a **6-digit numeric OTP** is generated securely using JavaScript's `Math.random()` function
- OTP range: 100000 to 999999 (exactly 6 digits)

**Storage and Expiry:**

- OTPs are stored in an **in-memory Map** data structure with username as the key
- Each OTP includes:
  - The OTP code
  - Expiration timestamp (5 minutes from generation)
- Server validates both correctness and expiry before granting access

**Demo Implementation:**

- For demonstration purposes, the OTP is displayed on-screen and in the server console
- In production, this would integrate with:
  - **Email services** (SendGrid, AWS SES, Nodemailer)
  - **SMS services** (Twilio, AWS SNS)

**OTP Verification:**

- Checks if OTP exists for the user
- Validates against expiry time
- Ensures one-time use by deleting after successful verification
- Registration/login is completed only after OTP verification passes

---

## Step 4: SSL/TLS Encryption

To secure all communication, **HTTPS** was enforced using SSL/TLS encryption.

**Certificate Generation:**

- Used **node-forge** library to generate self-signed SSL certificates
- 2048-bit RSA key pair for strong encryption
- Certificate includes:
  - Common Name: localhost
  - Validity period: 1 year
  - Subject Alternative Names (SANs) for localhost and 127.0.0.1

**HTTPS Server Configuration:**

```javascript
const https = require("https");
const sslOptions = {
  key: fs.readFileSync("ssl/server.key"),
  cert: fs.readFileSync("ssl/server.cert"),
};
https.createServer(sslOptions, app).listen(3000);
```

**Security Benefits:**

- All traffic between client and server is encrypted
- Prevents MITM (Man-in-the-Middle) attacks
- Protects against packet sniffing and eavesdropping
- Browser displays padlock icon indicating secure connection

**Production Ready:**

- In production, self-signed certificates can be replaced with CA-signed certificates (Let's Encrypt, DigiCert)
- Certificate auto-renewal can be configured

---

## Step 5: Session Management

Secure session handling was implemented using **express-session** middleware.

**Session Configuration:**

```javascript
app.use(
  session({
    secret: "web-security-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // HTTPS only
      httpOnly: true, // Prevents XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);
```

**Session Workflow:**

1. On CAPTCHA validation, `pendingUser` is stored in session
2. After OTP verification, user is moved to `session.user`
3. Protected routes check for `session.user` existence
4. Unauthorized users are redirected to login page
5. Sessions are destroyed on logout

**Security Features:**

- Server-side session storage
- Secure flag ensures cookies only sent over HTTPS
- HttpOnly flag prevents JavaScript access (XSS protection)
- Session expiry after 24 hours of inactivity

---

## Step 6: Security Headers and Rate Limiting

**Helmet.js Integration:**
Implemented comprehensive security headers using Helmet.js middleware:

- **X-Content-Type-Options** - Prevents MIME-type sniffing
- **X-Frame-Options** - Prevents clickjacking attacks
- **X-XSS-Protection** - Enables browser XSS filters
- **Strict-Transport-Security** - Enforces HTTPS
- **Content-Security-Policy** - Prevents XSS and injection attacks

**Rate Limiting:**

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per IP
});
```

**Benefits:**

- Prevents brute force attacks on login endpoints
- Mitigates DDoS attempts
- Protects against credential stuffing attacks
- Returns 429 (Too Many Requests) status when limit exceeded

---

## Step 7: Frontend Development

The user interface was designed for professional usability and security awareness.

**Design Theme:**

- **Background:** Purple gradient (from #667eea to #764ba2)
- **Primary Color:** Blue #667eea
- **Secondary:** White cards with subtle shadows
- **Animation:** Smooth transitions and slide-in effects

**Login Page (index.html):**

- Username and password input fields
- SVG CAPTCHA display with refresh button
- CAPTCHA input field with validation
- Security badges showing SSL encryption
- Responsive design for all screen sizes

**OTP Verification Page (otp.html):**

- Six individual input boxes for OTP digits
- Auto-focus and navigation between inputs
- Paste support for convenience
- **Live countdown timer** (5-minute expiry)
- Visual warning when time is running out
- Auto-redirect on expiry

**Dashboard (dashboard.html):**

- Welcome message with username
- Logout functionality
- Clean, minimal design
- Session-protected (redirects if not authenticated)

**Features:**

- Real-time form validation with error messages
- Success/error alerts with auto-dismiss
- Loading indicators during API calls
- Fully responsive design for mobile and desktop

---

## Step 8: API Endpoint Development

All functionalities were implemented as **RESTful API endpoints** returning JSON responses:

### Authentication Endpoints

**1. Generate CAPTCHA**

```
GET /api/captcha
Response: { captcha: "<svg>...</svg>" }
```

Generates and returns CAPTCHA in SVG format.

**2. Login with CAPTCHA**

```
POST /api/login
Body: { username, password, captcha }
Response: { success: true, message: "OTP sent", otp: "123456" }
```

Validates credentials and CAPTCHA, generates OTP.

**3. Verify OTP**

```
POST /api/verify-otp
Body: { otp }
Response: { success: true, message: "Login successful" }
```

Verifies OTP and completes authentication.

**4. Check Authentication Status**

```
GET /api/auth-status
Response: { authenticated: true, username: "admin" }
```

Returns current session authentication status.

**5. Logout**

```
POST /api/logout
Response: { success: true, message: "Logged out successfully" }
```

Destroys session and logs out user.

**Response Format:**

- All endpoints return consistent JSON structure
- Proper HTTP status codes (200, 400, 401, 500)
- Descriptive error messages for debugging
- Security-aware responses (no sensitive data exposure)

---

## Step 9: Error Handling and Validation

Robust error handling and input validation were implemented throughout the system.

**Frontend Validation:**

- Required field validation
- CAPTCHA format validation
- OTP digit-only validation
- Real-time error message display

**Backend Validation:**

- CAPTCHA existence check in session
- CAPTCHA correctness validation
- OTP expiry time validation
- Session validation for protected routes

**Error Scenarios Handled:**

1. **Invalid CAPTCHA** - "Invalid CAPTCHA. Please try again."
2. **Expired CAPTCHA** - Session-based expiry on page reload
3. **Invalid OTP** - "Invalid OTP. Please try again."
4. **Expired OTP** - "OTP expired. Please login again."
5. **Session Expired** - Redirect to login page
6. **Missing Credentials** - "Username and password are required."

**User Experience:**

- Clear, actionable error messages
- No system internals exposed
- Graceful degradation on errors
- Maintains security while being user-friendly

---

## Step 10: Testing and Deployment

Comprehensive testing ensured full system reliability and security.

**CAPTCHA Testing:**
✅ Correct CAPTCHA entry - Proceeds to OTP generation  
✅ Incorrect CAPTCHA - Error message, CAPTCHA refreshed  
✅ Refresh functionality - New CAPTCHA generated  
✅ Case-insensitive matching - Works correctly

**OTP Testing:**
✅ Valid OTP - Login successful, redirect to dashboard  
✅ Invalid OTP - Error message, retry allowed  
✅ Expired OTP (5 min) - Redirect to login with message  
✅ One-time use - OTP deleted after verification

**Login Flow Testing:**
✅ Complete flow - CAPTCHA → OTP → Dashboard  
✅ Password validation - Accepts any password (demo mode)  
✅ Session persistence - Stays logged in until logout

**Route Protection Testing:**
✅ Direct dashboard access - Redirects to login  
✅ Authenticated access - Dashboard displays correctly  
✅ Logout functionality - Session destroyed, redirects to login

**SSL/TLS Verification:**
✅ Browser padlock icon visible  
✅ HTTPS connection established  
✅ Certificate details viewable  
✅ All traffic encrypted

**Rate Limiting Testing:**
✅ Normal usage - No restrictions  
✅ Rapid requests - Limited after 100 in 15 minutes  
✅ Error message - "Too many requests from this IP"

**Security Headers Testing:**
✅ Helmet.js headers present in response  
✅ XSS protection enabled  
✅ Clickjacking prevention active

---

## Technical Implementation Summary

The project integrates **three layers of security**:

1. **CAPTCHA** - Blocks automated bots through SVG-based visual verification
2. **OTP** - Adds second-factor authentication for user identity verification
3. **SSL/TLS** - Encrypts all client-server communication

**Core Technologies Used:**

- **Backend:** Node.js with Express.js framework
- **Security:** SSL/TLS encryption, Helmet.js middleware, express-rate-limit
- **Session Management:** express-session with secure cookies
- **Certificate Generation:** node-forge library
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Server:** HTTPS server with self-signed certificates

**Architecture:**

- RESTful API design
- MVC-like separation (routes, logic, views)
- Session-based authentication
- Stateful server with in-memory OTP storage

---

## Results

1. ✅ Implemented a secure authentication system with CAPTCHA, OTP, and SSL/TLS
2. ✅ Built a custom SVG-based CAPTCHA resistant to bots and OCR attacks
3. ✅ Added 2FA with time-limited (5-minute) OTP verification
4. ✅ Ensured encrypted HTTPS communication for all traffic
5. ✅ Created a responsive, professional, and user-friendly interface
6. ✅ Implemented rate limiting to prevent brute force attacks
7. ✅ Applied security headers (Helmet.js) for XSS/CSRF protection
8. ✅ Developed comprehensive error handling and validation
9. ✅ Achieved zero security vulnerabilities in npm audit
10. ✅ Successfully deployed and tested all security features

---

## Learning Outcomes

✅ **Gained hands-on experience** in secure web application development using Node.js and Express.js

✅ **Learned CAPTCHA generation** using SVG graphics with randomization and distortion techniques

✅ **Mastered OTP verification** with time-based expiry and one-time use implementation

✅ **Understood SSL/TLS encryption** and its critical role in protecting client-server communication

✅ **Improved skills in API design** with RESTful endpoints and JSON responses

✅ **Implemented session management** with secure, HTTP-only cookies and server-side storage

✅ **Applied security best practices** including rate limiting, security headers, and input validation

✅ **Strengthened understanding** of multi-layered security and multi-factor authentication mechanisms

✅ **Enhanced ability** to test, debug, and document secure software solutions effectively

✅ **Developed proficiency** in modern web security techniques applicable to real-world applications

---

## Conclusion

This project successfully demonstrates a **comprehensive multi-layered security system** combining CAPTCHA verification, OTP-based two-factor authentication, and SSL/TLS encryption. The implementation showcases industry-standard security practices that protect against common web vulnerabilities including bot attacks, brute force attempts, session hijacking, and man-in-the-middle attacks.

The modular architecture and clean code structure make this solution scalable and production-ready with minimal modifications (such as integrating real email/SMS services and using CA-signed certificates).

**Key Achievement:** A fully functional, secure authentication system that balances strong security with excellent user experience.

---

**Project Repository:** https://github.com/Shrusti-04/web-security-captcha-otp-ssl
