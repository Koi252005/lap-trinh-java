# 🌱 BICAP: Blockchain Integration in Clean Agricultural Production

**BICAP** (Blockchain Integration in Clean Agricultural Production) là giải pháp công nghệ toàn diện nhằm minh bạch hóa chuỗi cung ứng nông sản sạch. Hệ thống kết hợp sức mạnh của **Blockchain**, **IoT** và **Cloud Computing** để đảm bảo mọi sản phẩm từ trang trại đến tay người tiêu dùng đều có nguồn gốc rõ ràng và bất biến.

---

## 🚀 Hướng dẫn Chạy Trang Web

### Cách 1: Chạy Tự Động (Khuyên dùng)

**Windows PowerShell:**
```powershell
.\start-web.ps1
```

Script này sẽ tự động:
- Dừng các process cũ
- Xóa cache
- Khởi động Backend (port 5001)
- Khởi động Frontend (port 3000)
- Kiểm tra và báo cáo trạng thái

Sau khi chạy script, mở browser và vào: **http://localhost:3000**

### Cách 2: Chạy Thủ Công

**1. Khởi động Backend:**
```powershell
cd bicap-backend
npm install
npm start
```

**2. Khởi động Frontend (terminal mới):**
```powershell
cd bicap-web-client
npm install
npm run dev
```

**3. Truy cập:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

---

## 🛠️ Xử lý Lỗi Connection Failed

Nếu gặp lỗi "connection failed", hãy:

1. **Chạy lại script tự động:**
   ```powershell
   .\start-web.ps1
   ```

2. **Hoặc dừng và khởi động lại thủ công:**
   ```powershell
   # Dừng tất cả Node.js processes
   Get-Process node | Stop-Process -Force
   
   # Sau đó chạy lại Backend và Frontend
   ```

3. **Kiểm tra port có bị chiếm không:**
   ```powershell
   # Kiểm tra port 3000
   netstat -ano | findstr :3000
   
   # Kiểm tra port 5001
   netstat -ano | findstr :5001
   ```

4. **Xóa cache và khởi động lại:**
   ```powershell
   # Xóa cache frontend
   Remove-Item -Recurse -Force bicap-web-client\.next\cache -ErrorAction SilentlyContinue
   Remove-Item -Force bicap-web-client\.next\dev\lock -ErrorAction SilentlyContinue
   ```

---

## 📂 Cấu trúc Dự án

```
BICAP-ROOT/
├── bicap-backend/           # Server API (Logic, DB, Blockchain)
├── bicap-web-client/        # Ứng dụng Web (Farm & Retailer)
├── bicap-mobile-driver/     # Ứng dụng di động (Driver)
├── bicap-smart-contracts/   # Smart contracts (Solidity)
├── start-web.ps1           # Script tự động khởi động
└── docker-compose.yml      # Orchestration cho toàn bộ hệ thống
```

---

## 🧱 Kiến trúc Công nghệ

| Thành phần | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind | Giao diện hiện đại, chuyên nghiệp, responsive. |
| **Backend** | Node.js, Express.js, Sequelize | Xử lý logic, API RESTful và đồng bộ dữ liệu. |
| **Cơ sở dữ liệu** | Azure SQL Edge (MSSQL) | Lưu trữ dữ liệu hệ thống off-chain. |
| **Blockchain** | VeChain (Thor Network) | Đảm bảo tính toàn vẹn và không thể sửa đổi của dữ liệu gốc. |
| **Xác thực** | Firebase Authentication | Bảo mật tài khoản người dùng đa nền tảng. |
| **Mobile** | React Native (Expo) | Ứng dụng di động tối ưu cho di chuyển. |

---

## 🚜 Tính năng Cốt lõi

### Dành cho Chủ trang trại (Farm Owner)
- **Quản lý mùa vụ:** Lập kế hoạch và theo dõi toàn bộ quá trình canh tác.
- **Minh bạch Blockchain:** Mọi hoạt động canh tác quan trọng đều được hash và ghi lại trên mạng lưới **VeChain**.
- **Giám sát IoT:** Theo dõi thời gian thực các chỉ số môi trường (Nhiệt độ, Độ ẩm, pH) và nhận cảnh báo tự động khi vượt ngưỡng.
- **Sàn giao dịch:** Đưa sản phẩm lên chợ nông sản, quản lý đơn hàng đầu ra.
- **Logistics:** Theo dõi trạng thái vận chuyển và thông báo từ tài xế.

### Dành cho Nhà bán lẻ (Retailer)
- **Tìm kiếm thông minh:** Tìm nguồn hàng nông sản sạch theo tiêu chuẩn.
- **Truy xuất nguồn gốc:** Quét mã QR để xem toàn bộ lịch sử canh tác, bón phân, thu hoạch và các chứng chỉ an toàn.
- **Quản lý đơn hàng:** Quy trình thanh toán tiền cọc (Deposit) và thanh toán nốt sau khi nhận hàng.
- **Xác nhận giao hàng:** Tải lên hình ảnh bằng chứng nhận hàng (Proof of Delivery) để hoàn tất quy trình.

### Dành cho Tài xế (Driver)
- **Nhận chuyến:** Quản lý danh sách các vận đơn được phân công.
- **Cập nhật lộ trình:** Cập nhật trạng thái (Pickup, Shipping, Delivered) theo thời gian thực.
- **Báo cáo sự cố:** Gửi báo cáo tình trạng vận chuyển cho chủ trại và nhà bán lẻ.

### Dành cho Quản trị viên (Admin)
- **Kiểm soát hệ thống:** Duyệt hồ sơ pháp lý của trang trại và nhà bán lẻ.
- **Quản lý hạ tầng:** Theo dõi các báo cáo vi phạm và tình trạng hệ thống.

---

## 🌟 Đóng góp

Dự án được xây dựng dựa trên tinh thần hỗ trợ nông nghiệp sạch Việt Nam. Mọi ý đóng góp vui lòng gửi qua các Issue hoặc Pull Request trên repository này.

---

**🌱 BICAP - Vì một nền nông nghiệp minh bạch và sạch!**
