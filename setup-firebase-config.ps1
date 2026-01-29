# Script để cấu hình Firebase cho BICAP Web Client
# Chạy script này và điền các giá trị từ Firebase Console

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🔥 Cấu Hình Firebase cho BICAP" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$envFile = "bicap-web-client\.env.local"

# Kiểm tra file .env.local có tồn tại không
if (-not (Test-Path $envFile)) {
    Write-Host "⚠️  File .env.local chưa tồn tại. Đang tạo mới..." -ForegroundColor Yellow
    
    @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZVDJEQN2Y4
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✅ Đã tạo file .env.local" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Hướng dẫn lấy Firebase Config:" -ForegroundColor Cyan
Write-Host "1. Vào https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Chọn project của bạn (hoặc tạo mới)" -ForegroundColor White
Write-Host "3. Click vào icon Web (</>) để thêm Web app" -ForegroundColor White
Write-Host "4. Copy các giá trị từ firebaseConfig" -ForegroundColor White
Write-Host ""
Write-Host "Nhấn Enter để tiếp tục..." -ForegroundColor Yellow
Read-Host

# Đọc các giá trị hiện tại
$currentContent = Get-Content $envFile -Raw
$apiKey = ""
$authDomain = ""
$projectId = ""
$storageBucket = ""
$messagingSenderId = ""
$appId = ""

# Parse các giá trị hiện tại
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_API_KEY=(.+)") {
    $apiKey = $matches[1].Trim()
}
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=(.+)") {
    $authDomain = $matches[1].Trim()
}
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_PROJECT_ID=(.+)") {
    $projectId = $matches[1].Trim()
}
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=(.+)") {
    $storageBucket = $matches[1].Trim()
}
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=(.+)") {
    $messagingSenderId = $matches[1].Trim()
}
if ($currentContent -match "NEXT_PUBLIC_FIREBASE_APP_ID=(.+)") {
    $appId = $matches[1].Trim()
}

# Nhập các giá trị
Write-Host ""
Write-Host "Nhập các giá trị Firebase (Enter để giữ giá trị hiện tại):" -ForegroundColor Cyan
Write-Host ""

$newApiKey = Read-Host "API Key [$apiKey]"
if ($newApiKey) { $apiKey = $newApiKey }

$newAuthDomain = Read-Host "Auth Domain [$authDomain]"
if ($newAuthDomain) { $authDomain = $newAuthDomain }

$newProjectId = Read-Host "Project ID [$projectId]"
if ($newProjectId) { $projectId = $newProjectId }

$newStorageBucket = Read-Host "Storage Bucket [$storageBucket]"
if ($newStorageBucket) { $storageBucket = $newStorageBucket }

$newMessagingSenderId = Read-Host "Messaging Sender ID [$messagingSenderId]"
if ($newMessagingSenderId) { $messagingSenderId = $newMessagingSenderId }

$newAppId = Read-Host "App ID [$appId]"
if ($newAppId) { $appId = $newAppId }

# Ghi lại file
$newContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=$apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=$appId
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZVDJEQN2Y4
NEXT_PUBLIC_API_URL=http://localhost:5001/api
"@

$newContent | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ Đã cập nhật file .env.local thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 File được lưu tại: $((Resolve-Path $envFile).Path)" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  QUAN TRỌNG:" -ForegroundColor Yellow
Write-Host "1. Đảm bảo bạn đã bật Authentication trong Firebase Console:" -ForegroundColor White
Write-Host "   - Email/Password" -ForegroundColor White
Write-Host "   - Google (nếu muốn dùng)" -ForegroundColor White
Write-Host ""
Write-Host "2. Restart dev server để áp dụng thay đổi:" -ForegroundColor White
Write-Host "   cd bicap-web-client" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
