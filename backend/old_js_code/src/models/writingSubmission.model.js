import { Schema, model } from "mongoose";

const writingSubmissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    testId: {
        type: Schema.Types.ObjectId,
        ref: 'Test',
        default: null
    },
    prompt: {
        type: String,
        default: ''
    },
    essayText: {
        type: String,
        required: true
    },
    bandScore: {
        type: Number,
        required: true
    },
    taskAchievement: {
        type: Number,
        required: true
    },
    coherenceCohesion: {
        type: Number,
        required: true
    },
    lexicalResource: {
        type: Number,
        required: true
    },
    grammarAccuracy: {
        type: Number,
        required: true
    },
    aiFeedback: {
        type: Schema.Types.Mixed, // Detailed feedback JSON
        required: true
    }
}, {
    collection: 'WritingSubmission',
    timestamps: true
});

const WritingSubmission = model('WritingSubmission', writingSubmissionSchema);
export default WritingSubmission;
