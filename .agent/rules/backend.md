---
trigger: glob
glob: "**/*.{py,js,ts,go,rs,sql,php,java,dockerfile,tf,yaml,yml}"
---

# BACKEND.MD - NodeJS & AI Mastery

> **Mục tiêu**: Xây dựng hệ thống API mạnh mẽ, bảo mật cao và tích hợp AI thông minh cho việc học IELTS.

---

## 🏗️ 1. ARCHITECTURE & API (Express Focus)

1. **Clean Architecture**: Controller -> Service -> Model. Sử dụng `express-async-handler` để quản lý lỗi async.
2. **RESTful Standards**:
   - HTTP Methods chuẩn (`GET`, `POST`, `PUT`, `DELETE`).
   - Status codes: `200` (OK), `201` (Created), `401` (Unauthorized), `403` (Forbidden), `500` (Error).
3. **Validation**: Sử dụng `Joi` hoặc `Zod` để validate request body/params.

---

## 🔐 2. AUTHENTICATION & SECURITY

1. **JWT Auth**: Access Token (hết hạn ngắn) + Refresh Token (hết hạn dài, lưu trong DB).
2. **RBAC**: Middleware phân quyền cho Student, Mentor, Admin.
3. **Security**: Sử dụng `helmet`, `cors`, `express-rate-limit` để bảo vệ API.
4. **Secrets**: Tuyệt đối sử dụng `.env`. Không bao giờ commit secret key.

---

## 🤖 3. AI INTEGRATION (OpenAI & Whisper)

1. **OpenAI**: Sử dụng SDK chính thức. Viết system prompt chi tiết cho việc chấm điểm Writing (Task 1 & Task 2).
2. **Whisper**: Xử lý audio file tải lên từ mobile. Kiểm tra định dạng (`m4a`, `mp3`, `wav`) trước khi gửi lên API.
3. **Cost Optimization**: Cache kết quả chấm điểm nếu nội dung không đổi. Sử dụng `gpt-4o-mini` cho các tác vụ đơn giản để tiết kiệm chi phí.

---

## 🗄️ 4. DATABASE & EMAILING

1. **Database**: MongoDB (Prisma). 
   - Sử dụng `db push` thay vì `migrate dev` cho tính linh hoạt của NoSQL.
   - Định nghĩa Schema với `@db.ObjectId` và `String` cho ID.
   - Luôn sử dụng Index cho các trường tìm kiếm thường xuyên (`email`, `username`, `booking_date`).
2. **Booking Logic**: Kiểm tra trùng lịch (Double booking) bằng MongoDB Transactions (Yêu cầu Replica Set).
3. **Emailing**: Sử dụng `Nodemailer` với SMTP (Gmail/SendGrid). Template email HTML chuyên nghiệp cho thông báo đặt lịch.

