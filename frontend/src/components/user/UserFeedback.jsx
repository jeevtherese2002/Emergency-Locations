import React, { useState, useMemo } from 'react';
import { Star, MapPin, MessageSquare, Send, Eye, Search, Filter, X } from 'lucide-react';
import { toast } from "react-toastify"

const UserFeedback = () => {
    const [selectedService, setSelectedService] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [showExistingReviews, setShowExistingReviews] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedServiceTypes, setSelectedServiceTypes] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Dummy emergency services data
    const emergencyServices = [
        { id: 1, name: 'City General Hospital', type: 'Hospital', address: '123 Medical St' },
        { id: 2, name: 'Fire Station #3', type: 'Fire Station', address: '456 Safety Ave' },
        { id: 3, name: 'Central Police Station', type: 'Police', address: '789 Law St' },
        { id: 4, name: 'Emergency Clinic', type: 'Clinic', address: '321 Care Rd' },
        { id: 5, name: 'Metro Ambulance Service', type: 'Ambulance', address: '654 Response Blvd' },
        { id: 6, name: 'Westside Medical Center', type: 'Hospital', address: '987 Health Way' }
    ];

    // Service types for filtering
    const serviceTypes = ['Hospital', 'Fire Station', 'Police', 'Clinic', 'Ambulance'];

    // Filtered services based on search and service type filters
    const filteredServices = useMemo(() => {
        let filtered = emergencyServices;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(service =>
                service.name.toLowerCase().includes(query) ||
                service.type.toLowerCase().includes(query) ||
                service.address.toLowerCase().includes(query)
            );
        }

        // Filter by selected service types
        if (selectedServiceTypes.length > 0) {
            filtered = filtered.filter(service =>
                selectedServiceTypes.includes(service.type)
            );
        }

        return filtered;
    }, [searchQuery, selectedServiceTypes]);

    // Dummy existing reviews
    const existingReviews = {
        1: { // City General Hospital
            averageRating: 4.2,
            totalReviews: 23,
            reviews: [
                { id: 1, rating: 5, message: 'Excellent emergency care. Staff was very professional and quick.', date: '2024-01-20', anonymous: false, userName: 'Sarah M.' },
                { id: 2, rating: 4, message: 'Good service but long wait times during peak hours.', date: '2024-01-18', anonymous: true, userName: 'Anonymous' },
                { id: 3, rating: 3, message: 'Average experience. Could improve communication with patients.', date: '2024-01-15', anonymous: false, userName: 'John D.' }
            ]
        },
        2: { // Fire Station #3
            averageRating: 4.8,
            totalReviews: 15,
            reviews: [
                { id: 4, rating: 5, message: 'Outstanding response time and professionalism. Thank you!', date: '2024-01-19', anonymous: false, userName: 'Mike R.' },
                { id: 5, rating: 5, message: 'Heroes! Saved our home from a major fire.', date: '2024-01-12', anonymous: false, userName: 'Lisa K.' }
            ]
        }
    };

    const handleServiceSelect = (serviceId) => {
        setSelectedService(serviceId);
        setRating(0);
        setMessage('');
        setShowExistingReviews(false);
    };

    const handleServiceTypeToggle = (serviceType) => {
        setSelectedServiceTypes(prev =>
            prev.includes(serviceType)
                ? prev.filter(type => type !== serviceType)
                : [...prev, serviceType]
        );
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedServiceTypes([]);
    };

    const handleStarClick = (starRating) => {
        setRating(starRating);
    };

    const handleStarHover = (starRating) => {
        setHoverRating(starRating);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService) {
            toast.info("Please select a service to provide feedback for.");
            return;
        }

        if (rating === 0) {
            toast.info("Please provide a rating by selecting at least one star.");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            toast.success("Thank you for helping improve emergency services.");

            // Reset form
            setSelectedService('');
            setRating(0);
            setMessage('');
            setShowExistingReviews(false);
            setIsSubmitting(false);
        }, 1500);
    };

    const renderStars = (starRating, isInteractive = false) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => {
                    const starIndex = i + 1;
                    const isFilled = starIndex <= (isInteractive ? (hoverRating || rating) : starRating);

                    return (
                        <Star
                            key={i}
                            className={`w-6 h-6 cursor-pointer transition-all duration-200 ${isFilled
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300 hover:text-yellow-200'
                                } ${isInteractive ? 'hover:scale-110' : ''}`}
                            onClick={isInteractive ? () => handleStarClick(starIndex) : undefined}
                            onMouseEnter={isInteractive ? () => handleStarHover(starIndex) : undefined}
                            onMouseLeave={isInteractive ? () => setHoverRating(0) : undefined}
                        />
                    );
                })}
            </div>
        );
    };

    const selectedServiceData = emergencyServices.find(service => service.id === parseInt(selectedService));
    const serviceReviews = selectedService ? existingReviews[selectedService] : null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Report & Feedback</h1>
                <p className="text-muted-foreground mt-2">Share your experience with emergency services to help improve community safety</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Find Emergency Services
                    </h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors sm:w-auto w-full justify-center"
                    >
                        <Filter className="w-4 h-4" />
                        Filters {selectedServiceTypes.length > 0 && `(${selectedServiceTypes.length})`}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name, address, or service type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Service Type Filters */}
                {showFilters && (
                    <div className="mb-4 p-4 bg-muted/30 rounded-lg animate-fade-in">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {serviceTypes.map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleServiceTypeToggle(type)}
                                    className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${selectedServiceTypes.includes(type)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background border border-border text-foreground hover:border-primary/50'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        {(searchQuery || selectedServiceTypes.length > 0) && (
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                        {filteredServices.length === emergencyServices.length
                            ? `Showing all ${emergencyServices.length} services`
                            : `Found ${filteredServices.length} of ${emergencyServices.length} services`
                        }
                    </p>
                </div>

                {/* Services Grid */}
                {filteredServices.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {filteredServices.map(service => (
                            <button
                                key={service.id}
                                onClick={() => handleServiceSelect(service.id)}
                                className={`text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${selectedService === service.id.toString()
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-background hover:border-primary/50'
                                    }`}
                            >
                                <h3 className="font-medium text-foreground">{service.name}</h3>
                                <p className="text-sm text-muted-foreground">{service.type}</p>
                                <p className="text-xs text-muted-foreground mt-1">{service.address}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No services found matching your criteria.</p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-2 text-primary hover:text-primary/80 transition-colors"
                        >
                            Clear filters to see all services
                        </button>
                    </div>
                )}
            </div>

            {/* Rating and Feedback Form */}
            {selectedService && (
                <div className="bg-card border border-border rounded-lg p-6 animate-fade-in">
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Rate Your Experience with {selectedServiceData?.name}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                How would you rate this service? <span className="text-destructive">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                {renderStars(rating, true)}
                                {(hoverRating || rating) > 0 && (
                                    <span className="text-sm text-muted-foreground animate-fade-in">
                                        {hoverRating || rating} out of 5 stars
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Share your experience (optional)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your experience with this emergency service. Your feedback helps improve community safety..."
                                className="w-full h-24 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200"
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1">{message.length}/500 characters</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full md:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 justify-center transition-all duration-200 ${isSubmitting
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-primary/90 hover:scale-105'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Submit Feedback
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Existing Reviews Section */}
            {selectedService && serviceReviews && (
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            Community Reviews
                        </h3>
                        <button
                            onClick={() => setShowExistingReviews(!showExistingReviews)}
                            className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            {showExistingReviews ? 'Hide' : 'View'} Reviews
                        </button>
                    </div>

                    {/* Average Rating */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            {renderStars(Math.round(serviceReviews.averageRating))}
                            <span className="text-lg font-semibold text-foreground">
                                {serviceReviews.averageRating}
                            </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            ({serviceReviews.totalReviews} reviews)
                        </span>
                    </div>

                    {/* Individual Reviews */}
                    {showExistingReviews && (
                        <div className="space-y-4 animate-fade-in">
                            {serviceReviews.reviews.map(review => (
                                <div key={review.id} className="bg-muted/50 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            {renderStars(review.rating)}
                                            <span className="text-sm font-medium text-foreground">
                                                {review.userName}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserFeedback;
