# Fly.io setup-skript för Baloo
# Kräver: Fly.io CLI installerad och inloggad

param(
    [string]$AppName = "baloo-api",
    [string]$Region = "lhr"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Fly.io Setup: $AppName ===" -ForegroundColor Cyan

# Kontrollera att fly CLI finns
if (-not (Get-Command fly -ErrorActionSilentlyContinue)) {
    Write-Host "✗ Fly.io CLI not found. Install from: https://fly.io/install.ps1" -ForegroundColor Red
    exit 1
}

# Skapa app om den inte finns
Write-Host "`n[1/3] Creating Fly.io app..." -ForegroundColor Green
try {
    fly apps list | Select-String $AppName | Out-Null
    Write-Host "✓ App already exists: $AppName" -ForegroundColor Green
} catch {
    fly launch --name $AppName --region $Region --no-deploy
    Write-Host "✓ App created: $AppName" -ForegroundColor Green
}

# Sätt miljövariabler
Write-Host "`n[2/3] Setting secrets..." -ForegroundColor Green
$envFile = Join-Path $PSScriptRoot "..\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^\s*([^#=]+)=(.*)$") {
            $key = $Matches[1].Trim()
            $value = $Matches[2].Trim()
            if ($key -and $value) {
                fly secrets set --app $AppName "$key=$value"
                Write-Host "  Set: $key" -ForegroundColor Gray
            }
        }
    }
    Write-Host "✓ Secrets configured" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file not found. Create it first." -ForegroundColor Yellow
}

# Deploya
Write-Host "`n[3/3] Deploying..." -ForegroundColor Green
fly deploy --app $AppName --region $Region

Write-Host "`n=== Fly.io Setup Complete ===" -ForegroundColor Cyan
Write-Host "App URL: https://$AppName.fly.dev" -ForegroundColor Yellow
Write-Host "Logs: fly logs --app $AppName" -ForegroundColor Yellow
