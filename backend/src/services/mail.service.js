import nodemailer from 'nodemailer';

class MailService {
    static async sendResetLink(email, resetLink) {
        // NOTE: Replace with your actual configured nodemailer credentials if needed
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.MAIL_USER || 'Apex IELTS <no-reply@apexielts.com>',
            to: email,
            subject: 'Apex IELTS - Yêu cầu đặt lại mật khẩu',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #374151; line-height: 1.6; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <div style="background-color: #00CC99; padding: 24px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">Apex IELTS</h2>
                    </div>
                    <div style="padding: 32px 24px;">
                        <h3 style="color: #111827; margin-top: 0; font-size: 20px;">Yêu cầu đặt lại mật khẩu</h3>
                        <p style="font-size: 16px;">Chào bạn,</p>
                        <p style="font-size: 16px;">Chúng tôi vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút bên dưới để tiến hành tạo mật khẩu mới:</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${resetLink}" style="display: inline-block; background-color: #00CC99; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0, 204, 153, 0.3);">
                                ĐẶT LẠI MẬT KHẨU
                            </a>
                        </div>
                        <p style="font-size: 14px; color: #6B7280; background-color: #F3F4F6; padding: 12px; border-radius: 6px; border-left: 4px solid #00CC99;">
                            Lưu ý: Liên kết này chỉ có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ liên kết này với bất kỳ ai để đảm bảo an toàn.
                        </p>
                        <p style="font-size: 16px; margin-top: 24px;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này hoặc liên hệ hỗ trợ nếu nghi ngờ có sự bất thường.</p>
                        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">
                        <p style="font-size: 15px; margin: 0;">Trân trọng,</p>
                        <p style="font-size: 15px; font-weight: bold; color: #00CC99; margin: 4px 0 0 0;">Đội ngũ Apex IELTS</p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Send email error:', error);
            // We return true even on failure if not fully configured yet, so the app doesn't crash 
            // Change to throw error in production
            return false;
        }
    }
}

export { MailService };
