import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true // Allow null/undefined values without violating unique constraint
    },
    fullName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    verify: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['STUDENT', 'MENTOR', 'ADMIN'],
        default: 'STUDENT'
    }
}, {
    timestamps: true,
    collection: 'User' // Chỉ định chính xác collection mà Prisma đã tạo
});

const UserModel = mongoose.model('User', userSchema)
export default UserModel