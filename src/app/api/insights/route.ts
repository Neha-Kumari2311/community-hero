import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import { generateInsights } from '@/lib/gemini';

// GET - Generate AI insights from community issues
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get recent issues for analysis
    const issues = await Issue.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (issues.length === 0) {
      return NextResponse.json({
        insights: {
          trending_categories: [],
          hotspot_areas: [],
          resolution_rate_analysis: 'No issues reported yet',
          predictions: [],
          recommendations: ['Start reporting community issues to get AI insights'],
          overall_health_score: 100,
        },
        stats: {
          total: 0,
          resolved: 0,
          inProgress: 0,
          reported: 0,
        },
      });
    }

    // Calculate basic stats
    const stats = {
      total: issues.length,
      resolved: issues.filter((i) => i.status === 'resolved').length,
      inProgress: issues.filter((i) => i.status === 'in_progress').length,
      reported: issues.filter((i) => i.status === 'reported').length,
      verified: issues.filter((i) => i.status === 'verified').length,
      critical: issues.filter((i) => i.severity === 'critical').length,
      high: issues.filter((i) => i.severity === 'high').length,
    };

    // Generate AI insights
    const insights = await generateInsights(issues);

    return NextResponse.json({ insights, stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
