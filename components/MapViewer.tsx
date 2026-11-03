'use client';

import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

declare const L: any;

interface MapProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  attractions?: {
    name: string;
    lat: number;
    lng: number;
    description: string;
    color?: string;
  }[];
  onMarkerClick?: (name: string) => void;
}

export default function MapViewer({
  center = [48.8566, 2.3522], // Paris default
  zoom = 13,
  attractions = [],
  onMarkerClick
}: MapProps) {
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!window.L) {
      // Load Leaflet CSS and JS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-sA+0S2fqrDPopN5q72Qn9RrvA0I2KfaGDL';
      link.crossOrigin = '';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-o6R4Q8JkHVX+CMArU27jz6R1UQCU8f8Q87rpJcQI=' ;
      script.crossOrigin = '';
      document.body.appendChild(script);

      return;
    }

    // Initialize map after Leaflet loads
    const instance = mapRef.current?.leafletEvent ? mapRef.current : L.map(mapRef.current);

    if (instance instanceof L.Map) {
      setMap(instance);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(instance);

      instance.setView(center, zoom);

      // Add markers for attractions
      if (attractions && attractions.length > 0) {
        attractions.forEach((attraction) => {
          const marker = L.marker([attraction.lat, attraction.lng], {
            icon: L.icon({
              iconUrl: '/images/marker.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            }),
          }).bindPopup(`
            <div>
              <h4>${attraction.name}</h4>
              <p>${attraction.description}</p>
            </div>
          `);
          marker.addTo(instance);
        });
      }

      // If there's a center point and attractions, fit bounds
      if (attractions && attractions.length > 0) {
        const layers = L.featureGroup(
          attractions.map((a) => L.marker([a.lat, a.lng]))
        );
        instance.fitBounds(layers.getBounds().pad(0.5));
      }

      // Handle marker clicks
      if (onMarkerClick && attractions) {
        // Note: In a full implementation, we'd add click listeners
      }
    }
  }, [center, zoom, attractions, onMarkerClick, window.L]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '400px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}