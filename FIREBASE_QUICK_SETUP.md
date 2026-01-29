# 🔥 Hướng Dẫn Cấu Hình Firebase Nhanh

## Bước 1: Tạo Firebase Project (Nếu chưa có)

1. Truy cập: https://console.firebase.google.com/
2. Click **"Add project"** hoặc chọn project có sẵn
3. Điền tên project (ví dụ: "BICAP")
4. Click **"Create project"**

## Bước 2: Thêm Web App

1. Trong Firebase Console, click vào icon **Web** (`</>`) ở trang chủ
2. Điền **App nickname**: "BICAP Web Client"
3. **KHÔNG** tích vào "Also set up Firebase Hosting"
4. Click **"Register app"**
5. Bạn sẽ thấy đoạn code như này:

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

## Bước 3: Bật Authentication

1. Trong Firebase Console, vào **Authentication** (menu bên trái)
2. Click **"Get started"**
3. Vào tab **"Sign-in method"**
4. Bật các provider:
   - ✅ **Email/Password** → Click "Enable" → Save
   - ✅ **Google** → Click "Enable" → Save

## Bước 4: Copy Config vào File .env

1. Mở file: `bicap-web-client\.env.local`
2. Copy các giá trị từ Firebase Console và thay thế:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**⚠️ QUAN TRỌNG:**
- Thay `your-project-id` bằng Project ID thực của bạn
- Thay tất cả các giá trị `your_*` bằng giá trị thực từ Firebase Console
- KHÔNG để khoảng trắng thừa

## Bước 5: Restart Dev Server

Sau khi cấu hình xong, restart dev server:

```powershell
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
cd bicap-web-client
npm run dev
```

## Kiểm Tra

1. Mở browser: http://localhost:3000
2. Vào trang Login
3. Nếu không còn cảnh báo Firebase config → ✅ Thành công!
4. Thử đăng nhập với Email/Password hoặc Google

## Lấy Lại Config (Nếu quên)

1. Vào Firebase Console > Project Settings (icon ⚙️)
2. Scroll xuống phần **"Your apps"**
3. Click vào Web app của bạn
4. Copy lại các giá trị từ `firebaseConfig`
