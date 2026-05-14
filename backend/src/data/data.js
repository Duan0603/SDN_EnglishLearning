export const Role = {
    STUDENT: 'STUDENT',
    MENTOR: 'MENTOR',
    ADMIN: 'ADMIN',
    GUEST: 'GUEST'
}

export const StatusCode = {
    OK: 200,                  // Thành công lấy dữ liệu hoặc cập nhật
    CREATED: 201,             // Tạo tài nguyên mới thành công
    BAD_REQUEST: 400,         // Client gửi yêu cầu sai cú pháp hoặc thiếu dữ liệu
    UNAUTHORIZED: 401,        // Client chưa xác thực (chưa đăng nhập, thiếu hoặc sai token)
    FORBIDDEN: 403,           // Đã xác thực nhưng tài khoản không đủ quyền hạn truy cập
    NOT_FOUND: 404,           // Không tìm thấy tài nguyên yêu cầu (sai endpoint API)
    CONFLICT: 409,            // Xung đột dữ liệu (ví dụ: đăng ký trùng email)
    INTERNAL_SERVER: 500,     // Lỗi bất ngờ từ phía server (code backend crash, lỗi DB)
};

export const ReasonStatusCode = {
    OK: 'Success',
    CREATED: 'Created',
    BAD_REQUEST: 'Bad Request Error',
    UNAUTHORIZED: 'Unauthorized Error',
    FORBIDDEN: 'Forbidden Error',
    NOT_FOUND: 'Not Found Error',
    CONFLICT: 'Conflict Error',
    INTERNAL_SERVER: 'Internal Server Error',
};


export const SuccessStatusCode = {
    OK: 200,
    CREATED: 201
}
export const SuccessReasonStatusCode = {
    OK: 'Created',
    CREATED: 'Success'
}


