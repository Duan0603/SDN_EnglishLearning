# Báo Cáo Kết Quả QA Automation Test (E2E & API)

## 1. Backend API Tests
**Framework:** Jest + Supertest
**Kết quả:** PASS (14/14 tests passed, 3 Test Suites)

Các API Authentication (truy cập tại `src/controllers/access.controller.js`) đã được kiểm thử:
- **POST `/api/v1/auth/signup`**:
  - ✅ Pass: Happy path (tạo tài khoản mới thành công, trả về 201 Created và tokens).
  - ✅ Pass: Validation error (báo lỗi 400 Bad Request nếu thiếu trường bắt buộc).
- **POST `/api/v1/auth/login`**:
  - ✅ Pass: Happy path (đăng nhập thành công, trả về 200 OK và set cookie `refreshToken`).
  - ✅ Pass: Invalid credentials (báo lỗi 400 Bad Request nếu sai email/password).
- **POST `/api/v1/auth/logout`**:
  - ✅ Pass: Trả về lỗi Unauthorized nếu không có token bảo vệ khi gọi API.

## 2. Frontend Component/E2E Tests
**Framework:** Jest + React Native Testing Library (`@testing-library/react-native`)
**Kết quả:** PASS (7/7 tests passed, 2 Test Suites)

Các màn hình chính của Module Authentication đã được kiểm thử:
- **`LoginScreen`**:
  - ✅ Pass: Render đầy đủ UI (text, placeholders).
  - ✅ Pass: Cho phép điền thông tin và trigger action `login` với dữ liệu chính xác.
  - ✅ Pass: Điều hướng qua trang `Register` thành công.
  - ✅ Pass: Hiển thị đúng thông báo lỗi nếu có `error` từ state.
- **`RegisterScreen`**:
  - ✅ Pass: Điều hướng chính xác qua các Step (Username -> Email/Password -> Full Name) và gọi `register`.
  - ✅ Pass: Validate form (báo lỗi nếu nhập sai định dạng email).
  - ✅ Pass: Chuyển hướng trở về `Login`.

## 3. Tổng kết
- Hệ thống CI/CD (nếu có) hiện đã có thể chạy tự động hai bộ test trên thông qua lệnh `npm run test` trên thư mục `backend` và `frontend`.
- Độ tin cậy của Module Authentication (cả Frontend và Backend) đã được đảm bảo và chống regression lỗi trong tương lai.
