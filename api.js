import express from 'express';
import reservationRoutes from './backend/routes/reservation.js';
import walkInRoutes from './backend/routes/walkin.js';
import tableRoutes from './backend/routes/table.js';
import { initializeDatabases } from './backend/utils/dbconfig.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = process.env.PORT || 1919;

// Connect to databases
const { mongoConnected, redisConnected } = await initializeDatabases();
if (!mongoConnected || !redisConnected) {
  process.exit(1); 
}

// Apply middleware
app.use(express.json());
app.use(cors());

// REST API routes
app.use('/reservations', reservationRoutes);
app.use('/walkins', walkInRoutes);
app.use('/tables', tableRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`Server running on port: ${HTTP_PORT}`);
});
