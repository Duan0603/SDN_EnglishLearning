import { Schema, model } from "mongoose";

const testSectionSchema = new Schema({
    testId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Test'
    },
    sectionOrder: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    passageText: {
        type: String,
        default: ''
    },
    audioUrl: {
        type: String,
        default: ''
    },
    images: {
        type: [String],
        default: []
    }
}, {
    collection: 'TestSection',
    timestamps: true
});

const TestSection = model('TestSection', testSectionSchema);
export default TestSection;
