# Railway setup-skript för Baloo
# Kräver: Railway CLI installerad och inloggad

param(
    [string]$ProjectName = "baloo"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Railway Setup: $ProjectName ===" -ForegroundColor Cyan

# Kontrollera att railway CLI finns
if (-not (Get-Command railway -ErrorActionSilentlyContinue)) {
    Write-Host "✗ Railway CLI not found. Install from: https://railway.app/cli" -ForegroundColor Red
    exit 1
}

# Initiera projekt
Write-Host "`n[1/3] Initializing Railway project..." -ForegroundColor Green
Set-Location $PSScriptRoot\..
railway init --name $ProjectName
Write-Host "✓ Project initialized" -ForegroundColor Green

# Länka till repo (om det finns)
Write-Host "`n[2/3] Linking to GitHub repo..." -ForegroundColor Green
railway link
Write-Host "✓ Linked" -ForegroundColor Green

# Deploya
Write-Host "`n[3/3] Deploying..." -ForegroundColor Green
railway up

Write-Host "`n=== Railway Setup Complete ===" -ForegroundColor Cyan
Write-Host "Check Railway dashboard for URLs and logs" -ForegroundColor Yellow
Write-Host "Next: Set environment variables in Railway dashboard" -ForegroundColor Yellow
