# 🐳 Hướng dẫn Setup Docker để Test Web Client

## 📋 Yêu cầu

1. **Docker Desktop** đã được cài đặt và đang chạy
2. **Firebase Project** với các thông tin cấu hình

## 🔧 Bước 1: Tạo file `.env` trong thư mục root

Tạo file `.env` trong thư mục `E:\XDLTHDT` với nội dung sau:

```env
# Firebase Configuration (Required for Web Client Build)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Lấy Firebase Config:**
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** > **General**
4. Scroll xuống phần **Your apps** > chọn Web app
5. Copy các giá trị từ `firebaseConfig`

## 🔧 Bước 2: Tạo file `.env` cho Backend (nếu chưa có)

Tạo file `bicap-backend/.env` với nội dung:

```env
# Database
DB_HOST=sql_server
DB_NAME=BICAP
DB_USER=sa
DB_PASSWORD=BiCapProject@123
DB_PORT=1433

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Firebase Admin (Optional - nếu có serviceAccountKey.json thì không cần)
# FIREBASE_SERVICE_ACCOUNT=./src/config/serviceAccountKey.json

# VNPay (Optional - chỉ cần nếu test payment)
# VNPAY_TMN_CODE=your_tmn_code
# VNPAY_HASH_SECRET=your_hash_secret
# VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
# VNPAY_RETURN_URL=http://localhost:5001/api/payments/vnpay-return
# VNPAY_IP_ADDR=127.0.0.1

# Server
PORT=5001
CLIENT_URL=http://localhost:3000
```

## 🚀 Bước 3: Build và Chạy

### Cách 1: Chạy toàn bộ hệ thống (Database + Backend + Frontend)

```powershell
cd E:\XDLTHDT
docker-compose up --build
```

### Cách 2: Chạy từng service riêng

```powershell
# 1. Chạy Database
docker-compose up sql_server -d

# 2. Chạy Backend (sau khi database sẵn sàng)
docker-compose up backend --build

# 3. Chạy Frontend (sau khi backend sẵn sàng)
docker-compose up frontend --build
```

## 🌐 Truy cập ứng dụng

- **Web Client:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **SQL Server:** localhost:1433 (Username: `sa`, Password: `BiCapProject@123`)

## 🔍 Kiểm tra Logs

```powershell
# Xem logs tất cả services
docker-compose logs -f

# Xem logs từng service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f sql_server
```

## 🛑 Dừng hệ thống

```powershell
# Dừng tất cả
docker-compose stop

# Dừng và xóa containers
docker-compose down

# Dừng và xóa containers + volumes (xóa database)
docker-compose down -v
```

## ⚠️ Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra file `.env` trong root đã có đầy đủ Firebase config chưa
- Đảm bảo các giá trị Firebase đúng và không có khoảng trắng thừa

### Lỗi: "env file not found"
- Tạo file `bicap-backend/.env` với nội dung như hướng dẫn ở Bước 2

### Lỗi: Port đã được sử dụng
- Kiểm tra xem có ứng dụng nào đang dùng port 3000, 5001, hoặc 1433 không
- Dừng các ứng dụng đó hoặc đổi port trong `docker-compose.yml`

### Build bị lỗi
- Xóa cache Docker: `docker system prune -a`
- Build lại: `docker-compose build --no-cache`

