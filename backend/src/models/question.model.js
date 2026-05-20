import { Schema, model } from "mongoose";

const questionSchema = new Schema({
    sectionId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'TestSection'
    },
    questionNumber: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['MULTIPLE_CHOICE', 'FILL_IN_BLANKS', 'MATCHING_HEADINGS', 'TRUE_FALSE_NOT_GIVEN', 'SHORT_ANSWER'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    options: {
        type: Schema.Types.Mixed, // List of strings for multiple choice
        default: null
    },
    answer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        default: ''
    }
}, {
    collection: 'Question',
    timestamps: true
});

const Question = model('Question', questionSchema);
export default Question;
