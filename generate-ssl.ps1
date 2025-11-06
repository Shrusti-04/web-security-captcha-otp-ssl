# PowerShell script to generate self-signed SSL certificate

Write-Host "`n🔐 Generating Self-Signed SSL Certificate...`n" -ForegroundColor Cyan

# Create ssl directory if it doesn't exist
$sslDir = Join-Path $PSScriptRoot "ssl"
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir | Out-Null
}

$certFile = Join-Path $sslDir "server.cert"
$keyFile = Join-Path $sslDir "server.key"

# Check if OpenSSL is available
$opensslAvailable = Get-Command openssl -ErrorAction SilentlyContinue

if ($opensslAvailable) {
    Write-Host "Using OpenSSL to generate certificate..." -ForegroundColor Yellow
    
    $opensslCmd = "openssl req -x509 -newkey rsa:4096 -keyout `"$keyFile`" -out `"$certFile`" -days 365 -nodes -subj `"/C=US/ST=State/L=City/O=Organization/CN=localhost`""
    
    Invoke-Expression $opensslCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ SSL certificate generated successfully!" -ForegroundColor Green
        Write-Host "📁 Certificate: $certFile" -ForegroundColor White
        Write-Host "🔑 Private Key: $keyFile" -ForegroundColor White
    }
} else {
    Write-Host "⚠️  OpenSSL not found. Using PowerShell to generate certificate..." -ForegroundColor Yellow
    
    # Generate certificate using PowerShell (Windows 10+)
    $cert = New-SelfSignedCertificate `
        -DnsName "localhost" `
        -CertStoreLocation "cert:\CurrentUser\My" `
        -NotAfter (Get-Date).AddYears(1) `
        -KeyAlgorithm RSA `
        -KeyLength 2048
    
    # Export certificate
    $certPassword = ConvertTo-SecureString -String "temp" -Force -AsPlainText
    $pfxPath = Join-Path $sslDir "server.pfx"
    Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $certPassword | Out-Null
    
    # Convert PFX to PEM format (cert and key)
    # Note: This requires OpenSSL or manual extraction
    Write-Host "`n✅ Certificate generated in Windows Certificate Store" -ForegroundColor Green
    Write-Host "📁 PFX file: $pfxPath" -ForegroundColor White
    Write-Host "`n⚠️  To convert to PEM format, you'll need OpenSSL:" -ForegroundColor Yellow
    Write-Host "   openssl pkcs12 -in server.pfx -nocerts -nodes -out server.key" -ForegroundColor White
    Write-Host "   openssl pkcs12 -in server.pfx -clcerts -nokeys -out server.cert" -ForegroundColor White
    
    # Clean up
    Remove-Item "cert:\CurrentUser\My\$($cert.Thumbprint)"
}

Write-Host ""
Write-Host "You can now install dependencies and run the server:" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
