import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Search,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Eye,
  MessageSquare,
  TriangleAlert,
  Loader2,
  Trash2,
  RefreshCw,
  Flag,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Admin Feedback Management Page
 *
 * Replaces dummy data with live backend:
 *
 *  Endpoints (admin protected):
 *   GET    /api/admin/feedback?search=&status=&flagged=&serviceId=&locationId=&page=&limit=
 *   PATCH  /api/admin/feedback/:id/status    { status: 'approved' | 'removed' }
 *   PATCH  /api/admin/feedback/:id/flag      { flagged: boolean }
 *   DELETE /api/admin/feedback/:id
 *
 *  Ancillary:
 *   GET    /api/services     (admin to build service filter options)
 *
 *  Features:
 *   - Search (comment, user name, service name, location name, address)
 *   - Filter by status, service, flagged
 *   - Pagination
 *   - View detail modal
 *   - Approve / Remove
 *   - Flag / Unflag
 *   - Delete review
 *   - Bulk approve / bulk remove / bulk flag / bulk unflag / bulk delete
 *   - Live refresh button
 */

const PAGE_LIMIT = 20;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'removed', label: 'Removed' }
];

const ReportsFeedback = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');

  // Data
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending'); // start with pending for moderation focus
  const [filterService, setFilterService] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // UI / selection
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Errors
  const [authError, setAuthError] = useState(false);

  /* ---------------- Helpers ---------------- */

  const authHeaders = () => {
    if (!token) {
      setAuthError(true);
      return null;
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  const handleAuthFailure = (res) => {
    if (res.status === 401 || res.status === 403) {
      setAuthError(true);
      toast.error('Unauthorized or session expired.');
      return true;
    }
    return false;
  };

  const resetSelection = () => setSelectedIds([]);

  /* ---------------- Fetch Services (for filter) ---------------- */
  useEffect(() => {
    const fetchServices = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${BASE_URL}/api/services`, {
          headers: authHeaders()
        });
        if (handleAuthFailure(res)) return;
        const data = await res.json();
        if (res.ok) {
          setServices(data.data || []);
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load services.');
      }
    };
    fetchServices();
  }, [BASE_URL, token]);

  /* ---------------- Fetch Feedback List ---------------- */
  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', PAGE_LIMIT);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterService !== 'all') params.set('serviceId', filterService);
      if (flaggedOnly) params.set('flagged', 'true');

      const res = await fetch(`${BASE_URL}/api/admin/feedback?${params.toString()}`, {
        headers: authHeaders()
      });
      if (handleAuthFailure(res)) {
        setReviews([]);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed loading feedback');
      setReviews(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      resetSelection();
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, token, page, searchTerm, filterStatus, filterService, flaggedOnly]);

  useEffect(() => {
    setPage(1); // reset page on filter/search changes
  }, [searchTerm, filterStatus, filterService, flaggedOnly]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  /* ---------------- Single Actions ---------------- */
  const updateReviewStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/feedback/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (handleAuthFailure(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selectedReview?._id === id) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }
      toast.success(`Review ${newStatus}`);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Status update failed');
    }
  };

  const toggleFlag = async (id) => {
    const review = reviews.find(r => r._id === id);
    if (!review) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/feedback/${id}/flag`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ flagged: !review.flagged })
      });
      if (handleAuthFailure(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to toggle flag');
      setReviews(reviews.map(r => r._id === id ? { ...r, flagged: !r.flagged } : r));
      if (selectedReview?._id === id) {
        setSelectedReview({ ...selectedReview, flagged: !selectedReview.flagged });
      }
      toast.success(`Review ${!review.flagged ? 'flagged' : 'unflagged'}`);
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Toggle flag failed');
    }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/feedback/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (handleAuthFailure(res)) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setReviews(reviews.filter(r => r._id !== id));
      if (selectedReview?._id === id) setSelectedReview(null);
      toast.success('Review deleted');
    } catch (e) {
      console.error(e);
      toast.error(e.message || 'Delete failed');
    }
  };

  /* ---------------- Bulk Actions ---------------- */
  const performBulk = async (action) => {
    if (selectedIds.length === 0) {
      toast.info('Select at least one review.');
      return;
    }
    setBulkWorking(true);

    const doAction = async (id) => {
      switch (action) {
        case 'approve':
          return updateReviewStatus(id, 'approved');
        case 'remove':
          return updateReviewStatus(id, 'removed');
        case 'flag':
          return toggleFlag(id);
        case 'unflag':
          return toggleFlag(id);
        case 'delete':
          return deleteReview(id);
        default:
          return;
      }
    };

    // If delete, confirm once
    if (action === 'delete') {
      const ok = confirm(`Delete ${selectedIds.length} review(s)? This cannot be undone.`);
      if (!ok) {
        setBulkWorking(false);
        return;
      }
    }

    for (const id of selectedIds) {
      await doAction(id); // sequential to avoid rate bursts
    }
    setBulkWorking(false);
    resetSelection();
    // For status changes or flags we already update state inline; Removed ones remain shown if filters still match.
    if (action === 'delete') {
      // refresh recommended to re-sync totals & pages
      setRefreshKey(k => k + 1);
    }
  };

  const allSelected = selectedIds.length > 0 && selectedIds.length === reviews.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      resetSelection();
    } else {
      setSelectedIds(reviews.map(r => r._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /* ---------------- Derived ---------------- */
  const serviceFilterOptions = useMemo(
    () => [{ _id: 'all', name: 'All Service Types' }, ...services],
    [services]
  );

  const statusCounts = useMemo(() => {
    // rough client side counts of currently loaded list (not global)
    const counts = { pending: 0, approved: 0, removed: 0 };
    reviews.forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });
    return counts;
  }, [reviews]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const formatDate = (iso) =>
    new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  /* ---------------- Render ---------------- */
  if (authError) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <TriangleAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Unauthorized
        </h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page. Please sign in as an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            User Feedback Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and moderate user feedback for emergency service locations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search feedback..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {serviceFilterOptions.map(s => (
                  <option key={s._id} value={s._id}>
                    {s._id === 'all' ? 'All Service Types' : s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Flagged */}
            <div className="flex items-center gap-2">
              <input
                id="flaggedOnly"
                type="checkbox"
                className="h-4 w-4"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
              />
              <label htmlFor="flaggedOnly" className="text-sm text-foreground">
                Show only flagged
              </label>
            </div>
          </div>

          {/* Current filter summary */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>
              Loaded (this page): Pending {statusCounts.pending} • Approved {statusCounts.approved} • Removed {statusCounts.removed}
            </span>
            {(searchTerm || filterStatus !== 'pending' || filterService !== 'all' || flaggedOnly) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('pending');
                  setFilterService('all');
                  setFlaggedOnly(false);
                }}
                className="px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/70"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-amber-800">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => performBulk('approve')}
              disabled={bulkWorking}
              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Approve
            </button>
            <button
              onClick={() => performBulk('remove')}
              disabled={bulkWorking}
              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
            <button
              onClick={() => performBulk('flag')}
              disabled={bulkWorking}
              className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Flag
            </button>
            <button
              onClick={() => performBulk('unflag')}
              disabled={bulkWorking}
              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Unflag
            </button>
            <button
              onClick={() => performBulk('delete')}
              disabled={bulkWorking}
              className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-black/80"
            >
              Delete
            </button>
            <button
              onClick={resetSelection}
              className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded hover:bg-muted/80"
            >
              Clear
            </button>
          </div>
          {bulkWorking && (
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              Working...
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-xs px-3 py-1 rounded border border-border bg-background hover:bg-muted transition"
              disabled={loading || reviews.length === 0}
            >
              {allSelected ? 'Unselect All' : 'Select All'}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}

            {!loading && reviews.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No reviews match your criteria.
                </p>
              </div>
            )}

          {!loading && reviews.map(review => {
            const selected = selectedIds.includes(review._id);
            return (
              <div
                key={review._id}
                className={`bg-card border rounded-lg p-4 transition-all ${
                  review.flagged
                    ? 'border-red-300 bg-red-50/60'
                    : 'border-border hover:shadow-sm'
                } ${selected ? 'ring-2 ring-primary/50' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selected}
                        onChange={() => toggleSelectOne(review._id)}
                      />
                      <span
                        className={`px-2 py-1 rounded-full text-[11px] font-medium ${getStatusColor(
                          review.status
                        )}`}
                      >
                        {review.status.charAt(0).toUpperCase() +
                          review.status.slice(1)}
                      </span>
                      {review.flagged && (
                        <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Flagged
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800">
                        {review.service?.name || 'Service'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-800">
                        {review.location?.name || 'Location'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">
                          {review.location?.name}
                        </h3>
                        {renderStars(review.rating)}
                        <span className="text-xs text-muted-foreground">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {review.comment || <em className="text-xs">No comment.</em>}
                      </p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span>
                          👤 {review.user?.name} ({review.user?.email})
                        </span>
                        <span>📍 {review.location?.address}</span>
                        <span>📅 {formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 min-w-[160px]">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>

                    {review.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateReviewStatus(review._id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded text-xs font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => updateReviewStatus(review._id, 'removed')}
                          className="px-3 py-1.5 bg-red-100 text-red-800 rounded text-xs font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Remove
                        </button>
                      </>
                    )}

                    {review.status !== 'pending' && (
                      <button
                        onClick={() =>
                          updateReviewStatus(
                            review._id,
                            review.status === 'approved' ? 'removed' : 'approved'
                          )
                        }
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-xs font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        {review.status === 'approved' ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            Remove
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => toggleFlag(review._id)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                        review.flagged
                          ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {review.flagged ? (
                        <>
                          <ShieldOff className="w-3 h-3" />
                          Unflag
                        </>
                      ) : (
                        <>
                          <Flag className="w-3 h-3" />
                          Flag
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => deleteReview(review._id)}
                      className="px-3 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-black/80 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Page {page} of {pages} ({total} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 rounded border border-border hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pages || loading}
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                className="p-2 rounded border border-border hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl relative">
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedReview.status
                  )}`}
                >
                  {selectedReview.status.charAt(0).toUpperCase() +
                    selectedReview.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedReview.service?.name}
                </span>
                {selectedReview.flagged && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Flagged
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Service / Location
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Service:</span>{' '}
                      {selectedReview.service?.name}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span>{' '}
                      {selectedReview.location?.name}
                    </p>
                    <p>
                      <span className="font-medium">Address:</span>{' '}
                      {selectedReview.location?.address}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">User</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedReview.user?.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {selectedReview.user?.email}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">
                  Rating & Review
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  {renderStars(selectedReview.rating)}
                  <span className="text-lg font-medium">
                    ({selectedReview.rating}/5)
                  </span>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {selectedReview.comment || <em>No comment provided.</em>}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                {selectedReview.status === 'pending' ? (
                  <>
                    <button
                      onClick={() =>
                        updateReviewStatus(selectedReview._id, 'approved')
                      }
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        updateReviewStatus(selectedReview._id, 'removed')
                      }
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      updateReviewStatus(
                        selectedReview._id,
                        selectedReview.status === 'approved'
                          ? 'removed'
                          : 'approved'
                      )
                    }
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {selectedReview.status === 'approved' ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Mark Removed
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Re-Approve
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => toggleFlag(selectedReview._id)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedReview.flagged
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {selectedReview.flagged ? 'Unflag' : 'Flag'}
                </button>

                <button
                  onClick={() => deleteReview(selectedReview._id)}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsFeedback;