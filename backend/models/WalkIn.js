import mongoose, { Document, Schema } from 'mongoose';


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


export const WalkIn = mongoose.model('WalkIn', walkInSchema); 
