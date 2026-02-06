// Script để cấp quyền admin qua API (không cần DB connection trực tiếp)
// Chạy khi backend đang chạy: node scripts/makeAdminViaAPI.js

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const EMAIL = 'khoiphan252005@gmail.com';

async function makeAdminViaAPI() {
  console.log('⚠️  Lưu ý: Backend phải đang chạy và bạn cần có token admin để gọi API này.');
  console.log('💡 Hoặc bạn có thể gọi API trực tiếp:');
  console.log(`   PUT ${API_URL}/admin/users/email/${encodeURIComponent(EMAIL)}`);
  console.log(`   Body: { "role": "admin" }`);
  console.log(`   Header: Authorization: Bearer <admin_token>`);
  console.log('');
  console.log('📝 Hoặc chạy SQL trực tiếp trên database:');
  console.log(`   UPDATE Users SET role = 'admin' WHERE email = '${EMAIL}';`);
}

makeAdminViaAPI();
