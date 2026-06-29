'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiMap, FiList, FiFilter } from 'react-icons/fi';
import MapView from '@/components/MapView';

export default function MapPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await fetch(`/api/issues?limit=50&category=${filter}`);
        const data = await res.json();
        if (res.ok) {
          setIssues(data.issues);
        }
      } catch (error) {
        toast.error('Failed to load issues');
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiMap className="text-green-600" />
            Issues Map
          </h1>
          <p className="text-gray-600 mt-1">
            View all community issues on an interactive map
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Link
            href="/issues"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 px-3 py-2 border rounded-lg transition-colors"
          >
            <FiList className="w-4 h-4" />
            List View
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by category</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: '🗺️ All' },
            { value: 'pothole', label: '🕳️ Pothole' },
            { value: 'water_leakage', label: '💧 Water' },
            { value: 'streetlight', label: '💡 Streetlight' },
            { value: 'waste_management', label: '🗑️ Waste' },
            { value: 'road_damage', label: '🛣️ Road' },
            { value: 'drainage', label: '🚰 Drainage' },
            { value: 'public_property', label: '🏛️ Property' },
            { value: 'safety_hazard', label: '⚠️ Safety' },
            { value: 'pollution', label: '🏭 Pollution' },
            { value: 'other', label: '📍 Other' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === cat.value
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-gray-600">Loading map...</p>
          </div>
        </div>
      ) : (
        <MapView issues={issues} />
      )}

      {/* Legend */}
      <div className="card mt-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">📍 Severity Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {issues.length} issues loaded • {issues.filter(i => i.location?.lat && i.location?.lng).length} with map coordinates • Click markers for details
        </p>
      </div>
    </div>
  );
}
