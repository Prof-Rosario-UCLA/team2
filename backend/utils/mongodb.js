import { Reservation } from '../models/Reservation.js';
import { WalkIn } from '../models/WalkIn.js';
import { Table } from '../models/Table.js';

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


export async function insertWalkIn(walkinData) {
    try {
        const walkin = new WalkIn(walkinData);
        const savedWalkIn = await walkin.save();
        return savedWalkIn;
    } catch (error) {
        console.error('Error inserting walkin:', error);
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

export async function insertTable(tableData) {
    try {
        const table = new Table(tableData);
        const savedTable = await table.save();
        return savedTable;
    } catch (error) {
        console.error('Error inserting table:', error);
        throw error;
    }
}

export async function getAllTables() {
    try {
        const tables = await Table.find()
            .sort({ tableNumber: 1 })
            .exec();
        return tables;
    } catch (error) {
        console.error('Error fetching tables:', error);
        throw error;
    }
}

export async function getTableByNumber(tableNumber) {
    try {
        const table = await Table.findOne({ tableNumber });
        return table;
    } catch (error) {
        console.error('Error fetching table by number:', error);
        throw error;
    }
}