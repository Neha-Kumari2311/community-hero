import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';
import { analyzeIssueImage, getAISuggestions } from '@/lib/gemini';

// GET - Fetch all issues with filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: any = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;

    const skip = (page - 1) * limit;

    const [issues, total] = await Promise.all([
      Issue.find(query)
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query),
    ]);

    return NextResponse.json({
      issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

// POST - Create a new issue
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to report an issue' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, description, category, severity, images, location } = body;

    if (!title || !description || !location) {
      return NextResponse.json(
        { error: 'Please provide title, description, and location' },
        { status: 400 }
      );
    }

    // AI Analysis - analyze image if provided
    let aiAnalysis: any = {};

    if (images && images.length > 0) {
      try {
        // Extract base64 data from data URL
        const imageData = images[0].split(',')[1];
        const mimeType = images[0].split(';')[0].split(':')[1];
        const imageAnalysis = await analyzeIssueImage(imageData, mimeType);
        aiAnalysis = { ...imageAnalysis };
      } catch (err) {
        console.error('Image analysis failed:', err);
      }
    }

    // Get AI suggestions for resolution
    try {
      const suggestions = await getAISuggestions(
        description,
        category || aiAnalysis.category || 'other'
      );
      aiAnalysis = { ...aiAnalysis, ...suggestions };
    } catch (err) {
      console.error('AI suggestions failed:', err);
    }

    // Create the issue
    const issue = await Issue.create({
      title: title || aiAnalysis.suggested_title || 'Community Issue',
      description,
      category: category || aiAnalysis.category || 'other',
      severity: severity || aiAnalysis.severity || 'medium',
      images: images || [],
      location,
      reportedBy: (session.user as any).id,
      aiAnalysis,
    });

    // Update user stats
    await User.findByIdAndUpdate((session.user as any).id, {
      $inc: { issuesReported: 1, points: 10 },
    });

    const populatedIssue = await Issue.findById(issue._id).populate(
      'reportedBy',
      'name email'
    );

    return NextResponse.json(
      { message: 'Issue reported successfully', issue: populatedIssue },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create issue' },
      { status: 500 }
    );
  }
}
