import { Request, Response } from 'express';
import { Reservation } from '../models/Reservation';

export const getAllReservations = async (req: Request, res: Response) => {
    try {
        const reservations = await Reservation.find()
            .sort({ startTime: 1 })
            .exec();

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });

    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching reservations'
        });
    }
};