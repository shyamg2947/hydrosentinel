import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { FacilityProvider } from './contexts/FacilityContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FacilityProvider>
            <SocketProvider>
              <NotificationProvider>
                <AppRoutes />
              </NotificationProvider>
            </SocketProvider>
          </FacilityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
