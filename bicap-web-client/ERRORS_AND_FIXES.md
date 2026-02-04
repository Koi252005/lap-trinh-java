# Lỗi đã phát hiện và đã sửa – BICAP Web Client

## 1. Đã sửa

### 1.1 API URL hardcode
- **Vấn đề:** Nhiều trang gọi trực tiếp `http://localhost:5001/api/...`, khó đổi môi trường (staging/production).
- **Đã làm:** Tạo `src/lib/api.ts` export `API_BASE` và `getApiUrl()`, dùng `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'`.
- **File đã cập nhật:** `src/app/market/page.tsx`, `src/app/(guest)/guest/education/page.tsx`.

### 1.2 Trang Education – API URL undefined
- **Vấn đề:** `process.env.NEXT_PUBLIC_API_URL` có thể undefined → URL thành `"undefined/articles"`.
- **Đã làm:** Chuyển sang dùng `API_BASE` từ `@/lib/api`.

### 1.3 CSS trùng keyframes
- **Vấn đề:** Trong `globals.css` có hai lần khai báo `@keyframes scaleIn` (scale 0.95 và 0.9).
- **Đã làm:** Xóa bản trùng, giữ một bản `scaleIn`.

---

## 2. Nên sửa tiếp (cùng pattern)

Các file sau vẫn hardcode `http://localhost:5001/api`. Nên thay bằng `API_BASE` từ `@/lib/api`:

| File | Ghi chú |
|------|--------|
| `src/context/AuthContext.tsx` | Đã dùng env, có thể thống nhất dùng `API_BASE` |
| `src/app/(farm)/farm/*.tsx` | Nhiều trang farm (page, orders, products, seasons, …) |
| `src/app/(retailer)/retailer/*.tsx` | Orders, market, profile, reports, notifications |
| `src/app/(shipping)/shipping/*.tsx` | shipments, drivers, page |
| `src/app/traceability/[id]/page.tsx` | Gọi API season |
| `src/app/(farm)/farm/services/payment/page.tsx` | Subscriptions |
| `src/app/(farm)/farm/profile/page.tsx` | Profile update |

Cách sửa mẫu:

```ts
import { API_BASE } from '@/lib/api';
// Thay: axios.get('http://localhost:5001/api/...')
// Bằng: axios.get(`${API_BASE}/...`)
```

---

## 3. Giao diện – Chủ đề thực vật + pixel

- **Font pixel:** Thêm font Google "Press Start 2P" trong `layout.tsx`, biến CSS `--font-pixel`.
- **Màu:** Cập nhật palette trong `globals.css` theo tone pixel (xanh lá, nâu đất, kem).
- **Thành phần pixel:** Thêm class `.pixel-card`, `.pixel-btn`, `.pixel-box` (viền đậm, bóng blocky, border-radius 0).
- **Trang chủ:** Hero và một số section dùng `font-pixel`, `pixel-card`, nền `theme-pixel`.
- **Market:** Tiêu đề "Chợ Nông Sản Sạch" dùng font pixel và text-shadow.

---

## 4. Chạy test trang web

- Trong thư mục `bicap-web-client` chạy: `npm run dev`.
- Mở http://localhost:3000 để xem trang chủ và điều hướng (market, login, guest, …).
- Lưu ý: Trên Windows PowerShell dùng `;` thay cho `&&` khi gộp lệnh (vd: `cd bicap-web-client; npm run dev`).

Nếu cần, có thể thêm script test E2E (Playwright/Cypress) hoặc unit test (Jest) sau.
