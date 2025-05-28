import express from 'express';
import { getAllReservations, getReservationsByDateRange, insertReservation } from '../utils/mongodb.js';
import { Reservation } from '../models/Reservation.js';

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

        const start = new Date(startDate);
        const end = new Date(endDate);

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
router.post('/create', async (req, res) => {
    try {
        console.log('Trying to CREATE a reservation:', req.body);
        const reservationData = req.body;

        // Validate required fields
        if (!reservationData.size || !reservationData.startTime || !reservationData.endTime) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate dates
        const startTime = new Date(reservationData.time);
        const endTime = new Date(startTime.getTime() + (2 * 60 * 60 * 1000));

        if (isNaN(startTime.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const newReservation = {
            name: `${reservationData.firstname} ${reservationData.lastname}`,
            email: reservationData.email || '',
            phone: reservationData.phone || '',
            size: reservationData.partySize,
            startTime: startTime,
            endTime: endTime,
            specialRequests: reservationData.specialRequests || ''
        };

        const result = await insertReservation(newReservation);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in POST /reservations:', error);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

export default router;
