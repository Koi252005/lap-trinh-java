# 🔥 HƯỚNG DẪN CẤU HÌNH FIREBASE ADMIN SDK CHO BACKEND

## ❌ VẤN ĐỀ HIỆN TẠI

Backend đang báo lỗi **401 "Token không hợp lệ"** vì:
- Frontend đã có Firebase config ✅
- Backend **CHƯA** có Firebase Admin SDK config ❌
- Backend không thể verify token từ frontend → 401 Unauthorized

## ✅ GIẢI PHÁP: Tạo Service Account Key

### BƯỚC 1: Vào Firebase Console

1. Mở: **https://console.firebase.google.com/**
2. Chọn project của bạn (ví dụ: `lap-trinh-java`)

### BƯỚC 2: Tạo Service Account

1. Click icon **⚙️ Settings** (bên trái) → **"Project settings"**
2. Vào tab **"Service accounts"**
3. Click **"Generate new private key"**
4. Click **"Generate key"** trong popup cảnh báo
5. File JSON sẽ được download về máy (tên file như: `lap-trinh-java-firebase-adminsdk-xxxxx.json`)

### BƯỚC 3: Đặt File vào Backend

1. Đổi tên file thành: `serviceAccountKey.json`
2. Copy file vào thư mục: `bicap-backend\src\config\serviceAccountKey.json`

**⚠️ QUAN TRỌNG:**
- File này chứa **credentials quan trọng** - KHÔNG commit lên Git
- File đã có trong `.gitignore` nên an toàn

### BƯỚC 4: Restart Backend

Sau khi đặt file xong:

```powershell
# Dừng backend hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd bicap-backend
npm start
```

### BƯỚC 5: Kiểm Tra

Backend sẽ log:
```
✅ Firebase Admin Initialized successfully.
```

Nếu thấy log này → ✅ **Thành công!**

## 📋 CẤU TRÚC FILE serviceAccountKey.json

File sẽ có dạng như này (ví dụ):

```json
{
  "type": "service_account",
  "project_id": "lap-trinh-java",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@lap-trinh-java.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

## 🔍 KIỂM TRA LẠI

1. File có đúng đường dẫn không?
   ```
   bicap-backend\src\config\serviceAccountKey.json
   ```

2. Backend có log "Firebase Admin Initialized" không?

3. Test lại đăng nhập trên frontend

## ⚠️ TROUBLESHOOTING

### Lỗi: "serviceAccountKey.json not found"
- Kiểm tra đường dẫn file
- Đảm bảo tên file đúng: `serviceAccountKey.json` (không có khoảng trắng)

### Lỗi: "Failed to initialize Firebase Admin"
- Kiểm tra file JSON có đúng format không
- Đảm bảo file không bị corrupt
- Thử download lại từ Firebase Console

### Vẫn báo 401 sau khi config
- Restart backend server
- Kiểm tra backend logs xem có lỗi gì không
- Đảm bảo frontend và backend dùng cùng Firebase project
