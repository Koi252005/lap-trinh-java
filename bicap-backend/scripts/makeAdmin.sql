-- Script SQL để cấp quyền admin cho user
-- Chạy trực tiếp trên SQL Server database

UPDATE Users 
SET role = 'admin' 
WHERE email = 'khoiphan252005@gmail.com';

-- Kiểm tra kết quả
SELECT id, email, fullName, role, isActive 
FROM Users 
WHERE email = 'khoiphan252005@gmail.com';
