# Screenshots Folder

## Required Screenshots

Place your project screenshots in this folder with the following names:

### 1. **login-page.png**

- Screenshot of the login page
- Show: Username field, Password field, CAPTCHA image, CAPTCHA input

### 2. **captcha-validation.png**

- Screenshot showing CAPTCHA validation
- Show: Success message after entering correct CAPTCHA OR error for wrong CAPTCHA

### 3. **otp-verification.png**

- Screenshot of OTP verification page
- Show: Six OTP input boxes, countdown timer

### 4. **otp-display.png**

- Screenshot showing OTP on screen (demo mode)
- Show: Success message with OTP code displayed

### 5. **dashboard.png**

- Screenshot of secured dashboard after successful login
- Show: Welcome message, username, logout button

### 6. **https-ssl.png**

- Screenshot of browser address bar showing HTTPS
- Show: Padlock icon, https:// in URL

### 7. **ssl-certificate.png**

- Screenshot of SSL certificate details
- Show: Click on padlock → Certificate details → Self-signed certificate info

### 8. **server-running.png**

- Screenshot of terminal/PowerShell with server running
- Show: "HTTPS Server running on https://localhost:3000" message

### 9. **rate-limiting.png** (Optional)

- Screenshot showing rate limit error
- Show: Error message "Too many requests from this IP"

### 10. **security-headers.png** (Optional)

- Screenshot of browser developer tools (F12)
- Show: Network tab → Response headers → Helmet.js security headers

---

## How to Take Screenshots

### Windows:

- **Full Screen**: Press `PrtScn` key
- **Active Window**: Press `Alt + PrtScn`
- **Snipping Tool**: Press `Windows + Shift + S`

### Save Screenshots:

1. Paste in Paint or any image editor
2. Save as PNG format
3. Name according to the list above
4. Save in this `screenshots/` folder

---

## After Adding Screenshots

Run these commands to upload to GitHub:

```powershell
cd "C:\Users\shrus\Desktop\7th\CNS\Lab\Evaluation 3"
git add screenshots/
git commit -m "Add project screenshots"
git push origin main
```

---

**Note:** Make sure all images are in PNG format for best quality and GitHub compatibility.
