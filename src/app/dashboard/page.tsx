'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiAlertCircle, FiCheckCircle, FiClock, FiCpu, FiBarChart2 } from 'react-icons/fi';

export default function DashboardPage() {
  const [insights, setInsights] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/insights');
        const data = await res.json();
        if (res.ok) {
          setInsights(data.insights);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">🤖 AI is generating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FiBarChart2 className="text-green-600" />
          AI-Powered Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Real-time community health insights powered by Google Gemini AI
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-gray-800">{stats?.total || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Issues</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{stats?.resolved || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Resolved</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{stats?.inProgress || 0}</div>
          <div className="text-sm text-gray-500 mt-1">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600">{stats?.critical || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Critical</div>
        </div>
      </div>

      {/* Community Health Score */}
      {insights?.overall_health_score !== undefined && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiCpu className="text-blue-600" />
            Community Health Score
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="50"
                  stroke="#e5e7eb" strokeWidth="10" fill="none"
                />
                <circle
                  cx="60" cy="60" r="50"
                  stroke={
                    insights.overall_health_score >= 70 ? '#10b981' :
                    insights.overall_health_score >= 40 ? '#f59e0b' : '#ef4444'
                  }
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${insights.overall_health_score * 3.14} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{insights.overall_health_score}</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-800">
                {insights.overall_health_score >= 70
                  ? '🌟 Good Community Health'
                  : insights.overall_health_score >= 40
                  ? '⚠️ Needs Attention'
                  : '🚨 Critical Issues Detected'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Based on AI analysis of reported issues, resolution rates, and severity patterns.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trending Categories */}
        {insights?.trending_categories?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-orange-500" />
              Trending Issues
            </h2>
            <div className="space-y-3">
              {insights.trending_categories.map((category: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-gray-700 capitalize">{category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotspot Areas */}
        {insights?.hotspot_areas?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiAlertCircle className="text-red-500" />
              Hotspot Areas
            </h2>
            <div className="space-y-3">
              {insights.hotspot_areas.map((area: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                  <span className="text-red-500">📍</span>
                  <span className="text-gray-700">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions */}
        {insights?.predictions?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiClock className="text-purple-500" />
              AI Predictions
            </h2>
            <div className="space-y-3">
              {insights.predictions.map((prediction: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-500 mt-0.5">🔮</span>
                  <span className="text-gray-600">{prediction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights?.recommendations?.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiCheckCircle className="text-green-500" />
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {insights.recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">💡</span>
                  <span className="text-gray-600">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resolution Analysis */}
      {insights?.resolution_rate_analysis && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FiCpu className="text-blue-600" />
            Resolution Analysis
          </h2>
          <p className="text-gray-600">{insights.resolution_rate_analysis}</p>
        </div>
      )}
    </div>
  );
}
