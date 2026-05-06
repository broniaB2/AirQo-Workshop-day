/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { NormalizedMeasurement } from '../types';
import { 
  AqGood, 
  AqModerate, 
  AqUnhealthyForSensitiveGroups, 
  AqUnhealthy, 
  AqVeryUnhealthy, 
  AqHazardous 
} from '@airqo/icons-react';

interface MarkersModuleProps {
  data: NormalizedMeasurement[];
  onMarkerClick: (site: NormalizedMeasurement) => void;
  visible: boolean;
}

export const MarkersModule: React.FC<MarkersModuleProps> = ({ data, onMarkerClick, visible }) => {
  if (!visible) return null;

  return (
    <>
      {data.map((m) => {
        // Determine which icon and color to use based on PM2.5 levels
        let IconComponent = AqGood;
        let color = '#4ade80'; // Good (Green)
        
        if (m.pm25 > 12 && m.pm25 <= 35) {
          IconComponent = AqModerate;
          color = '#fbbf24'; // Moderate (Yellow)
        } else if (m.pm25 > 35 && m.pm25 <= 55.4) {
          IconComponent = AqUnhealthyForSensitiveGroups;
          color = '#f97316'; // Orange
        } else if (m.pm25 > 55.4 && m.pm25 <= 150.4) {
          IconComponent = AqUnhealthy;
          color = '#ef4444'; // Red
        } else if (m.pm25 > 150.4 && m.pm25 <= 250.4) {
          IconComponent = AqVeryUnhealthy;
          color = '#a855f7'; // Purple
        } else if (m.pm25 > 250.4) {
          IconComponent = AqHazardous;
          color = '#7e22ce'; // Maroon
        }

        return (
          <AdvancedMarker
            key={m.id}
            position={{ lat: m.lat, lng: m.lng }}
            onClick={() => onMarkerClick(m)}
            title={`Site: ${m.siteId} | PM2.5: ${m.pm25.toFixed(1)}`}
          >
            <div className="p-1 bg-white rounded-full shadow-lg border border-gray-200 transform hover:scale-110 transition-transform cursor-pointer">
              <IconComponent size={32} color={color} />
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};
