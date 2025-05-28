import mongoose, { Schema, Types } from 'mongoose';

const tableSchema = new mongoose.Schema({
    tableCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    reservedTimes: [{
        type: Schema.Types.ObjectId,
        refPath: 'reservedTimesModel'
    }],
    reservedTimesModel: {
        type: String,
        enum: ['Reservation', 'WalkIn']
    },
    comments: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export const Table = mongoose.model('Table', tableSchema); 