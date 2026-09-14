# pack.ps1 – Samlar Baloo-projektet, VSCodium-konfig och tiermux-chattar till en tar.gz
# Kör: powershell -ExecutionPolicy Bypass -File pack.ps1
$ErrorActionPreference = "Stop"

$kit = $PSScriptRoot
if ($kit -eq "" -or $null -eq $kit) { $kit = "C:\Vgds Baloo\oracle-move-kit" }
$tmp = Join-Path $kit ".stage"
$bak = Join-Path $kit "baloo-full-backup.tar.gz"
$title = "Oracle-move-kit"

Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item $bak -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $tmp | Out-Null

Write-Host "=== 1/4 KÃ¶rs som $env:USERNAME pÃ¥ $env:COMPUTERNAME ==="

$project = "C:\Vgds Baloo"
if (Test-Path $project) {
    Write-Host "  Kopierar projektet: $project"
    # Kopiera kÃ¤llkod + settings, hoppa Ã¶ver node_modules, .git och stora byggmappar
    & robocopy "$project" (Join-Path $tmp "project") /E /XD node_modules dist out build .git .cache coverage /XF *.so 2>$null | Out-Null
    Write-Host "  OK"
} else {
    Write-Host "  VARNING: Hittar inte '$project' â€“ letar efter andra mappar..."
    Get-ChildItem "C:\" -Directory -ErrorAction SilentlyContinue | Where-Object Name -like "*Baloo*" | ForEach-Object { Write-Host "    -> $($_.FullName)" }
}

Write-Host "=== 2/4 Kopierar VSCodium-konfiguration ==="
$vscodium = "$env:APPDATA\VSCodium"
if (Test-Path $vscodium) {
    # User/settings, keybindings + extensions (men inte workspaceStorage – hanteras separat)
    New-Item -ItemType Directory -Path (Join-Path $tmp "vscodium") | Out-Null
    Get-ChildItem "$vscodium\User" -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "workspaceStorage" } | ForEach-Object {
        & robocopy $_.FullName (Join-Path $tmp "vscodium\$_") /E /XF state.vscdb state.vscdb.backup 2>$null | Out-Null
    }
    Write-Host "  OK (User + extensions)"
} else {
    Write-Host "  Ingen VSCodium-katalog pÃ¥ den hÃ¤r datorn."
}

Write-Host "=== 3/4 Kopierar tiermux-chattar ==="
$ws = "$vscodium\User\workspaceStorage"
$wsTargetLut = @{
  "048c03ba9c7fd80a8af32a640ed408cd" = "baloo_workspace"              # C:\Vgds Baloo
  "888d525793d7546d67840683f03f1f73" = "vgds_projekten"
  "19e7d499fe3546a9e382f3f0a807daf7" = "vgds_fabriken"
  "b659ea7fe97aa340d49c086d04695dbb" = "baloo_root"
  "c4b782eb8f3b0c51038919f8137b5187" = "baloo_extension"
  "ext-dev"                            = "ext_dev"
  "f376e58185fd7dc0247f17246169a968" = "vgds_baloo_extension"
}
$count = 0
foreach ($hash in $wsTargetLut.Keys) {
    $src = Join-Path $ws $hash
    if (Test-Path $src) {
        $dest = Join-Path $tmp "chattar\$($wsTargetLut[$hash])"
        & robocopy $src $dest /E 2>$null | Out-Null
        $count++
    }
}
Write-Host "  Kopierade $count workspace-kataloger med chattar"

Write-Host "=== 4/4 Packar till baloo-full-backup.tar.gz ==="
# ta bort tomma mappar som skapats av robocopy-saknad data
Get-ChildItem $tmp -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer -and @(Get-ChildItem $_.FullName -Force -ErrorAction SilentlyContinue).Count -eq 0 } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

if (Get-Command tar -ErrorAction SilentlyContinue) {
    tar -czf $bak -C $kit ".stage"
    Write-Host "  Skapad: $bak ($([math]::Round((Get-Item $bak).Length/1MB,1)) MB)"
} else {
    Write-Host "  tar saknas; lÃ¤mnar fÃ¤rdig .stage-mapp pÃ¥ $tmp istÃ¤llet."
}

Write-Host ""
Write-Host "KLART. Du kan nu (nÃ¤r Oracle-VM Ã¤r igÃ¥ng) ladda upp $bak till servern."
Write-Host "Alternativt kopiera hela mappen 'oracle-move-kit' till servern."