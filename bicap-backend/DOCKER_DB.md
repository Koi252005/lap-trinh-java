# Docker + Database

## Đã cấu hình

1. **Mật khẩu DB**: Docker-compose dùng `DB_PASSWORD` và `DB_PASS` = `BiCapProject@123`. Backend đọc cả hai.

2. **Tự động seed**: Khi backend (Docker) khởi động và kết nối DB thành công, nếu **chưa có sản phẩm nào** thì sẽ **tự tạo sản phẩm mẫu**. Không cần gọi API hay chạy script.

3. **Cách chạy lại từ đầu** (để seed lại):
   - Xóa volume DB: `docker-compose down -v` (cẩn thận: mất hết dữ liệu)
   - Hoặc chỉ restart backend: `docker-compose restart backend` (sản phẩm đã có thì không tạo lại)

4. **Nếu vẫn không có sản phẩm**: Vào web → Sàn retailer → bấm nút **"🌱 Tạo sản phẩm mẫu"** (gọi POST /api/seed).
