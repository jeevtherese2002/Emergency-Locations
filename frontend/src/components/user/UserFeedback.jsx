import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Star,
    MapPin,
    MessageSquare,
    Send,
    Eye,
    Search,
    Filter,
    X,
    Loader2,
    ChevronRight,
    ChevronLeft,
    ShieldAlert,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

const PAGE_LIMIT_LOCATIONS = 12;
const PAGE_LIMIT_REVIEWS = 10;
const MESSAGE_CHAR_MAX = 500;

const UserFeedback = () => {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token');

    /* ---------------- State ---------------- */
    const [services, setServices] = useState([]);
    const [locationSummaries, setLocationSummaries] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationPage, setLocationPage] = useState(1);
    const [locationPages, setLocationPages] = useState(1);
    const [locationTotal, setLocationTotal] = useState(0);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    const [selectedLocationId, setSelectedLocationId] = useState('');
    const [selectedLocationMeta, setSelectedLocationMeta] = useState(null);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [anonymous, setAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [reviewsPages, setReviewsPages] = useState(1);
    const [reviewsTotal, setReviewsTotal] = useState(0);
    const [showReviews, setShowReviews] = useState(true);
    const [ratingSummary, setRatingSummary] = useState(null);

    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const authHeaders = () => {
        if (!token) {
            toast.error('Authentication required. Please log in.');
            return null;
        }
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };
    };

    const handleAuthError = (res) => {
        if (res.status === 401 || res.status === 403) {
            toast.error('Session expired or unauthorized. Please log in again.');
            return true;
        }
        return false;
    };

    /* ---------------- Load Services ---------------- */
    useEffect(() => {
        let ignore = false;
        const fetchServices = async () => {
            if (!token) return; // stop spam to protected route
            try {
                const res = await fetch(`${BASE_URL}/api/services/user`, {
                    headers: authHeaders()
                });
                if (handleAuthError(res)) return;
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to load services');
                if (!ignore) setServices(data.data || []);
            } catch (e) {
                console.error(e);
                toast.error(e.message || 'Failed to load services');
            }
        };
        fetchServices();
        return () => { ignore = true; };
    }, [BASE_URL, token]);

    /* ---------------- Fetch Location Summaries ---------------- */
    const fetchLocationSummaries = useCallback(async (page = 1) => {
        if (!token) {
            setLocationSummaries([]);
            return;
        }
        setLocationLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', PAGE_LIMIT_LOCATIONS);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            if (selectedServiceFilter !== 'all') {
                params.set('serviceId', selectedServiceFilter);
            }

            const res = await fetch(`${BASE_URL}/api/feedback/locations/summary?${params.toString()}`, {
                headers: authHeaders()
            });
            if (handleAuthError(res)) {
                setLocationSummaries([]);
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load locations');

            setLocationSummaries(data.data || []);
            setLocationPage(data.page);
            setLocationPages(data.pages);
            setLocationTotal(data.total);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed loading locations');
        } finally {
            setLocationLoading(false);
            setInitialFetchDone(true);
        }
    }, [BASE_URL, searchQuery, selectedServiceFilter, token]);

    useEffect(() => {
        fetchLocationSummaries(1);
    }, [fetchLocationSummaries]);

    /* ---------------- Fetch Reviews ---------------- */
    const fetchReviews = useCallback(async (locId, page = 1) => {
        if (!token || !locId) {
            setReviews([]);
            return;
        }
        setReviewsLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/feedback/location/${locId}?page=${page}&limit=${PAGE_LIMIT_REVIEWS}`, {
                headers: authHeaders()
            });
            if (handleAuthError(res)) {
                setReviews([]);
                return;
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to load reviews');

            setReviews(data.data || []);
            setReviewsPage(data.page);
            setReviewsPages(data.pages);
            setReviewsTotal(data.total);
            setRatingSummary(data.ratingSummary || null);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Failed loading reviews');
        } finally {
            setReviewsLoading(false);
        }
    }, [BASE_URL, token]);

    /* ---------------- Handlers ---------------- */
    const handleSelectLocation = (loc) => {
        setSelectedLocationId(loc.locationId);
        setSelectedLocationMeta(loc);
        setRating(0);
        setHoverRating(0);
        setComment('');
        setAnonymous(false);
        setReviewsPage(1);
        setShowReviews(true);
        fetchReviews(loc.locationId, 1);
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error('Please log in to submit feedback');
            return;
        }
        if (!selectedLocationId) {
            toast.info('Select a location first');
            return;
        }
        if (rating < 1) {
            toast.info('Please provide a rating');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`${BASE_URL}/api/feedback`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    locationId: selectedLocationId,
                    rating,
                    comment: comment.trim(),
                    anonymous
                })
            });
            if (handleAuthError(res)) return;
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to submit feedback');

            toast.success('Feedback submitted (pending approval)');
            setRating(0);
            setComment('');
            setAnonymous(false);
        } catch (e) {
            console.error(e);
            toast.error(e.message || 'Submit failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLocationPageChange = (dir) => {
        const next = locationPage + dir;
        if (next >= 1 && next <= locationPages) {
            fetchLocationSummaries(next);
        }
    };

    const handleReviewsPageChange = (dir) => {
        const next = reviewsPage + dir;
        if (next >= 1 && next <= reviewsPages) {
            fetchReviews(selectedLocationId, next);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedServiceFilter('all');
    };

    /* ---------------- Derived ---------------- */
    const serviceFilterOptions = useMemo(
        () => [{ _id: 'all', name: 'All Services' }, ...services],
        [services]
    );

    const renderStars = (value, interactive = false) => {
        const active = interactive ? (hoverRating || rating) : value;
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => {
                    const filled = i <= active;
                    return (
                        <Star
                            key={i}
                            className={`w-6 h-6 transition-colors duration-150 ${interactive ? 'cursor-pointer' : 'cursor-default'
                                } ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                } ${interactive ? 'hover:scale-110' : ''}`}
                            onClick={interactive ? () => setRating(i) : undefined}
                            onMouseEnter={interactive ? () => setHoverRating(i) : undefined}
                            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
                        />
                    );
                })}
            </div>
        );
    };

    const ratingBreakdown = useMemo(() => {
        if (!ratingSummary) return [];
        const total = ratingSummary.totalReviews || 0;
        return [5, 4, 3, 2, 1].map(star => {
            const count = ratingSummary.breakdown?.[star] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return { star, count, pct };
        });
    }, [ratingSummary]);

    /* ---------------- Render ---------------- */
    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    Report & Feedback
                </h1>
                <p className="text-muted-foreground mt-2">
                    Share your experience to improve emergency response quality for everyone.
                </p>
                {!token && (
                    <p className="mt-3 text-sm text-destructive">
                        You are not logged in. Please log in to view and submit feedback.
                    </p>
                )}
            </div>

            {/* Discovery & Filters */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Emergency Service Locations
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(prev => !prev)}
                            disabled={!token}
                            className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? 'Hide Filters' : 'Filters'}
                        </button>
                        {(searchQuery || selectedServiceFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={!token}
                        className="w-full pl-11 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition disabled:opacity-50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && token && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                            Service Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {serviceFilterOptions.map(s => (
                                <button
                                    key={s._id}
                                    onClick={() => setSelectedServiceFilter(s._id)}
                                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition ${selectedServiceFilter === s._id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    {s.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Locations Result Meta */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-3">
                    <span>
                        {!token
                            ? 'Login required.'
                            : locationLoading
                                ? 'Loading locations...'
                                : locationTotal
                                    ? `Page ${locationPage} of ${locationPages} (${locationTotal} total)`
                                    : initialFetchDone
                                        ? 'No locations found'
                                        : 'Loading...'}
                    </span>
                    {token && locationPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                disabled={locationPage === 1 || locationLoading}
                                onClick={() => handleLocationPageChange(-1)}
                                className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={locationPage === locationPages || locationLoading}
                                onClick={() => handleLocationPageChange(1)}
                                className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Locations Grid */}
                <div className="relative min-h-[120px]">
                    {token && locationLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    )}
                    {token && !locationLoading && locationSummaries.length === 0 && initialFetchDone && (
                        <div className="text-center py-10 text-muted-foreground">
                            <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
                            <p>No matching locations.</p>
                        </div>
                    )}
                    {!token && (
                        <div className="text-center py-10 text-muted-foreground">
                            Please log in to browse locations.
                        </div>
                    )}
                    <div
                        className={`grid gap-3 md:grid-cols-2 xl:grid-cols-3 transition-opacity ${locationLoading ? 'opacity-30 pointer-events-none' : 'opacity-100'
                            }`}
                    >
                        {token && locationSummaries.map(loc => {
                            const active = selectedLocationId === loc.locationId;
                            return (
                                <button
                                    key={loc.locationId}
                                    onClick={() => handleSelectLocation(loc)}
                                    className={`text-left p-4 rounded-lg border-2 group transition-all duration-200 hover:shadow-sm relative ${active
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border bg-background hover:border-primary/40'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-medium text-foreground line-clamp-1">
                                                {loc.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                {loc.address}
                                            </p>
                                        </div>
                                        <span
                                            className="inline-flex items-center justify-center rounded-full px-2 py-1 text-[10px] font-medium"
                                            style={{
                                                backgroundColor: '#00000010',
                                                color: loc.service?.color || 'var(--primary)'
                                            }}
                                        >
                                            {loc.service?.name || 'Service'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        {loc.avgRating ? (
                                            <>
                                                <div className="flex">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-4 h-4 ${i < Math.round(loc.avgRating)
                                                                    ? 'text-yellow-400 fill-yellow-400'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {loc.avgRating} ({loc.totalReviews})
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs italic text-muted-foreground flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> New
                                            </span>
                                        )}
                                    </div>
                                    {active && (
                                        <div className="absolute top-2 right-2 text-primary">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Selected Location Panel */}
            {selectedLocationId && token && (
                <div className="space-y-8">
                    {/* Meta & Rating Summary */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    {selectedLocationMeta?.name}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedLocationMeta?.address}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Service Type: {selectedLocationMeta?.service?.name}
                                </p>
                            </div>
                            {ratingSummary && (
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            {renderStars(Math.round(ratingSummary.avgRating || 0), false)}
                                            <span className="text-lg font-semibold">
                                                {ratingSummary.avgRating || '0.00'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {ratingSummary.totalReviews} review
                                            {ratingSummary.totalReviews !== 1 && 's'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                        {ratingBreakdown.map(row => (
                                            <div key={row.star} className="flex items-center gap-2">
                                                <span className="w-10 text-right">{row.star}★</span>
                                                <div className="flex-1 h-2 rounded bg-muted overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 transition-all"
                                                        style={{ width: `${row.pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right text-muted-foreground">
                                                    {row.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {!ratingSummary && (
                                <div className="text-sm text-muted-foreground italic">
                                    No approved reviews yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Form */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                            Share Your Experience
                        </h3>
                        <form onSubmit={handleSubmitFeedback} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-3">
                                    Rating <span className="text-destructive">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {renderStars(rating, true)}
                                    {(hoverRating || rating) > 0 && (
                                        <span className="text-sm text-muted-foreground">
                                            {(hoverRating || rating)} / 5
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Comments (optional)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    maxLength={MESSAGE_CHAR_MAX}
                                    placeholder="Describe your experience. Constructive detail helps everyone..."
                                    className="w-full h-28 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                />
                                <div className="text-right text-xs text-muted-foreground mt-1">
                                    {comment.length}/{MESSAGE_CHAR_MAX}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    id="anonymous"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border"
                                    checked={anonymous}
                                    onChange={(e) => setAnonymous(e.target.checked)}
                                />
                                <label htmlFor="anonymous" className="text-sm text-muted-foreground">
                                    Submit anonymously
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-medium bg-primary text-primary-foreground transition-all ${submitting
                                            ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:bg-primary/90 hover:scale-[1.02]'
                                        }`}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Your feedback will appear after admin approval.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Reviews */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Community Reviews
                            </h3>
                            <button
                                onClick={() => setShowReviews(prev => !prev)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:bg-muted/70 transition-colors"
                            >
                                {showReviews ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        {showReviews && (
                            <div className="space-y-6">
                                {reviewsLoading && (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                )}
                                {!reviewsLoading && reviews.length === 0 && (
                                    <div className="text-center py-8 text-sm text-muted-foreground">
                                        No approved reviews yet for this location.
                                    </div>
                                )}
                                {!reviewsLoading && reviews.map(r => (
                                    <div
                                        key={r._id}
                                        className="p-4 rounded-lg bg-muted/40 border border-border/60"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {renderStars(r.rating, false)}
                                                <span className="text-sm font-medium text-foreground">
                                                    {r.userDisplay}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {r.comment && (
                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                {r.comment}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {reviewsPages > 1 && (
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-muted-foreground">
                                            Page {reviewsPage} of {reviewsPages} ({reviewsTotal} review{reviewsTotal !== 1 && 's'})
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={reviewsPage === 1 || reviewsLoading}
                                                onClick={() => handleReviewsPageChange(-1)}
                                                className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                disabled={reviewsPage === reviewsPages || reviewsLoading}
                                                onClick={() => handleReviewsPageChange(1)}
                                                className="p-1 rounded border border-border hover:bg-muted disabled:opacity-40"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!selectedLocationId && token && (
                <div className="text-center text-xs text-muted-foreground">
                    Select a location above to rate and view community feedback.
                </div>
            )}
        </div>
    );
};

export default UserFeedback;