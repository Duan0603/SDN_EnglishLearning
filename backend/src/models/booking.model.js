import { Schema, model } from "mongoose";

const bookingSchema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    mentorId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    availabilityId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Availability',
        unique: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
        default: 'PENDING'
    },
    notes: {
        type: String,
        default: ''
    },
    mentorNotes: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: null
    },
    comment: {
        type: String,
        default: ''
    }
}, {
    collection: 'Booking',
    timestamps: true
});

const Booking = model('Booking', bookingSchema);
export default Booking;
