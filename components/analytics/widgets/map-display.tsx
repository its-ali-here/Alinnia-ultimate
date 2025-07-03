'use client';

import { useRef, useEffect } from 'react';
import L from 'leaflet';

// Define the structure for a single data point
interface MapPoint {
  lat: number;
  lon: number;
  [key: string]: any; // Allows for other data properties
}

interface MapDisplayProps {
  data: MapPoint[];
}

export const MapDisplay = ({ data }: MapDisplayProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (data.length === 0) return;

    const bounds = L.latLngBounds([]);
    data.forEach((point) => {
      const marker = L.circleMarker([point.lat, point.lon], {
        renderer: L.canvas(), // Use canvas renderer for better performance
        radius: 6,
        fillColor: '#3b82f6', // A nice blue color
        color: '#ffffff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map);

      // Create a popup with all data for that point
      let popupContent = '<div style="max-height: 150px; overflow-y: auto;">';
      for (const key in point) {
        popupContent += `<b>${key}:</b> ${point[key]}<br/>`;
      }
      popupContent += '</div>'
      marker.bindPopup(popupContent);

      bounds.extend([point.lat, point.lon]);
    });

    // Zoom the map to fit the data
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [data]); // This effect re-runs whenever the data prop changes

  return (
    <div
        ref={mapContainerRef}
        className="react-grid-drag-handle-cancelled" // Add this class
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
    />
);
};