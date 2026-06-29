import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';

// GET - Generate insights from community issues (no AI call - uses local stats only)
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
          recommendations: ['Start reporting community issues to get insights'],
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

    // Generate insights locally from data (no AI API call)
    const categoryCount: Record<string, number> = {};
    const locationCount: Record<string, number> = {};
    issues.forEach((i: any) => {
      categoryCount[i.category] = (categoryCount[i.category] || 0) + 1;
      if (i.location?.address) {
        locationCount[i.location.address] = (locationCount[i.location.address] || 0) + 1;
      }
    });

    const trending_categories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat.replace('_', ' '));

    const hotspot_areas = Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area]) => area);

    const resolutionRate = stats.total > 0
      ? Math.round((stats.resolved / stats.total) * 100)
      : 0;

    const healthScore = Math.max(
      10,
      100 - (stats.critical * 15) - (stats.high * 8) + (resolutionRate * 0.5)
    );

    const insights = {
      trending_categories,
      hotspot_areas,
      resolution_rate_analysis: `${resolutionRate}% of issues have been resolved. ${stats.inProgress} currently in progress.`,
      predictions: stats.critical > 0
        ? [`${stats.critical} critical issues need immediate attention`]
        : ['Community is in good shape!'],
      recommendations: [
        stats.reported > 5 ? 'Many issues awaiting verification - community members can help verify' : '',
        stats.critical > 0 ? 'Prioritize critical issues for faster resolution' : '',
        'Encourage community participation through the points system',
      ].filter(Boolean),
      overall_health_score: Math.min(100, Math.round(healthScore)),
    };

    return NextResponse.json({ insights, stats });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
