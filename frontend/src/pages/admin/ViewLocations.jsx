import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Share2, Navigation, Edit, Trash2, Eye, EyeOff, X, View } from 'lucide-react';

const ViewLocations = ({ onMenuItemClick }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [services, setServices] = useState([]);

  // Dummy data for emergency services
  const emergencyCategories = [
    { id: 'police', name: 'Police', icon: '🚔', color: 'bg-blue-500' },
    { id: 'hospital', name: 'Hospital', icon: '🏥', color: 'bg-red-500' },
    { id: 'fire', name: 'Fire Station', icon: '🚒', color: 'bg-orange-500' },
    { id: 'ambulance', name: 'Ambulance', icon: '🚑', color: 'bg-green-500' },
    { id: 'pharmacy', name: 'Pharmacy', icon: '💊', color: 'bg-purple-500' },
    { id: 'gas', name: 'Gas Station', icon: '⛽', color: 'bg-yellow-500' },
  ];

  const initialServices = [
    {
      id: 1,
      category: 'police',
      name: 'Central Police Station',
      address: '123 Main St, Downtown',
      phone: '+1 234 567 8900',
      phone2: '',
      lat: 40.7128,
      lng: -74.0060,
      status: 'active',
      icon: '🚔'
    },
    {
      id: 2,
      category: 'hospital',
      name: 'City General Hospital',
      address: '456 Health Ave, Medical District',
      phone: '+1 234 567 8901',
      phone2: '+1 234 567 8911',
      lat: 40.7580,
      lng: -73.9855,
      status: 'active',
      icon: '🏥'
    },
    {
      id: 3,
      category: 'fire',
      name: 'Fire Station #1',
      address: '789 Fire Rd, Safety Zone',
      phone: '+1 234 567 8902',
      phone2: '',
      lat: 40.7306,
      lng: -73.9352,
      status: 'disabled',
      icon: '🚒'
    },
    {
      id: 4,
      category: 'ambulance',
      name: 'Emergency Medical Services',
      address: '321 Rescue Blvd, Emergency District',
      phone: '+1 234 567 8903',
      phone2: '',
      lat: 40.7831,
      lng: -73.9712,
      status: 'active',
      icon: '🚑'
    },
  ];

  useEffect(() => {
    setServices(initialServices);
    // Simulate getting user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
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
    ? services 
    : services.filter(service => selectedFilters.includes(service.category));

  const handleServiceClick = (service) => {
    setSelectedService(service);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowEditForm(true);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setServices(prev => prev.filter(s => s.id !== selectedService.id));
    setShowDeleteConfirm(false);
    setSelectedService(null);
  };

  const toggleStatus = (service) => {
    setServices(prev => prev.map(s => 
      s.id === service.id 
        ? { ...s, status: s.status === 'active' ? 'disabled' : 'active' }
        : s
    ));
    if (selectedService && selectedService.id === service.id) {
      setSelectedService({ ...service, status: service.status === 'active' ? 'disabled' : 'active' });
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedService = {
      ...editingService,
      name: formData.get('name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      phone2: formData.get('phone2'),
    };
    
    setServices(prev => prev.map(s => 
      s.id === editingService.id ? updatedService : s
    ));
    
    if (selectedService && selectedService.id === editingService.id) {
      setSelectedService(updatedService);
    }
    
    setShowEditForm(false);
    setEditingService(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Filter Section */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Admin Map View - Emergency Services</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {emergencyCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleFilter(category.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 min-w-[80px] ${
                  selectedFilters.includes(category.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                  selectedFilters.includes(category.id) ? category.color : 'bg-muted'
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
      <div className="flex-1 relative bg-gradient-subtle">
        {/* Mock Map Container */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
          {/* User Location Marker */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs bg-black text-white px-2 py-1 rounded whitespace-nowrap">
                Your Location
              </span>
            </div>
          )}

          {/* Service Markers */}
          {filteredServices.map((service, index) => {
            const category = emergencyCategories.find(cat => cat.id === service.category);
            return (
              <div
                key={service.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 ${
                  service.status === 'disabled' ? 'opacity-50' : ''
                }`}
                style={{
                  top: `${30 + (index * 10) % 40}%`,
                  left: `${25 + (index * 15) % 50}%`,
                }}
                onClick={() => handleServiceClick(service)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white ${category.color} relative`}>
                  {category.icon}
                  {service.status === 'disabled' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <EyeOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Map Placeholder Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Admin Map View</p>
              <p className="text-sm">Click on service markers to manage</p>
            </div>
          </div>
        </div>

        {/* Service Details Popup */}
        {selectedService && !showEditForm && !showDeleteConfirm && (
          <div className="absolute inset-x-4 bottom-4 bg-card border border-border rounded-lg shadow-elegant p-4 z-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedService.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedService.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {selectedService.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedService.address}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Phone className="w-4 h-4" />
                  {selectedService.phone}
                  {selectedService.phone2 && (
                    <span className="ml-2">• {selectedService.phone2}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleStatus(selectedService)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${
                  selectedService.status === 'active'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {selectedService.status === 'active' ? (
                  <><EyeOff className="w-4 h-4" /> Disable</>
                ) : (
                  <><Eye className="w-4 h-4" /> Enable</>
                )}
              </button>
              <button
                onClick={() => handleEdit(selectedService)}
                className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedService)}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Edit Form Popup */}
        {showEditForm && editingService && (
          <div className="absolute inset-4 bg-card border border-border rounded-lg shadow-elegant p-6 z-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-foreground">Edit Service</h3>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingService.name}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  defaultValue={editingService.address}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primary Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingService.phone}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    name="phone2"
                    defaultValue={editingService.phone2}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && selectedService && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-lg shadow-elegant p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Delete Service</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete "{selectedService.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewLocations;