import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import fs from 'fs';
import reservationRoutes from './backend/routes/reservation.js';
import walkInRoutes from './backend/routes/walkin.js';
import tableRoutes from './backend/routes/table.js';
import { initializeDatabases } from './backend/utils/dbconfig.js';
import cors from 'cors';

// Express setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const HTTP_PORT = 1919;
const HTTPS_PORT = 8443;

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

// Start HTTP server (for health checks and local development)
app.listen(HTTP_PORT, () => {
  console.log(`HTTP Server running on port: ${HTTP_PORT}`);
});

// Start HTTPS server
const options = {
  key: fs.readFileSync(process.env.TLS_KEY_PATH || '/etc/certs/tls.key'),
  cert: fs.readFileSync(process.env.TLS_CERT_PATH || '/etc/certs/tls.crt')
};

https.createServer(options, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port: ${HTTPS_PORT}`);
});