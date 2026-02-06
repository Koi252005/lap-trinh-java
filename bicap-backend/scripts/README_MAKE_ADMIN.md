# Cách cấp quyền Admin cho tài khoản

## Email: khoiphan252005@gmail.com

### Cách 1: Chạy SQL trực tiếp (Khuyến nghị)

1. Mở SQL Server Management Studio (SSMS) hoặc Azure Data Studio
2. Kết nối đến database BICAP
3. Chạy lệnh SQL sau:

```sql
UPDATE Users 
SET role = 'admin' 
WHERE email = 'khoiphan252005@gmail.com';

-- Kiểm tra kết quả
SELECT id, email, fullName, role, isActive 
FROM Users 
WHERE email = 'khoiphan252005@gmail.com';
```

### Cách 2: Chạy script Node.js (cần DB đang chạy)

```bash
cd bicap-backend
node scripts/makeAdmin.js
```

**Lưu ý:** Script này cần database đang kết nối được.

### Cách 3: Qua API (cần có token admin trước)

Nếu bạn đã có một tài khoản admin khác, có thể gọi API:

```bash
PUT http://localhost:5001/api/admin/users/email/khoiphan252005@gmail.com
Headers: Authorization: Bearer <admin_token>
Body: { "role": "admin" }
```

---

## Sau khi cấp quyền

1. Đăng xuất và đăng nhập lại với email `khoiphan252005@gmail.com`
2. Vào trang `/admin` để kiểm tra quyền admin
3. Bạn sẽ thấy menu: Tổng quan, Đơn hàng, Người dùng
