# Quick Start Guide

## Setup (3 Simple Steps)

### 1️⃣ Install Dependencies

```powershell
npm install
```

### 2️⃣ Generate SSL Certificate

```powershell
.\generate-ssl.ps1
```

### 3️⃣ Start the Server

```powershell
npm start
```

## Access the Application

Open your browser and go to: **https://localhost:3000**

⚠️ **Note:** You'll see a security warning (self-signed certificate). Click "Advanced" → "Proceed to localhost"

## Demo Login Flow

1. **Login Page** (https://localhost:3000)

   - Username: `admin` (any username works)
   - Password: `password` (any password works)
   - Enter the CAPTCHA code shown

2. **OTP Page** (automatically redirected)

   - The OTP will be displayed on screen (for demo)
   - Enter the 6-digit code
   - You have 5 minutes before it expires

3. **Dashboard** (secure area)
   - View security features
   - Logout when done

## Troubleshooting

**Port already in use?**

```powershell
# Find and kill the process
Get-NetTCPConnection -LocalPort 3000
Stop-Process -Id <PID>
```

**SSL not generating?**
Make sure OpenSSL is installed or use the alternative method in the README.

**Dependencies not installing?**

```powershell
# Clear cache and retry
npm cache clean --force
npm install
```

## Security Features Demonstrated

✅ **HTTPS/SSL** - Encrypted communication  
✅ **CAPTCHA** - Bot prevention  
✅ **OTP** - Two-factor authentication  
✅ **Rate Limiting** - Brute force protection  
✅ **Secure Sessions** - HTTP-only cookies  
✅ **Security Headers** - Helmet.js protection

---

For detailed documentation, see **README.md**
