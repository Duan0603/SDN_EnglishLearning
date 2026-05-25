# Project Context: IELTS Online Examination & Mentor Booking System

## 1. Overview & Goal

* **Project Name:** `SDN_EnglishLearning` (IELTS Core Platform).
* **Objective:** Xây dựng hệ thống luyện thi IELTS trực tuyến, giả lập phòng thi thật, chấm điểm Speaking bằng AI và tối ưu hóa quy trình đặt lịch với Mentor không bị trùng lặp.
* **Target User:** Học viên Band 5.0 muốn lên 7.0+ (cần môi trường áp lực, sửa lỗi chi tiết, chi phí rẻ); Mentor (người hướng dẫn); Admin (quản trị viên).

## 2. Technical Architecture & Tech Stack

* **Frontend:** ReactJS (Tối ưu giao diện Responsive trên Desktop và Tablet).
* **Backend:** Node.js (Xử lý logic, API, Middleware Verify quyền).
* **Database & Cache:** Redis (Dùng để xử lý Concurrency/Locking slot đặt lịch).
* **Authentication:** JWT kết hợp HttpOnly Cookie cho Refresh Token. Phân quyền 3 role: `Student`, `Mentor`, `Admin`.
* **AI Integration:** Web Audio API (Thu âm) -> Speech-to-Text -> Gemini API (Chấm điểm Speaking < 7 giây theo 4 tiêu chí BC/IDP).

## 3. Core Features (Functional Requirements)

* **Exam Mode:** Thi thử full Listening & Reading theo thời gian thực, ẩn hoàn toàn Transcript. Giao diện chia đôi màn hình (Đề / Đáp án).
* **Practice Mode:** Luyện tập tự do theo từng Part/Section, cho phép bật/tắt Transcript chạy song song audio.
* **Review & Analytics:** Trả điểm quy đổi, giải thích chi tiết đáp án, **Highlight cặp từ đồng nghĩa (Paraphrasing)** giữa câu hỏi và bài đọc/nghe.
* **AI Speaking:** Ghi âm -> STT -> Gemini API phân tích và trả điểm chi tiết theo 4 tiêu chí: *Fluency & Coherence, Lexical Resource, Grammatical Range, Pronunciation*.
* **Mentor Booking:** Xem lịch trống và đặt slot của Mentor trực tiếp. Hệ thống tự động lock slot thời gian thực.
* **Admin Dashboard:** CRUD đề thi, cập nhật đáp án Cambridge, duyệt hồ sơ Mentor.

## 4. Critical Edge Cases & Handling

* **Race Condition (Booking trùng lịch):** Nhiều học viên cùng bấm đặt một slot Mentor tại cùng một mili-giây.
* *Xử lý:* Request nào chiếm được **Redis Key** trước sẽ đi tiếp. Request sau bị block ngay tại bộ nhớ, trả về `409 Conflict`. Tỷ lệ trùng lịch bắt buộc bằng 0%.

* **Audio Interruption (Mất kết nối thu âm):** Rớt mạng hoặc mất quyền Micro khi đang nói.
* *Xử lý:* Frontend bắt sự kiện `oniceconnectionstatechange` hoặc mất stream để pause, hiển thị Toast thông báo và cho phép thu âm lại, không gửi request lỗi lên Server để tiết kiệm chi phí API.

## 5. Phase 1 - Out of Scope

* Không làm Mobile App (chỉ làm Responsive Web trên Desktop/Tablet).
* Không làm tính năng AI chấm bài Writing (Task 1 & Task 2).
