import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketIO } from './sockets/socketHandler.js';
import { telemetryEngine } from './simulator/telemetryEngine.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

setupSocketIO(io);

// Connect DB & start server
const startServer = async () => {
  try {
    await connectDB();

    // Initialize telemetry simulator
    await telemetryEngine.init();

    server.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🛡️  HYDROSENTINEL BACKEND ONLINE ON PORT ${PORT}`);
      console.log(`📡 WebSocket Engine ready | Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log(`⚙️  Simulator status: ${telemetryEngine.isRunning ? 'RUNNING' : 'STOPPED'} (${telemetryEngine.scenario})`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error(`[Server Start Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Process] Gracefully shutting down HydroSentinel...');
  telemetryEngine.stop();
  server.close(() => {
    console.log('[Process] Server closed cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
