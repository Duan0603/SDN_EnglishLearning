# ERRORS.MD - Automatic Error Tracking & Learning

> **Mục tiêu**: Ghi lại mọi lỗi xảy ra trong quá trình phát triển để học hỏi và cải thiện. Ngăn chặn lỗi lặp lại.

---

## [2026-05-24 11:55] - Lỗi Cú pháp Đóng Thẻ JSX trong HomeScreen.js

- **Type**: Syntax
- **Severity**: Critical (Gây crash Web/Android Bundling)
- **File**: `frontend/src/screens/HomeScreen.js:138`
- **Agent**: Long (SME/Orchestrator)
- **Root Cause**: Thiếu dấu ngoặc nhọn đóng `>` ở thẻ `</View>` và ghi đè chú thích ngay trên cùng một dòng khi thực hiện thay đổi màu sắc layout.
- **Error Message**: 
  ```
  ERROR  SyntaxError: D:\Ky_7\EnglishApp_SDN_MMA\SDN_EnglishLearning\frontend\src\screens\HomeScreen.js: Unexpected token, expected "jsxTagEnd" (138:30)

    136 |                 Meticulously crafted learning pathways utilizing modern visual aids, smart spacing, and clean layouts to enhance absorption.
    137 |               </Text>
  > 138 |             </View            {/* Course Cards Grid */}
        |                               ^
  ```
- **Fix Applied**: Thay thế đoạn mã lỗi bằng thẻ đóng hợp lệ `</View>` và xuống dòng cho chú thích `{/* Course Cards Grid */}`.
- **Prevention**: Sử dụng extension linting JSX tự động và kiểm tra kỹ cấu trúc đóng mở thẻ trước khi lưu file khi thực hiện chỉnh sửa giao diện lớn.
- **Status**: Fixed

---

## [2026-05-24 12:15] - Lỗi Trắng Màn Hình (Runtime ReferenceError) do Biến Chưa Định Nghĩa trong ProfileScreen.js

- **Type**: Agent (Execution Error)
- **Severity**: Critical (Gây sập/trắng màn hình Profile trên toàn bộ nền tảng Web & Mobile)
- **File**: `frontend/src/screens/ProfileScreen.js:159, 172`
- **Agent**: Long (SME/Orchestrator)
- **Root Cause**: Trong lúc tái thiết kế cấu trúc mới cực kỳ phức tạp để tích hợp các tính năng tiến độ hình tròn và thanh đo chẩn đoán AI, Agent đã sử dụng biến `progressPercent` và `skillsData` mà quên mất việc khai báo và khởi tạo chúng bên trong hàm `ProfileScreen`.
- **Error Message**: 
  ```
  ReferenceError: progressPercent is not defined
  ReferenceError: skillsData is not defined
  ```
- **Fix Applied**: Khai báo và định nghĩa lại hằng số `progressPercent = (currentEst / targetScore) * 100` và mảng `skillsData` chứa đầy đủ thông tin chuẩn đoán AI ở phần đầu hàm `ProfileScreen`.
- **Prevention**: Luôn rà soát kỹ lưỡng toàn bộ biến số được gọi trong JSX trước khi hoàn tất thay đổi, đặc biệt là khi tích hợp nhiều module dữ liệu năng động phức tạp.
- **Status**: Fixed

---
