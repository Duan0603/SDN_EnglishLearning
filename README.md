# Apex IELTS — AI-Powered Learning Platform

Dự án học tiếng Anh IELTS tích hợp AI, xây dựng theo kiến trúc Fullstack Monorepo.

## 🔗 Liên kết dự án

- **Jira**: [Jira board của nhóm](https://knightdragon184.atlassian.net/jira/software/projects/EMAL/boards/1)
- **SRS**: [Tài liệu SRS của nhóm](https://docs.google.com/document/d/1KBLJLe8Z7QSNdK9XqvogO0MOMtQrduZYJ1euGcqtld8/edit?tab=t.0)
- **Paper Draft**: [Bản thảo bài báo khoa học (Paper Draft)](docs/paper_draft.md)
- **Google Drive Paper Draft**: [Thư mục tài liệu của nhóm](https://drive.google.com/drive/folders/1urDFKghlIHYq8umarsMMz3xHF15hPWYZ?usp=sharing)
- **Swagger UI**: `http://localhost:5000/api-docs`
- **Mongo Express**: `http://localhost:8082`

---

## 🎯 Mục tiêu nghiên cứu & phạm vi đề tài

Dự án tập trung vào nghiên cứu và ứng dụng AI cùng các kỹ thuật hệ thống hiện đại để xây dựng một nền tảng học IELTS thông minh, hỗ trợ đánh giá, phản hồi và cá nhân hóa lộ trình học tập cho người dùng.

### 1. Nghiên cứu ứng dụng AI trong đánh giá ngôn ngữ (AI-Assisted Grading)
- **Writing**: Prompt Engineering cho LLM (OpenAI GPT) để tự động chấm điểm theo 4 tiêu chí IELTS (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy).
- **Speaking**: Tích hợp Whisper STT + Gemini AI để đánh giá phát âm, độ trôi chảy và cung cấp feedback cá nhân hóa.

### 2. Nghiên cứu Tối ưu hóa Kiến trúc Hệ thống
- Backend xử lý luồng dữ liệu đa phương tiện (Media Streaming/Upload) cho Listening & Speaking.
- Đồng bộ dữ liệu, xử lý Double Booking bằng Transaction/Locking trong MongoDB với Redis SETNX.

### 3. Cá nhân hóa trải nghiệm học tập
- Theo dõi tiến độ, đánh giá điểm mạnh/điểm yếu qua từng bài thi để tối ưu hóa lộ trình học.

---

## 📁 Cấu trúc dự án (Monorepo)

```
SDN_EnglishLearning/
├── backend/          # NodeJS Express API + Prisma + MongoDB + Socket.io
│   ├── src/
│   │   ├── routes/   # API routes (auth, exams, mentors, bookings, admin)
│   │   ├── services/ # Business logic (exam, booking, mentor, gemini, stt)
│   │   ├── sockets/  # Socket.io handlers (audio streaming)
│   │   ├── models/   # Prisma models (Test, User, Booking, SpeakingSubmission)
│   │   ├── middlewares/ # Auth middleware (JWT + RBAC)
│   │   └── controllers/ # Request handlers
│   └── prisma/       # Schema + Seed scripts
│
├── frontend/         # React Native (Expo) Mobile App
│   └── src/
│       ├── screens/  # LoginScreen, HomeScreen, PracticeScreen, SpeakingScreen,
│       │             # ExamScreen, ProgressScreen, ProfileScreen, MentorsScreen,
│       │             # AdminScreen, RegisterScreen, ForgotPasswordScreen, SettingsScreen
│       ├── navigation/ # AppNavigator (Stack + Bottom Tabs)
│       ├── store/    # Zustand (useAuthStore)
│       ├── api/      # Axios client + interceptors + exam.service.js
│       ├── theme/    # Design tokens (COLORS, TYPOGRAPHY, SPACING)
│       └── shared/   # Reusable icons, components
│
├── web/              # Vite + React Admin Web Panel (Dashboard Admin)
│   └── src/
│       ├── features/ # auth/, admin/, practice/, profile/, landing/
│       ├── store/    # Redux store
│       └── services/ # API services
│
├── landing/          # Landing page (static)
├── docker-compose.yml
└── docs/             # Architecture diagrams, API docs
```

---

## 🌊 Luồng hoạt động (Flow) của dự án

### 🔐 Epic 1 — Authentication & Platform Core
```
[Mobile/Web] → Login/Register Form
    ↓ POST /api/v1/auth/login (hoặc /auth/signup)
[Backend] → Validate → JWT Generate → Store KeyToken
    ↓ accessToken + refreshToken
[Mobile] → expo-secure-store lưu token → Zustand useAuthStore.setSession()
    ↓ restoreToken() khi khởi động app
[Backend] → GET /api/v1/auth/profile → Trả user object
    ↓
[Navigation] → isBootstrapping? → SplashScreen → AuthStack hoặc MainTabNavigator
```
- **Status Mobile**: ✅ Đã tích hợp hoàn toàn (Login, Register, Google OAuth, Logout, ForgotPassword, ResetPassword)
- **Status Backend**: ✅ Hoàn chỉnh (JWT, KeyToken model, RBAC middleware, mail service)
- **⚠️ Còn thiếu**: Redux authSlice cho Web (web/src/features/auth chưa kết nối hoàn toàn API)

---

### 📖 Epic 2 — Exam Engine (Reading & Listening)
```
[PracticeScreen] → GET /api/v1/exams?type=READING (hoặc LISTENING)
    ↓ Danh sách đề thi từ database (Cambridge seeded data)
[User chọn đề] → GET /api/v1/exams/:id → Full exam với sections + questions
    ↓
[ExamScreen] → Hiển thị passage/audio + câu hỏi + countdown timer
    ↓ User trả lời → Auto-save answers vào AsyncStorage
[Submit] → POST /api/v1/exams/:id/submit { answers, timeTaken }
    ↓
[Backend ExamService.submitExam()] → So sánh đáp án → Tính bandScore
    ↓ Lưu TestResult vào database
[Frontend] → Hiển thị kết quả với correct/incorrect + explanation
```
- **Status Backend**: ✅ Hoàn chỉnh (CRUD exam, submission, grading, band score conversion)
- **⚠️ Còn thiếu (Mobile)**: PracticeScreen đang dùng **dữ liệu cứng** (hardcoded exams array) — cần gọi `GET /api/v1/exams?type=` thật sự
- **⚠️ Còn thiếu (Mobile)**: ExamScreen đang dùng **nội dung passage giả** — cần load từ `GET /api/v1/exams/:id`
- **⚠️ Còn thiếu (Mobile)**: Submit chưa gửi lên server thật, chỉ `Alert` mock
- **Status Web Admin**: ✅ Exam management UI (CRUD + bulk import)

---

### 🎙️ Epic 3 — AI Speaking Assessment
```
[SpeakingScreen] → Socket.io connect → User tap mic
    ↓ expo-av ghi âm → base64 audio
[Socket] → emit('audio:start') → emit('audio:chunk', base64) → emit('audio:stop', { userId, prompt })
    ↓
[Backend audio.handler.ts] → Nhận chunks → Gắn kết buffer
    ↓ Whisper STT API → Transcript
    ↓ Gemini API → Score JSON (bandScore, fluency, lexical, grammar, pronunciation, aiFeedback)
    ↓ Lưu SpeakingSubmission vào database
[Socket] → emit('audio:score', data) → SpeakingScreen nhận → Hiển thị kết quả
```
- **Status Mobile**: ✅ Đã tích hợp Socket.io (start/stop/chunk/score/error events)
- **Status Backend**: ✅ Hoàn chỉnh (audio handler, Whisper STT, Gemini scoring)
- **⚠️ Còn thiếu**: Speaking history (3.4 backlog) — chưa load lịch sử bài nói từ API

---

### 📅 Epic 4 — Mentor Booking System
```
[MentorsScreen] → GET /api/v1/mentors → Danh sách mentor (có fallback mock)
    ↓ User chọn mentor → GET /api/v1/mentors/:id/availabilities
[Modal] → Hiển thị slots khả dụng
    ↓ User chọn slot → POST /api/v1/bookings { availabilityId, notes }
[Backend BookingService] → Redis SETNX lock → MongoDB transaction → Tạo Booking
    ↓ 409 nếu slot đã bị book đồng thời
[Frontend] → Success/Conflict toast → Refresh slots
```
- **Status Mobile**: ✅ UI hoàn chỉnh, gọi API thật (có graceful fallback mock nếu 404)
- **Status Backend**: ✅ Mentor service + concurrency-safe booking với Redis lock
- **⚠️ Còn thiếu**: Admin mentor approval UI (web), Mentor profile setup

---

### 📊 Progress & Analytics
```
[ProgressScreen] → Hiển thị band scores, streak, history
    ⚠️ HIỆN TẠI: Tất cả là dữ liệu cứng (hardcoded)
    ✅ CẦN: GET /api/v1/auth/profile/progress hoặc GET /api/v1/exams/results?userId=
```

---

## 🚀 Hướng dẫn chạy nhanh

### 1. Backend & Database
```bash
# Chạy MongoDB Replica Set (bắt buộc cho Prisma transactions)
docker-compose up -d mongodb

# Cài đặt backend
cd backend
npm install
cp .env.example .env   # Cấu hình DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, WHISPER_API_KEY

# Đồng bộ schema và seed Cambridge data
npm run migrate

# Chạy server (dev mode)
npm run dev
# → API: http://localhost:5000
```

### 2. Mobile App (Expo)
```bash
cd frontend
npm install

# Cấu hình IP backend trong src/api/client.js (line 12)
# Hoặc set EXPO_PUBLIC_API_URL=http://<your-ip>:5000/api/v1

npm start
# → Scan QR code bằng Expo Go hoặc dùng emulator
```

### 3. Web Admin Panel (Vite)
```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

### 4. Chạy toàn bộ stack bằng Docker
```bash
docker compose up -d
# → API: http://localhost:5000
# → Mongo Express: http://localhost:8082 (admin/password)
```

### 5. Kết nối MongoDB Compass (Windows)
```
mongodb://127.0.0.1:27017/ielts_app?directConnection=true
```
- Host: `127.0.0.1` | Port: `27017` | Auth: `None` | DB: `ielts_app`

---

## 👥 Tài khoản dùng thử (sau khi seed)

| Role | Email | Password |
|:-----|:------|:---------|
| **Admin** | `admin@sdn.com` | `password123` |
| **Mentor** | `mentor@sdn.com` | `password123` |
| **Student** | `student@sdn.com` | `password123` |

---

## 📋 Tính năng (Epics) & Trạng thái

| Epic | Tên | Backend | Mobile | Web |
|:-----|:----|:-------:|:------:|:---:|
| Epic 1 | Auth & Platform Core | ✅ Done | ✅ Done | ⚠️ Partial |
| Epic 2 | Exam Engine (Reading/Listening) | ✅ Done | ⚠️ Partial | ✅ Done |
| Epic 3 | AI Speaking Assessment | ✅ Done | ✅ Done | ❌ TODO |
| Epic 4 | Mentor Booking System | ✅ Done | ✅ Done | ❌ Backlog |

### ⚠️ Các luồng còn thiếu tích hợp fullstack (cần fix)

1. **PracticeScreen** — Thay hardcoded exam list bằng `GET /api/v1/exams?type=`
2. **ExamScreen** — Load real exam từ `GET /api/v1/exams/:id`, submit thật lên `POST /api/v1/exams/:id/submit`
3. **ProgressScreen** — Load real results từ `GET /api/v1/users/me/results`, band scores từ TestResult
4. **HomeScreen** — Load real progress data thay vì hardcoded `7.5`, `62%`...
5. **Speaking History** — Load past submissions từ `GET /api/v1/speaking/history`
6. **Web Auth** — Kết nối Redux authSlice với real API endpoints

---

## 🔌 API Endpoints chính

| Method | Endpoint | Mô tả |
|:-------|:---------|:------|
| POST | `/api/v1/auth/signup` | Đăng ký tài khoản |
| POST | `/api/v1/auth/login` | Đăng nhập (JWT) |
| POST | `/api/v1/auth/logout` | Đăng xuất |
| GET | `/api/v1/auth/profile` | Thông tin user hiện tại |
| GET | `/api/v1/exams` | Danh sách bài thi (filter by type, paginated) |
| GET | `/api/v1/exams/:id` | Chi tiết bài thi (sections + questions) |
| POST | `/api/v1/exams/:id/submit` | Nộp bài và nhận kết quả |
| GET | `/api/v1/mentors` | Danh sách mentor |
| GET | `/api/v1/mentors/:id/availabilities` | Slot available của mentor |
| POST | `/api/v1/bookings` | Đặt lịch mentor (concurrency-safe) |
| POST | `/api/v1/admin/exams/bulk-import` | Admin bulk import exams |
| WS | `socket: audio:chunk` | Stream audio chunks lên server |
| WS | `socket: audio:stop` | Kết thúc stream, trigger STT + AI grading |
| WS | `socket: audio:score` | Server trả về kết quả chấm điểm |
