import { Schema, model } from "mongoose";

const speakingSubmissionSchema = new Schema({
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
    audioUrl: {
        type: String,
        required: true
    },
    transcription: {
        type: String,
        default: ''
    },
    bandScore: {
        type: Number,
        required: true
    },
    fluencyCoherence: {
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
    pronunciation: {
        type: Number,
        required: true
    },
    aiFeedback: {
        type: Schema.Types.Mixed, // Detailed feedback JSON
        required: true
    }
}, {
    collection: 'SpeakingSubmission',
    timestamps: true
});

const SpeakingSubmission = model('SpeakingSubmission', speakingSubmissionSchema);
export default SpeakingSubmission;
