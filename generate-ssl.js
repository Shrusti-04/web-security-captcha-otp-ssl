const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const sslDir = path.join(__dirname, "ssl");

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

console.log("Generating self-signed SSL certificate...\n");

// Generate self-signed certificate using OpenSSL
const command = `openssl req -x509 -newkey rsa:4096 -keyout "${path.join(
  sslDir,
  "server.key"
)}" -out "${path.join(
  sslDir,
  "server.cert"
)}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Error generating SSL certificate:", error.message);
    console.log("\n⚠️  OpenSSL not found. Trying alternative method...\n");

    // Alternative: Create a simple self-signed certificate using Node.js crypto
    createSelfSignedCertificate();
    return;
  }

  if (stderr) {
    console.log(stderr);
  }

  console.log("✅ SSL certificate generated successfully!");
  console.log(`📁 Certificate location: ${path.join(sslDir, "server.cert")}`);
  console.log(`🔑 Private key location: ${path.join(sslDir, "server.key")}`);
  console.log("\n✨ You can now run the server with: npm start\n");
});

function createSelfSignedCertificate() {
  const forge = require("node-forge");
  const pki = forge.pki;

  console.log("Creating certificate using node-forge...\n");

  // Generate a key pair
  const keys = pki.rsa.generateKeyPair(2048);

  // Create a certificate
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  const attrs = [
    {
      name: "commonName",
      value: "localhost",
    },
    {
      name: "countryName",
      value: "US",
    },
    {
      shortName: "ST",
      value: "State",
    },
    {
      name: "localityName",
      value: "City",
    },
    {
      name: "organizationName",
      value: "Organization",
    },
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // Self-sign certificate
  cert.sign(keys.privateKey);

  // Convert to PEM format
  const certPem = pki.certificateToPem(cert);
  const keyPem = pki.privateKeyToPem(keys.privateKey);

  // Write to files
  fs.writeFileSync(path.join(sslDir, "server.cert"), certPem);
  fs.writeFileSync(path.join(sslDir, "server.key"), keyPem);

  console.log("✅ SSL certificate generated successfully using node-forge!");
  console.log(`📁 Certificate location: ${path.join(sslDir, "server.cert")}`);
  console.log(`🔑 Private key location: ${path.join(sslDir, "server.key")}`);
  console.log("\n✨ You can now run the server with: npm start\n");
}
