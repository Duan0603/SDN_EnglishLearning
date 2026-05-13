import { StatusCode, ReasonStatusCode } from "../data/data.js";

// Lớp gốc để kế thừa, đại diện cho mọi lỗi có thể trả về cho Client
class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);       // Gọi constructor của class Error gốc
        this.status = status; // Bổ sung thêm mã HTTP status
    }
}

// Lỗi 400: Client gửi sai dữ liệu (VD: Thiếu tham số, sai format JSON)
export class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.BAD_REQUEST, status = StatusCode.BAD_REQUEST) {
        super(message, status);
    }
}

// Lỗi 401: Client chưa xác thực (VD: Chưa đăng nhập, token hết hạn)
export class UnauthorizedError extends ErrorResponse {
    constructor(message = ReasonStatusCode.UNAUTHORIZED, status = StatusCode.UNAUTHORIZED) {
        super(message, status);
    }
}

// Lỗi 403: Đã xác thực nhưng không có quyền (VD: User cố gắng vào route của Admin)
export class ForbiddenError extends ErrorResponse {
    constructor(message = ReasonStatusCode.FORBIDDEN, status = StatusCode.FORBIDDEN) {
        super(message, status);
    }
}

// Lỗi 404: Không tìm thấy tài nguyên (VD: Truy vấn ID user không tồn tại)
export class NotFoundError extends ErrorResponse {
    constructor(message = ReasonStatusCode.NOT_FOUND, status = StatusCode.NOT_FOUND) {
        super(message, status);
    }
}

// Lỗi 409: Xung đột dữ liệu (VD: Đăng ký email đã tồn tại trong Database)
export class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, status = StatusCode.CONFLICT) {
        super(message, status);
    }
}