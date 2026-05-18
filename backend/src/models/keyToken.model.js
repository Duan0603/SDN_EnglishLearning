import {Schema, model} from "mongoose";

const keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    publicKey: {
        type: String,
        required: true
    } ,
    refreshToken: {
        type: Array, default: []
    }
}, {
    collection: 'Keys',
    timestamps: true
})

const Key = model('Key', keyTokenSchema)

export default Key