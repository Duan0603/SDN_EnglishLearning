---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["docs/project-context.md"]
workflowType: 'architecture'
project_name: 'SDN_EnglishLearning'
user_name: 'Quan'
date: '2026-05-25'
lastStep: 8
status: 'complete'
completedAt: '2026-05-25'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Core Learning:** Exam Mode (chia đôi màn hình, ẩn transcript, thời gian thực) và Practice Mode (cho phép bật/tắt transcript).
- **AI Integration:** Chấm bài Speaking tự động (Frontend MediaRecorder API -> Backend Whisper STT -> Gemini API) đánh giá theo 4 tiêu chí BC/IDP.
- **Booking System:** Học viên xem và đặt trực tiếp slot trống của Mentor.
- **Admin/Analytics:** Dashboard quản trị đề thi Cambridge, trả điểm và highlight từ đồng nghĩa (Paraphrasing).

**Non-Functional Requirements:**
- **Concurrency & Consistency (0% Trùng lặp):** Áp dụng mô hình **Hai lớp bảo vệ (Two-layer Defense)**. Lớp 1 (Fast-fail): Dùng Redis SETNX + Lua Script để khóa slot trên RAM; Lớp 2 (Data Integrity): Dùng MongoDB Unique Compound Index `(mentorId, timeSlot)`.
- **Performance & Cost Resilience:** Kiến trúc Streaming Pipeline với WebSockets. Frontend tiến hành Audio Chunking qua WebSocket, Backend STT song song, giảm độ trễ Gemini xuống < 3 giây.
- **Security:** Cơ chế Auth bằng JWT và Refresh Token qua HttpOnly Cookie. Phân tách 3 quyền: Student, Mentor, Admin.

**Scale & Complexity:**
- Primary domain: Web Full-Stack (ReactJS, Node.js, Redis, MongoDB)
- Complexity level: Enterprise-grade (Concurrency Locking & Multi-step AI Pipeline)
- Estimated architectural components: Frontend App, Backend REST/WebSocket API, Redis (Cache/Lock Layer), Database Layer, External AI Services.

### Technical Constraints & Dependencies

- WebSockets Cluster: Backend Node.js sử dụng Cluster/PM2 + Redis Pub/Sub Adapter để chịu tải 10,000+ connections.
- Offline-First Audio: Dùng IndexedDB caching lưu tạm Audio Blobs ở Frontend chống mất dữ liệu khi rớt mạng.
- Giao diện tối ưu Desktop/Tablet. Không có Mobile app ở Phase 1. Không AI chấm Writing.

### Cross-Cutting Concerns Identified

- **Frontend State Management:** Zustand/Redux để lock giao diện Exam Mode (anti-cheat) và xử lý đồng bộ Audio-Text ở Review Mode.
- **Distributed Locking Utility:** Đóng gói Redis Lock thành Middleware độc lập tái sử dụng.
- **Session Management:** Xử lý cơ chế thu hồi (Revoke) JWT và Refresh Cookie an toàn.

## Starter Template Evaluation

### Primary Technology Domain
Web Full-Stack (Decoupled Architecture: SPA Frontend + API/WebSocket Backend)

### Starter Options Considered
- **Next.js (App Router):** Phù hợp SEO, Server-side Rendering. Tuy nhiên dự án này nặng về Client-side Audio Processing và Long-lived WebSockets. Việc setup WebSocket Cluster trên Next.js rất thiếu ổn định. -> *Bỏ qua.*
- **Nx Monorepo / Turborepo:** Tốt cho quản lý nhiều project. Nhưng đổi lại là sự phức tạp trong setup ban đầu. -> *Hủy bỏ để ưu tiên sự đơn giản.*
- **Vite React TS + Node.js Express TS (Polyrepo):** Sự phân tách hoàn hảo. Frontend dùng Vite cực nhanh, dễ cấu hình Web Worker/Audio. Backend dùng Express dễ dàng scale bằng PM2 và gắn Socket.io cùng Redis Adapter. -> **Lựa chọn tối ưu.**

### Selected Starter: Vite React (Frontend) & Express TS (Backend)

**Rationale for Selection:**
Phân tách rõ ràng (Decoupled) giúp Frontend dễ dàng cấu hình IndexedDB và MediaRecorder API độc lập. Backend Node.js + Express là môi trường hoàn hảo và ổn định nhất để thiết lập WebSockets Cluster, Redis Lock Middleware và MongoDB, đồng thời giữ kiến trúc nhẹ nhàng (không cần Monorepo phức tạp).

**Initialization Command:**

```bash
# Khởi tạo Frontend (Vite + React + TypeScript)
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install zustand tailwindcss postcss autoprefixer socket.io-client

# Khởi tạo Backend (Express + TypeScript)
mkdir backend && cd backend
npm init -y
npm install express mongoose redis socket.io jsonwebtoken
npm install -D typescript @types/node @types/express ts-node-dev jest supertest mongodb-memory-server redis-mock
npx tsc --init
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Toàn bộ dùng **TypeScript** cho cả Frontend và Backend để đồng bộ Type (Interfaces). Node.js Runtime (v20+ LTS).

**Styling Solution:**
- **Tailwind CSS** cho giao diện Responsive Desktop/Tablet.

**Build Tooling:**
- **Vite** (Frontend) hỗ trợ Hot Module Replacement (HMR) tốc độ cao và build optimize bundle nhỏ gọn. **tsc / ts-node-dev** (Backend).

**Testing Framework:**
- **Vitest** cho Frontend.
- **Jest + Supertest** cho Backend API & WebSocket events.

**Code Organization (Folder Structure Blueprint):**
- **Toàn cục:** Thêm thư mục `tests/` phân tách rõ `tests/unit/` và `tests/integration/`. 
- **Frontend (`frontend/src/`):**
  - `components/`, `features/`, `services/` (Axios API calls).
  - `hooks/`: Custom hooks (`useAudioStream.ts`, `useWebSocket.ts`).
  - `store/`: Zustand stores (`examStore.ts` để lock trạng thái Anti-cheat).
  - `workers/`: Chạy đồng hồ và nén âm thanh ở Background Thread, tránh giật lag UI.
- **Backend (`backend/src/`):**
  - `controllers/` & `routes/`: Quản lý HTTP REST APIs.
  - `sockets/`: Quản lý các Event Socket.io hoàn toàn độc lập với REST API.
  - `streams/`: Luồng xử lý Piping Audio trực tiếp từ Socket đến Whisper API (zero-memory-footprint).
  - `services/`: Logic nghiệp vụ nặng (`ai.service.ts`, `booking.service.ts`).
  - `middlewares/`: Cửa ngõ chặn Request (`auth.middleware.ts`, `redisLock.middleware.ts`).
  - `models/`: Mongoose schemas.
  - `database/indexes/`: Định nghĩa các Compound/TTL Index cho MongoDB.
  - `docs/api/`: Nơi chứa tài liệu Swagger API tự sinh.

**Development Experience:**
- Hot-reload độc lập cho cả Client và Server. Tách biệt hoàn toàn, dễ scale và bảo trì.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Data Access Layer:** Prisma ORM + MongoDB (Đảm bảo Type-safety từ DB đến API, đặc biệt lưu ý khi mapping data dạng JSON từ AI Feedback).
- **Redis Locking:** Dùng Redis `SETNX` + Lua Script (có cấu hình `TTL` nghiêm ngặt chống Deadlock) trên 1 node duy nhất để khóa slot (Fast-fail), kết hợp Unique Compound Index của MongoDB.
- **Frontend State Management:** Redux Toolkit (Cho khả năng mở rộng tốt, kết hợp **Custom Redux Middleware** để quản lý trực tiếp các luồng events từ Socket.io).

**Important Decisions (Shape Architecture):**
- **Authentication:** JWT lưu trong HttpOnly Cookies kết hợp RBAC qua Express Middleware.
- **API & Streaming:** REST API cho thao tác CRUD; Socket.io cho streaming Audio chunks (được cô lập logic bên trong Redux Middleware).

**Deferred Decisions (Post-MVP):**
- Các kiến trúc phân tán phức tạp (như Redlock phân tán, Microservices, API Gateway) được trì hoãn để giữ dự án bám sát quy mô đồ án sinh viên.

### Data Architecture
- **Database:** MongoDB.
- **ORM:** Prisma ORM (MongoDB provider).
- **Concurrency Control:** Lệnh `SETNX` + Lua Script + `TTL` (ngăn node crash gây treo slot) trên node Redis nội bộ. Đủ để đảm bảo tỷ lệ trùng lịch 0%.

### Authentication & Security
- **Strategy:** JWT + HttpOnly Cookies để chống tấn công XSS. 
- **Authorization:** Middleware chuẩn hóa HTTP Error Codes, chặn quyền truy cập theo Roles (Student, Mentor, Admin).

### API & Communication Patterns
- **Standard:** RESTful API (Express Router).
- **Real-time:** Socket.io truyền tải Audio chunks từ Frontend (MediaRecorder) lên Backend (Whisper STT).

### Frontend Architecture
- **State Management:** Redux (Redux Toolkit) + Custom Middleware để xử lý Real-time Sync một cách sạch sẽ.
- **Styling:** Tailwind CSS.

### Infrastructure & Deployment
- **Deployment:** Chạy Node.js Backend độc lập bằng PM2. Frontend Vite build ra static files.

### Decision Impact Analysis

**Implementation Sequence (Thứ tự triển khai):**
1. Cấu hình Prisma Schema và kết nối MongoDB.
2. Xây dựng Authentication (JWT) và các REST APIs cơ bản.
3. Thiết lập Redux Toolkit ở Frontend, viết Custom Middleware khởi tạo kết nối Socket.io.
4. Tích hợp Redis và logic khóa slot Booking có cài đặt TTL an toàn.
5. Hoàn thiện luồng Socket.io cho Audio Streaming (Thu âm -> STT -> Gemini).

**Cross-Component Dependencies (Sự phụ thuộc):**
- Custom Redux Middleware sẽ là cầu nối độc quyền (Single Source of Truth) giữa Frontend Components và Socket.io instance.
- Tầng Prisma lưu trữ Data sẽ phụ thuộc trực tiếp vào tính ổn định định dạng JSON đầu ra của Gemini API (đối với trường `aiFeedback`).

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
Có 4 khu vực tiềm ẩn rủi ro xung đột (Naming, Structure, Formats, Process) cần quy chuẩn nghiêm ngặt để các AI Agents không viết code "giẫm chân" lên nhau.

### Naming Patterns
- **Database (Prisma):** Model luôn dùng `PascalCase` dạng số ít (ví dụ: `User`, `SpeakingSubmission`). Tên field dùng `camelCase`.
- **API Naming:** REST Endpoints luôn dùng chữ thường, số nhiều, danh từ, phân tách bằng gạch ngang `kebab-case` (ví dụ: `GET /api/v1/speaking-submissions`).
- **Code Naming (React):** 
  - Component & File: `PascalCase` (ví dụ: `AudioPlayer.tsx`).
  - Hooks: Bắt đầu bằng chữ `use` (ví dụ: `useSocket.ts`).
  - Utils/Helpers: `camelCase` (ví dụ: `formatTime.ts`).

### Structure Patterns
- **Frontend (Redux Toolkit):** Tổ chức theo Feature-based (ví dụ: `src/features/exam/examSlice.ts`, `src/features/exam/ExamBoard.tsx`).
- **Backend:** Phân tách rõ ràng giữa HTTP (`src/controllers`, `src/routes`) và WebSockets (`src/sockets/events.ts`).

### Format Patterns
- **API Response:** BẮT BUỘC tuân thủ chuẩn sau:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "error": { "code": 404, "message": "Not found" } }`
- **Data Exchange:** Các dữ liệu thời gian (Dates) gửi qua API/Socket phải ở định dạng `ISO 8601 string`.

### Communication Patterns
- **Socket.io Events:** Dùng cú pháp `phạm-vi:hành-động` (ví dụ: `audio:chunk_received`, `exam:time_sync`).
- **State Management:** Custom Redux Middleware sẽ "hứng" event từ Socket.io và map thẳng thành Redux Actions (ví dụ: `dispatch(examActions.updateTimer(data))`). Không để Components tự lắng nghe Socket riêng lẻ.

### Process Patterns
- **Error Handling (Backend):** Bắt buộc dùng 1 Global Error Middleware ở cuối luồng Express để thống nhất Response.
- **Error Handling (Frontend):** Dùng Error Boundary bao bọc các Route, và dùng tính năng `extraReducers` của Redux Toolkit để xử lý rejected API calls.

### Enforcement Guidelines
**Tất cả AI Agents BẮT BUỘC PHẢI:**
- Không được tự ý thay đổi format trả về của API.
- Luôn đặt logic lắng nghe Socket.io bên trong Redux Middleware.
- Bất kỳ file React Component nào cũng phải xuất (export default) ở dạng `PascalCase`.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
SDN_EnglishLearning/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/        # Load biến môi trường, khởi tạo DB & Redis
│   │   ├── controllers/   # Xử lý Request/Response HTTP
│   │   ├── middlewares/   # auth.middleware.ts, error.middleware.ts
│   │   ├── routes/        # Định nghĩa các REST endpoint (API v1)
│   │   ├── services/      # Logic nghiệp vụ (Booking, AI STT, Exam grading)
│   │   ├── sockets/       # Lắng nghe và xử lý sự kiện Socket.io
│   │   ├── utils/         # Hàm dùng chung (redis-lock, logger)
│   │   └── server.ts      # Entry point
│   └── tests/             # Jest tests (unit/integration)
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── src/
    │   ├── assets/        # Hình ảnh, âm thanh tĩnh
    │   ├── components/    # Shared UI components (Button, Modal, Toast)
    │   ├── features/      # Tổ chức theo chức năng (auth, exam, practice, booking)
    │   ├── hooks/         # Custom hooks (useSocket, useAudioRecorder)
    │   ├── store/         # Redux store, slices, và custom Socket middleware
    │   ├── services/      # Axios API clients
    │   ├── App.tsx        # Root component, Routing layout
    │   └── main.tsx       # Entry point React
    └── tests/             # Vitest & React Testing Library
```

### Architectural Boundaries

**API Boundaries:**
- **RESTful API:** Chỉ phục vụ thao tác CRUD (tạo tài khoản, lấy đề thi, đặt lịch). Backend route tại `backend/src/routes`.
- **WebSockets:** Dành riêng cho Streaming (Audio chunking và trả kết quả STT thời gian thực). Xử lý hoàn toàn trong `backend/src/sockets`.

**Component Boundaries (Frontend):**
- **Smart Components (Features):** Được đặt trong `src/features/`, kết nối trực tiếp với Redux để lấy Data và dispatch action.
- **Dumb Components (UI):** Nằm ở `src/components/`, chỉ nhận Props để hiển thị, không gọi API hay Redux trực tiếp.

**Data Boundaries:**
- **MongoDB (Persistent):** Lưu thông tin lâu dài (Users, Tests, Submissions). Truy cập duy nhất thông qua Prisma Client tại tầng `services/` của backend.
- **Redis (Ephemeral/Locking):** Lưu trạng thái khóa slot tức thời (Fast-fail). Truy xuất qua file tiện ích tại `backend/src/utils/redisLock.ts`.

### Requirements to Structure Mapping

**Epic Mapping:**
- **Epic: AI Speaking System**
  - Frontend: `frontend/src/features/exam/AudioRecorder.tsx`, `frontend/src/hooks/useAudioRecorder.ts`
  - Redux: `frontend/src/store/examSlice.ts`
  - Backend Sockets: `backend/src/sockets/audio.socket.ts`
  - Backend Service: `backend/src/services/ai.service.ts`

- **Epic: Mentor Booking System**
  - Frontend: `frontend/src/features/booking/`
  - Backend API: `backend/src/routes/booking.routes.ts`, `backend/src/controllers/booking.controller.ts`
  - Logic/Locking: `backend/src/services/booking.service.ts`, `backend/src/utils/redisLock.ts`

**Cross-Cutting Concerns:**
- **Authentication:** `frontend/src/features/auth/`, `backend/src/middlewares/auth.middleware.ts`.
- **Global Error Handling:** `backend/src/middlewares/error.middleware.ts`, Frontend Error Boundary Component.

### Integration Points
- **Internal:** Giao tiếp Frontend-Backend thông qua Axios (REST) và thư viện `socket.io-client`. 
- **External:** Backend gọi tới Whisper STT và Gemini API thông qua các service wrapper trong `backend/src/services/ai.service.ts`.

## Architecture Validation Results

### Coherence Validation ✅
**Decision Compatibility:** Bộ công cụ (Express, Prisma, React, Redux, Socket.io) hoạt động trơn tru với nhau trong hệ sinh thái TypeScript.
**Pattern Consistency:** Các quy tắc đặt tên và quản lý Event được thiết kế tối ưu riêng cho luồng giao tiếp Socket.io - Redux.
**Structure Alignment:** Thư mục phản ánh chính xác sự phân tách trách nhiệm (Separation of Concerns) giữa Frontend UI và Backend API/Streaming.

### Requirements Coverage Validation ✅
**Epic/Feature Coverage:** 
- AI Speaking System được hỗ trợ bởi kiến trúc WebSockets + AI Services.
- Mentor Booking System được hỗ trợ bởi kiến trúc Concurrency Locking (Redis).
**Non-Functional Requirements Coverage:** Tính chịu lỗi, tốc độ phản hồi real-time và phòng chống XSS đều đã có giải pháp tương ứng (Error Boundary, Socket.io, HttpOnly JWT).

### Implementation Readiness Validation ✅
**Decision Completeness:** Toàn bộ công nghệ đã chốt version/công cụ.
**Structure Completeness:** Sơ đồ cây đầy đủ và chi tiết.
**Pattern Completeness:** Ranh giới rõ ràng, không có khoảng trống.

### Architecture Completeness Checklist
**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** High

**Key Strengths:** 
- Rất thực dụng, tinh gọn, đúng chuẩn mực của một Đồ án (Student Project) nhưng vẫn mang hơi hướng chuyên nghiệp nhờ ứng dụng Redis và Socket.io.
- TypeScript được tận dụng triệt để ở cả hai đầu.

**Areas for Future Enhancement (Sau MVP):**
- Đưa vào hàng đợi (Message Queue như RabbitMQ/BullMQ) nếu lượng file ghi âm tải lên quá lớn khiến Gemini AI xử lý không kịp.

### Implementation Handoff
**AI Agent Guidelines:**
- Bắt buộc tuân thủ 100% cấu trúc thư mục và quy tắc Naming Convention đã chốt.
- Bất kỳ Agent nào khi tham gia code đều phải đọc file này đầu tiên.

**First Implementation Priority:**
`npm create vite@latest frontend -- --template react-ts` và `npm init -y` cho thư mục backend, setup cấu trúc cơ bản.
