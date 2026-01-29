# ✅ CHECKLIST BACKEND - BICAP SYSTEM

## 📊 TỔNG QUAN: Backend ~50-60% hoàn thành

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Quản lý Trang trại (Farm Management) - 60%
- ✅ **Đăng ký/Đăng nhập/Profile** - 100%
  - Sync Firebase → SQL Server
  - Update profile
- ✅ **Quản lý Vụ mùa & Quy trình** - 100%
  - Tạo mùa vụ, thêm quy trình
  - Blockchain Mock tích hợp
- ✅ **Tạo Sản phẩm** - 100%
  - Tạo sản phẩm từ mùa vụ
  - Marketplace API
- ✅ **Sàn giao dịch/Đơn hàng** - 100%
  - CRUD đơn hàng đầy đủ
  - Thanh toán cọc (logic đơn giản)
- ✅ **Thông báo/Báo cáo** - 100%
  - Notification system
  - Report system

### 2. Nhà bán lẻ (Retailer) - 40%
- ✅ **Đăng ký/Đăng nhập** - 100% (dùng chung Auth)
- ✅ **Tìm kiếm/Đặt mua** - 100%
- ⚠️ **Thanh toán** - 70% (có logic nhưng Mock)

---

## ⚠️ CẦN BỔ SUNG

### 🔴 Ưu tiên cao:

#### 1. Tạo mã QR Code ⚠️ (50%)
- ❌ **THIẾU:** File `src/utils/qrGenerator.js`
- ✅ **ĐÃ CÓ:** Dữ liệu QR (`qrCodeData` trong `exportSeason`)
- **Cần làm:**
  ```bash
  npm install qrcode
  ```
  - Tạo `src/utils/qrGenerator.js`
  - Tạo endpoint `GET /api/seasons/:seasonId/qr-code` hoặc `/api/products/:productId/qr-code`
  - Trả về ảnh QR code PNG/SVG

#### 2. Thanh toán thật ⚠️ (70%)
- ⚠️ **HIỆN TẠI:** Mock payment (chỉ validate)
- ❌ **THIẾU:** Tích hợp VNPay/Stripe/PayPal
- **Cần làm:**
  - Tạo `src/utils/paymentHelper.js`
  - Cập nhật `subscriptionController.subscribe()`
  - Tạo webhook handler cho callback
  - Cập nhật `orderController.payDeposit()`

#### 3. API cho Driver ❌ (0%)
- ❌ **THIẾU:** Hoàn toàn chưa có
- **Cần làm:**
  - Tạo `src/controllers/driverController.js`
  - Tạo `src/routes/driverRoutes.js`
  - Endpoints cần có:
    - `GET /api/driver/orders` - Danh sách đơn hàng được giao
    - `PUT /api/driver/orders/:id/pickup` - Xác nhận nhận hàng (quét QR)
    - `PUT /api/driver/orders/:id/deliver` - Xác nhận giao hàng (quét QR)
    - `PUT /api/driver/location` - Cập nhật vị trí GPS
    - `GET /api/driver/shipments` - Danh sách vận đơn của tôi

### 🟡 Ưu tiên trung bình:

#### 4. API cho Admin ⚠️ (20%)
- ⚠️ **HIỆN TẠI:** Chỉ có middleware phân quyền
- **Cần làm:**
  - Tạo `src/controllers/adminController.js`
  - Tạo `src/routes/adminRoutes.js`
  - Endpoints:
    - `GET /api/admin/dashboard` - Thống kê tổng quan
    - `GET /api/admin/users` - Quản lý users
    - `PUT /api/admin/users/:id` - Cập nhật user
    - `GET /api/admin/farms` - Quản lý farms
    - `PUT /api/admin/farms/:id/approve` - Duyệt farm
    - `GET /api/admin/reports` - Xem tất cả reports

#### 5. Upload ảnh (Multer) ❌
- ❌ **THIẾU:** `src/middleware/uploadMiddleware.js`
- **Cần làm:**
  ```bash
  npm install multer
  ```
  - Tạo middleware upload
  - Tích hợp vào routes cần upload ảnh:
    - `POST /api/seasons/:seasonId/process` (upload ảnh quy trình)
    - `POST /api/products` (upload ảnh sản phẩm)
    - `PUT /api/orders/:id/confirm-delivery` (upload ảnh nhận hàng)

#### 6. Quản lý Vận chuyển ⚠️ (30%)
- ✅ **ĐÃ CÓ:** Cơ bản (tạo vận đơn, cập nhật status)
- ❌ **THIẾU:** 
  - API cho Driver xem vận đơn của mình
  - Tracking GPS realtime
  - Quét QR để xác nhận

### 🟢 Ưu tiên thấp:

#### 7. Email Sender ❌
- ❌ **THIẾU:** `src/utils/emailSender.js`
- **Cần làm:**
  ```bash
  npm install nodemailer
  ```
  - Tạo email sender
  - Gửi email khi có đơn hàng mới, thông báo quan trọng

#### 8. Public API cho Guest ⚠️ (10%)
- ⚠️ **HIỆN TẠI:** Một số routes có thể public nhưng chưa rõ ràng
- **Cần làm:**
  - Đảm bảo `GET /api/products` hoạt động public
  - Đảm bảo `GET /api/seasons/:seasonId` public (truy xuất nguồn gốc)
  - Tạo `GET /api/public/traceability/:seasonId` rõ ràng

---

## 📋 CHECKLIST THỰC HIỆN

### Bước 1: QR Code Generator
- [ ] Cài đặt `qrcode`: `npm install qrcode`
- [ ] Tạo `src/utils/qrGenerator.js`
- [ ] Tạo endpoint `GET /api/seasons/:seasonId/qr-code`
- [ ] Tạo endpoint `GET /api/products/:productId/qr-code`
- [ ] Test tạo và trả về ảnh QR

### Bước 2: Thanh toán VNPay
- [ ] Đăng ký tài khoản VNPay
- [ ] Cài đặt SDK VNPay
- [ ] Tạo `src/utils/paymentHelper.js`
- [ ] Cập nhật `subscriptionController.subscribe()`
- [ ] Tạo webhook handler `POST /api/payments/vnpay-callback`
- [ ] Cập nhật `orderController.payDeposit()`
- [ ] Test thanh toán

### Bước 3: Driver API
- [ ] Tạo `src/controllers/driverController.js`
- [ ] Tạo `src/routes/driverRoutes.js`
- [ ] Implement `GET /api/driver/orders`
- [ ] Implement `PUT /api/driver/orders/:id/pickup`
- [ ] Implement `PUT /api/driver/orders/:id/deliver`
- [ ] Implement `PUT /api/driver/location`
- [ ] Implement `GET /api/driver/shipments`
- [ ] Thêm middleware kiểm tra role `shipping` hoặc `driver`

### Bước 4: Admin API
- [ ] Tạo `src/controllers/adminController.js`
- [ ] Tạo `src/routes/adminRoutes.js`
- [ ] Implement dashboard stats
- [ ] Implement user management
- [ ] Implement farm management
- [ ] Implement report management

### Bước 5: Upload Middleware
- [ ] Cài đặt `multer`: `npm install multer`
- [ ] Tạo `src/middleware/uploadMiddleware.js`
- [ ] Tích hợp vào routes cần upload
- [ ] Test upload ảnh

### Bước 6: Email Sender
- [ ] Cài đặt `nodemailer`: `npm install nodemailer`
- [ ] Tạo `src/utils/emailSender.js`
- [ ] Tích hợp vào notification system
- [ ] Test gửi email

---

## 📊 TỈ LỆ HOÀN THÀNH THEO MODULE

| Module | Tỉ lệ | Trạng thái |
|--------|-------|------------|
| Farm Management | 60% | ⚠️ Cần QR Generator, Payment thật |
| Retailer | 40% | ⚠️ Cần Payment thật |
| Driver | 0% | ❌ Chưa có |
| Shipping | 30% | ⚠️ Cần Driver API |
| Admin | 20% | ⚠️ Cần Admin API |
| Guest | 10% | ⚠️ Cần Public API rõ ràng |

**TỔNG:** ~45% hoàn thành

---

## 🚀 NEXT STEPS

1. **Ngay lập tức:** Tạo QR Generator (quan trọng cho truy xuất nguồn gốc)
2. **Tiếp theo:** Tích hợp thanh toán VNPay
3. **Sau đó:** Xây dựng Driver API
4. **Cuối cùng:** Admin API và các tính năng phụ

---

*Báo cáo chi tiết xem file: `BACKEND_STATUS_REPORT.md`*





