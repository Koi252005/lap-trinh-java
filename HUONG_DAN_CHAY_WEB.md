# 🚀 Hướng Dẫn Chạy Web Client với Docker

## ✅ Trạng thái hiện tại

Ứng dụng web đã được build và đang chạy thành công!

- **URL truy cập**: http://localhost:3000
- **Container**: `bicap_frontend`
- **Port**: 3000

## 📋 Yêu cầu

1. **Docker Desktop** đã được cài đặt và đang chạy
2. **File `.env`** trong thư mục root (`e:\XDLTHDT\.env`) với cấu hình Firebase

## 🔧 Các cách chạy ứng dụng

### Cách 1: Sử dụng Docker Compose (Khuyến nghị)

Docker Compose sẽ tự động quản lý các service (Database, Backend, Frontend) và biến môi trường.

#### Chạy toàn bộ hệ thống (Database + Backend + Frontend):
```powershell
cd e:\XDLTHDT
docker-compose up -d
```

#### Chỉ chạy Frontend:
```powershell
cd e:\XDLTHDT
docker-compose up -d frontend
```

#### Xem logs:
```powershell
docker-compose logs -f frontend
```

#### Dừng ứng dụng:
```powershell
docker-compose down
```

#### Dừng chỉ Frontend:
```powershell
docker-compose stop frontend
```

### Cách 2: Sử dụng Docker trực tiếp

#### Build image:
```powershell
cd e:\XDLTHDT\bicap-web-client
docker build -t bicap-web-client .
```

**Lưu ý**: Khi build trực tiếp, bạn cần truyền các build arguments cho Firebase config:
```powershell
docker build `
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key" `
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_domain" `
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id" `
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_bucket" `
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id" `
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id" `
  --build-arg NEXT_PUBLIC_API_URL="http://localhost:5001/api" `
  -t bicap-web-client .
```

#### Chạy container:
```powershell
docker run -d -p 3000:3000 --name bicap-web-client bicap-web-client
```

#### Xem logs:
```powershell
docker logs -f bicap-web-client
```

#### Dừng container:
```powershell
docker stop bicap-web-client
docker rm bicap-web-client
```

## 🔍 Kiểm tra trạng thái

### Kiểm tra container đang chạy:
```powershell
docker-compose ps
# hoặc
docker ps
```

### Kiểm tra logs:
```powershell
docker-compose logs frontend
# hoặc xem logs real-time
docker-compose logs -f frontend
```

### Kiểm tra ứng dụng:
Mở trình duyệt và truy cập: **http://localhost:3000**

## 🔄 Rebuild khi có thay đổi code

Khi bạn thay đổi code, cần rebuild image:

```powershell
cd e:\XDLTHDT
docker-compose build frontend
docker-compose up -d frontend
```

Hoặc rebuild và restart cùng lúc:
```powershell
docker-compose up -d --build frontend
```

## ⚙️ Cấu hình Firebase

Đảm bảo file `.env` trong thư mục root có đầy đủ các biến môi trường:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

Xem chi tiết trong file `FIREBASE_SETUP_GUIDE.md`

## 🐛 Troubleshooting

### Lỗi: Port 3000 đã được sử dụng

**Giải pháp**: Thay đổi port trong `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Thay đổi 3000 thành 3001
```

### Lỗi: Build failed

**Giải pháp**:
1. Kiểm tra file `.env` có đầy đủ biến môi trường không
2. Xóa cache và rebuild:
   ```powershell
   docker-compose build --no-cache frontend
   ```

### Lỗi: Container không start

**Giải pháp**:
1. Xem logs để biết lỗi:
   ```powershell
   docker-compose logs frontend
   ```
2. Kiểm tra Docker Desktop đang chạy
3. Kiểm tra port 3000 có bị chiếm không

### Lỗi: Firebase không hoạt động

**Giải pháp**:
1. Kiểm tra file `.env` có giá trị thực (không phải placeholder)
2. Rebuild container sau khi sửa `.env`:
   ```powershell
   docker-compose build frontend
   docker-compose up -d frontend
   ```

## 📝 Lệnh hữu ích

```powershell
# Xem tất cả containers
docker-compose ps

# Xem logs của tất cả services
docker-compose logs

# Restart frontend
docker-compose restart frontend

# Xóa và tạo lại container
docker-compose up -d --force-recreate frontend

# Xóa image và rebuild từ đầu
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 🎯 Tóm tắt nhanh

```powershell
# Chạy ứng dụng
cd e:\XDLTHDT
docker-compose up -d frontend

# Xem logs
docker-compose logs -f frontend

# Truy cập: http://localhost:3000

# Dừng ứng dụng
docker-compose stop frontend
```

---

**Lưu ý**: Ứng dụng web cần Backend API chạy ở port 5001 để hoạt động đầy đủ. Nếu chỉ chạy frontend, một số tính năng có thể không hoạt động.
