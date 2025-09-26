import React, { useState } from 'react';
import { Search, Star, CheckCircle, XCircle, AlertTriangle, Filter, Eye, MessageSquare } from 'lucide-react';

const ReportsFeedback = () => {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      userName: 'John Smith',
      userEmail: 'john.smith@email.com',
      serviceName: 'City General Hospital',
      serviceType: 'Hospital',
      location: '123 Main St, Downtown',
      rating: 5,
      comment: 'Excellent emergency care! The staff was very professional and the response time was incredible.',
      status: 'pending',
      createdAt: '2024-01-20T14:30:00Z',
      flagged: false
    },
    {
      id: 2,
      userName: 'Sarah Johnson',
      userEmail: 'sarah.j@email.com',
      serviceName: 'Fire Station #3',
      serviceType: 'Fire Station',
      location: '456 Oak Ave, Midtown',
      rating: 4,
      comment: 'Quick response but could use better equipment.',
      status: 'approved',
      createdAt: '2024-01-19T10:15:00Z',
      flagged: false
    },
    {
      id: 3,
      userName: 'Mike Wilson',
      userEmail: 'mike.wilson@email.com',
      serviceName: 'Central Police Station',
      serviceType: 'Police Station',
      location: '789 Pine St, Central',
      rating: 2,
      comment: 'Staff was rude and unprofessional. This place needs better management.',
      status: 'pending',
      createdAt: '2024-01-18T16:45:00Z',
      flagged: true
    },
    {
      id: 4,
      userName: 'Lisa Brown',
      userEmail: 'lisa.brown@email.com',
      serviceName: 'Metro Ambulance Service',
      serviceType: 'Ambulance Service',
      location: '321 Elm St, Westside',
      rating: 3,
      comment: 'Average service, took longer than expected but staff was friendly.',
      status: 'approved',
      createdAt: '2024-01-17T09:20:00Z',
      flagged: false
    },
    {
      id: 5,
      userName: 'David Garcia',
      userEmail: 'david.g@email.com',
      serviceName: 'Emergency Clinic',
      serviceType: 'Clinic',
      location: '654 Birch Rd, Eastside',
      rating: 1,
      comment: 'Terrible experience! Staff ignored me for hours. Worst service ever!!!',
      status: 'removed',
      createdAt: '2024-01-16T11:30:00Z',
      flagged: true
    },
    {
      id: 6,
      userName: 'Emily Davis',
      userEmail: 'emily.davis@email.com',
      serviceName: 'City General Hospital',
      serviceType: 'Hospital',
      location: '123 Main St, Downtown',
      rating: 4,
      comment: 'Good facilities and caring staff. Wait time could be improved.',
      status: 'approved',
      createdAt: '2024-01-15T13:10:00Z',
      flagged: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);

  const serviceTypes = [
    'all',
    'Hospital',
    'Fire Station',
    'Police Station',
    'Ambulance Service',
    'Clinic'
  ];

  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.userName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesService = filterService === 'all' || review.serviceType === filterService;

    return matchesSearch && matchesStatus && matchesService;
  });

  const updateReviewStatus = (id, newStatus) => {
    setReviews(reviews.map(review =>
      review.id === id ? { ...review, status: newStatus } : review
    ));
  };

  const toggleFlag = (id) => {
    setReviews(reviews.map(review =>
      review.id === id ? { ...review, flagged: !review.flagged } : review
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'removed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const getStatsCount = (status) => {
    return reviews.filter(review => status === 'all' ? true : review.status === status).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">User Feedback Management</h1>
        <p className="text-muted-foreground mt-2">Review and moderate user feedback for emergency services</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getStatsCount('all')}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getStatsCount('pending')}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getStatsCount('approved')}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{getStatsCount('removed')}</p>
              <p className="text-sm text-muted-foreground">Removed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by place, service name, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="removed">Removed</option>
            </select>
          </div>
          <div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {serviceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Service Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className={`bg-card border rounded-lg p-4 transition-all ${review.flagged ? 'border-red-200 bg-red-50/50' : 'border-border hover:shadow-md'
            }`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {review.serviceType}
                  </span>
                  {review.flagged && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Flagged
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{review.serviceName}</h3>
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                  </div>

                  <p className="text-muted-foreground text-sm">{review.comment}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                    <span>📍 {review.location}</span>
                    <span className="hidden sm:block">•</span>
                    <span>👤 {review.userName} ({review.userEmail})</span>
                    <span className="hidden sm:block">•</span>
                    <span>📅 {formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setSelectedReview(review)}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  View
                </button>

                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'approved')}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateReviewStatus(review.id, 'removed')}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Remove
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleFlag(review.id)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${review.flagged
                    ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {review.flagged ? 'Unflag' : 'Flag'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews found matching your criteria.</p>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-foreground">Review Details</h3>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                  {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedReview.serviceType}
                </span>
                {selectedReview.flagged && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Flagged as Inappropriate
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Service Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedReview.serviceName}</p>
                    <p><span className="font-medium">Type:</span> {selectedReview.serviceType}</p>
                    <p><span className="font-medium">Location:</span> {selectedReview.location}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">User Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedReview.userName}</p>
                    <p><span className="font-medium">Email:</span> {selectedReview.userEmail}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedReview.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Rating & Review</h4>
                <div className="flex items-center gap-3 mb-3">
                  {renderStars(selectedReview.rating)}
                  <span className="text-lg font-medium">({selectedReview.rating}/5)</span>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-foreground">{selectedReview.comment}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border">
                {selectedReview.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => {
                        updateReviewStatus(selectedReview.id, 'approved');
                        setSelectedReview({ ...selectedReview, status: 'approved' });
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Review
                    </button>
                    <button
                      onClick={() => {
                        updateReviewStatus(selectedReview.id, 'removed');
                        setSelectedReview({ ...selectedReview, status: 'removed' });
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Remove Review
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center text-muted-foreground">
                    Review has been {selectedReview.status}
                  </div>
                )}

                <button
                  onClick={() => {
                    toggleFlag(selectedReview.id);
                    setSelectedReview({ ...selectedReview, flagged: !selectedReview.flagged });
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${selectedReview.flagged
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {selectedReview.flagged ? 'Remove Flag' : 'Flag as Inappropriate'}
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