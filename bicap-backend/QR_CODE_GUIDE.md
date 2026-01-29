# 📱 Hướng dẫn sử dụng QR Code Generator

## Tổng quan

Hệ thống QR Code Generator đã được tích hợp vào backend để tạo mã QR cho việc truy xuất nguồn gốc sản phẩm và mùa vụ.

---

## 🎯 Chức năng

### 1. QR Code cho Mùa vụ (Season)
- Tạo mã QR để truy xuất thông tin mùa vụ
- Link: `/traceability/{seasonId}`

### 2. QR Code cho Sản phẩm (Product)
- Tạo mã QR để truy xuất thông tin sản phẩm
- Link: `/traceability/product/{productId}`

---

## 📡 API Endpoints

### **Season QR Code**

#### 1. Lấy ảnh QR Code (PNG/SVG)
```
GET /api/seasons/:seasonId/qr-code
```

**Query Parameters:**
- `format` (optional): `png` hoặc `svg` (mặc định: `png`)
- `size` (optional): Kích thước QR code (mặc định: `300`)

**Ví dụ:**
```bash
# Lấy QR code PNG
GET /api/seasons/1/qr-code

# Lấy QR code SVG
GET /api/seasons/1/qr-code?format=svg

# Lấy QR code với kích thước lớn hơn
GET /api/seasons/1/qr-code?size=500
```

**Response:**
- Content-Type: `image/png` hoặc `image/svg+xml`
- Body: Ảnh QR code (binary)

---

#### 2. Lấy QR Code dạng Data URL (Base64)
```
GET /api/seasons/:seasonId/qr-code-data
```

**Query Parameters:**
- `size` (optional): Kích thước QR code (mặc định: `300`)

**Ví dụ:**
```bash
GET /api/seasons/1/qr-code-data?size=400
```

**Response:**
```json
{
  "seasonId": 1,
  "traceabilityURL": "http://localhost:3000/traceability/1",
  "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Sử dụng:** Data URL có thể được embed trực tiếp vào HTML:
```html
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." />
```

---

### **Product QR Code**

#### 1. Lấy ảnh QR Code (PNG/SVG)
```
GET /api/products/:productId/qr-code
```

**Query Parameters:**
- `format` (optional): `png` hoặc `svg` (mặc định: `png`)
- `size` (optional): Kích thước QR code (mặc định: `300`)

**Ví dụ:**
```bash
# Lấy QR code PNG
GET /api/products/5/qr-code

# Lấy QR code SVG với kích thước lớn
GET /api/products/5/qr-code?format=svg&size=500
```

---

#### 2. Lấy QR Code dạng Data URL (Base64)
```
GET /api/products/:productId/qr-code-data
```

**Query Parameters:**
- `size` (optional): Kích thước QR code (mặc định: `300`)

**Response:**
```json
{
  "productId": 5,
  "traceabilityURL": "http://localhost:3000/traceability/product/5",
  "qrCodeDataURL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

---

## 🔧 Sử dụng trong Code

### Trong Controller

```javascript
const qrGenerator = require('../utils/qrGenerator');

// Tạo traceability URL
const traceabilityURL = qrGenerator.generateTraceabilityURL(seasonId);

// Tạo QR code Data URL
const dataURL = await qrGenerator.generateDataURL(traceabilityURL, {
  width: 300
});

// Tạo QR code Buffer (để gửi file)
const buffer = await qrGenerator.generateBuffer(traceabilityURL, {
  width: 300
});

// Tạo QR code SVG
const svg = await qrGenerator.generateSVG(traceabilityURL, {
  width: 300
});
```

---

## 📝 Ví dụ Response từ Export Season

Khi export một season, response sẽ bao gồm thông tin QR code:

```json
{
  "message": "Xuất mùa vụ thành công!",
  "season": {
    "id": 1,
    "name": "Vụ lúa xuân 2024",
    "status": "completed",
    ...
  },
  "qrCodeData": "http://localhost:3000/traceability/1",
  "qrCodeImageUrl": "http://localhost:5001/api/seasons/1/qr-code",
  "txHash": "0xabc123..."
}
```

---

## 📝 Ví dụ Response từ Create Product

Khi tạo một product, response sẽ bao gồm thông tin QR code:

```json
{
  "message": "Đăng bán sản phẩm thành công!",
  "product": {
    "id": 5,
    "name": "Lúa tẻ thơm",
    "batchCode": "BATCH001",
    ...
  },
  "qrCodeData": "http://localhost:3000/traceability/product/5",
  "qrCodeImageUrl": "http://localhost:5001/api/products/5/qr-code"
}
```

---

## ⚙️ Cấu hình

### Environment Variables

Đảm bảo có các biến môi trường sau trong file `.env`:

```env
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5001
```

- `CLIENT_URL`: URL của frontend (để tạo traceability link)
- `API_URL`: URL của backend API (để tạo QR code image URL)

---

## 🎨 Tùy chỉnh QR Code

### Options có sẵn:

```javascript
{
  errorCorrectionLevel: 'H',  // L, M, Q, H (H = cao nhất)
  type: 'image/png',          // 'image/png' hoặc 'svg'
  quality: 0.92,              // Chất lượng (0-1)
  margin: 1,                  // Khoảng trắng xung quanh
  color: {
    dark: '#000000',          // Màu QR code
    light: '#FFFFFF'          // Màu nền
  },
  width: 300                  // Kích thước (pixels)
}
```

### Ví dụ tùy chỉnh màu sắc:

```javascript
const dataURL = await qrGenerator.generateDataURL(url, {
  width: 400,
  color: {
    dark: '#0066CC',  // Màu xanh dương
    light: '#F0F8FF'  // Màu nền xanh nhạt
  }
});
```

---

## 🔒 Phân quyền

- **QR Code Image endpoints** (`/qr-code`): **Public** - Ai cũng có thể quét để truy xuất nguồn gốc
- **QR Code Data URL endpoints** (`/qr-code-data`): **Public** - Ai cũng có thể lấy để hiển thị

---

## 🐛 Xử lý lỗi

Nếu có lỗi khi tạo QR code, API sẽ trả về:

```json
{
  "message": "Lỗi tạo mã QR",
  "error": "Chi tiết lỗi..."
}
```

**Status Code:** `500 Internal Server Error`

---

## 📦 Dependencies

- `qrcode`: Thư viện tạo QR code
- Đã được cài đặt trong `package.json`

---

## ✅ Checklist hoàn thành

- [x] Cài đặt package `qrcode`
- [x] Tạo utility `qrGenerator.js`
- [x] Thêm endpoints QR code cho Season
- [x] Thêm endpoints QR code cho Product
- [x] Cập nhật `exportSeason` để trả về QR code info
- [x] Cập nhật `createProduct` để trả về QR code info
- [x] Tạo documentation

---

**Tác giả:** BICAP Backend Team  
**Ngày tạo:** 2024





