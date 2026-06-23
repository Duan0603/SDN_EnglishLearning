import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTP will be automatically deleted from DB after 5 minutes
    }
}, {
    timestamps: true,
    collection: 'Otps'
});

const OtpModel = mongoose.model('Otp', otpSchema);
export default OtpModel;
