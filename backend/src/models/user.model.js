import mongoose from "mongoose"


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    password:{
        type:String,
        required:true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        required: true,
        default: 'active'
    },
    verify: {
        type: mongoose.Schema.Types.Boolean,
        default: false,
        required: true,
    },
    role: {
        type: Array,
        default: []
    }
});

const UserModel = mongoose.model('Users', userSchema)
export default UserModel