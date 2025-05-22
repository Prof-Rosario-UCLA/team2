import { Reservation } from '../models/Reservation.js';
import { WalkIn } from '../models/WalkIn.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant_db';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        return true;
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        return false;
    }
};

export async function insertReservation(reservationData) {
    try {
        const reservation = new Reservation(reservationData);
        const savedReservation = await reservation.save();
        return savedReservation;
    } catch (error) {
        console.error('Error inserting reservation:', error);
        throw error;
    }
}

export async function getAllReservations() {
    try {
        const reservations = await Reservation.find()
            .sort({ startTime: 1 })
            .exec();
        return reservations;
    } catch (error) {
        console.error('Error fetching reservations:', error);
        throw error;
    }
}

export async function getAllWalkIns() {
    try {
        const walkIns = await WalkIn.find()
            .sort({ timeAddedToWaitlist: 1 })
            .exec();
        return walkIns;
    } catch (error) {
        console.error('Error fetching walk-ins:', error);
        throw error;
    }
}

export async function getReservationsByDateRange(startDate, endDate) {
    try {
        const reservations = await Reservation.find({
            startTime: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .sort({ startTime: 1 })
        .exec();
        return reservations;
    } catch (error) {
        console.error('Error fetching reservations by date range:', error);
        throw error;
    }
}

export async function getWalkInsByDateRange(startDate, endDate) {
    try {
        const walkIns = await WalkIn.find({
            timeAddedToWaitlist: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .sort({ timeAddedToWaitlist: 1 })
        .exec();
        return walkIns;
    } catch (error) {
        console.error('Error fetching walk-ins by date range:', error);
        throw error;
    }
}