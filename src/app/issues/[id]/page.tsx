'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  FiThumbsUp, FiCheckCircle, FiMapPin, FiClock, FiSend,
  FiCpu, FiArrowLeft, FiAlertTriangle, FiTrash2, FiArchive
} from 'react-icons/fi';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchIssue = async () => {
    try {
      const res = await fetch(`/api/issues/${params.id}`);
      const data = await res.json();
      if (res.ok) {
        setIssue(data.issue);
      } else {
        toast.error('Issue not found');
        router.push('/issues');
      }
    } catch (error) {
      toast.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchIssue();
  }, [params.id]);

  const handleUpvote = async () => {
    if (!session) { toast.error('Please login'); return; }
    try {
      await fetch(`/api/issues/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' }),
      });
      fetchIssue();
    } catch { toast.error('Failed'); }
  };

  const handleVerify = async () => {
    if (!session) { toast.error('Please login'); return; }
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to verify');
        return;
      }
      fetchIssue();
      toast.success('✅ Verified! +5 points');
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Please login'); return; }
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await fetch(`/api/issues/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', text: comment }),
      });
      setComment('');
      fetchIssue();
      toast.success('Comment added! +2 points');
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update');
        return;
      }
      fetchIssue();
      if (newStatus === 'resolved') {
        toast.success('✅ Vote recorded! +5 points');
      } else {
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    if (!session) { toast.error('Please login'); return; }
    
    const confirmMsg = issue.status === 'resolved' 
      ? 'Close and archive this resolved issue?' 
      : 'Are you sure you want to delete this issue? This cannot be undone.';
    
    if (!confirm(confirmMsg)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/issues/${params.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.action === 'closed') {
          toast.success('🗄️ Issue closed and archived');
          fetchIssue();
        } else {
          toast.success('🗑️ Issue deleted successfully');
          router.push('/issues');
        }
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch { toast.error('Failed to delete issue'); }
    finally { setDeleting(false); }
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

  if (!issue) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition-colors"
      >
        <FiArrowLeft /> Back to Issues
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {issue.images?.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <img
                src={issue.images[0]}
                alt={issue.title}
                className="w-full h-72 object-cover"
              />
            </div>
          )}

          {/* Issue Info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <span className={`badge badge-${issue.severity}`}>{issue.severity}</span>
              <span className={`badge status-${issue.status}`}>
                {issue.status.replace('_', ' ')}
              </span>
              <span className="badge bg-gray-100 text-gray-700">
                {issue.category.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-3">{issue.title}</h1>
            <p className="text-gray-600 leading-relaxed">{issue.description}</p>

            {/* Meta */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                {issue.location?.address}
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
              </div>
              <div>
                Reported by <strong>{issue.reportedBy?.name}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button onClick={handleUpvote} className="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                <FiThumbsUp /> Upvote ({issue.upvotes?.length || 0})
              </button>
              <button onClick={handleVerify} className="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                <FiCheckCircle /> Verify ({issue.verifiedBy?.length || 0})
              </button>
            </div>

            {/* Vote Resolved */}
            {session && issue.status !== 'resolved' && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Mark as Resolved:</label>
                  <span className="text-xs text-gray-500">
                    {issue.resolvedVotes?.length || 0}/3 votes needed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((issue.resolvedVotes?.length || 0) / 3 * 100, 100)}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full text-sm px-4 py-2.5 rounded-lg border border-green-500 text-green-700 hover:bg-green-50 transition-colors font-medium"
                >
                  ✅ Vote as Resolved ({issue.resolvedVotes?.length || 0}/3)
                </button>
                <p className="text-xs text-gray-400 mt-1 text-center">
                  3 community members must vote to confirm resolution
                </p>
              </div>
            )}
            {issue.status === 'resolved' && (
              <div className="mt-4 pt-4 border-t">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <span className="text-green-700 font-medium text-sm">🎉 Issue Resolved by Community!</span>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              Comments ({issue.comments?.length || 0})
            </h2>

            {/* Comment Form */}
            {session ? (
              <form onSubmit={handleComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="btn-primary px-4 disabled:opacity-50"
                >
                  <FiSend />
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 mb-4">Login to add comments</p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {issue.comments?.length === 0 && (
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              )}
              {issue.comments?.map((c: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 text-sm font-medium">
                      {c.user?.name?.[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - AI Analysis */}
        <div className="space-y-6">
          {issue.aiAnalysis && (
            <div className="card border-blue-200 bg-blue-50/50">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2 mb-4">
                <FiCpu className="w-5 h-5" />
                AI Analysis
              </h3>

              {issue.aiAnalysis.priority_score && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Priority Score</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          issue.aiAnalysis.priority_score >= 8
                            ? 'bg-red-500'
                            : issue.aiAnalysis.priority_score >= 5
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${issue.aiAnalysis.priority_score * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold">{issue.aiAnalysis.priority_score}/10</span>
                  </div>
                </div>
              )}

              {issue.aiAnalysis.suggested_department && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase">Department</div>
                  <div className="text-sm font-medium">{issue.aiAnalysis.suggested_department}</div>
                </div>
              )}

              {issue.aiAnalysis.estimated_resolution_time && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase">Est. Resolution</div>
                  <div className="text-sm font-medium">{issue.aiAnalysis.estimated_resolution_time}</div>
                </div>
              )}

              {issue.aiAnalysis.estimated_impact && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase">Impact</div>
                  <div className="text-sm">{issue.aiAnalysis.estimated_impact}</div>
                </div>
              )}

              {issue.aiAnalysis.resolution_steps?.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-gray-500 uppercase mb-1">Resolution Steps</div>
                  <ol className="text-sm space-y-1">
                    {issue.aiAnalysis.resolution_steps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-600 font-medium">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Verification Status */}
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FiCheckCircle className="text-blue-600" />
              Verification
            </h3>
            <div className="text-sm">
              <p className="text-gray-600 mb-2">
                {issue.verifiedBy?.length || 0} / 3 verifications
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((issue.verifiedBy?.length || 0) / 3 * 100, 100)}%` }}
                ></div>
              </div>
              {issue.verifiedBy?.length >= 3 && (
                <p className="text-green-600 text-xs mt-2 font-medium">✅ Community Verified</p>
              )}
            </div>
          </div>

          {/* Danger level */}
          {issue.severity === 'critical' && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-700">
                <FiAlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Critical Issue</span>
              </div>
              <p className="text-sm text-red-600 mt-2">
                This issue requires immediate attention and has been flagged as critical.
              </p>
            </div>
          )}

          {/* Escalate - for long pending issues */}
          {(issue.status === 'reported' || issue.status === 'verified') && (
            <div className="card border-orange-200 bg-orange-50/50">
              <h3 className="font-semibold text-orange-800 mb-2">⏳ Issue Not Resolved?</h3>
              <p className="text-sm text-orange-700 mb-3">
                File a formal complaint on the official government portal:
              </p>
              <div className="space-y-2">
                <a
                  href="https://pgportal.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-white rounded-lg border hover:border-blue-400 transition-colors text-sm"
                >
                  <span>🏛️</span>
                  <div>
                    <div className="font-medium text-gray-800">CPGRAMS</div>
                    <div className="text-xs text-gray-500">pgportal.gov.in</div>
                  </div>
                </a>
                <a
                  href="https://swachhata.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 bg-white rounded-lg border hover:border-green-400 transition-colors text-sm"
                >
                  <span>🧹</span>
                  <div>
                    <div className="font-medium text-gray-800">Swachhata</div>
                    <div className="text-xs text-gray-500">swachhata.gov.in</div>
                  </div>
                </a>
              </div>
            </div>
          )}

          {/* Delete / Close Issue */}
          {session && issue.status !== 'closed' && (
            <div className="card border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                {issue.status === 'resolved' ? (
                  <><FiArchive className="w-4 h-4" /> Close Issue</>
                ) : (
                  <><FiTrash2 className="w-4 h-4" /> Delete Issue</>
                )}
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {issue.status === 'resolved'
                  ? 'This resolved issue can be closed and archived. It will no longer appear in active listings.'
                  : 'Only the reporter or an admin can delete an unresolved issue. This action cannot be undone.'}
              </p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className={`w-full text-sm px-4 py-2.5 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                  issue.status === 'resolved'
                    ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    : 'border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                {deleting ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : issue.status === 'resolved' ? (
                  <><FiArchive className="w-4 h-4" /> Close &amp; Archive</>
                ) : (
                  <><FiTrash2 className="w-4 h-4" /> Delete Issue</>
                )}
              </button>
            </div>
          )}

          {/* Closed status indicator */}
          {issue.status === 'closed' && (
            <div className="card border-purple-200 bg-purple-50">
              <div className="flex items-center gap-2 text-purple-700">
                <FiArchive className="w-5 h-5" />
                <span className="font-semibold">Issue Closed</span>
              </div>
              <p className="text-sm text-purple-600 mt-2">
                This issue has been resolved and archived. It will be permanently removed after 15 days.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
