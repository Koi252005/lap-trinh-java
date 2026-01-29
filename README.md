# 🌱 BICAP: Blockchain Integration in Clean Agricultural Production

**BICAP** (Blockchain Integration in Clean Agricultural Production) là giải pháp công nghệ toàn diện nhằm minh bạch hóa chuỗi cung ứng nông sản sạch. Hệ thống kết hợp sức mạnh của **Blockchain**, **IoT** và **Cloud Computing** để đảm bảo mọi sản phẩm từ trang trại đến tay người tiêu dùng đều có nguồn gốc rõ ràng và bất biến.

---

## 🚀 Tính năng Cốt lõi

### 🚜 Dành cho Chủ trang trại (Farm Owner)
- **Quản lý mùa vụ:** Lập kế hoạch và theo dõi toàn bộ quá trình canh tác.
- **Minh bạch Blockchain:** Mọi hoạt động canh tác quan trọng đều được hash và ghi lại trên mạng lưới **VeChain**.
- **Giám sát IoT:** Theo dõi thời gian thực các chỉ số môi trường (Nhiệt độ, Độ ẩm, pH) và nhận cảnh báo tự động khi vượt ngưỡng.
- **Sàn giao dịch:** Đưa sản phẩm lên chợ nông sản, quản lý đơn hàng đầu ra.
- **Logistics:** Theo dõi trạng thái vận chuyển và thông báo từ tài xế.

### 🏪 Dành cho Nhà bán lẻ (Retailer)
- **Tìm kiếm thông minh:** Tìm nguồn hàng nông sản sạch theo tiêu chuẩn.
- **Truy xuất nguồn gốc:** Quét mã QR để xem toàn bộ lịch sử canh tác, bón phân, thu hoạch và các chứng chỉ an toàn.
- **Quản lý đơn hàng:** Quy trình thanh toán tiền cọc (Deposit) và thanh toán nốt sau khi nhận hàng.
- **Xác nhận giao hàng:** Tải lên hình ảnh bằng chứng nhận hàng (Proof of Delivery) để hoàn tất quy trình.

### 🚚 Dành cho Tài xế (Driver)
- **Nhận chuyến:** Quản lý danh sách các vận đơn được phân công.
- **Cập nhật lộ trình:** Cập nhật trạng thái (Pickup, Shipping, Delivered) theo thời gian thực.
- **Báo cáo sự cố:** Gửi báo cáo tình trạng vận chuyển cho chủ trại và nhà bán lẻ.

### 🛡️ Dành cho Quản trị viên (Admin)
- **Kiểm soát hệ thống:** Duyệt hồ sơ pháp lý của trang trại và nhà bán lẻ.
- **Quản lý hạ tầng:** Theo dõi các báo cáo vi phạm và tình trạng hệ thống.

---

## 🧱 Kiến trúc Công nghệ & Hạ tầng

| Thành phần | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Hạ tầng** | Docker & Docker Compose | Đảm bảo môi trường nhất quán, triển khai nhanh. |
| **Frontend** | Next.js 14+ (App Router), TypeScript, Tailwind | Giao diện hiện đại, chuyên nghiệp, responsive. |
| **Backend** | Node.js, Express.js, Sequelize | Xử lý logic, API RESTful và đồng bộ dữ liệu. |
| **Cơ sở dữ liệu** | Azure SQL Edge (MSSQL) | Lưu trữ dữ liệu hệ thống off-chain. |
| **Blockchain** | VeChain (Thor Network) | Đảm bảo tính toàn vẹn và không thể sửa đổi của dữ liệu gốc. |
| **Xác thực** | Firebase Authentication | Bảo mật tài khoản người dùng đa nền tảng. |
| **Mobile** | React Native (Expo) | Ứng dụng di động tối ưu cho di chuyển. |

---

## 📂 Cấu trúc Dự án

```text
BICAP-ROOT/
├── � bicap-backend/           # Server API (Logic, DB, Blockchain)
├── 📂 bicap-web-client/        # Ứng dụng Web (Farm & Retailer)
├── 📂 bicap-mobile-driver/     # Ứng dụng di động (Driver)
├── 📂 bicap-smart-contracts/   # Smart contracts (Solidity)
└── � docker-compose.yml       # Orchestration cho toàn bộ hệ thống
```

---

## 🛠️ Hướng dẫn Cài đặt & Chạy

### 1. Chuẩn bị
- Đã cài đặt **Docker Desktop**.
- Có tài khoản **Firebase** (để cấu hình Admin SDK nếu cần chạy manual).

### 2. Chạy ứng dụng (Khuyên dùng)
Hệ thống đã được đóng gói hoàn toàn trong Docker, giúp đảm bảo môi trường đồng nhất.

```bash
# Khởi động toàn bộ hệ thống (Database, Backend, Frontend) ở chế độ daemon
docker-compose up -d
```

- **Web Client:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5001](http://localhost:5001)
- **SQL Server:** `localhost:1433` (Username: `sa`, Password: `BiCapProject@123`)

### 3. Cập nhật code mới
Vì Docker đóng gói toàn bộ source code vào Image lúc khởi tạo, nên khi bạn thay đổi code ở máy local, bạn cần "rebuild" lại container để áp dụng thay đổi:

- **Cách 1: Cập nhật tất cả (Đơn giản nhất)**
  ```bash
  docker-compose up --build
  ```
- **Cách 2: Chỉ cập nhật một dịch vụ (Nhanh hơn)**
  Nếu bạn chỉ sửa code ở backend:
  ```bash
  docker-compose up --build backend
  ```

### 4. Các lệnh quản lý & Xử lý sự cố

#### 🔍 Kiểm tra trạng thái & Nhật ký
- **Xem danh sách container đang chạy:** `docker compose ps`
- **Xem nhật ký (logs) theo thời gian thực:**
  ```bash
  docker-compose logs -f         # Xem tất cả
  docker-compose logs -f backend # Chỉ xem backend
  ```

#### 🛑 Dừng hệ thống
- Nếu đang chạy ở chế độ thường: Nhấn `Ctrl + C`.
- Nếu đang chạy ở chế độ ẩn (`-d`):
  ```bash
  docker-compose stop  # Dừng nhưng giữ lại container
  docker-compose down  # Dừng và xóa container (Khuyên dùng)
  ```

#### 🧹 Reset hoàn toàn hệ thống
Dùng khi bạn muốn xóa sạch database và bắt đầu lại từ đầu:
```bash
docker-compose down -v      # Xóa container và volumes
rm -rf .docker_data         # Xóa thư mục lưu dữ liệu database local
docker-compose up --build   # Khởi động lại và build mới
```

#### ⚠️ Các lỗi thường gặp (Troubleshooting)
1. **Xung đột cổng (Port Conflict):** Đảm bảo không có ứng dụng nào khác đang dùng cổng 3000, 5001 hoặc 1433 trên máy của bạn.
2. **Backend không kết nối được DB:** Docker dùng cơ chế `depends_on` với `healthcheck`. Backend sẽ đợi cho đến khi SQL Server sẵn sàng hoàn toàn mới khởi chạy. Nếu thấy lỗi kết nối lúc mới bắt đầu, hãy đợi khoảng 20-30 giây.
3. **Dữ liệu không thay đổi:** Nếu bạn sửa code mà không thấy hiệu quả, hãy chắc chắn đã chạy lệnh với flag `--build`.

---

## 🏗️ Kiến trúc Docker
Hệ thống gồm 3 container chính giao tiếp trong mạng nội bộ Docker:
1. **`sql_server`**: Chạy Azure SQL Edge (tương thích MSSQL). Dữ liệu được lưu bền vững tại thư mục `.docker_data`.
2. **`backend`**: Kết nối với `sql_server` qua host name nội bộ (không phải `localhost`).
3. **`frontend`**: Giao tiếp với `backend` API thông qua cổng 5001 được công khai.

---

## �️ Thiết kế Cơ sở dữ liệu

Hệ thống sử dụng SQL Server với các ràng buộc chặt chẽ. Đặc biệt, logic xóa (Cascade) đã được tối ưu cho MSSQL để tránh lỗi "Multiple Cascade Paths":
- **User ↔ Farm:** Cascade (Xóa user xóa farm).
- **Product ↔ Order:** No Action (Giữ đơn hàng để đối soát ngay cả khi xóa sản phẩm).
- **Season ↔ Product:** No Action (Tránh vòng lặp cascade qua Farm).

---

## 🌟 Đóng góp
Dự án được xây dựng dựa trên tinh thần hỗ trợ nông nghiệp sạch Việt Nam. Mọi ý đóng góp vui lòng gửi qua các Issue hoặc Pull Request trên repository này.

---

**🌱 BICAP - Vì một nền nông nghiệp minh bạch và sạch!**