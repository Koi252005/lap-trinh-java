# Script Test Nhanh Các API Quan Trọng Trước Khi Trình Bày

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST API NHANH" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5001/api"

# Test 1: Backend Health Check
Write-Host "1. Kiem tra Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   [OK] Backend da san sang" -ForegroundColor Green
} catch {
    Write-Host "   [LOI] Backend chua san sang hoac co loi" -ForegroundColor Red
    Write-Host "   Chi tiet: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test 2: Public Products API
Write-Host "`n2. Kiem tra API Products (Public)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   [OK] API Products hoat dong" -ForegroundColor Green
} catch {
    Write-Host "   [LOI] API Products khong hoat dong" -ForegroundColor Red
}

# Test 3: Public Farms API
Write-Host "`n3. Kiem tra API Farms (Public)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/public/farms" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   [OK] API Farms hoat dong" -ForegroundColor Green
} catch {
    Write-Host "   [WARNING] API Farms co the khong ton tai hoac can authentication" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  KET QUA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "De test day du, vui long:" -ForegroundColor Yellow
Write-Host "1. Mo browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Dang ky/dang nhap voi cac role khac nhau" -ForegroundColor White
Write-Host "3. Test cac tinh nang theo checklist trong CHECKLIST_TRINH_BAY.md" -ForegroundColor White
Write-Host ""
