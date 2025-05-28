import mongoose, { Schema } from 'mongoose';

const reservationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
    },
    phoneNumber: {
        type: String,
    },
    tableNum: {
        type: Number
    },
    size: {
        type: Number,
        required: true,
        min: 1
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    comments: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export const Reservation = mongoose.model('Reservation', reservationSchema); 