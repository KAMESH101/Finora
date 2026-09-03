import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface LeafletHeatmapProps {
  points: HeatmapPoint[];
  maxVal?: number;
}

export function LeafletHeatmap({ points, maxVal = 10000 }: LeafletHeatmapProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // Format for leaflet.heat: [lat, lng, intensity]
    const heatData: [number, number, number][] = points.map(p => [
      p.lat,
      p.lng,
      Math.min(1.0, Math.max(0.1, p.intensity / maxVal))
    ]);

    // @ts-ignore L.heatLayer is added by 'leaflet.heat'
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: '#3B82F6',
        0.4: '#10B981',
        0.6: '#F59E0B',
        0.8: '#EF4444',
        1.0: '#881337'
      }
    });

    heatLayer.addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, maxVal]);

  return null;
}
