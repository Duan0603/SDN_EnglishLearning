import { Schema, model } from "mongoose";

const testResultSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    testId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Test'
    },
    answers: {
        type: Schema.Types.Mixed, // [{ questionId: string, userAnswer: string }]
        required: true
    },
    correctCount: {
        type: Number,
        required: true
    },
    bandScore: {
        type: Number,
        required: true
    },
    timeTaken: {
        type: Number, // in seconds
        required: true
    }
}, {
    collection: 'TestResult',
    timestamps: true
});

const TestResult = model('TestResult', testResultSchema);
export default TestResult;
