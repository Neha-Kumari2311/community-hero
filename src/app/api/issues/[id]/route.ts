import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Issue from '@/models/Issue';
import User from '@/models/User';

// GET - Fetch single issue
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const issue = await Issue.findById(id)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id: issueId } = await params;

    const body = await request.json();
    const { action, ...data } = body;
    const userId = (session.user as any).id;

    let issue;

    switch (action) {
      case 'upvote':
        issue = await Issue.findById(issueId);
        if (!issue) {
          return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }
        
        const hasUpvoted = issue.upvotes.some(
          (id: any) => id.toString() === userId
        );
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
        issue = await Issue.findById(issueId);
        if (!issue) {
          return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        const hasVerified = issue.verifiedBy.some(
          (id: any) => id.toString() === userId
        );
        if (hasVerified) {
          return NextResponse.json({ error: 'You have already verified this issue' }, { status: 400 });
        }
        issue.verifiedBy.push(userId);
        // Auto-update status if 3+ verifications
        if (issue.verifiedBy.length >= 3 && issue.status === 'reported') {
          issue.status = 'verified';
        }
        // Award points to verifier
        await User.findByIdAndUpdate(userId, {
          $inc: { points: 5 },
        });
        await issue.save();
        break;

      case 'comment':
        issue = await Issue.findByIdAndUpdate(
          issueId,
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

      case 'vote_resolved':
        issue = await Issue.findById(issueId);
        if (!issue) {
          return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
        }

        if (!issue.resolvedVotes) issue.resolvedVotes = [];
        const hasVotedResolved = issue.resolvedVotes.some(
          (id: any) => id.toString() === userId
        );
        if (hasVotedResolved) {
          return NextResponse.json({ error: 'You have already voted to resolve this issue' }, { status: 400 });
        }
        issue.resolvedVotes.push(userId);
        // Auto-resolve if 3+ community members vote it's resolved
        if (issue.resolvedVotes.length >= 3 && issue.status !== 'resolved') {
          issue.status = 'resolved';
          issue.resolvedAt = new Date();
        }
        await issue.save();
        // Award points to voter
        await User.findByIdAndUpdate(userId, {
          $inc: { points: 5 },
        });
        break;

      case 'status':
        // Only admins can directly change status (except resolved which needs votes)
        if (data.status === 'resolved') {
          // For resolved, use vote_resolved action instead (unless admin)
          issue = await Issue.findById(issueId);
          if (!issue) {
            return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
          }
          if (!issue.resolvedVotes) issue.resolvedVotes = [];
          // Check if user already voted
          const alreadyVoted = issue.resolvedVotes.some(
            (id: any) => id.toString() === userId
          );
          if (alreadyVoted) {
            return NextResponse.json({ error: 'You have already voted to resolve this issue' }, { status: 400 });
          }
          issue.resolvedVotes.push(userId);
          if (issue.resolvedVotes.length >= 3) {
            issue.status = 'resolved';
            issue.resolvedAt = new Date();
          }
          await issue.save();
          await User.findByIdAndUpdate(userId, {
            $inc: { points: 5 },
          });
        } else {
          issue = await Issue.findByIdAndUpdate(
            issueId,
            { status: data.status },
            { new: true }
          );
        }
        break;

      default:
        issue = await Issue.findByIdAndUpdate(issueId, data, { new: true });
    }

    const updatedIssue = await Issue.findById(issueId)
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

// DELETE - Delete an issue (only by reporter or admin, or auto-delete resolved issues after 30 days)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id: issueId } = await params;
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
    }

    // Check permissions: only the reporter, admin, or if issue is resolved/closed
    const isReporter = issue.reportedBy.toString() === userId;
    const isAdmin = userRole === 'admin';
    const isResolved = issue.status === 'resolved' || issue.status === 'closed';

    if (!isReporter && !isAdmin && !isResolved) {
      return NextResponse.json(
        { error: 'You can only delete your own issues or resolved issues' },
        { status: 403 }
      );
    }

    // If issue is resolved, change status to 'closed' instead of hard delete
    // Hard delete only for admins or the original reporter of unresolved issues
    if (isResolved && !isAdmin) {
      // Mark as closed (soft delete / archive)
      issue.status = 'closed';
      await issue.save();
      return NextResponse.json({ 
        message: 'Issue has been closed and archived',
        action: 'closed'
      });
    }

    // Hard delete for admins or reporters of their own unresolved issues
    await Issue.findByIdAndDelete(issueId);

    // Decrement the reporter's issue count
    if (issue.reportedBy) {
      await User.findByIdAndUpdate(issue.reportedBy, {
        $inc: { issuesReported: -1 },
      });
    }

    return NextResponse.json({ 
      message: 'Issue deleted successfully',
      action: 'deleted'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
