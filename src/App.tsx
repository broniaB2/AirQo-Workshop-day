/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StateManagerProvider, useAppState } from './managers/StateManager';
import { MapManager } from './components/MapManager';
import { 
  CloudRain, 
  Map as MapIcon, 
  Layers, 
  Activity, 
  Info,
  RefreshCw,
  X
} from 'lucide-react';
import { 
  AqGood, 
  AqModerate, 
  AqUnhealthyForSensitiveGroups, 
  AqUnhealthy, 
  AqVeryUnhealthy, 
  AqHazardous 
} from '@airqo/icons-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getAirQualityInfo = (pm25: number) => {
  if (pm25 <= 12) return { Icon: AqGood, label: 'Good', color: '#4ade80', bg: 'bg-green-100', text: 'text-green-700' };
  if (pm25 <= 35) return { Icon: AqModerate, label: 'Moderate', color: '#fbbf24', bg: 'bg-yellow-100', text: 'text-yellow-700' };
  if (pm25 <= 55.4) return { Icon: AqUnhealthyForSensitiveGroups, label: 'Unhealthy for Sensitive Groups', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' };
  if (pm25 <= 150.4) return { Icon: AqUnhealthy, label: 'Unhealthy', color: '#ef4444', bg: 'bg-red-100', text: 'text-red-700' };
  if (pm25 <= 250.4) return { Icon: AqVeryUnhealthy, label: 'Very Unhealthy', color: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-700' };
  return { Icon: AqHazardous, label: 'Hazardous', color: '#7e22ce', bg: 'bg-purple-900', text: 'text-white' };
};

const Dashboard: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    measurements, 
    loading, 
    refreshData, 
    selectedSite, 
    setSelectedSite 
  } = useAppState();
  const { isDemoMode } = useAppState();

  const aqInfo = selectedSite ? getAirQualityInfo(selectedSite.pm25) : null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col p-4 md:p-6 z-10">
      {/* Demo Mode Alert */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-orange-500/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-orange-400/50 flex items-center gap-2 pointer-events-auto">
              <Info size={16} className="text-white" />
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-wider">
                Demo Mode: AirQo API Key Required in Secrets
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="pointer-events-auto flex justify-between items-start w-full">
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <CloudRain size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AirQo Monitor</h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Environmental Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-end">
          <button 
            onClick={() => refreshData()}
            className={cn(
              "pointer-events-auto bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-md border border-white/20 transition-all hover:bg-white active:scale-95",
              loading && "animate-spin"
            )}
          >
            <RefreshCw size={20} className="text-gray-700" />
          </button>

          <div className="pointer-events-auto bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-md border border-white/20 flex flex-col gap-1">
            <button 
              onClick={() => setViewMode('markers')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'markers' ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
              )}
              title="Station Markers"
            >
              <MapIcon size={20} />
            </button>
            <button 
              onClick={() => setViewMode('heatmap')}
              className={cn(
                "p-2 rounded-lg transition-colors",
                viewMode === 'heatmap' ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
              )}
              title="Pollution Heatmap"
            >
              <Layers size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="mt-4 pointer-events-auto flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20 min-w-[140px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Stations</p>
          <p className="text-2xl font-bold text-gray-900">{measurements.length}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-md border border-white/20 min-w-[140px]">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Avg PM2.5</p>
          <p className="text-2xl font-bold text-gray-900">
            {(measurements.reduce((acc, m) => acc + m.pm25, 0) / (measurements.length || 1)).toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex-grow" />

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedSite && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="pointer-events-auto w-full md:max-w-md self-center md:self-start"
          >
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Activity size={120} className="text-blue-600" />
              </div>

              <button 
                onClick={() => setSelectedSite(null)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className={cn(
                  "px-2 py-1 text-[10px] font-black uppercase rounded tracking-widest",
                  aqInfo?.bg,
                  aqInfo?.text
                )}>
                  {aqInfo?.label}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400 text-xs font-medium">
                  ID: {selectedSite.siteId}
                </span>
              </div>

              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                  Monitoring Location
                </h3>
                {aqInfo && (
                  <div className={cn("p-2 rounded-2xl shadow-inner", aqInfo.bg)}>
                    <aqInfo.Icon size={48} color={aqInfo.color} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">PM 2.5</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-gray-900">{selectedSite.pm25.toFixed(1)}</p>
                    <p className="text-sm text-gray-400 font-bold">µg/m³</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">PM 10</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-gray-900">{selectedSite.pm10.toFixed(1)}</p>
                    <p className="text-sm text-gray-400 font-bold">µg/m³</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500">
                  {aqInfo && <aqInfo.Icon size={16} color={aqInfo.color} />}
                  <span className="text-xs font-medium uppercase tracking-wider">Air Quality: {aqInfo?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    selectedSite.pm25 < 35 ? "bg-green-500 animate-pulse" : "bg-orange-500 animate-pulse"
                  )} />
                  <span className="text-xs font-bold text-gray-700 uppercase">Active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-6 text-center text-white drop-shadow-md text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
        Data provided by AirQo • Kampala, Uganda
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StateManagerProvider>
      <div className="relative w-full h-screen bg-gray-900 overflow-hidden font-sans">
        <MapManager />
        <Dashboard />
      </div>
    </StateManagerProvider>
  );
}
