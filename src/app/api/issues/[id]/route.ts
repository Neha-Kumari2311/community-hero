import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';

// GET - Fetch single issue
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const issue = await Issue.findById(params.id)
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('verifiedBy', 'name');

    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    return NextResponse.json({ issue });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// PATCH - Update issue (status, upvote, verify, comment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { action, ...data } = body;
    const userId = (session.user as any).id;

    let issue;

    switch (action) {
      case 'upvote':
        issue = await Issue.findById(params.id);
        if (!issue) {
          return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }
        
        const hasUpvoted = issue.upvotes.includes(userId);
        if (hasUpvoted) {
          issue.upvotes = issue.upvotes.filter(
            (id: any) => id.toString() !== userId
          );
        } else {
          issue.upvotes.push(userId);
        }
        await issue.save();
        break;

      case 'verify':
        issue = await Issue.findById(params.id);
        if (!issue) {
          return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        const hasVerified = issue.verifiedBy.includes(userId);
        if (!hasVerified) {
          issue.verifiedBy.push(userId);
          // Auto-update status if 3+ verifications
          if (issue.verifiedBy.length >= 3 && issue.status === 'reported') {
            issue.status = 'verified';
          }
          // Award points to verifier
          await User.findByIdAndUpdate(userId, {
            $inc: { points: 5 },
          });
        }
        await issue.save();
        break;

      case 'comment':
        issue = await Issue.findByIdAndUpdate(
          params.id,
          {
            $push: {
              comments: {
                user: userId,
                text: data.text,
                createdAt: new Date(),
              },
            },
          },
          { new: true }
        );
        // Award points for commenting
        await User.findByIdAndUpdate(userId, {
          $inc: { points: 2 },
        });
        break;

      case 'status':
        issue = await Issue.findByIdAndUpdate(
          params.id,
          {
            status: data.status,
            ...(data.status === 'resolved' ? { resolvedAt: new Date() } : {}),
          },
          { new: true }
        );
        
        // Award points if resolved
        if (data.status === 'resolved') {
          await User.findByIdAndUpdate(userId, {
            $inc: { points: 25, issuesResolved: 1 },
          });
        }
        break;

      default:
        issue = await Issue.findByIdAndUpdate(params.id, data, { new: true });
    }

    const updatedIssue = await Issue.findById(params.id)
      .populate('reportedBy', 'name email')
      .populate('comments.user', 'name email')
      .populate('verifiedBy', 'name');

    return NextResponse.json({ issue: updatedIssue });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update issue' },
      { status: 500 }
    );
  }
}
