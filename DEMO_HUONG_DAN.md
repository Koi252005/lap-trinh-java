# Hướng dẫn chạy demo BICAP (cho giảng viên)

## Trạng thái đã chạy sẵn (nếu vừa chạy lệnh)
- **SQL Server**: Đang chạy trong Docker (port 1433).
- **Backend**: Đang chạy tại http://localhost:5001, đã kết nối DB và có **15 sản phẩm mẫu**.
- **Frontend**: Bạn cần tự chạy (xem Bước 3 bên dưới).

---

## Chuẩn bị nhanh (3 bước)

### Bước 1: Mở Docker Desktop
- Mở **Docker Desktop** và đợi đến khi biểu tượng Docker ở taskbar báo "Running".

### Bước 2: Chạy SQL Server
Mở PowerShell tại thư mục dự án (`f:\New folder\laptrinhjava`) và chạy:
```powershell
docker-compose up -d sql_server
```
Đợi khoảng **15–20 giây** cho SQL Server khởi động.

### Bước 3: Chạy Backend và Frontend
Mở **2 cửa sổ PowerShell** (hoặc Terminal):

**Cửa sổ 1 - Backend:**
```powershell
cd "f:\New folder\laptrinhjava\bicap-backend"
npm run dev
```
Đợi thấy dòng `✅ KẾT NỐI DATABASE THÀNH CÔNG!` và `Server đang chạy tại: http://localhost:5001`.

**Cửa sổ 2 - Frontend:**
```powershell
cd "f:\New folder\laptrinhjava\bicap-web-client"
npm run dev
```
Đợi thấy `Ready` / `localhost:3000`. Mở trình duyệt: **http://localhost:3000**.

*Hoặc chạy script:* `.\start-demo.ps1` *(script sẽ mở 2 cửa sổ Backend + Frontend).*

---

## Truy cập demo

| Dịch vụ   | URL                  |
|-----------|----------------------|
| Web (UI)  | http://localhost:3000 |
| Backend   | http://localhost:5001 |

## Flow demo đề xuất

1. **Trang chủ** → Đăng ký / Đăng nhập (Firebase).
2. **Sàn (Market)** → Xem sản phẩm (nếu chưa có, bấm **"Tạo sản phẩm mẫu"** trên trang Admin hoặc Sàn).
3. **Xem chi tiết sản phẩm** → **Gửi yêu cầu đặt hàng**.
4. **Đơn hàng của tôi** → Xem đơn vừa tạo.
5. **Admin / Chủ trang trại** → Duyệt đơn hàng.

## Nếu gặp lỗi

- **"Failed to connect to sql_server"** hoặc **"localhost:1433"**  
  → Chưa có SQL Server: làm **Bước 1 và 2**, sau đó **tắt và chạy lại** cửa sổ Backend, rồi chạy lại `.\start-demo.ps1` nếu cần.

- **Chưa có sản phẩm**  
  → Đăng nhập **Admin** → Trang Admin → Bấm **"Seed sản phẩm mẫu"**.  
  Hoặc vào Sàn → Bấm **"Tạo sản phẩm mẫu"**.

- **CORS / không gọi được API**  
  → Kiểm tra Backend đang chạy tại http://localhost:5001 và Frontend dùng đúng URL API (mặc định `http://localhost:5001/api`).
