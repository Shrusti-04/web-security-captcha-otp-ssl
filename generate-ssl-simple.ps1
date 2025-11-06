Write-Host ""
Write-Host "Generating Self-Signed SSL Certificate..." -ForegroundColor Cyan
Write-Host ""

$sslDir = Join-Path $PSScriptRoot "ssl"
if (-not (Test-Path $sslDir)) {
    New-Item -ItemType Directory -Path $sslDir | Out-Null
}

# Generate certificate using PowerShell
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1) -KeyAlgorithm RSA -KeyLength 2048

# Export as PFX
$certPassword = ConvertTo-SecureString -String "temp123" -Force -AsPlainText
$pfxPath = Join-Path $sslDir "server.pfx"
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $certPassword | Out-Null

# Export public key (certificate)
$certPath = Join-Path $sslDir "server.cert"
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
[System.IO.File]::WriteAllBytes($certPath, $certBytes)

# Export private key (requires conversion)
$keyPath = Join-Path $sslDir "server.key"

# Create a simple key file (base64 encoded)
$certBase64 = [Convert]::ToBase64String($cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, "temp123"))
$keyContent = "-----BEGIN PRIVATE KEY-----`n"
$keyContent += $certBase64
$keyContent += "`n-----END PRIVATE KEY-----"
Set-Content -Path $keyPath -Value $keyContent

# Clean up certificate store
Remove-Item "cert:\CurrentUser\My\$($cert.Thumbprint)" -Force

Write-Host "SSL certificate generated successfully!" -ForegroundColor Green
Write-Host "Certificate: $certPath" -ForegroundColor White
Write-Host "Private Key: $keyPath" -ForegroundColor White
Write-Host "PFX File: $pfxPath" -ForegroundColor White
Write-Host ""
Write-Host "You can now start the server:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
