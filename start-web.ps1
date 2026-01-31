# Script tự động khởi động BICAP Web Application
# Chạy script này để khởi động cả Backend và Frontend

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BICAP - KHOI DONG TRANG WEB" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Hàm kiểm tra port có đang được sử dụng không
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Hàm dừng process trên port
function Stop-PortProcess {
    param([int]$Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            Write-Host "  Da dong process tren port $Port" -ForegroundColor Yellow
        }
    } catch {
        # Ignore errors
    }
}

# Dừng các process cũ
Write-Host "Dang dong cac process cu..." -ForegroundColor Yellow
Stop-PortProcess -Port 5001
Stop-PortProcess -Port 3000

# Dừng tất cả Node.js processes liên quan
$nodeProcs = Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { 
    $_.CommandLine -match "server.js|next dev|bicap" 
}
if ($nodeProcs) {
    foreach ($proc in $nodeProcs) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
        } catch {}
    }
    Start-Sleep -Seconds 2
    Write-Host "  Da dong cac Node.js process cu" -ForegroundColor Yellow
}

# Xóa cache và lock files
Write-Host "Dang xoa cache..." -ForegroundColor Yellow
$frontendPath = "bicap-web-client"
if (Test-Path "$frontendPath\.next\dev\lock") {
    Remove-Item -Force "$frontendPath\.next\dev\lock" -ErrorAction SilentlyContinue
}
if (Test-Path "$frontendPath\.next\cache") {
    Remove-Item -Recurse -Force "$frontendPath\.next\cache" -ErrorAction SilentlyContinue
}
Write-Host "  Da xoa cache frontend" -ForegroundColor Yellow

Write-Host ""
Write-Host "Dang khoi dong Backend..." -ForegroundColor Cyan

# Khởi động Backend
$backendPath = "bicap-backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "ERROR: Khong tim thay thu muc $backendPath" -ForegroundColor Red
    exit 1
}

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm start
} -ArgumentList (Resolve-Path $backendPath)

Write-Host "  Backend da khoi dong (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Đợi backend khởi động
Write-Host "  Dang cho backend khoi dong..." -ForegroundColor Yellow
$backendReady = $false
for ($i = 1; $i -le 15; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Port -Port 5001) {
        $backendReady = $true
        Write-Host "  Backend da san sang!" -ForegroundColor Green
        break
    }
    Write-Host "  ." -NoNewline -ForegroundColor Gray
}
Write-Host ""

if (-not $backendReady) {
    Write-Host "  WARNING: Backend chua khoi dong xong, nhung se tiep tuc..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Dang khoi dong Frontend..." -ForegroundColor Cyan

# Khởi động Frontend
$frontendPath = "bicap-web-client"
if (-not (Test-Path $frontendPath)) {
    Write-Host "ERROR: Khong tim thay thu muc $frontendPath" -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    exit 1
}

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    $env:PORT = "3000"
    npm run dev
} -ArgumentList (Resolve-Path $frontendPath)

Write-Host "  Frontend da khoi dong (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Đợi frontend khởi động
Write-Host "  Dang cho frontend khoi dong..." -ForegroundColor Yellow
$frontendReady = $false
for ($i = 1; $i -le 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Port -Port 3000) {
        $frontendReady = $true
        Write-Host "  Frontend da san sang!" -ForegroundColor Green
        break
    }
    Write-Host "  ." -NoNewline -ForegroundColor Gray
}
Write-Host ""

# Kiểm tra lại sau 5 giây
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  TRANG THAI SERVER" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Backend
if (Test-Port -Port 5001) {
    Write-Host "  [OK] Backend:  http://localhost:5001" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Backend: Chua khoi dong" -ForegroundColor Red
}

# Kiểm tra Frontend
if (Test-Port -Port 3000) {
    Write-Host "  [OK] Frontend: http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Frontend: Chua khoi dong" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  HUONG DAN" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Mo browser va vao: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  De dung server:" -ForegroundColor Yellow
Write-Host "    Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "    Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Hoac nhan Ctrl+C de dung script (server van tiep tuc chay)" -ForegroundColor Yellow
Write-Host ""

# Giữ script chạy để theo dõi
Write-Host "Dang theo doi server (nhan Ctrl+C de thoat, server van tiep tuc chay)..." -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Kiểm tra jobs còn chạy không
        $backendStatus = Get-Job -Id $backendJob.Id -ErrorAction SilentlyContinue
        $frontendStatus = Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue
        
        if (-not $backendStatus -or $backendStatus.State -eq "Failed") {
            Write-Host "  [WARNING] Backend job da dung!" -ForegroundColor Yellow
        }
        if (-not $frontendStatus -or $frontendStatus.State -eq "Failed") {
            Write-Host "  [WARNING] Frontend job da dung!" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host ""
    Write-Host "Script da dung, nhung server van dang chay trong background." -ForegroundColor Yellow
    Write-Host "De dung server, chay lenh:" -ForegroundColor Yellow
    Write-Host "  Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
    Write-Host "  Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor White
}
