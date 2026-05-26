# Story 1.4: Triển khai Hạ tầng Socket.io & Zustand Store (Kết nối Real-time)

Status: completed

## Story

Với vai trò là Nhà phát triển,
Tôi muốn cấu hình máy chủ Socket.io cơ bản và tích hợp Socket.io Client với Zustand Store ở Frontend,
Để các tính năng thời gian thực (Audio Streaming, Khóa phòng đặt lịch học) có thể dễ dàng tích hợp trong các Epic tiếp theo.

## Tiêu chí Chấp nhận (Acceptance Criteria - AC)

1. **AC-1 (Backend Socket.io Server):** Khi máy chủ backend khởi chạy thành công, nó khởi tạo cổng Socket.io lắng nghe kết nối từ client.
2. **AC-2 (Frontend Socket.io Connection):** Khi ứng dụng frontend (React Native) được tải và người dùng đã xác thực, client Socket.io sẽ tự động kết nối thành công tới server.
3. **AC-3 (Zustand State & Connection Tracking):** Zustand Store (useSocketStore) quản lý và cập nhật chính xác trạng thái kết nối (`connected`, `disconnected`, `socketId`) và xử lý các sự kiện cơ bản (như gửi/nhận tin nhắn kiểm tra `ping-pong`).

## Danh sách Task / Subtasks

- [ ] **Task 1: Cấu hình Socket.io cho Backend** (AC-1)
  - [ ] Cài đặt package `socket.io` trong thư mục `backend/`.
  - [ ] Cập nhật `backend/server.js` để tích hợp Socket.io với server HTTP của Express.
  - [ ] Xây dựng file quản lý socket riêng `backend/src/services/socketService.js` để handle các sự kiện `connection`, `disconnect` và tin nhắn test `ping-pong`.
- [ ] **Task 2: Cài đặt và Tích hợp Socket.io Client cho Frontend (React Native)** (AC-2, AC-3)
  - [ ] Cài đặt package `socket.io-client` trong thư mục `frontend/`.
  - [ ] Xây dựng Zustand store `frontend/src/store/useSocketStore.js` để quản lý thực thể Socket, trạng thái kết nối và các phương thức gửi/nhận sự kiện.
  - [ ] Cập nhật App chính để khởi chạy kết nối Socket.io khi user đã đăng nhập.
- [ ] **Task 3: Kiểm thử & Xác thực Kết nối**
  - [ ] Chạy server Backend và ứng dụng Frontend để xác nhận log kết nối thành công ở cả 2 phía.
  - [ ] Thực hiện gửi sự kiện test `ping` từ Frontend và nhận `pong` phản hồi từ Backend để kiểm tra tính toàn vẹn của kênh truyền.

## Ghi chú Phát triển (Dev Notes)

- **Stack công nghệ:** React Native (Expo) + Zustand ở Frontend, Node.js + Express ở Backend. Nhất quán với cấu hình của hệ thống `GEMINI.md`.
- **Cấu hình Port:** Socket.io sẽ dùng chung port với HTTP server của Backend (mặc định là port `3017` hoặc PORT trong file `.env`).
- **Bảo mật:** Hiện tại thiết lập cho phép kết nối tự do để kiểm tra cơ sở hạ tầng, các Epic sau sẽ tích hợp xác thực JWT qua socket handshake.

## Bản ghi Dev Agent

### Model Sử dụng
Gemini 3.5 Flash

### Debug Log
Chưa có lỗi xảy ra.
