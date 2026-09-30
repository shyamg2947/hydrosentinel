import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FacilityContext = createContext(null);

export const FacilityProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState(() => {
    return localStorage.getItem('hydrosentinel_facility_id') || '';
  });
  const [loading, setLoading] = useState(false);

  const fetchFacilities = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await api.get('/facilities?limit=100');
      if (res.success && res.data) {
        setFacilities(res.data);
        // Default to first facility if none saved
        if (!selectedFacilityId && res.data.length > 0) {
          setSelectedFacilityId(res.data[0]._id);
          localStorage.setItem('hydrosentinel_facility_id', res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch facilities list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFacilities();
    } else {
      setFacilities([]);
    }
  }, [isAuthenticated]);

  const selectFacility = (id) => {
    setSelectedFacilityId(id);
    if (id) {
      localStorage.setItem('hydrosentinel_facility_id', id);
    } else {
      localStorage.removeItem('hydrosentinel_facility_id');
    }
  };

  const selectedFacility = facilities.find(f => f._id === selectedFacilityId) || null;

  return (
    <FacilityContext.Provider
      value={{
        facilities,
        selectedFacilityId,
        selectedFacility,
        selectFacility,
        refreshFacilities: fetchFacilities,
        loading
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
};

export const useFacility = () => {
  const context = useContext(FacilityContext);
  if (!context) throw new Error('useFacility must be used within FacilityProvider');
  return context;
};
