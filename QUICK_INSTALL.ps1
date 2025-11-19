# Quick Install Script for Dependencies
# Run this in PowerShell

Write-Host "Adding Node.js to PATH..." -ForegroundColor Yellow
$env:PATH += ";C:\Program Files\nodejs"

Write-Host "Checking npm..." -ForegroundColor Yellow
& "C:\Program Files\nodejs\npm.cmd" --version

Write-Host "`nInstalling dependencies..." -ForegroundColor Green
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

& "C:\Program Files\nodejs\npm.cmd" install

if (Test-Path "node_modules") {
    Write-Host "`n✅ SUCCESS! Dependencies installed!" -ForegroundColor Green
    Write-Host "Now restart VS Code and TypeScript errors will disappear!" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Installation may have failed. Check errors above." -ForegroundColor Red
}

