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
if (!mongoConnected) {
  process.exit(1); 
}

// Apply middleware
app.use(express.json());
app.use(cors());

// REST API routes
app.use('/reservations', reservationRoutes);
app.use('/walkins', walkInRoutes);
app.use('/tables', tableRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {

  app.get('/', (req, res) => {
    res.json({ message: 'Restaurant API Server Running', port: PORT });
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Restaurant REST API running on http://localhost:${PORT}`);
});