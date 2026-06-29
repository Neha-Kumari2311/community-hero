'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiGift, FiStar, FiAward, FiFlag, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';

const rewards = [
  {
    id: 'certificate_bronze',
    name: 'Bronze Community Hero Certificate',
    description: 'Digital certificate recognizing your contribution as a community hero',
    points: 50,
    icon: '🥉',
    category: 'Certificate',
  },
  {
    id: 'certificate_silver',
    name: 'Silver Community Hero Certificate',
    description: 'Silver-level recognition certificate for outstanding community service',
    points: 150,
    icon: '🥈',
    category: 'Certificate',
  },
  {
    id: 'certificate_gold',
    name: 'Gold Community Hero Certificate',
    description: 'Gold-level certificate of excellence in community improvement',
    points: 300,
    icon: '🥇',
    category: 'Certificate',
  },
  {
    id: 'tree_plant',
    name: 'Plant a Tree in Your Name',
    description: 'We plant a tree in your local community park with your name tag',
    points: 100,
    icon: '🌳',
    category: 'Environmental',
  },
  {
    id: 'local_discount',
    name: 'Local Shop Discount Voucher',
    description: '10% discount at partnered local shops and restaurants in your area',
    points: 75,
    icon: '🏪',
    category: 'Voucher',
  },
  {
    id: 'bus_pass',
    name: 'Free Bus Pass (1 Week)',
    description: 'One week free public transport pass for your city',
    points: 200,
    icon: '🚌',
    category: 'Transport',
  },
  {
    id: 'badge_guardian',
    name: 'Community Guardian Badge',
    description: 'Special "Guardian" badge on your profile visible to all users',
    points: 100,
    icon: '🛡️',
    category: 'Badge',
  },
  {
    id: 'badge_champion',
    name: 'Champion Badge',
    description: '"Champion" profile badge — shows you\'ve resolved 10+ issues',
    points: 250,
    icon: '🏆',
    category: 'Badge',
  },
  {
    id: 'ngo_donation',
    name: 'Donate to Community NGO',
    description: 'Convert your points to ₹50 donation to a local community NGO',
    points: 50,
    icon: '❤️',
    category: 'Donation',
  },
];

const pointsGuide = [
  { action: 'Report an Issue', points: '+10', icon: <FiFlag className="w-4 h-4 text-green-600" /> },
  { action: 'Verify an Issue', points: '+5', icon: <FiCheckCircle className="w-4 h-4 text-blue-600" /> },
  { action: 'Vote Resolved', points: '+5', icon: <FiStar className="w-4 h-4 text-purple-600" /> },
  { action: 'Add Comment', points: '+2', icon: <FiMessageSquare className="w-4 h-4 text-orange-600" /> },
  { action: 'Resolve Issue (authority)', points: '+25', icon: <FiAward className="w-4 h-4 text-yellow-600" /> },
];

export default function RewardsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPoints, setUserPoints] = useState(0);
  const [redeemedItems, setRedeemedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchUserPoints();
    }
  }, [status]);

  const fetchUserPoints = async () => {
    try {
      const res = await fetch('/api/rewards');
      const data = await res.json();
      if (res.ok) {
        setUserPoints(data.points);
        setRedeemedItems(data.redeemed || []);
      }
    } catch (error) {
      console.error('Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward: typeof rewards[0]) => {
    if (userPoints < reward.points) {
      toast.error(`Not enough points! You need ${reward.points - userPoints} more points.`);
      return;
    }

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: reward.id, pointsCost: reward.points }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserPoints(data.remainingPoints);
        setRedeemedItems([...redeemedItems, reward.id]);
        toast.success(`🎉 Redeemed: ${reward.name}!`);
      } else {
        toast.error(data.error || 'Redemption failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FiGift className="text-green-600" />
          Rewards & Redemption
        </h1>
        <p className="text-gray-600 mt-2">Earn points by helping your community, redeem them for real rewards!</p>
      </div>

      {/* Points Balance */}
      <div className="card mb-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Your Balance</p>
            <p className="text-4xl font-bold">{userPoints} Points</p>
            <p className="text-green-200 text-sm mt-1">Keep helping your community to earn more!</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <FiStar className="w-10 h-10 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiAward className="text-yellow-500" />
          How to Earn Points
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pointsGuide.map((item, i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="flex justify-center mb-2">{item.icon}</div>
              <div className="text-xs text-gray-600">{item.action}</div>
              <div className="text-lg font-bold text-green-600">{item.points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <h2 className="text-xl font-semibold mb-4">🎁 Available Rewards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => {
          const isRedeemed = redeemedItems.includes(reward.id);
          const canAfford = userPoints >= reward.points;

          return (
            <div
              key={reward.id}
              className={`card flex flex-col ${isRedeemed ? 'opacity-60 border-green-300 bg-green-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{reward.icon}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {reward.category}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{reward.name}</h3>
              <p className="text-sm text-gray-600 flex-1 mb-4">{reward.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">{reward.points} pts</span>
                {isRedeemed ? (
                  <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                    <FiCheckCircle /> Redeemed
                  </span>
                ) : (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`text-sm px-4 py-2 rounded-lg font-medium transition-all ${
                      canAfford
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Redeem' : `Need ${reward.points - userPoints} more`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
