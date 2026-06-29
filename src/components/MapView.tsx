'use client';

import { useEffect, useRef, useState } from 'react';

interface Issue {
  _id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: string;
}

interface MapViewProps {
  issues: Issue[];
}

export default function MapView({ issues }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map only once
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || initializedRef.current) return;

    let map: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Create map centered on New Delhi
      map = L.map(mapContainerRef.current!, {
        center: [28.5672, 77.2100],
        zoom: 12,
      });
      mapRef.current = map;
      initializedRef.current = true;
      setMapReady(true);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    };

    initMap();

    // Cleanup on unmount only
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [isClient]);

  // Update markers when issues change (without recreating the map)
  useEffect(() => {
    if (!mapRef.current || !isClient || !mapReady) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapRef.current;

      // Remove existing markers
      markersRef.current.forEach((marker) => {
        try {
          map.removeLayer(marker);
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current = [];

      // Add markers for each issue
      issues.forEach((issue) => {
        if (!issue.location || (issue.location.lat === 0 && issue.location.lng === 0)) return;
        if (issue.location.lat == null || issue.location.lng == null) return;

        const severityColor = getSeverityColor(issue.severity);
        const categoryEmoji = getCategoryEmoji(issue.category);

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="
              position: relative;
              width: 36px;
              height: 44px;
            ">
              <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.059 0 0 8.059 0 18c0 13.5 18 26 18 26s18-12.5 18-26C36 8.059 27.941 0 18 0z" fill="${severityColor}"/>
                <circle cx="18" cy="18" r="10" fill="white"/>
              </svg>
              <span style="
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                line-height: 1;
              ">${categoryEmoji}</span>
            </div>
          `,
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([issue.location.lat, issue.location.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; min-width: 180px;">
            <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 6px 0; color: #1f2937;">${issue.title}</h3>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 6px 0;">
              📍 ${issue.location.address}
            </p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              <span style="
                font-size: 11px;
                padding: 2px 8px;
                border-radius: 9999px;
                color: white;
                background-color: ${severityColor};
              ">${issue.severity}</span>
              <span style="
                font-size: 11px;
                padding: 2px 8px;
                border-radius: 9999px;
                background-color: #f3f4f6;
                color: #374151;
              ">${issue.status.replace('_', ' ')}</span>
            </div>
            <a href="/issues/${issue._id}" style="
              font-size: 12px;
              color: #16a34a;
              text-decoration: none;
            ">View Details →</a>
          </div>
        `);

        markersRef.current.push(marker);
      });

      // Fit bounds to show ALL markers
      const validIssues = issues.filter(i =>
        i.location && i.location.lat != null && i.location.lng != null &&
        !(i.location.lat === 0 && i.location.lng === 0)
      );
      if (validIssues.length > 1) {
        const bounds = L.latLngBounds(
          validIssues.map(i => [i.location.lat, i.location.lng] as [number, number])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else if (validIssues.length === 1) {
        map.setView([validIssues[0].location.lat, validIssues[0].location.lng], 14);
      }
    };

    updateMarkers();
  }, [issues, isClient, mapReady]);

  if (!isClient) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .custom-map-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="w-full h-[500px] rounded-xl overflow-hidden border border-gray-200"
      />
    </>
  );
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#3b82f6';
    default: return '#6b7280';
  }
}

function getCategoryEmoji(category: string): string {
  switch (category) {
    case 'pothole': return '🕳️';
    case 'water_leakage': return '💧';
    case 'streetlight': return '💡';
    case 'waste_management': return '🗑️';
    case 'road_damage': return '🛣️';
    case 'drainage': return '🚰';
    case 'public_property': return '🏛️';
    case 'safety_hazard': return '⚠️';
    case 'pollution': return '🏭';
    case 'other': return '📍';
    default: return '📍';
  }
}
