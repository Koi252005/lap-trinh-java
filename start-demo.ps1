# BICAP - Script chạy demo (SQL Server + Backend + Frontend)
# Chạy: .\start-demo.ps1   hoặc chuột phải -> Run with PowerShell
# Yêu cầu: Mở Docker Desktop trước (để chạy SQL Server).

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BICAP - Khoi dong Demo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Docker: start SQL Server neu Docker dang chay
Write-Host "`n[1/4] Kiem tra Docker & SQL Server..." -ForegroundColor Yellow
$dockerOk = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerOk = $true
        Write-Host "      Docker dang chay. Khoi dong container SQL Server..." -ForegroundColor Gray
        docker-compose up -d sql_server 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "      Cho SQL Server khoi dong (15 giay)..." -ForegroundColor Gray
            Start-Sleep -Seconds 15
        }
    }
} catch {}
if (-not $dockerOk) {
    Write-Host "      Docker chua chay. MO DOCKER DESKTOP, sau do chay lai script nay." -ForegroundColor Red
    Write-Host "      Hoac chay thu: docker-compose up -d sql_server" -ForegroundColor Gray
}
Set-Location $root

# 2. Backend
Write-Host "`n[2/4] Backend (Node) - port 5001" -ForegroundColor Yellow
Set-Location "$root\bicap-backend"
if (-not (Test-Path "node_modules")) {
    Write-Host "      npm install..." -ForegroundColor Gray
    npm install --silent 2>$null
}
Write-Host "      Chay backend: npm run dev (nen chay trong terminal rieng)" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\bicap-backend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 8

# 3. Seed san pham mau
Write-Host "`n[3/4] Tao san pham mau (seed)..." -ForegroundColor Yellow
Set-Location "$root\bicap-backend"
node scripts/addSampleProducts.js --local 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      (Seed co the chay lai sau khi backend ket noi DB thanh cong)" -ForegroundColor Gray
}
Start-Sleep -Seconds 2

# 4. Frontend
Write-Host "`n[4/4] Frontend (Next.js) - port 3000" -ForegroundColor Yellow
Set-Location "$root\bicap-web-client"
if (-not (Test-Path "node_modules")) {
    Write-Host "      npm install..." -ForegroundColor Gray
    npm install --silent 2>$null
}
Write-Host "      Chay frontend: npm run dev" -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\bicap-web-client'; npm run dev" -WindowStyle Normal

Set-Location $root
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Demo da khoi dong." -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend:  http://localhost:5001" -ForegroundColor White
Write-Host "  Neu chua co Docker: mo Docker Desktop, chay 'docker-compose up -d sql_server', roi khoi dong lai backend." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
