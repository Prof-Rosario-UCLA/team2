import express from 'express';
import { getAllReservations, getReservationsByDateRange, insertReservation } from '../utils/mongodb';
import { Reservation } from '../models/Reservation';

const router = express.Router();

// Get all reservations
router.get('/', async (req, res) => {
    try {
        console.log('Trying to GET all reservations');
        const reservations = await getAllReservations();
        res.json(reservations);
    } catch (error) {
        console.error('Error in GET /reservations:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// Get reservations by date range
router.get('/range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const reservations = await getReservationsByDateRange(start, end);
        res.json(reservations);
    } catch (error) {
        console.error('Error in GET /reservations/range:', error);
        res.status(500).json({ error: 'Failed to fetch reservations by date range' });
    }
});

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const reservationData: Reservation = req.body;

        // Validate required fields
        if (!reservationData.name || !reservationData.size || !reservationData.startTime || !reservationData.endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate dates
        const startTime = new Date(reservationData.startTime);
        const endTime = new Date(reservationData.endTime);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        if (startTime >= endTime) {
            return res.status(400).json({ error: 'End time must be after start time' });
        }

        const newReservation = await insertReservation(reservationData);
        res.status(201).json(newReservation);
    } catch (error) {
        console.error('Error in POST /reservations:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

export default router;
