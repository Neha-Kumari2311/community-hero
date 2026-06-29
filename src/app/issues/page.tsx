'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FiFilter, FiThumbsUp, FiCheckCircle, FiMessageSquare, FiMapPin, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'pothole', label: '🕳️ Pothole' },
  { value: 'water_leakage', label: '💧 Water Leakage' },
  { value: 'streetlight', label: '💡 Streetlight' },
  { value: 'waste_management', label: '🗑️ Waste' },
  { value: 'road_damage', label: '🛣️ Road' },
  { value: 'drainage', label: '🌊 Drainage' },
  { value: 'public_property', label: '🏛️ Property' },
  { value: 'safety_hazard', label: '⚠️ Safety' },
  { value: 'pollution', label: '🏭 Pollution' },
  { value: 'other', label: '📋 Other' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'reported', label: '📝 Reported' },
  { value: 'verified', label: '✅ Verified' },
  { value: 'in_progress', label: '🔧 In Progress' },
  { value: 'resolved', label: '🎉 Resolved' },
];

export default function IssuesPage() {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    severity: 'all',
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: filters.category,
        status: filters.status,
        severity: filters.severity,
        page: pagination.page.toString(),
        limit: '12',
      });

      // Filter by user's region if logged in
      const userRegion = (session?.user as any)?.region;
      if (userRegion) {
        params.set('region', userRegion);
      }

      const res = await fetch(`/api/issues?${params}`);
      const data = await res.json();

      if (res.ok) {
        setIssues(data.issues);
        setPagination(data.pagination);
      }
    } catch (error) {
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [filters, pagination.page]);

  const handleUpvote = async (issueId: string) => {
    if (!session) {
      toast.error('Please login to upvote');
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upvote' }),
      });

      if (res.ok) {
        fetchIssues();
        toast.success('Vote recorded!');
      }
    } catch (error) {
      toast.error('Failed to upvote');
    }
  };

  const handleVerify = async (issueId: string) => {
    if (!session) {
      toast.error('Please login to verify');
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify' }),
      });

      if (res.ok) {
        fetchIssues();
        toast.success('✅ Issue verified! +5 points');
      }
    } catch (error) {
      toast.error('Failed to verify');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'badge-low';
      case 'medium': return 'badge-medium';
      case 'high': return 'badge-high';
      case 'critical': return 'badge-critical';
      default: return 'badge-medium';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'status-reported';
      case 'verified': return 'status-verified';
      case 'in_progress': return 'status-in_progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-reported';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.label.split(' ')[0] : '📋';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Community Issues</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} issues reported by community members
          </p>
        </div>
        {session && (
          <Link href="/report" className="btn-primary mt-4 md:mt-0 inline-flex items-center gap-2">
            ➕ Report New Issue
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            className="input-field text-sm"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <select
            className="input-field text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="input-field text-sm"
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="all">All Severity</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🟠 High</option>
            <option value="critical">🔴 Critical</option>
          </select>
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="text-center py-20">
          <svg className="animate-spin h-10 w-10 mx-auto text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🏘️</p>
          <h3 className="text-xl font-semibold text-gray-700">No issues found</h3>
          <p className="text-gray-500 mt-2">
            Be the first to report an issue in your community!
          </p>
          {session && (
            <Link href="/report" className="btn-primary mt-4 inline-block">
              Report an Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => (
            <div key={issue._id} className="card hover:shadow-lg transition-all duration-200 flex flex-col">
              {/* Image */}
              {issue.images && issue.images.length > 0 && (
                <div className="relative -mx-6 -mt-6 mb-3">
                  <img
                    src={issue.images[0]}
                    alt={issue.title}
                    className="w-full h-52 object-cover rounded-t-xl"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`badge ${getSeverityColor(issue.severity)}`}>
                      {issue.severity}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`badge ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{getCategoryEmoji(issue.category)}</span>
                  {!issue.images?.length && (
                    <div className="flex gap-1">
                      <span className={`badge ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className={`badge ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                <Link href={`/issues/${issue._id}`}>
                  <h3 className="font-semibold text-gray-800 hover:text-green-600 transition-colors line-clamp-1 text-sm">
                    {issue.title}
                  </h3>
                </Link>

                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                  {issue.description}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1 mt-3 text-xs text-gray-500">
                  <FiMapPin className="w-3 h-3" />
                  <span className="truncate">{issue.location?.address}</span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <FiClock className="w-3 h-3" />
                  <span>
                    {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleUpvote(issue._id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                >
                  <FiThumbsUp className="w-4 h-4" />
                  <span>{issue.upvotes?.length || 0}</span>
                </button>

                <button
                  onClick={() => handleVerify(issue._id)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  <span>{issue.verifiedBy?.length || 0}</span>
                </button>

                <a
                  href={`/issues/${issue._id}`}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  <span>{issue.comments?.length || 0}</span>
                </a>

                <span className="text-xs text-gray-400">
                  by {issue.reportedBy?.name?.split(' ')[0] || 'Anonymous'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPagination({ ...pagination, page: i + 1 })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pagination.page === i + 1
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
