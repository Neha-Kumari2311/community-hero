import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Get user's points and redeemed rewards
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized - Please login' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById((session.user as any).id).select('points badges issuesReported issuesResolved name');

    if (!user) {
      // User ID from session no longer exists in DB (stale session after re-seed)
      return NextResponse.json({
        error: 'Session expired. Please logout and login again.',
        points: 0,
        redeemed: [],
        issuesReported: 0,
        issuesResolved: 0,
        name: 'Unknown',
      }, { status: 200 });
    }

    return NextResponse.json({
      points: user.points,
      redeemed: user.badges || [],
      issuesReported: user.issuesReported || 0,
      issuesResolved: user.issuesResolved || 0,
      name: user.name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

// POST - Redeem a reward
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { rewardId, pointsCost } = await request.json();

    if (!rewardId || !pointsCost) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const user = await User.findById((session.user as any).id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.points < pointsCost) {
      return NextResponse.json(
        { error: 'Not enough points' },
        { status: 400 }
      );
    }

    // Check if already redeemed
    if (user.badges.includes(rewardId)) {
      return NextResponse.json(
        { error: 'Already redeemed this reward' },
        { status: 400 }
      );
    }

    // Deduct points and add to redeemed list
    user.points -= pointsCost;
    user.badges.push(rewardId);
    await user.save();

    return NextResponse.json({
      message: 'Reward redeemed successfully!',
      remainingPoints: user.points,
      redeemed: user.badges,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}
