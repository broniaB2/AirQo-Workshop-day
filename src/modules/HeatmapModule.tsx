/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { NormalizedMeasurement } from '../types';

interface HeatmapModuleProps {
  data: NormalizedMeasurement[];
  visible: boolean;
}

export const HeatmapModule: React.FC<HeatmapModuleProps> = ({ data, visible }) => {
  const map = useMap();

  const overlay = useMemo(() => {
    if (!visible || data.length === 0) return null;

    const layer = new HeatmapLayer({
      id: 'airqo-heatmap',
      data,
      getPosition: (d: NormalizedMeasurement) => [d.lng, d.lat],
      getWeight: (d: NormalizedMeasurement) => d.normalizedValue,
      radiusPixels: 60,
      intensity: 1,
      threshold: 0.05,
    });

    return new GoogleMapsOverlay({
      layers: [layer],
    });
  }, [data, visible]);

  useEffect(() => {
    if (!map || !overlay) return;

    overlay.setMap(map);
    return () => overlay.setMap(null);
  }, [map, overlay]);

  return null;
};
