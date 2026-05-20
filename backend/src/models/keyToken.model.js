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
        type: [String], default: []
    },
    refreshTokensUsed: {
        type: [String], default: []
    }
}, {
    collection: 'KeyToken',
    timestamps: true
});

const Key = model('KeyToken', keyTokenSchema)

export default Key