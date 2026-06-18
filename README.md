# IELTS Learning App

Dự án học tiếng Anh IELTS tích hợp AI.

## Liên kết dự án

- Jira: [Jira board của nhóm](https://knightdragon184.atlassian.net/jira/software/projects/EMAL/boards/1)
- SRS: [Tài liệu SRS của nhóm] (https://docs.google.com/document/d/1KBLJLe8Z7QSNdK9XqvogO0MOMtQrduZYJ1euGcqtld8/edit?tab=t.0)

- Overleaf: [Tài liệu Overleaf của nhóm] (https://www.overleaf.com/read/zfnjhyvpcwwp#999b02)

## Mục tiêu nghiên cứu & phạm vi đề tài

Dự án tập trung vào nghiên cứu và ứng dụng Trí tuệ Nhân tạo (AI) cùng các kỹ thuật hệ thống hiện đại để xây dựng một nền tảng học IELTS thông minh, có khả năng hỗ trợ đánh giá, phản hồi và cá nhân hóa lộ trình học tập cho người dùng. Hàm lượng nghiên cứu của đề tài nằm ở ba hướng chính:

1. **Nghiên cứu ứng dụng AI trong đánh giá ngôn ngữ (AI-Assisted Grading)**
   - **Writing**: Khảo sát và tối ưu hóa Prompt Engineering cho LLM (Large Language Models - ví dụ OpenAI GPT) để tự động chấm điểm, chữa lỗi và nhận xét bài viết dựa trên 4 tiêu chí chuẩn của IELTS (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
   - **Speaking**: Tích hợp mô hình nhận dạng giọng nói (Speech-to-Text như Whisper API) kết hợp LLM để đánh giá phát âm, độ trôi chảy và cung cấp feedback cá nhân hóa theo thời gian thực.

2. **Nghiên cứu Tối ưu hóa Kiến trúc Hệ thống (System Architecture)**
   - Xây dựng hệ thống Backend xử lý luồng dữ liệu đa phương tiện (Media Streaming/Upload) hiệu quả cho phần thi Listening & Speaking.
   - Xử lý bài toán đồng bộ dữ liệu và xung đột lịch đặt phòng (Double Booking) ở mức Database level bằng Transaction/Locking trong MongoDB.

3. **Cá nhân hóa trải nghiệm học tập**
   - Áp dụng các thuật toán theo dõi tiến độ và đánh giá điểm mạnh, điểm yếu qua từng bài thi để tối ưu hóa lộ trình tự học của học viên.

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

### 2. Chạy bằng Docker
```bash
# Khởi động toàn bộ stack: MongoDB, mongo-express và API
docker compose up -d
```

Nếu muốn đổi user/password MongoDB, copy `.env.example` thành `.env` rồi chỉnh giá trị trước khi chạy.

Sau khi chạy xong:
- API: http://localhost:5000
- mongo-express: http://localhost:8082

### 3. Kết nối MongoDB Compass
Compass trên máy Windows nên dùng kết nối trực tiếp và không nhập username/password:

```text
mongodb://127.0.0.1:27017/ielts_app?directConnection=true
```

Thiết lập nhanh trong Compass:
- Host: `127.0.0.1`
- Port: `27017`
- Authentication Method: `None`
- Database: `ielts_app`

Nên tạo connection mới thay vì sửa connection cũ đã lưu để tránh Compass giữ lại credential hoặc option cũ.

Backend trong Docker vẫn dùng replica set nội bộ theo URI trong `.env` và `docker-compose.yml`.

### 4. Frontend
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
