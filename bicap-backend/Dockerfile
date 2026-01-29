# Sử dụng Node.js image chính thức
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port (Backend chạy 5001)
EXPOSE 5001

# Lệnh khởi chạy
CMD ["npm", "start"]
