import { Schema, model } from "mongoose";

const testSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['READING', 'LISTENING', 'WRITING', 'SPEAKING'],
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    }
}, {
    collection: 'Test',
    timestamps: true
});

const Test = model('Test', testSchema);
export default Test;
