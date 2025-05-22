import express, { Express } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import reservationRoutes from './routes/reservation';
import { connectDB } from './utils/mongodb';

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        headers: req.headers,
        query: req.query,
        body: req.body
    });
    next();
});

// More permissive CORS configuration
app.use(cors());

app.use(express.json());

connectDB();

app.use('/reservations', reservationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 