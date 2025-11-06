const forge = require("node-forge");
const fs = require("fs");
const path = require("path");

console.log("\n🔐 Generating SSL certificate using node-forge...\n");

// Generate a key pair
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
const cert = forge.pki.createCertificate();
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
    value: "Web Security Demo",
  },
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Add extensions
cert.setExtensions([
  {
    name: "basicConstraints",
    cA: true,
  },
  {
    name: "keyUsage",
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true,
  },
  {
    name: "subjectAltName",
    altNames: [
      {
        type: 2, // DNS
        value: "localhost",
      },
      {
        type: 7, // IP
        ip: "127.0.0.1",
      },
    ],
  },
]);

// Self-sign certificate
cert.sign(keys.privateKey, forge.md.sha256.create());

// Convert to PEM format
const certPem = forge.pki.certificateToPem(cert);
const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, "ssl");
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

// Write to files
fs.writeFileSync(path.join(sslDir, "server.cert"), certPem);
fs.writeFileSync(path.join(sslDir, "server.key"), keyPem);

console.log("✅ SSL certificate generated successfully!");
console.log(`📁 Certificate: ${path.join(sslDir, "server.cert")}`);
console.log(`🔑 Private Key: ${path.join(sslDir, "server.key")}`);
console.log("\n✨ You can now start the server with: npm start\n");
