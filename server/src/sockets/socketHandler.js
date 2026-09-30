import jwt from 'jsonwebtoken';
import { telemetryEngine } from '../simulator/telemetryEngine.js';
import { setAlertSocketIO } from '../services/alertService.js';
import { setSocketIOInstance } from '../services/notificationService.js';
import User from '../models/User.js';

export const setupSocketIO = (io) => {
  telemetryEngine.setSocketIO(io);
  setAlertSocketIO(io);
  setSocketIOInstance(io);

  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        // Allow unauthenticated connection with guest read-only for public demo screens if needed
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'hydrosentinel_super_secure_jwt_secret_key_2026_capstone'
      );
      const user = await User.findById(decoded.id).select('_id name role assignedFacilities');
      socket.user = user;
      next();
    } catch (err) {
      // Don't reject outright so demo client can gracefully prompt to log in
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    const userName = socket.user ? socket.user.name : 'Anonymous Client';
    console.log(`[Socket.IO] Client connected: ${socket.id} (${userName})`);

    if (socket.user) {
      socket.join(`user:${socket.user._id}`);
      // Join assigned facility rooms
      if (socket.user.assignedFacilities && socket.user.assignedFacilities.length > 0) {
        socket.user.assignedFacilities.forEach(fId => {
          socket.join(`facility:${fId}`);
        });
      }
    }

    // Client requests to join a specific facility room for live telemetry
    socket.on('join_facility', (facilityId) => {
      if (facilityId) {
        socket.join(`facility:${facilityId}`);
        console.log(`[Socket.IO] Socket ${socket.id} joined facility:${facilityId}`);
      }
    });

    socket.on('leave_facility', (facilityId) => {
      if (facilityId) {
        socket.leave(`facility:${facilityId}`);
      }
    });

    socket.on('request_simulator_state', () => {
      socket.emit('simulator_status', {
        isRunning: telemetryEngine.isRunning,
        intervalMs: telemetryEngine.intervalMs,
        scenario: telemetryEngine.scenario,
        noiseFactor: telemetryEngine.noiseFactor
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};
