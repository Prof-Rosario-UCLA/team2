import mongoose, { Schema, Types } from 'mongoose';

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
        min: 1,
        unique: true
    },
    tableCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    comments: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

export const Table = mongoose.model('Table', tableSchema); 