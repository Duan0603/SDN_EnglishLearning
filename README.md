# IELTS Learning App

Dự án học tiếng Anh IELTS tích hợp AI.

## Cấu trúc thư mục
- `backend/`: NodeJS Express API + Prisma + PostgreSQL.
- `frontend/`: React Native (Expo) app.
- `docker-compose.yml`: Orchestration cho môi trường dev.

## Hướng dẫn chạy nhanh

### 1. Backend & Database
```bash
# Chạy database và adminer
docker-compose up -d db adminer

# Cài đặt backend
cd backend
npm install
cp .env.example .env # Cấu hình DATABASE_URL
npm run migrate
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
```

## Tính năng (Epics)
- Epic 1: Authentication & User Management
- Epic 2: Core Learning - Reading & Listening
- Epic 3: AI Integration - Writing & Speaking
- Epic 4: Mentor Booking System
