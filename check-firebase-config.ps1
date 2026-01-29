# Script kiem tra cau hinh Firebase
# Chay: .\check-firebase-config.ps1

Write-Host "`n🔥 Kiem Tra Cau Hinh Firebase" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$envFile = ".env"
$errors = @()
$warnings = @()

# Kiem tra file .env
if (-not (Test-Path $envFile)) {
    Write-Host "`n❌ File .env khong ton tai!" -ForegroundColor Red
    Write-Host "   Vui long tao file .env trong thu muc root voi noi dung:" -ForegroundColor Yellow
    Write-Host "   Xem file FIREBASE_SETUP_GUIDE.md de biet cach cau hinh" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ File .env da ton tai" -ForegroundColor Green

# Doc file .env
$envContent = Get-Content $envFile -Raw

# Danh sach cac bien can kiem tra
$requiredVars = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

# Patterns de phat hien placeholder
$placeholderPatterns = @(
    "your_",
    "placeholder",
    "example",
    "change_this",
    "your_firebase",
    "your_project"
)

Write-Host "`n📋 Kiem tra tung bien moi truong:" -ForegroundColor Yellow

foreach ($var in $requiredVars) {
    # Tim gia tri cua bien
    $pattern = "$var=(.+)"
    if ($envContent -match $pattern) {
        $value = $matches[1].Trim()
        
        # Kiem tra neu la placeholder
        $isPlaceholder = $false
        foreach ($pattern in $placeholderPatterns) {
            if ($value -like "*$pattern*") {
                $isPlaceholder = $true
                break
            }
        }
        
        if ([string]::IsNullOrWhiteSpace($value) -or $isPlaceholder) {
            Write-Host "  ❌ $var" -ForegroundColor Red
            Write-Host "     Gia tri: $value" -ForegroundColor Gray
            $errors += $var
        } else {
            # An mot phan gia tri de bao mat
            $displayValue = if ($value.Length -gt 20) {
                $value.Substring(0, 10) + "..." + $value.Substring($value.Length - 5)
            } else {
                "***"
            }
            Write-Host "  ✅ $var" -ForegroundColor Green
            Write-Host "     Gia tri: $displayValue" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ❌ $var" -ForegroundColor Red
        Write-Host "     Khong tim thay trong file .env" -ForegroundColor Gray
        $errors += $var
    }
}

# Tong ket
Write-Host "`n" + "="*50 -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n✅ Tat ca cau hinh Firebase da dung!" -ForegroundColor Green
    Write-Host "   Ban co the chay ung dung ngay bay gio." -ForegroundColor Green
    Write-Host "`n💡 Luu y: Neu van gap loi, hay rebuild Docker container:" -ForegroundColor Yellow
    Write-Host "   docker-compose build frontend" -ForegroundColor Gray
    Write-Host "   docker-compose up" -ForegroundColor Gray
    exit 0
} else {
    Write-Host "`n❌ Phat hien $($errors.Count) loi cau hinh!" -ForegroundColor Red
    Write-Host "`nCac bien can sua:" -ForegroundColor Yellow
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host "`n📖 Huong dan:" -ForegroundColor Yellow
    Write-Host "   1. Mo file .env trong thu muc root" -ForegroundColor White
    Write-Host "   2. Thay the cac gia tri placeholder bang gia tri thuc tu Firebase Console" -ForegroundColor White
    Write-Host "   3. Xem file FIREBASE_SETUP_GUIDE.md de biet cach lay Firebase config" -ForegroundColor White
    Write-Host "   4. Chay lai script nay de kiem tra" -ForegroundColor White
    exit 1
}
