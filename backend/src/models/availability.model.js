import { Schema, model } from "mongoose";

const availabilitySchema = new Schema({
    mentorId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'Availability',
    timestamps: true
});

const Availability = model('Availability', availabilitySchema);
export default Availability;
