import { OK } from "../core/success.response.js";
import { BadRequestError, NotFoundError } from "../core/error.response.js";
import userModel from "../models/user.model.js";
import OtpModel from "../models/otp.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { MailService } from "../services/mail.service.js";

export class PasswordController {
    static forgotPassword = async (req, res, next) => {
        try {
            const { email, deepLinkBase } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Vui lòng cung cấp email" });
            }
            if (!deepLinkBase) {
                return res.status(400).json({ message: "Vui lòng cung cấp deepLinkBase từ frontend" });
            }

            // 1. Kiểm tra Email người dùng có tồn tại trong MongoDB hay chưa
            const user = await userModel.findOne({ email }).lean();
            if (!user) {
                // Trả về 404 như yêu cầu của Frontend
                return res.status(404).json({ message: "Email này chưa được đăng ký trong hệ thống!" });
            }

            // 2. Generate random reset token
            const token = crypto.randomBytes(32).toString('hex');

            // 3. Save Token to DB (sử dụng model OtpModel hiện tại, thay otp = token)
            await OtpModel.create({ email, otp: token });

            // 4. Send Email
            const resetLink = `${deepLinkBase}?email=${encodeURIComponent(email)}&token=${token}`;
            const isSent = await MailService.sendResetLink(email, resetLink);
            
            if (!isSent) {
                // Lỗi gửi mail
                return res.status(500).json({ message: "Lỗi hệ thống hoặc cấu hình gửi mail thất bại!" });
            }

            new OK({
                message: "Email chứa link đặt lại mật khẩu đã được gửi đến bạn",
                metadata: { email }
            }).send(res);

        } catch (error) {
            console.error("Lỗi tại Forgot Password:", error);
            return res.status(500).json({ message: "Lỗi hệ thống hoặc cấu hình gửi mail thất bại!" });
        }
    };

    static verifyOtp = async (req, res, next) => {
        try {
            const { email, token } = req.body;
            if (!email || !token) {
                return res.status(400).json({ message: "Thiếu thông tin xác thực" });
            }

            // Check if Token exists and matches
            const tokenRecord = await OtpModel.findOne({ email, otp: token }).lean();
            if (!tokenRecord) {
                return res.status(400).json({ message: "Link xác thực không hợp lệ hoặc đã hết hạn" });
            }

            new OK({
                message: "Xác thực link thành công",
                metadata: { valid: true }
            }).send(res);
        } catch (error) {
            console.error("Lỗi tại Verify OTP:", error);
            return res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    };

    static resetPassword = async (req, res, next) => {
        try {
            const { email, token, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
            }

            // Verify Token again just to be safe
            const tokenRecord = await OtpModel.findOne({ email, otp: token }).lean();
            if (!tokenRecord) {
                return res.status(400).json({ message: "Link xác thực không hợp lệ hoặc đã hết hạn" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update User Password
            await userModel.updateOne({ email }, { password: hashedPassword });

            // Delete used OTP
            await OtpModel.deleteMany({ email });

            new OK({
                message: "Đổi mật khẩu thành công",
                metadata: {}
            }).send(res);
        } catch (error) {
            console.error("Lỗi tại Reset Password:", error);
            return res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    };

    static changePassword = async (req, res, next) => {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ mật khẩu cũ và mới" });
            }

            const userId = req.user.userId;
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            // Verify old password
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu cũ không chính xác" });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password
            await userModel.updateOne({ _id: userId }, { password: hashedPassword });

            new OK({
                message: "Đổi mật khẩu thành công",
                metadata: {}
            }).send(res);
        } catch (error) {
            console.error("Lỗi tại Change Password:", error);
            return res.status(500).json({ message: "Lỗi hệ thống!" });
        }
    };
}
