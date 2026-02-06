# Hướng dẫn Seed sản phẩm

## Cách 1: Nút trên giao diện (dễ nhất)

1. **Chạy backend**: `npm start` hoặc `npm run dev`
2. **Chạy frontend**: `cd bicap-web-client && npm run dev`
3. Vào **Sàn retailer** (http://localhost:3000/retailer/market)
4. Nếu chưa có sản phẩm → bấm **"🌱 Tạo sản phẩm mẫu"**
5. Hoặc vào **Admin** (http://localhost:3000/admin) → bấm **"🌱 Seed sản phẩm mẫu"**

## Cách 2: API trực tiếp

```bash
curl -X POST http://localhost:5001/api/seed
```

## Cách 3: Script (khi backend chưa chạy)

```bash
cd bicap-backend

# Dùng DB từ .env (mặc định)
npm run seed

# Dùng localhost (khi .env có DB_SERVER=sql_server)
npm run seed:local
# hoặc
node scripts/addSampleProducts.js --local
```

## Cấu hình .env

- **Chạy local**: `DB_SERVER=localhost` hoặc `DB_HOST=localhost`
- **Dùng Docker**: `DB_SERVER=sql_server`
- Cần: `DB_NAME`, `DB_USER`, `DB_PASSWORD`
