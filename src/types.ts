/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Value {
  value: number;
}

export interface Measurement {
  device: string;
  device_number: number;
  site_id: string;
  time: string;
  pm2_5: Value;
  pm10: Value;
  location: Location;
}

export interface AirQoResponse {
  success: boolean;
  isCache: boolean;
  message: string;
  meta: {
    total: number;
    page: number;
    pages: number;
    limit: number;
    startTime: string;
    endTime: string;
  };
  measurements: Measurement[];
}

export interface NormalizedMeasurement {
  id: string;
  lat: number;
  lng: number;
  pm25: number;
  pm10: number;
  time: string;
  siteId: string;
  // Normalized value (0-100) for visualization weights
  normalizedValue: number;
}

/**
 * Utility to normalize PM2.5 values for heatmaps.
 * Standard PM2.5 ranges roughly go from 0 to 500 (hazardous).
 * We normalize to 0-100 for consistent heatmap weighting.
 */
export const normalizePM25 = (value: number): number => {
  const max = 250; // Values above this are extremely hazardous
  const normalized = (value / max) * 100;
  return Math.min(Math.max(normalized, 0), 100);
};
