import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import reservationRoutes from './routes/reservation.js';
import { connectDB } from './utils/mongodb.js';

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/reservations', reservationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 