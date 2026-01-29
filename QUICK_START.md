# 🚀 Quick Start Guide - Chạy Test Web Client

## ✅ Đã chuẩn bị sẵn

1. ✅ **Docker images đã được build:**
   - ✅ Backend image: `xdlthdt-backend`
   - ✅ Frontend image: `xdlthdt-frontend`
   - ✅ SQL Server sẽ tự động pull khi chạy

2. ✅ **File cấu hình đã được tạo:**
   - ✅ `.env` (root) - Cần điền Firebase config
   - ✅ `bicap-backend/.env` - Đã cấu hình sẵn

## ⚠️ QUAN TRỌNG: Cần điền Firebase Config

Trước khi chạy, bạn **PHẢI** điền Firebase config vào file `.env` trong thư mục root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Lấy Firebase Config:**
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Project Settings** > **General**
4. Scroll xuống phần **Your apps** > chọn Web app
5. Copy các giá trị từ `firebaseConfig`

## 🚀 Chạy ứng dụng

### Cách 1: Chạy toàn bộ hệ thống (Khuyến nghị)

```powershell
cd E:\XDLTHDT
docker-compose up
```

### Cách 2: Chạy ở chế độ background

```powershell
docker-compose up -d
```

### Cách 3: Chạy từng service riêng

```powershell
# 1. Chạy Database
docker-compose up sql_server -d

# 2. Chạy Backend (sau khi database sẵn sàng ~30 giây)
docker-compose up backend

# 3. Chạy Frontend (trong terminal khác)
docker-compose up frontend
```

## 🌐 Truy cập ứng dụng

Sau khi chạy thành công:

- **Web Client:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **SQL Server:** localhost:1433
  - Username: `sa`
  - Password: `BiCapProject@123`

## 🔍 Kiểm tra trạng thái

```powershell
# Xem danh sách containers
docker-compose ps

# Xem logs
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

## 🔄 Rebuild sau khi sửa code

```powershell
# Rebuild và chạy lại
docker-compose up --build

# Chỉ rebuild một service
docker-compose up --build frontend
docker-compose up --build backend
```

## ⚠️ Troubleshooting

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra file `.env` đã điền đúng Firebase config chưa
- Đảm bảo không có khoảng trắng thừa trong các giá trị

### Lỗi: Port đã được sử dụng
- Kiểm tra xem có ứng dụng nào đang dùng port 3000, 5001, hoặc 1433 không
- Dừng các ứng dụng đó hoặc đổi port trong `docker-compose.yml`

### Backend không kết nối được Database
- Đợi khoảng 30 giây sau khi SQL Server khởi động
- Kiểm tra logs: `docker-compose logs backend`

### Frontend không load được
- Kiểm tra Firebase config trong `.env`
- Kiểm tra logs: `docker-compose logs frontend`
- Đảm bảo backend đang chạy: `docker-compose ps`

## 📝 Ghi chú

- **Database data** được lưu trong `.docker_data_new/sql/` - không bị mất khi restart
- **Backend uploads** được lưu trong `bicap-backend/uploads/`
- **Firebase config** là bắt buộc để web client hoạt động
- Tất cả images đã được build sẵn, chỉ cần điền Firebase config và chạy!

## 📖 Tài liệu thêm

- Xem `SETUP_DOCKER.md` để biết chi tiết về cấu hình
- Xem `README.md` để biết về kiến trúc hệ thống

