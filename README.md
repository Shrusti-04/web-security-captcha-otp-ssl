# Web Security Implementation

## CAPTCHA, OTP, and SSL/HTTPS

A comprehensive demonstration of web security features including CAPTCHA verification, One-Time Password (OTP) authentication, and SSL/TLS encryption.

---

## 🔐 Security Features

### 1. **SSL/HTTPS Encryption**

- All communication encrypted using TLS
- Self-signed certificate for development
- Secure cookie transmission
- HTTPS-only session cookies

### 2. **CAPTCHA Verification**

- SVG-based CAPTCHA generation
- Server-side validation
- Prevents automated bot attacks
- Auto-refresh capability

### 3. **OTP (One-Time Password)**

- 6-digit numeric OTP
- 5-minute expiry time
- Session-based verification
- Simulated email delivery (console output for demo)

### 4. **Additional Security Measures**

- **Rate Limiting**: Prevents brute force attacks (100 requests per 15 minutes)
- **Helmet.js**: Sets secure HTTP headers
- **Session Management**: Secure, HTTP-only cookies
- **XSS Protection**: Prevents cross-site scripting
- **CSRF Protection**: Session-based security

---

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **OpenSSL** (optional, for SSL certificate generation)

---

## 🚀 Installation & Setup

### Step 1: Install Dependencies

```powershell
npm install
```

### Step 2: Generate SSL Certificate

**Option A: Using PowerShell Script (Recommended for Windows)**

```powershell
.\generate-ssl.ps1
```

**Option B: Using OpenSSL (if installed)**

```powershell
openssl req -x509 -newkey rsa:4096 -keyout ssl/server.key -out ssl/server.cert -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

**Option C: Using Node.js Script**

```powershell
npm run generate-ssl
```

### Step 3: Start the Server

```powershell
npm start
```

The server will start on **https://localhost:3000**

---

## 🌐 Usage

### 1. **Access the Application**

Open your browser and navigate to:

```
https://localhost:3000
```

**Note:** You'll see a security warning because we're using a self-signed certificate. This is normal for development. Click "Advanced" and proceed to localhost.

### 2. **Login Process**

#### Step 1: Enter Credentials

- Username: Any username (e.g., `admin`)
- Password: Any password (e.g., `password`)
- CAPTCHA: Enter the displayed CAPTCHA code

#### Step 2: OTP Verification

- After successful CAPTCHA validation, an OTP will be generated
- **For demo purposes**, the OTP is displayed on the page and in the console
- In production, this would be sent via email/SMS
- Enter the 6-digit OTP within 5 minutes

#### Step 3: Access Dashboard

- Upon successful OTP verification, you'll be redirected to the secure dashboard
- View implemented security features and details

---

## 📁 Project Structure

```
Evaluation 3/
├── server.js                 # Main Express server with HTTPS
├── package.json             # Project dependencies
├── generate-ssl.js          # Node.js SSL certificate generator
├── generate-ssl.ps1         # PowerShell SSL certificate generator
├── ssl/                     # SSL certificates directory
│   ├── server.cert         # SSL certificate
│   └── server.key          # Private key
├── public/                  # Frontend files
│   ├── index.html          # Login page with CAPTCHA
│   ├── otp.html            # OTP verification page
│   └── dashboard.html      # Secured dashboard
└── README.md               # This file
```

---

## 🔒 Security Implementation Details

### CAPTCHA System

- **Generation**: Server-side SVG generation with random text
- **Validation**: Session-based storage and verification
- **Features**:
  - 6-character alphanumeric code
  - Visual noise (lines) for bot prevention
  - Character rotation and random positioning
  - Refresh functionality

### OTP System

- **Generation**: 6-digit random numeric code
- **Storage**: In-memory storage (use Redis in production)
- **Expiry**: 5-minute time limit
- **Validation**: One-time use, automatically deleted after verification
- **Features**:
  - Visual countdown timer
  - Auto-focus and navigation between input fields
  - Paste support
  - Expired OTP detection

### SSL/TLS Configuration

- **Protocol**: HTTPS with TLS
- **Key Length**: 4096-bit RSA
- **Certificate**: Self-signed (valid for 1 year)
- **Cookie Security**:
  - `secure: true` (HTTPS only)
  - `httpOnly: true` (prevents XSS)
  - `maxAge: 24 hours`

### Session Management

- **Storage**: Server-side session storage
- **Security**:
  - Secure session cookies
  - Session expiry
  - CSRF protection via session validation
  - Logout functionality

---

## 🛡️ API Endpoints

### Authentication Endpoints

| Endpoint           | Method | Description                                  |
| ------------------ | ------ | -------------------------------------------- |
| `/api/captcha`     | GET    | Generate new CAPTCHA                         |
| `/api/login`       | POST   | Validate credentials & CAPTCHA, generate OTP |
| `/api/verify-otp`  | POST   | Verify OTP and complete authentication       |
| `/api/auth-status` | GET    | Check if user is authenticated               |
| `/api/logout`      | POST   | Logout and destroy session                   |

### Request/Response Examples

**Generate CAPTCHA**

```javascript
GET / api / captcha;
Response: {
  captcha: "<svg>...</svg>";
}
```

**Login**

```javascript
POST /api/login
Body: { username: "admin", password: "pass", captcha: "ABC123" }
Response: { success: true, message: "OTP sent", otp: "123456" }
```

**Verify OTP**

```javascript
POST /api/verify-otp
Body: { otp: "123456" }
Response: { success: true, message: "Login successful!" }
```

---

## 🔧 Configuration

### Modify Port

Edit `server.js`:

```javascript
const PORT = process.env.PORT || 3000;
```

### Adjust Rate Limiting

Edit `server.js`:

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
});
```

### Change OTP Expiry

Edit `server.js`:

```javascript
const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
```

---

## 🧪 Testing the Security Features

### Test CAPTCHA

1. Try entering wrong CAPTCHA - should fail
2. Refresh CAPTCHA and try again
3. Verify case-insensitive matching

### Test OTP

1. Try entering wrong OTP - should fail
2. Wait for OTP to expire (5 minutes) - should redirect to login
3. Try using same OTP twice - should fail

### Test Rate Limiting

1. Make multiple rapid requests
2. Should be limited after 100 requests in 15 minutes

### Test SSL

1. Check browser address bar for padlock icon
2. View certificate details
3. Verify HTTPS connection

---

## 📸 Screenshots

### Login Page with CAPTCHA

![Screenshot 1](screenshots/Screenshot%202025-11-06%20195126.png)

### OTP Verification Page

![Screenshot 2](screenshots/Screenshot%202025-11-06%20195147.png)

### Secured Dashboard

![Screenshot 3](screenshots/Screenshot%202025-11-06%20195243.png)

---

## 🎯 Evaluation Criteria Coverage

✅ **CAPTCHA Implementation**

- Server-side generation
- Client-side display and validation
- Refresh functionality

✅ **OTP Implementation**

- Generation and storage
- Time-based expiry
- Verification system

✅ **SSL/HTTPS Implementation**

- Self-signed certificate generation
- HTTPS server configuration
- Secure communication

✅ **Additional Security Features**

- Rate limiting
- Secure headers (Helmet)
- Session management
- XSS/CSRF protection

---

## 🌟 Demo Credentials

Since this is a demo without a database:

- **Username**: Any username (e.g., `admin`, `user`, `test`)
- **Password**: Any password (e.g., `password123`)
- **CAPTCHA**: Enter the displayed code
- **OTP**: Will be shown on screen (in production, sent via email/SMS)

---

**Happy Coding! 🚀**
