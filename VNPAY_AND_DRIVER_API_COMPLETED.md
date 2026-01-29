# ✅ HOÀN THÀNH: VNPay Payment & Driver API

## 📋 Tổng quan

Đã hoàn thành việc tích hợp thanh toán VNPay và xây dựng API cho Driver trong backend BICAP.

---

## ✅ PHẦN 1: VNPAY PAYMENT INTEGRATION

### 1.1 ✅ Model Payment
- **File:** `src/models/Payment.js`
- **Chức năng:** Lưu trữ thông tin thanh toán
- **Fields quan trọng:**
  - `vnp_TxnRef`: Mã tham chiếu giao dịch (unique)
  - `vnp_TransactionNo`: Mã giao dịch từ VNPay
  - `paymentType`: subscription, order_deposit, order_full
  - `status`: pending, processing, success, failed, cancelled

### 1.2 ✅ VNPay Helper Utility
- **File:** `src/utils/vnpayHelper.js`
- **Chức năng:**
  - `createPaymentUrl()`: Tạo URL thanh toán VNPay
  - `verifyCallback()`: Xác thực callback từ VNPay
  - `checkResponseCode()`: Kiểm tra mã phản hồi
  - `generateTxnRef()`: Tạo mã tham chiếu giao dịch

### 1.3 ✅ Payment Controller
- **File:** `src/controllers/paymentController.js`
- **Endpoints:**
  - `POST /api/payments` - Tạo payment request
  - `GET /api/payments/vnpay-return` - Xử lý return URL từ VNPay
  - `POST /api/payments/vnpay-ipn` - Xử lý IPN từ VNPay
  - `GET /api/payments/txn-ref/:txnRef` - Lấy thông tin payment
  - `GET /api/payments/my-payments` - Lấy danh sách payments của user

### 1.4 ✅ Cập nhật Subscription Controller
- **File:** `src/controllers/subscriptionController.js`
- **Thay đổi:** 
  - `subscribe()` không còn mock payment
  - Tạo subscription với status 'pending'
  - Trả về payment endpoint để frontend gọi

### 1.5 ✅ Cập nhật Order Controller
- **File:** `src/controllers/orderController.js`
- **Thay đổi:**
  - `payDeposit()` không còn xử lý trực tiếp
  - Trả về payment endpoint để frontend gọi

### 1.6 ✅ Routes
- **File:** `src/routes/paymentRoutes.js`
- **Đã thêm vào:** `server.js`

---

## ✅ PHẦN 2: DRIVER API

### 2.1 ✅ Cập nhật Shipment Model
- **File:** `src/models/Shipment.js`
- **Fields mới:**
  - `currentLocation`: GPS location hiện tại (lat,lng)
  - `pickupLocation`: Địa điểm nhận hàng
  - `deliveryLocation`: Địa điểm giao hàng
  - `pickupQRCode`: QR code đã quét khi nhận hàng
  - `deliveryQRCode`: QR code đã quét khi giao hàng

### 2.2 ✅ Driver Controller
- **File:** `src/controllers/driverController.js`
- **Endpoints:**
  - `GET /api/driver/stats` - Thống kê của Driver
  - `GET /api/driver/shipments` - Danh sách vận đơn của tôi
  - `GET /api/driver/shipments/:id` - Chi tiết vận đơn
  - `PUT /api/driver/location` - Cập nhật vị trí GPS
  - `POST /api/driver/shipments/pickup` - Xác nhận nhận hàng (quét QR)
  - `POST /api/driver/shipments/delivery` - Xác nhận giao hàng (quét QR)
  - `PUT /api/driver/shipments/:id/status` - Cập nhật trạng thái vận chuyển

### 2.3 ✅ Driver Routes
- **File:** `src/routes/driverRoutes.js`
- **Middleware:** Yêu cầu role `driver`, `shipping`, hoặc `admin`
- **Đã thêm vào:** `server.js`

### 2.4 ✅ Middleware Support
- **File:** `src/middleware/authMiddleware.js`
- **Đã hỗ trợ:** Role `driver` và `shipping`

---

## 📁 Files đã tạo/sửa đổi

### Files mới:
1. `src/models/Payment.js` - Payment model
2. `src/utils/vnpayHelper.js` - VNPay helper utility
3. `src/controllers/paymentController.js` - Payment controller
4. `src/routes/paymentRoutes.js` - Payment routes
5. `src/controllers/driverController.js` - Driver controller
6. `src/routes/driverRoutes.js` - Driver routes

### Files đã cập nhật:
1. `src/models/index.js` - Thêm Payment model và associations
2. `src/models/Shipment.js` - Thêm GPS và QR code fields
3. `src/controllers/subscriptionController.js` - Tích hợp VNPay
4. `src/controllers/orderController.js` - Tích hợp VNPay
5. `server.js` - Thêm payment và driver routes

---

## 🔧 Cấu hình cần thiết

### Environment Variables cho VNPay:

```env
# VNPay Configuration
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5001/api/payments/vnpay-return
VNPAY_IP_ADDR=127.0.0.1

# Client URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5001
```

**Lưu ý:** 
- Sandbox URL cho testing: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Production URL: `https://www.vnpayment.vn/paymentv2/vpcpay.html`

---

## 📡 API Endpoints

### Payment Endpoints:

#### 1. Tạo Payment Request
```
POST /api/payments
Authorization: Bearer <token>
Body: {
  "paymentType": "subscription" | "order_deposit" | "order_full",
  "orderId": 123,           // Nếu paymentType là order_*
  "subscriptionId": 456,    // Nếu paymentType là subscription
  "amount": 500000,        // Optional: để validate
  "description": "Mô tả"   // Optional
}
```

#### 2. VNPay Return URL (Public)
```
GET /api/payments/vnpay-return
Query params từ VNPay
```

#### 3. VNPay IPN (Public)
```
POST /api/payments/vnpay-ipn
Body từ VNPay
```

#### 4. Lấy thông tin Payment
```
GET /api/payments/txn-ref/:txnRef
Authorization: Bearer <token>
```

#### 5. Lấy danh sách Payments của tôi
```
GET /api/payments/my-payments?status=success&paymentType=subscription
Authorization: Bearer <token>
```

---

### Driver Endpoints:

#### 1. Thống kê Driver
```
GET /api/driver/stats
Authorization: Bearer <token>
Role: driver, shipping, admin
```

#### 2. Danh sách vận đơn của tôi
```
GET /api/driver/shipments?status=picked_up
Authorization: Bearer <token>
Role: driver, shipping, admin
```

#### 3. Chi tiết vận đơn
```
GET /api/driver/shipments/:id
Authorization: Bearer <token>
Role: driver, shipping, admin
```

#### 4. Cập nhật vị trí GPS
```
PUT /api/driver/location
Authorization: Bearer <token>
Body: {
  "shipmentId": 123,
  "latitude": 10.762622,
  "longitude": 106.660172
}
```

#### 5. Xác nhận nhận hàng (Quét QR)
```
POST /api/driver/shipments/pickup
Authorization: Bearer <token>
Body: {
  "shipmentId": 123,
  "qrCode": "ORDER_456",
  "latitude": 10.762622,    // Optional
  "longitude": 106.660172   // Optional
}
```

#### 6. Xác nhận giao hàng (Quét QR)
```
POST /api/driver/shipments/delivery
Authorization: Bearer <token>
Body: {
  "shipmentId": 123,
  "qrCode": "ORDER_456",
  "latitude": 10.762622,    // Optional
  "longitude": 106.660172,  // Optional
  "deliveryImage": "url"    // Optional
}
```

#### 7. Cập nhật trạng thái vận chuyển
```
PUT /api/driver/shipments/:id/status
Authorization: Bearer <token>
Body: {
  "status": "delivering",
  "latitude": 10.762622,    // Optional
  "longitude": 106.660172   // Optional
}
```

---

## 🔄 Flow thanh toán VNPay

### Subscription Payment Flow:
1. User gọi `POST /api/subscriptions/subscribe` với `packageId`
2. Backend tạo subscription với status 'pending'
3. Frontend gọi `POST /api/payments` với `paymentType: 'subscription'`
4. Backend tạo payment record và trả về `paymentUrl`
5. Frontend redirect user đến `paymentUrl` (VNPay)
6. User thanh toán trên VNPay
7. VNPay redirect về `VNPAY_RETURN_URL` (Return URL)
8. VNPay gọi `VNPAY_IPN_URL` (IPN) để xác nhận
9. Backend xử lý và kích hoạt subscription nếu thành công

### Order Deposit Payment Flow:
1. User gọi `PUT /api/orders/:id/pay-deposit`
2. Backend trả về payment endpoint và data
3. Frontend gọi `POST /api/payments` với `paymentType: 'order_deposit'`
4. Tương tự flow subscription từ bước 4 trở đi

---

## 🔄 Flow Driver Shipment

### 1. Driver nhận vận đơn:
- Farm Owner tạo shipment và gán `driverId`
- Driver xem danh sách: `GET /api/driver/shipments`

### 2. Driver nhận hàng:
- Driver đến địa điểm nhận hàng
- Quét QR code: `POST /api/driver/shipments/pickup`
- Status chuyển: `created/assigned` → `picked_up`
- Order status chuyển: `confirmed` → `shipping`

### 3. Driver vận chuyển:
- Cập nhật GPS: `PUT /api/driver/location`
- Cập nhật status: `PUT /api/driver/shipments/:id/status` với `status: 'delivering'`

### 4. Driver giao hàng:
- Driver đến địa điểm giao hàng
- Quét QR code: `POST /api/driver/shipments/delivery`
- Status chuyển: `delivering` → `delivered`
- Order status chuyển: `shipping` → `completed`

---

## ✅ Checklist hoàn thành

### VNPay Integration:
- [x] Tạo Payment model
- [x] Tạo VNPay helper utility
- [x] Tạo payment controller và routes
- [x] Tích hợp vào subscription controller
- [x] Tích hợp vào order controller
- [x] Xử lý callback và IPN
- [x] Tạo associations trong models/index.js

### Driver API:
- [x] Cập nhật Shipment model (GPS, QR fields)
- [x] Tạo driver controller
- [x] Tạo driver routes
- [x] Hỗ trợ middleware cho role driver/shipping
- [x] Thêm vào server.js

---

## 📝 Ghi chú quan trọng

### VNPay:
- **Sandbox:** Dùng cho testing, không cần thẻ thật
- **Production:** Cần đăng ký tài khoản VNPay thật
- **Security:** Luôn verify secure hash từ VNPay
- **IPN:** Quan trọng để xác nhận giao dịch, VNPay sẽ gọi tự động

### Driver API:
- **QR Code Format:** `ORDER_{orderId}` hoặc `SHIPMENT_{shipmentId}`
- **GPS Location:** Format `latitude,longitude` (VD: `10.762622,106.660172`)
- **Status Flow:** `created` → `assigned` → `picked_up` → `delivering` → `delivered`
- **Permissions:** Chỉ driver được gán mới có quyền cập nhật shipment

---

## 🚀 Next Steps

1. **Testing VNPay:**
   - Đăng ký tài khoản VNPay Sandbox
   - Cấu hình environment variables
   - Test payment flow end-to-end

2. **Testing Driver API:**
   - Tạo user với role `driver`
   - Tạo shipment và gán driver
   - Test các endpoints driver

3. **Frontend Integration:**
   - Tích hợp VNPay payment vào frontend
   - Tích hợp Driver API vào mobile app

---

**Trạng thái:** ✅ HOÀN THÀNH  
**Ngày hoàn thành:** 2024





