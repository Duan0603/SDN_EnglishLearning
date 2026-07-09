import { Schema, model } from "mongoose";

const mentorRequestSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    certificates: {
        type: [String],
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    expertise: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    adminComment: {
        type: String,
        default: ''
    }
}, {
    collection: 'MentorRequest',
    timestamps: true
});

const MentorRequest = model('MentorRequest', mentorRequestSchema);
export default MentorRequest;
