# Baloo-migreringsskript
# Flyttar källkod, inställningar och data till nya miljön
# Kräver: PowerShell 5.1+, scp, rsync (för Windows)

param(
    [string]$Source = "C:\Vgds Baloo",
    [string]$Destination = ".",
    [string]$RemoteHost = "",
    [string]$RemoteUser = "root"
)

$ErrorActionPreference = "Stop"

Write-Host "=== Baloo Migration ===" -ForegroundColor Cyan
Write-Host "Source: $Source" -ForegroundColor Yellow
Write-Host "Destination: $Destination" -ForegroundColor Yellow

# 1. Säkerhetskopiera mastertext.txt (56 MB chatthistorik)
Write-Host "`n[1/5] Backing up mastertext.txt..." -ForegroundColor Green
$mastertext = Join-Path $Source "mastertext.txt"
if (Test-Path $mastertext) {
    Copy-Item $mastertext $Destination -Force
    Write-Host "✓ mastertext.txt copied" -ForegroundColor Green
} else {
    Write-Host "⚠ mastertext.txt not found" -ForegroundColor Red
}

# 2. Arkivera projektstruktur
Write-Host "`n[2/5] Archiving project structure..." -ForegroundColor Green
$projects = @("baloo-extension", "extension", "baloo-mobil", "Baloo-safety")
foreach ($project in $projects) {
    $projectPath = Join-Path $Source $project
    if (Test-Path $projectPath) {
        Write-Host "  - $project"
    }
}
Write-Host "✓ Project structure documented" -ForegroundColor Green

# 3. Exportera lista med VS Code/Codium extensions
Write-Host "`n[3/5] Exporting editor extensions..." -ForegroundColor Green
$codeDir = "$env:USERPROFILE\.vscode\extensions"
if (Test-Path $codeDir) {
    $extensions = Get-ChildItem $codeDir -Directory | ForEach-Object { $_.Name.Split('.')[0] }
    $extensions | Out-File "$Destination\vscode-extensions.txt"
    Write-Host "✓ Exported $($extensions.Count) extensions" -ForegroundColor Green
} else {
    Write-Host "⚠ VS Code extensions folder not found" -ForegroundColor Red
}

# 4. Samla miljövariabler (utan att skriva lösenord)
Write-Host "`n[4/5] Collecting environment variables..." -ForegroundColor Green
$envFile = "$Destination\.env.example"
"# Baloo Environment Variables (fill in your values)
# NODE_ENV=production
# API_KEY_GROQ=
# API_KEY_OPENROUTER=
# API_KEY_NVIDIA=
# DATABASE_URL=
# MINIO_ENDPOINT=
# MINIO_ACCESS_KEY=
# MINIO_SECRET_KEY=
" | Out-File $envFile
Write-Host "✓ Created .env.example" -ForegroundColor Green

# 5. Skapa arkiv om remote host angavs
if ($RemoteHost) {
    Write-Host "`n[5/5] Creating archive and uploading..." -ForegroundColor Green
    $archiveName = "baloo-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
    Compress-Archive -Path $Source -DestinationPath $archiveName -Force
    Write-Host "✓ Archive created: $archiveName" -ForegroundColor Green
    
    Write-Host "`nUploading to $RemoteUser@$RemoteHost..." -ForegroundColor Green
    scp $archiveName "$RemoteUser@$RemoteHost`:~/"
    Write-Host "✓ Upload complete" -ForegroundColor Green
    
    Write-Host "`n=== Migration Complete ===" -ForegroundColor Cyan
    Write-Host "Archive: $archiveName" -ForegroundColor Yellow
    Write-Host "Next: Extract on remote and run docker-compose up -d" -ForegroundColor Yellow
} else {
    Write-Host "`n[5/5] Skipping upload (no remote host specified)" -ForegroundColor Yellow
    Write-Host "`n=== Migration Complete ===" -ForegroundColor Cyan
    Write-Host "Files prepared in: $Destination" -ForegroundColor Yellow
    Write-Host "Next: Upload manually and run docker-compose up -d" -ForegroundColor Yellow
}
