'use client';

import { useState, useEffect } from 'react';
import { FiAward, FiStar, FiFlag, FiCheckCircle } from 'react-icons/fi';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (res.ok) {
          setLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 1: return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 2: return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default: return 'bg-white border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FiAward className="text-yellow-500" />
          Community Heroes
        </h1>
        <p className="text-gray-600 mt-2">
          Top contributors making our community better
        </p>
      </div>

      {/* Points Explanation */}
      <div className="card mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <h3 className="font-semibold text-green-800 mb-3">🎯 How to Earn Points</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FiFlag className="text-green-600" />
            <span>Report Issue: <strong>+10</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-blue-600" />
            <span>Verify Issue: <strong>+5</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <FiStar className="text-purple-600" />
            <span>Resolve Issue: <strong>+25</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span>💬</span>
            <span>Comment: <strong>+2</strong></span>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🏆</p>
          <h3 className="text-xl font-semibold text-gray-700">No heroes yet!</h3>
          <p className="text-gray-500 mt-2">
            Be the first to report an issue and earn points.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user, index) => (
            <div
              key={user._id}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${getRankBg(index)}`}
            >
              {/* Rank */}
              <div className="w-12 text-center">
                <span className={`text-2xl ${index < 3 ? '' : 'text-gray-400 text-lg font-medium'}`}>
                  {getRankBadge(index)}
                </span>
              </div>

              {/* Avatar */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>

              {/* Name and Stats */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <FiFlag className="w-3 h-3" />
                    {user.issuesReported} reported
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" />
                    {user.issuesResolved} resolved
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">{user.points}</div>
                <div className="text-xs text-gray-400">points</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
