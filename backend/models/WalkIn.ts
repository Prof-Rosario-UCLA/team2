import mongoose, { Document, Schema } from 'mongoose';

export interface WalkIn {
    name: string;
    phoneNumber: string;
    tableNum?: number;
    size: number;
    timeAddedToWaitlist: Date;
    startTime?: Date;
    endTime?: Date;
    comments?: string;
    createdAt: Date;
    updatedAt: Date;
}

const walkInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    tableNum: {
        type: Number
    },
    size: {
        type: Number,
        required: true,
        min: 1
    },
    timeAddedToWaitlist: {
        type: Date,
        required: true,
        default: Date.now
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    comments: {
        type: String,
    }
}, {
    timestamps: true
});


export const WalkIn = mongoose.model<WalkIn>('WalkIn', walkInSchema); 
