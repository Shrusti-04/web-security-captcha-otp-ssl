const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
  })
);

// Rate limiting to prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: "web-security-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Only send cookie over HTTPS
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// CAPTCHA generation endpoint
app.get("/api/captcha", (req, res) => {
  const captchaText = generateCaptchaText();
  req.session.captcha = captchaText;

  const svgCaptcha = generateCaptchaSVG(captchaText);
  res.json({ captcha: svgCaptcha });
});

// CAPTCHA validation and login endpoint
app.post("/api/login", (req, res) => {
  const { username, password, captcha } = req.body;

  // Validate CAPTCHA
  if (!req.session.captcha || captcha !== req.session.captcha) {
    return res.status(400).json({
      success: false,
      message: "Invalid CAPTCHA. Please try again.",
    });
  }

  // Clear used CAPTCHA
  delete req.session.captcha;

  // Simple authentication (in production, use proper authentication)
  if (username && password) {
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    // Store OTP
    otpStore.set(username, { otp, expiry: otpExpiry });

    // Store username in session
    req.session.pendingUser = username;

    // In production, send OTP via email/SMS
    console.log(`OTP for ${username}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully. Check console for OTP.",
      otp: otp, // Remove this in production!
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }
});

// OTP verification endpoint
app.post("/api/verify-otp", (req, res) => {
  const { otp } = req.body;
  const username = req.session.pendingUser;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Session expired. Please login again.",
    });
  }

  const storedOTP = otpStore.get(username);

  if (!storedOTP) {
    return res.status(400).json({
      success: false,
      message: "OTP not found. Please request a new one.",
    });
  }

  // Check if OTP is expired
  if (Date.now() > storedOTP.expiry) {
    otpStore.delete(username);
    return res.status(400).json({
      success: false,
      message: "OTP expired. Please login again.",
    });
  }

  // Verify OTP
  if (otp === storedOTP.otp) {
    // OTP is valid
    otpStore.delete(username);
    req.session.user = username;
    delete req.session.pendingUser;

    res.json({
      success: true,
      message: "Login successful!",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  }
});

// Check authentication status
app.get("/api/auth-status", (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, username: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Helper function to generate CAPTCHA text
function generateCaptchaText() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
}

// Helper function to generate CAPTCHA SVG
function generateCaptchaSVG(text) {
  const width = 200;
  const height = 60;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="#f0f0f0"/>`;

  // Add noise lines
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cccccc" stroke-width="1"/>`;
  }

  // Add text
  const chars = text.split("");
  chars.forEach((char, index) => {
    const x = 20 + index * 28;
    const y = 35 + (Math.random() * 10 - 5);
    const rotation = Math.random() * 30 - 15;
    const color = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(
      Math.random() * 100
    )}, ${Math.floor(Math.random() * 100)})`;

    svg += `<text x="${x}" y="${y}" font-family="Arial" font-size="28" font-weight="bold" fill="${color}" transform="rotate(${rotation}, ${x}, ${y})">${char}</text>`;
  });

  svg += "</svg>";
  return svg;
}

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// SSL configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "ssl", "server.key")),
  cert: fs.readFileSync(path.join(__dirname, "ssl", "server.cert")),
};

// Create HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`\n✅ HTTPS Server running on https://localhost:${PORT}`);
  console.log(`🔒 SSL/TLS encryption enabled`);
  console.log(`🔐 Security features: CAPTCHA, OTP, Rate Limiting\n`);
});
