# IELTS Learning App

Dự án học tiếng Anh IELTS tích hợp AI.

## Cấu trúc thư mục
- `backend/`: NodeJS Express API + Prisma + MongoDB.
- `frontend/`: React Native (Expo) app.
- `docker-compose.yml`: Orchestration cho môi trường dev.

## Hướng dẫn chạy nhanh

### 1. Backend & Database
```bash
# Chạy database (MongoDB Replica Set)
docker-compose up -d mongodb

# Cài đặt backend
cd backend
npm install
cp .env.example .env # Cấu hình DATABASE_URL

# Đồng bộ schema và tạo dữ liệu mẫu (Seed)
npm run migrate

# Chạy server
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

## Tài khoản dùng thử (Test Accounts)
Sau khi chạy lệnh `npm run migrate`, bạn có thể sử dụng các tài khoản sau để test:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@sdn.com` | `password123` |
| **Mentor** | `mentor@sdn.com` | `password123` |
| **Student** | `student@sdn.com` | `password123` |

> **Swagger UI**: Bạn có thể truy cập tài liệu API tại `http://localhost:5000/api-docs`

> **Mongo Express (Database GUI)**: Truy cập tại `http://localhost:8082`
> - **User**: `admin`
> - **Password**: `password`

## Tính năng (Epics)
- Epic 1: Authentication & User Management
- Epic 2: Core Learning - Reading & Listening
- Epic 3: AI Integration - Writing & Speaking
- Epic 4: Mentor Booking System
