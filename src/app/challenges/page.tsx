'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiTarget, FiZap, FiTrendingUp, FiClock, FiCheckCircle, FiLock } from 'react-icons/fi';

// Daily challenges that reset
const dailyChallenges = [
  {
    id: 'report_1',
    title: '📸 First Reporter',
    description: 'Report 1 community issue today',
    target: 1,
    type: 'report',
    reward: 15,
    icon: '📸',
  },
  {
    id: 'verify_2',
    title: '✅ Verifier',
    description: 'Verify 2 issues reported by others',
    target: 2,
    type: 'verify',
    reward: 12,
    icon: '✅',
  },
  {
    id: 'comment_3',
    title: '💬 Commentator',
    description: 'Leave 3 helpful comments on issues',
    target: 3,
    type: 'comment',
    reward: 10,
    icon: '💬',
  },
  {
    id: 'upvote_5',
    title: '👍 Supporter',
    description: 'Upvote 5 community issues',
    target: 5,
    type: 'upvote',
    reward: 8,
    icon: '👍',
  },
];

// Weekly challenges (harder, more reward)
const weeklyChallenges = [
  {
    id: 'report_5_week',
    title: '🏆 Issue Hunter',
    description: 'Report 5 issues this week',
    target: 5,
    type: 'report',
    reward: 50,
    icon: '🏆',
  },
  {
    id: 'resolve_1_week',
    title: '🔧 Problem Solver',
    description: 'Help resolve 1 issue (vote resolved on a fixed issue)',
    target: 1,
    type: 'resolve',
    reward: 30,
    icon: '🔧',
  },
  {
    id: 'streak_3',
    title: '🔥 3-Day Streak',
    description: 'Be active on the platform for 3 consecutive days',
    target: 3,
    type: 'streak',
    reward: 40,
    icon: '🔥',
  },
];

// Achievement badges (one-time unlocks)
const achievements = [
  { id: 'first_report', title: 'First Step', description: 'Report your first issue', icon: '🌱', unlockAt: 1, type: 'report' },
  { id: 'ten_reports', title: 'Watchdog', description: 'Report 10 issues', icon: '🐕', unlockAt: 10, type: 'report' },
  { id: 'fifty_reports', title: 'Eagle Eye', description: 'Report 50 issues', icon: '🦅', unlockAt: 50, type: 'report' },
  { id: 'first_resolve', title: 'Fixer', description: 'Help resolve your first issue', icon: '🔨', unlockAt: 1, type: 'resolve' },
  { id: 'ten_resolves', title: 'Hero', description: 'Help resolve 10 issues', icon: '🦸', unlockAt: 10, type: 'resolve' },
  { id: 'hundred_points', title: 'Century', description: 'Earn 100 points', icon: '💯', unlockAt: 100, type: 'points' },
  { id: 'five_hundred_points', title: 'Legend', description: 'Earn 500 points', icon: '⭐', unlockAt: 500, type: 'points' },
  { id: 'top_3', title: 'Podium', description: 'Reach top 3 on the leaderboard', icon: '🏅', unlockAt: 3, type: 'rank' },
];

export default function ChallengesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyProgress, setDailyProgress] = useState<Record<string, number>>({});
  const [claimedDaily, setClaimedDaily] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/rewards');
      const data = await res.json();
      if (res.ok) {
        setUserStats(data);
        // Simulate daily progress (in production, track actual daily actions)
        setDailyProgress({
          report: Math.min(1, Math.floor(Math.random() * 2)),
          verify: Math.min(2, Math.floor(Math.random() * 3)),
          comment: Math.min(3, Math.floor(Math.random() * 4)),
          upvote: Math.min(5, Math.floor(Math.random() * 6)),
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const claimReward = (challengeId: string, reward: number) => {
    if (claimedDaily.includes(challengeId)) {
      toast.error('Already claimed!');
      return;
    }
    setClaimedDaily([...claimedDaily, challengeId]);
    toast.success(`🎉 +${reward} bonus points claimed!`);
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FiTarget className="text-purple-600" />
          Challenges & Achievements
        </h1>
        <p className="text-gray-600 mt-2">Complete challenges to earn bonus points and unlock achievements!</p>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <a
            href="/quiz"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            🧠 Play Eco Quiz
          </a>
          <a
            href="/rewards"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            🎁 Redeem Rewards
          </a>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <FiZap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">Level {Math.floor((userStats?.points || 0) / 50) + 1}</div>
          <div className="text-sm text-purple-500">Community Hero</div>
          <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${((userStats?.points || 0) % 50) * 2}%` }}
            ></div>
          </div>
          <div className="text-xs text-purple-400 mt-1">{(userStats?.points || 0) % 50}/50 to next level</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">{userStats?.points || 0}</div>
          <div className="text-sm text-green-500">Total Points</div>
          <a href="/rewards" className="text-xs text-green-600 hover:underline mt-1 block">🎁 Redeem →</a>
        </div>

        <div className="card text-center bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <span className="text-2xl mb-1 block">📋</span>
          <div className="text-2xl font-bold text-blue-700">{userStats?.issuesReported || 0}</div>
          <div className="text-sm text-blue-500">Issues Reported</div>
          <div className="text-xs text-blue-400 mt-1">+{(userStats?.issuesReported || 0) * 10} pts earned</div>
        </div>

        <div className="card text-center bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <span className="text-2xl mb-1 block">✅</span>
          <div className="text-2xl font-bold text-orange-700">{userStats?.issuesResolved || 0}</div>
          <div className="text-sm text-orange-500">Issues Resolved</div>
          <div className="text-xs text-orange-400 mt-1">+{(userStats?.issuesResolved || 0) * 25} pts earned</div>
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="card mb-8">
        <h3 className="font-semibold text-gray-800 mb-3">📊 Your Points Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-green-50 p-3 rounded-xl text-center">
            <div className="text-xs text-gray-500">Reporting</div>
            <div className="text-lg font-bold text-green-600">+{(userStats?.issuesReported || 0) * 10}</div>
            <div className="text-xs text-gray-400">{userStats?.issuesReported || 0} × 10pts</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-center">
            <div className="text-xs text-gray-500">Resolving</div>
            <div className="text-lg font-bold text-blue-600">+{(userStats?.issuesResolved || 0) * 25}</div>
            <div className="text-xs text-gray-400">{userStats?.issuesResolved || 0} × 25pts</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-xl text-center">
            <div className="text-xs text-gray-500">Verifying</div>
            <div className="text-lg font-bold text-purple-600">+5</div>
            <div className="text-xs text-gray-400">per verify</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-center">
            <div className="text-xs text-gray-500">Comments</div>
            <div className="text-lg font-bold text-orange-600">+2</div>
            <div className="text-xs text-gray-400">per comment</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-xl text-center">
            <div className="text-xs text-gray-500">Vote Resolved</div>
            <div className="text-lg font-bold text-yellow-600">+5</div>
            <div className="text-xs text-gray-400">per vote</div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiClock className="text-blue-600" />
            Daily Challenges
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Resets in 12h</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dailyChallenges.map((challenge) => {
            const progress = dailyProgress[challenge.type] || 0;
            const isComplete = progress >= challenge.target;
            const isClaimed = claimedDaily.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                className={`card flex items-center gap-4 ${isComplete && !isClaimed ? 'border-green-300 bg-green-50/50 animate-pulse' : ''} ${isClaimed ? 'opacity-60' : ''}`}
              >
                <div className="text-3xl">{challenge.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                  <p className="text-xs text-gray-500">{challenge.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min((progress / challenge.target) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {progress}/{challenge.target}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {isClaimed ? (
                    <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                      <FiCheckCircle /> Done
                    </span>
                  ) : isComplete ? (
                    <button
                      onClick={() => claimReward(challenge.id, challenge.reward)}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 animate-bounce"
                    >
                      Claim +{challenge.reward}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">+{challenge.reward} pts</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Challenges */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiTarget className="text-orange-600" />
            Weekly Challenges
          </h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Resets Monday</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weeklyChallenges.map((challenge) => (
            <div key={challenge.id} className="card text-center">
              <span className="text-4xl mb-3 block">{challenge.icon}</span>
              <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{challenge.description}</p>
              <div className="mt-3 bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="text-sm font-bold text-orange-600 mt-2">+{challenge.reward} pts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiZap className="text-yellow-500" />
          Achievements
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => {
            const points = userStats?.points || 0;
            let isUnlocked = false;

            if (achievement.type === 'points') {
              isUnlocked = points >= achievement.unlockAt;
            } else if (achievement.type === 'report') {
              isUnlocked = (userStats?.issuesReported || 0) >= achievement.unlockAt;
            }

            return (
              <div
                key={achievement.id}
                className={`card text-center ${isUnlocked ? 'border-yellow-300 bg-yellow-50/50' : 'opacity-50 grayscale'}`}
              >
                <span className="text-3xl block mb-2">{achievement.icon}</span>
                <h3 className="font-semibold text-sm text-gray-800">{achievement.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                {isUnlocked ? (
                  <span className="text-xs text-yellow-600 font-medium mt-2 block">🏅 Unlocked!</span>
                ) : (
                  <span className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <FiLock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
