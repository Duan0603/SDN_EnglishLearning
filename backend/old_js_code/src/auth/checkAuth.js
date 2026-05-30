
// day la mot higher order component nhận vào các
// controller được khai báo trong folder controller
// đóng vai trò là lớp bao để catch các lỗi từ các hàm bất đồng bộ
export const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}