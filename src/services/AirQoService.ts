/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AirQoResponse, NormalizedMeasurement, normalizePM25 } from '../types';

export class AirQoService {
  /**
   * Fetches the latest air quality measurements from AirQo via the server proxy.
   */
  static async fetchMeasurements(): Promise<NormalizedMeasurement[]> {
    try {
      const response = await fetch('/api/measurements');

      if (!response.ok) {
        // Handle unauthorized or missing key
        if (response.status === 401) {
          console.warn('AirQo API Key is unauthorized or missing. Showing demo data.');
          return this.getMockData();
        }
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data: AirQoResponse = await response.json();
      return this.transformData(data);
    } catch (error) {
      console.error('Failed to fetch AirQo data:', error);
      return this.getMockData(); 
    }
  }

  /**
   * Transforms raw AirQo API response into our normalized application state.
   */
  private static transformData(data: AirQoResponse): NormalizedMeasurement[] {
    if (!data.measurements || data.measurements.length === 0) {
      return this.getMockData();
    }
    return data.measurements.map((m, index) => ({
      id: `${m.site_id}-${index}`,
      lat: m.location.latitude,
      lng: m.location.longitude,
      pm25: m.pm2_5.value,
      pm10: m.pm10.value,
      time: m.time,
      siteId: m.site_id,
      normalizedValue: normalizePM25(m.pm2_5.value),
    }));
  }

  /**
   * Provides sample data around Kampala, Uganda (AirQo's primary area) for testing.
   */
  private static getMockData(): NormalizedMeasurement[] {
    const kampala = { lat: 0.3476, lng: 32.5825 };
    // Create a more varied distribution of points
    return Array.from({ length: 40 }).map((_, i) => {
      // Create some hotspots and some clean areas
      const isHotspot = Math.random() > 0.7;
      const pm25 = isHotspot ? 60 + Math.random() * 150 : 5 + Math.random() * 25;
      
      return {
        id: `mock-${i}`,
        lat: kampala.lat + (Math.random() - 0.5) * 0.15,
        lng: kampala.lng + (Math.random() - 0.5) * 0.15,
        pm25: pm25,
        pm10: pm25 * 1.3,
        time: new Date().toISOString(),
        siteId: `STATION-${100 + i}`,
        normalizedValue: normalizePM25(pm25),
      };
    });
  }
}
