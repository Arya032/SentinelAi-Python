# ============================================================
#  SentinelAI — One-Click Installer
#  Right-click this file and choose "Run with PowerShell"
# ============================================================
param()
$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Re-launch as Administrator if needed ────────────────────
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]'Administrator')
if (-not $isAdmin) {
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    exit
}

Clear-Host
Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "    SENTINELAI -- ENTERPRISE CYBER DEFENSE" -ForegroundColor Cyan
Write-Host "    Connecting your PC to your personal dashboard" -ForegroundColor Cyan
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Ask for CYENEX.AI account email ─────────────────
Write-Host "  To link this PC to your dashboard at CYENEX.AI," -ForegroundColor White
Write-Host "  enter the email you used to sign up:" -ForegroundColor White
Write-Host ""
$userEmail = Read-Host "  Your CYENEX.AI email"
if (-not $userEmail -or -not $userEmail.Contains('@')) {
    Write-Host "  [!] Invalid email. Defaulting to anonymous mode." -ForegroundColor Yellow
    $userEmail = "anonymous@sentinelai.local"
}

# Sanitize email into a Firebase-safe key (replace . @ with _)
$userId = $userEmail.ToLower() -replace '[^a-z0-9]', '_'
$deviceName = $env:COMPUTERNAME

Write-Host ""
Write-Host "  Account  : $userEmail" -ForegroundColor Green
Write-Host "  Device   : $deviceName" -ForegroundColor Green
Write-Host "  Dashboard: https://arya032.github.io/SentinelAi-Website/dashboard.html" -ForegroundColor Cyan
Write-Host ""

# ── Step 2: Install to Program Files ────────────────────────
$installDir = "$env:ProgramFiles\SentinelAI"
Write-Host "  [1/4] Installing to $installDir ..." -ForegroundColor White
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item -Path "$ScriptDir\*" -Destination $installDir -Recurse -Force
Write-Host "        Done." -ForegroundColor Green

# ── Step 3: Write config.json (links agent to dashboard) ────
$config = @{
    user_email  = $userEmail
    user_id     = $userId
    device_name = $deviceName
    installed   = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
} | ConvertTo-Json

$config | Out-File -FilePath "$installDir\config.json" -Encoding UTF8
Write-Host "  [2/4] User config saved (device linked to $userEmail)." -ForegroundColor Green

# ── Step 4: Register Windows Service ────────────────────────
Write-Host "  [3/4] Registering Windows Service (auto-starts at boot)..." -ForegroundColor White
$exePath = "$installDir\SentinelAI.exe"
sc.exe stop  SentinelAIEDR 2>$null | Out-Null
sc.exe delete SentinelAIEDR 2>$null | Out-Null
Start-Sleep -Seconds 1
sc.exe create SentinelAIEDR binPath= "`"$exePath`"" start= auto DisplayName= "SentinelAI - Enterprise Cyber Defense" | Out-Null
sc.exe description SentinelAIEDR "AryaShield AI-powered zero-day threat detection. Starts at every boot." | Out-Null
sc.exe failure SentinelAIEDR reset= 86400 actions= restart/5000/restart/10000/restart/30000 | Out-Null
Write-Host "        Done." -ForegroundColor Green

# ── Step 5: Start it now ─────────────────────────────────────
Write-Host "  [4/4] Starting SentinelAI protection..." -ForegroundColor White
sc.exe start SentinelAIEDR | Out-Null
Start-Sleep -Seconds 3
$status = sc.exe query SentinelAIEDR | Select-String 'STATE'
Write-Host "        Status: $status" -ForegroundColor Green

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Green
Write-Host "    SENTINELAI IS NOW PROTECTING THIS PC" -ForegroundColor Green
Write-Host "    - Running silently in background" -ForegroundColor Green  
Write-Host "    - Starts automatically at every boot" -ForegroundColor Green
Write-Host "    - Reporting to your dashboard as: $userEmail" -ForegroundColor Green
Write-Host ""
Write-Host "    View your dashboard at:" -ForegroundColor White
Write-Host "    https://arya032.github.io/SentinelAi-Website/dashboard.html" -ForegroundColor Cyan
Write-Host "  ============================================================" -ForegroundColor Green
Write-Host ""
Read-Host "  Press Enter to close"
