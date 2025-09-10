import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Share2, Navigation } from 'lucide-react';
import MapboxMap from './MapboxMap';

const Dashboard = ({ onMenuItemClick }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Dummy data for emergency services
  const emergencyCategories = [
    { id: 'police', name: 'Police', icon: '🚔', color: 'bg-blue-500' },
    { id: 'hospital', name: 'Hospital', icon: '🏥', color: 'bg-red-500' },
    { id: 'fire', name: 'Fire Station', icon: '🚒', color: 'bg-orange-500' },
    { id: 'ambulance', name: 'Ambulance', icon: '🚑', color: 'bg-green-500' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊', color: 'bg-purple-500' },
    { id: 'gas', name: 'Gas Station', icon: '⛽', color: 'bg-yellow-500' },
  ];

  const emergencyServices = [
    {
      id: 1,
      category: 'police',
      name: 'Central Police Station',
      address: '123 Main St, Downtown',
      phone: '+1 234 567 8900',
      lat: 40.7128,
      lng: -74.0060,
    },
    {
      id: 2,
      category: 'hospital',
      name: 'City General Hospital',
      address: '456 Health Ave, Medical District',
      phone: '+1 234 567 8901',
      lat: 40.7580,
      lng: -73.9855,
    },
    {
      id: 3,
      category: 'fire',
      name: 'Fire Station #1',
      address: '789 Fire Rd, Safety Zone',
      phone: '+1 234 567 8902',
      lat: 40.7306,
      lng: -73.9352,
    },
    {
      id: 4,
      category: 'ambulance',
      name: 'Emergency Medical Services',
      address: '321 Rescue Blvd, Emergency District',
      phone: '+1 234 567 8903',
      lat: 40.7831,
      lng: -73.9712,
    },
    {
      id: 5,
      category: 'pharmacy',
      name: '24/7 Community Pharmacy',
      address: '654 Wellness St, Health Plaza',
      phone: '+1 234 567 8904',
      lat: 40.7489,
      lng: -73.9680,
    },
    {
      id: 6,
      category: 'gas',
      name: 'Quick Fill Gas Station',
      address: '987 Fuel Ave, Auto District',
      phone: '+1 234 567 8905',
      lat: 40.7282,
      lng: -74.0776,
    },
  ];

  // Simulate getting user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to NYC coordinates
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  const toggleFilter = (categoryId) => {
    setSelectedFilters(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredServices = selectedFilters.length === 0
    ? emergencyServices
    : emergencyServices.filter(service => selectedFilters.includes(service.category));

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`);
  };

  const handleShare = (service) => {
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `${service.name} - ${service.address}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(`${service.name} - ${service.address} - ${service.phone}`);
      alert('Service details copied to clipboard!');
    }
  };

  const handleGetDirections = (service) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Filter Section */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Emergency Services</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {emergencyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleFilter(category.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 min-w-[80px] ${selectedFilters.includes(category.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${selectedFilters.includes(category.id) ? category.color : 'bg-muted'
                  }`}>
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1">
        <MapboxMap
          userLocation={userLocation}
          services={filteredServices}
          onMarkerClick={handleServiceClick}
        />
      </div>

    </div>
  );
};

export default Dashboard;