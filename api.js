import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import reservationRoutes from './backend/routes/reservation.js';
import walkInRoutes from './backend/routes/walkin.js';
import tableRoutes from './backend/routes/table.js';
import { initializeDatabases } from './backend/utils/dbconfig.js';
import cors from 'cors';

// Express setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 1919;

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


// Start the server
app.listen(PORT, () => {
  console.log(`Restaurant REST API running on http://localhost:${PORT}`);
});