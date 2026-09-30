import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem('hydrosentinel_token');
    const socketHost = import.meta.env.VITE_API_URL || window.location.origin;
    socket = io(socketHost, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] Connected to HydroSentinel realtime server (id: ${socket.id})`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) return initSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
