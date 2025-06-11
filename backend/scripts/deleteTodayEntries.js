import mongoose from 'mongoose';
import { Reservation } from '../models/Reservation.js';
import { WalkIn } from '../models/WalkIn.js';
import { initializeDatabases } from '../utils/dbconfig.js';

async function deleteTodayEntries() {
    try {
        // Initialize database connection
        const { mongoConnected } = await initializeDatabases();
        if (!mongoConnected) {
            console.error('Failed to connect to MongoDB');
            process.exit(1);
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get tomorrow's date at midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Delete reservations from today
        const reservationResult = await Reservation.deleteMany({
            startTime: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Delete walk-ins from today
        const walkInResult = await WalkIn.deleteMany({
            timeAddedToWaitlist: {
                $gte: today,
                $lt: tomorrow
            }
        });

        console.log(`Deleted ${reservationResult.deletedCount} reservations`);
        console.log(`Deleted ${walkInResult.deletedCount} walk-ins`);

        // Close the database connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error deleting entries:', error);
        process.exit(1);
    }
}

// Run the script
deleteTodayEntries(); 