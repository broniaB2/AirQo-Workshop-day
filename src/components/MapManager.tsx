/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useAppState } from '../managers/StateManager';
import { HeatmapModule } from '../modules/HeatmapModule';
import { MarkersModule } from '../modules/MarkersModule';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const KAMPALA_CENTER = { lat: 0.3476, lng: 32.5825 };

export const MapManager: React.FC = () => {
  const { measurements, viewMode, setSelectedSite } = useAppState();

  const hasValidKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Maps API Key Required</h2>
          <p className="text-gray-600 mb-6 font-medium">To visualize the air quality data, please add your Google Maps API Key to the project secrets.</p>
          <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg text-sm">
            <p><strong>1.</strong> Open <strong>Settings</strong> (⚙️ top-right)</p>
            <p><strong>2.</strong> Select <strong>Secrets</strong></p>
            <p><strong>3.</strong> Add <code>GOOGLE_MAPS_PLATFORM_KEY</code></p>
          </div>
          <p className="mt-6 text-xs text-gray-400">The application will refresh automatically.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
      <div className="relative w-full h-full">
        <Map
          defaultCenter={KAMPALA_CENTER}
          defaultZoom={11}
          mapId="AIRQO_POLLUTION_MAP"
          style={{ width: '100%', height: '100%' }}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          scrollwheel={true}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        >
          <HeatmapModule 
            data={measurements} 
            visible={viewMode === 'heatmap'} 
          />
          <MarkersModule 
            data={measurements} 
            visible={viewMode === 'markers'} 
            onMarkerClick={(site) => setSelectedSite(site)}
          />
        </Map>
      </div>
    </APIProvider>
  );
};
