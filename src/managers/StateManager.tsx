/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NormalizedMeasurement } from '../types';
import { AirQoService } from '../services/AirQoService';

interface AppState {
  measurements: NormalizedMeasurement[];
  loading: boolean;
  error: string | null;
  selectedSite: NormalizedMeasurement | null;
  viewMode: 'markers' | 'heatmap';
  isDemoMode: boolean;
  refreshData: () => Promise<void>;
  setSelectedSite: (site: NormalizedMeasurement | null) => void;
  setViewMode: (mode: 'markers' | 'heatmap') => void;
}

const StateContext = createContext<AppState | undefined>(undefined);

export const StateManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [measurements, setMeasurements] = useState<NormalizedMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<NormalizedMeasurement | null>(null);
  const [viewMode, setViewMode] = useState<'markers' | 'heatmap'>('markers');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await AirQoService.fetchMeasurements();
      setMeasurements(data);
      
      // If the first item has a 'mock-' prefix, we're in demo mode
      const isDemo = data.length > 0 && data[0].id.startsWith('mock');
      setIsDemoMode(isDemo);
      
      setError(null);
    } catch (err) {
      setError('Failed to load air quality data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <StateContext.Provider 
      value={{ 
        measurements, 
        loading, 
        error, 
        selectedSite, 
        viewMode, 
        isDemoMode,
        refreshData, 
        setSelectedSite, 
        setViewMode 
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateManagerProvider');
  }
  return context;
};
