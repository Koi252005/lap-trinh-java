# 🔥 Hướng Dẫn Cấu Hình Firebase cho BICAP

## ⚠️ Lỗi Thường Gặp

Nếu bạn gặp lỗi: **"Firebase: Error (auth/api-key-not-valid)"**, điều này có nghĩa là Firebase chưa được cấu hình đúng.

## 📋 Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** hoặc chọn project có sẵn
3. Điền tên project (ví dụ: "BICAP")
4. Chọn **Google Analytics** (tùy chọn)
5. Click **"Create project"**

## 📋 Bước 2: Thêm Web App vào Firebase Project

1. Trong Firebase Console, chọn project của bạn
2. Click vào icon **Web** (`</>`) ở trang chủ
3. Điền **App nickname** (ví dụ: "BICAP Web Client")
4. **KHÔNG** tích vào "Also set up Firebase Hosting"
5. Click **"Register app"**
6. Copy các giá trị từ `firebaseConfig`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 📋 Bước 3: Bật Authentication

1. Trong Firebase Console, vào **Authentication** (bên trái)
2. Click **"Get started"**
3. Bật các **Sign-in providers** bạn muốn sử dụng:
   - ✅ **Email/Password** (bắt buộc)
   - ✅ **Google** (khuyến nghị)
4. Lưu ý: Với Google, bạn cần thêm **Authorized domains** nếu chạy trên domain khác localhost

## 📋 Bước 4: Cấu Hình File .env

Tạo hoặc chỉnh sửa file `.env` trong thư mục root (`E:\XDLTHDT\.env`):

```env
# Firebase Configuration (REQUIRED - Thay thế bằng giá trị thực từ Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# API URL
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**⚠️ QUAN TRỌNG:**
- Thay thế TẤT CẢ các giá trị `your_*` và placeholder bằng giá trị thực từ Firebase Console
- KHÔNG để các giá trị như `your_firebase_api_key_here` hoặc `your_project_id`
- File `.env` không được commit lên Git (đã có trong .gitignore)

## 📋 Bước 5: Kiểm Tra Cấu Hình

Sau khi cấu hình xong, kiểm tra:

1. **File .env có tồn tại không:**
   ```powershell
   Test-Path .env
   ```

2. **File .env có giá trị thực không:**
   ```powershell
   Get-Content .env | Select-String "NEXT_PUBLIC_FIREBASE"
   ```
   
   Kết quả phải KHÔNG chứa các từ như: `your_`, `placeholder`, `example`

3. **Rebuild Docker container:**
   ```powershell
   docker-compose down
   docker-compose build frontend
   docker-compose up
   ```

## 🔍 Troubleshooting

### Lỗi: "Firebase: Error (auth/api-key-not-valid)"

**Nguyên nhân:**
- API key chưa được cấu hình hoặc sai
- File .env chưa được load đúng trong Docker

**Giải pháp:**
1. Kiểm tra file `.env` có đúng format không
2. Đảm bảo các giá trị không có khoảng trắng thừa
3. Rebuild Docker container: `docker-compose build frontend`
4. Kiểm tra logs: `docker-compose logs frontend`

### Lỗi: "Firebase: Error (auth/unauthorized-domain)"

**Nguyên nhân:**
- Domain hiện tại chưa được thêm vào Authorized domains trong Firebase

**Giải pháp:**
1. Vào Firebase Console > Authentication > Settings
2. Thêm domain vào **Authorized domains**:
   - `localhost` (đã có sẵn)
   - Domain của bạn nếu deploy

### Lỗi: "Firebase: Error (auth/popup-blocked)"

**Nguyên nhân:**
- Trình duyệt đã chặn popup

**Giải pháp:**
1. Cho phép popup cho localhost
2. Thử lại đăng nhập

## 📚 Tài Liệu Tham Khảo

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## ✅ Checklist

- [ ] Firebase project đã được tạo
- [ ] Web app đã được thêm vào Firebase project
- [ ] Authentication đã được bật (Email/Password, Google)
- [ ] File `.env` đã được tạo với các giá trị thực
- [ ] Docker container đã được rebuild
- [ ] Đã test đăng nhập thành công
