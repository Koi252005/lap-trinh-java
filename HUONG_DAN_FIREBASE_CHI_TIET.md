# 🔥 HƯỚNG DẪN CẤU HÌNH FIREBASE - TỪNG BƯỚC CHI TIẾT

## BƯỚC 1: Tạo Firebase Project

1. Mở trình duyệt và vào: **https://console.firebase.google.com/**
2. Đăng nhập bằng tài khoản Google của bạn
3. Click nút **"Add project"** (hoặc chọn project có sẵn nếu đã có)
4. Điền tên project: `BICAP` (hoặc tên bạn muốn)
5. Click **"Continue"**
6. Chọn **Google Analytics** (có thể bỏ qua) → Click **"Continue"**
7. Click **"Create project"**
8. Đợi Firebase tạo project xong → Click **"Continue"**

## BƯỚC 2: Thêm Web App vào Firebase Project

1. Trong trang chủ Firebase Console, bạn sẽ thấy các icon:
   - iOS (🍎)
   - Android (🤖)
   - **Web (</>)** ← **Click vào icon này**

2. Điền thông tin:
   - **App nickname**: `BICAP Web Client`
   - **KHÔNG** tích vào "Also set up Firebase Hosting"
   - Click **"Register app"**

3. Bạn sẽ thấy một đoạn code JavaScript như này:

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

4. **COPY** các giá trị này (bạn sẽ cần dán vào file .env.local)

## BƯỚC 3: Bật Authentication

1. Trong Firebase Console, nhìn menu bên trái → Click **"Authentication"**
2. Click **"Get started"** (nếu lần đầu)
3. Vào tab **"Sign-in method"**
4. Bật các phương thức đăng nhập:

   **a) Email/Password:**
   - Click vào dòng **"Email/Password"**
   - Bật toggle **"Enable"**
   - Click **"Save"**

   **b) Google (tùy chọn nhưng khuyến nghị):**
   - Click vào dòng **"Google"**
   - Bật toggle **"Enable"**
   - Điền **Project support email** (email của bạn)
   - Click **"Save"**

## BƯỚC 4: Điền Config vào File .env.local

1. Mở file: `bicap-web-client\.env.local` (bằng Notepad hoặc VS Code)

2. Bạn sẽ thấy file có dạng như này:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Thay thế từng dòng bằng giá trị từ Firebase Console:

   **Ví dụ:**
   - Từ Firebase: `apiKey: "AIzaSyABC123..."`
   - Trong file: `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123...`

   **Lưu ý:**
   - Bỏ dấu ngoặc kép `"` và dấu phẩy `,`
   - Không có khoảng trắng thừa
   - Giữ nguyên format: `TEN_BIEN=gia_tri`

4. **Ví dụ file .env.local hoàn chỉnh:**

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123XYZ789
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bicap-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bicap-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bicap-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZVDJEQN2Y4
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

5. **Lưu file** (Ctrl+S)

## BƯỚC 5: Restart Dev Server

1. Dừng dev server hiện tại (nếu đang chạy): Nhấn **Ctrl+C** trong terminal

2. Chạy lại:
   ```powershell
   cd bicap-web-client
   npm run dev
   ```

3. Mở browser: **http://localhost:3000**

4. Vào trang Login → Nếu không còn cảnh báo Firebase → ✅ **Thành công!**

## KIỂM TRA LẠI CONFIG (Nếu quên giá trị)

1. Vào Firebase Console → Chọn project của bạn
2. Click icon **⚙️ Settings** (bên trái) → **"Project settings"**
3. Scroll xuống phần **"Your apps"**
4. Click vào Web app của bạn
5. Copy lại các giá trị từ `firebaseConfig`

## TROUBLESHOOTING

### Lỗi: "Firebase: Error (auth/invalid-api-key)"
- Kiểm tra lại API Key trong file .env.local
- Đảm bảo không có khoảng trắng thừa
- Restart dev server

### Lỗi: "Firebase: Error (auth/unauthorized-domain)"
- Vào Firebase Console → Authentication → Settings
- Thêm domain vào **Authorized domains**: `localhost`

### Vẫn thấy cảnh báo Firebase chưa cấu hình
- Kiểm tra file `.env.local` có đúng đường dẫn: `bicap-web-client\.env.local`
- Đảm bảo các giá trị không có từ `your_`, `placeholder`, `example`
- Restart dev server

## ✅ CHECKLIST

- [ ] Đã tạo Firebase project
- [ ] Đã thêm Web app vào Firebase
- [ ] Đã bật Email/Password authentication
- [ ] Đã bật Google authentication (tùy chọn)
- [ ] Đã copy các giá trị từ firebaseConfig
- [ ] Đã điền vào file `.env.local`
- [ ] Đã restart dev server
- [ ] Đã test đăng nhập thành công
