'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiMapPin, FiUser } from 'react-icons/fi';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && userRole !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (status === 'authenticated' && userRole === 'admin') {
      fetchIssues();
    }
  }, [status, userRole, filter]);

  const fetchIssues = async () => {
    try {
      const params = new URLSearchParams({ limit: '50', status: filter });
      const res = await fetch(`/api/issues?${params}`);
      const data = await res.json();
      if (res.ok) {
        // Sort by severity: critical > high > medium > low
        const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        const sorted = data.issues.sort(
          (a: any, b: any) => (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4)
        );
        setIssues(sorted);
      }
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeUp = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'status',
          status: 'in_progress',
        }),
      });

      if (res.ok) {
        toast.success('✅ Issue taken up! Status: In Progress');
        fetchIssues();
      } else {
        toast.error('Failed to take up issue');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const highCount = issues.filter(i => i.severity === 'high').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const pendingCount = issues.filter(i => i.status === 'reported' || i.status === 'verified').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiShield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Authority Dashboard</h1>
            <p className="text-gray-600 text-sm">
              {(session?.user as any)?.region} • {(session?.user as any)?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center border-red-200">
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
          <div className="text-sm text-gray-500">🔴 Critical</div>
        </div>
        <div className="card text-center border-orange-200">
          <div className="text-3xl font-bold text-orange-600">{highCount}</div>
          <div className="text-sm text-gray-500">🟠 High</div>
        </div>
        <div className="card text-center border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-500">⏳ Pending</div>
        </div>
        <div className="card text-center border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{inProgressCount}</div>
          <div className="text-sm text-gray-500">🔧 In Progress</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { value: 'all', label: 'All Issues' },
          { value: 'reported', label: '📝 Reported' },
          { value: 'verified', label: '✅ Verified' },
          { value: 'in_progress', label: '🔧 In Progress' },
          { value: 'resolved', label: '🎉 Resolved' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              filter === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🎉</p>
          <h3 className="text-xl font-semibold text-gray-700">No issues found</h3>
          <p className="text-gray-500">All clear in your region!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className={`card flex flex-col md:flex-row md:items-center gap-4 ${
                issue.severity === 'critical' ? 'border-red-300 bg-red-50/30' :
                issue.severity === 'high' ? 'border-orange-200' : ''
              }`}
            >
              {/* Severity & Category */}
              <div className="flex items-center gap-3 md:w-48">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(issue.severity)}`}>
                  {issue.severity === 'critical' && '🔴 '}
                  {issue.severity === 'high' && '🟠 '}
                  {issue.severity.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/issues/${issue._id}`} className="font-semibold text-gray-800 hover:text-blue-600 truncate block">
                  {issue.title}
                </Link>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {issue.location?.address || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiUser className="w-3 h-3" />
                    {issue.reportedBy?.name || 'Anonymous'}
                  </span>
                  <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                    {issue.category?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2">
                {(issue.status === 'reported' || issue.status === 'verified') && (
                  <button
                    onClick={() => handleTakeUp(issue._id)}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    🛠️ Take Up
                  </button>
                )}
                {issue.status === 'in_progress' && (
                  <span className="text-sm px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg">
                    🔧 In Progress
                  </span>
                )}
                {issue.status === 'resolved' && (
                  <span className="text-sm px-3 py-1.5 bg-green-100 text-green-800 rounded-lg flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" /> Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
