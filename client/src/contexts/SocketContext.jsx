import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { useFacility } from './FacilityContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { selectedFacilityId } = useFacility();
  const [connected, setConnected] = useState(false);
  const [lastTick, setLastTick] = useState(null);
  const [liveReadings, setLiveReadings] = useState([]);
  const [simulatorState, setSimulatorState] = useState({
    isRunning: true,
    scenario: 'Normal Operations',
    intervalMs: 3000
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setConnected(false);
      return;
    }

    const socket = getSocket();

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleTelemetryTick = (data) => {
      setLastTick(data.timestamp);
      if (data.readings) {
        setLiveReadings(data.readings);
      }
      if (data.scenario) {
        setSimulatorState(prev => ({ ...prev, scenario: data.scenario }));
      }
    };

    const handleSimulatorStatus = (status) => {
      setSimulatorState(status);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('telemetry_tick', handleTelemetryTick);
    socket.on('simulator_status', handleSimulatorStatus);

    if (socket.connected) {
      setConnected(true);
    }

    socket.emit('request_simulator_state');

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('telemetry_tick', handleTelemetryTick);
      socket.off('simulator_status', handleSimulatorStatus);
    };
  }, [isAuthenticated]);

  // Join facility room when facility changes
  useEffect(() => {
    if (!isAuthenticated || !selectedFacilityId) return;
    const socket = getSocket();
    socket.emit('join_facility', selectedFacilityId);

    return () => {
      socket.emit('leave_facility', selectedFacilityId);
    };
  }, [isAuthenticated, selectedFacilityId]);

  return (
    <SocketContext.Provider
      value={{
        connected,
        lastTick,
        liveReadings,
        simulatorState
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
