import mongoose, { Schema } from 'mongoose';

export interface Reservation {
    name: string;
    email?: string;
    phoneNumber?: string;
    tableNum?: number;
    size: number;
    startTime: Date;
    endTime: Date;
    comments?: string;
    createdAt: Date;
    updatedAt: Date;
}

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

export const Reservation = mongoose.model<Reservation>('Reservation', reservationSchema); 