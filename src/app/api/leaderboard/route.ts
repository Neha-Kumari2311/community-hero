import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET - Fetch leaderboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = await User.find({})
      .select('name points issuesReported issuesResolved badges')
      .sort({ points: -1 })
      .limit(20);

    return NextResponse.json({ leaderboard: users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
