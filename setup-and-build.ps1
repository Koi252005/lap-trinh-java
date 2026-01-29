# Script tự động setup và build Docker cho BICAP Project
# Chạy script này: .\setup-and-build.ps1

Write-Host "🚀 BICAP Docker Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Kiểm tra Docker
Write-Host "`n📦 Kiểm tra Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker đã được cài đặt" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker chưa được cài đặt. Vui lòng cài đặt Docker Desktop trước." -ForegroundColor Red
    exit 1
}

# Kiểm tra file .env root
Write-Host "`n📝 Kiểm tra file .env trong root..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env chưa tồn tại. Đang tạo file mẫu..." -ForegroundColor Yellow
    @"
# Firebase Configuration (Required for Web Client Build)
# Vui lòng điền các giá trị Firebase của bạn vào đây
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Đã tạo file .env mẫu. Vui lòng điền các giá trị Firebase vào file .env trước khi build!" -ForegroundColor Yellow
    Write-Host "📖 Xem hướng dẫn trong file SETUP_DOCKER.md" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ File .env đã tồn tại" -ForegroundColor Green
}

# Kiểm tra file .env backend
Write-Host "`n📝 Kiểm tra file .env cho backend..." -ForegroundColor Yellow
if (-not (Test-Path "bicap-backend\.env")) {
    Write-Host "⚠️  File bicap-backend\.env chưa tồn tại. Đang tạo file mẫu..." -ForegroundColor Yellow
    @"
# Database
DB_HOST=sql_server
DB_NAME=BICAP
DB_USER=sa
DB_PASSWORD=BiCapProject@123
DB_PORT=1433
DB_SERVER=sql_server

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production_$(Get-Random)

# Server
PORT=5001
CLIENT_URL=http://localhost:3000
"@ | Out-File -FilePath "bicap-backend\.env" -Encoding UTF8
    Write-Host "✅ Đã tạo file bicap-backend\.env" -ForegroundColor Green
} else {
    Write-Host "✅ File bicap-backend\.env đã tồn tại" -ForegroundColor Green
}

# Kiểm tra Firebase config trong .env
Write-Host "`n🔍 Kiểm tra cấu hình Firebase..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your_firebase_api_key_here") {
    Write-Host "⚠️  Firebase config chưa được điền vào file .env!" -ForegroundColor Red
    Write-Host "📖 Vui lòng mở file .env và điền các giá trị Firebase của bạn" -ForegroundColor Yellow
    Write-Host "📖 Xem hướng dẫn trong file SETUP_DOCKER.md" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ Firebase config đã được cấu hình" -ForegroundColor Green
}

# Build Docker images
Write-Host "`n🔨 Bắt đầu build Docker images..." -ForegroundColor Yellow
Write-Host "⏳ Quá trình này có thể mất vài phút..." -ForegroundColor Yellow

# Build từng service
Write-Host "`n1️⃣  Building SQL Server image..." -ForegroundColor Cyan
# SQL Server sử dụng image có sẵn, không cần build

Write-Host "`n2️⃣  Building Backend..." -ForegroundColor Cyan
docker-compose build backend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build backend thất bại!" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣  Building Frontend..." -ForegroundColor Cyan
docker-compose build frontend
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build frontend thất bại!" -ForegroundColor Red
    Write-Host "💡 Kiểm tra lại Firebase config trong file .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Build thành công!" -ForegroundColor Green
Write-Host "`n🚀 Để chạy ứng dụng, sử dụng lệnh:" -ForegroundColor Cyan
Write-Host "   docker-compose up" -ForegroundColor White
Write-Host "`n📖 Hoặc chạy ở chế độ background:" -ForegroundColor Cyan
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host "`n🌐 Sau khi chạy, truy cập:" -ForegroundColor Cyan
Write-Host "   Web Client: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:5001/api" -ForegroundColor White

