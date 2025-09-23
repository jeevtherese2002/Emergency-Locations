import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Edit, Trash2, Eye, EyeOff, X, Mail } from 'lucide-react';
import * as LucideIcons from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const ViewLocations = ({ onMenuItemClick }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Existing local locations list (kept as-is)
  const [services, setServices] = useState([]);

  // Services for the filter grid: NOW derived only from services that have locations
  const [serviceTypes, setServiceTypes] = useState([]);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Helpers (same mapping behavior as in AddLocation)
  const colorClasses = {
    'rose-500': 'text-rose-500',
    'blue-600': 'text-blue-600',
    'red-600': 'text-red-600',
    'emerald-500': 'text-emerald-500',
    'amber-500': 'text-amber-500',
  };

  const toPascal = (s) =>
    String(s || "")
      .split(/[-_ ]+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");

  const buildCandidates = (raw) => {
    if (!raw) return [];
    const r = String(raw).trim();
    const lower = r.toLowerCase();

    const strippedIcon = lower.replace(/icon$/i, "");
    const strippedLucide = strippedIcon.replace(/^lucide/i, "");
    const stripNonAlnum = strippedLucide.replace(/[^a-z0-9]+/gi, "");

    const candidates = new Set([
      lower,
      strippedIcon,
      strippedLucide,
      stripNonAlnum,
      toPascal(lower),
      toPascal(strippedIcon),
      toPascal(strippedLucide),
    ]);

    return Array.from(candidates).filter(Boolean);
  };

  const getIconComponentById = (id) => {
    if (!id) return LucideIcons.Hospital; // fallback
    const candidates = buildCandidates(id);
    for (const cand of candidates) {
      const pascal = toPascal(cand);
      if (LucideIcons[pascal]) return LucideIcons[pascal];
      const exactLowerKey = Object.keys(LucideIcons).find(k => k.toLowerCase() === cand.toLowerCase());
      if (exactLowerKey) return LucideIcons[exactLowerKey];
    }
    const lowerId = String(id).toLowerCase();
    const keys = Object.keys(LucideIcons);
    const includeMatch = keys.find(k => k.toLowerCase().includes(lowerId) || lowerId.includes(k.toLowerCase()));
    if (includeMatch) return LucideIcons[includeMatch];
    return LucideIcons.Hospital;
  };

  const getColorProps = (color) => {
    if (!color) return { className: "", style: {} };
    if (colorClasses[color]) {
      return { className: colorClasses[color], style: {} };
    }
    return { className: "", style: { color } }; // assume hex/rgb/etc
  };

  // Init map (unchanged)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz",
      center: [76.5222, 9.590026],
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl());

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];

          new mapboxgl.Marker({ color: "blue" })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup().setHTML("<b>Your Location</b>"))
            .addTo(mapRef.current);

          mapRef.current.flyTo({ center: coords, zoom: 14 });
        },
        () => {
          console.warn("Location permission denied");
        }
      );
    }

    return () => mapRef.current?.remove();
  }, []);

  // Existing dummy locations (kept)
  const initialServices = [
    {
      id: 1,
      category: 'police',
      name: 'Central Police Station',
      address: '123 Main St, Downtown',
      phone: '+1 234 567 8900',
      phone2: '',
      email: "jerry@gmail.com",
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
      email: "jerry@gmail.com",
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
      email: "jerry@gmail.com",
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
      email: "jerry@gmail.com",
      lat: 40.7831,
      lng: -73.9712,
      status: 'active',
      icon: '🚑'
    },
  ];

  useEffect(() => {
    setServices(initialServices);
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

  // IMPORTANT CHANGE: Fetch enabled locations and derive service types that have locations
  useEffect(() => {
    const fetchLocationsAndBuildServices = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/locations`, {
          method: "GET",
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to fetch locations:", data?.message);
          return;
        }

        const unique = new Map();
        (data.data || []).forEach(loc => {
          const s = loc?.serviceId;
          if (s && s._id && !unique.has(s._id)) {
            const rawIcon = s.icon || s.iconId || s.iconName;
            unique.set(s._id, {
              _id: s._id,
              name: s.name,
              iconId: String(rawIcon || "").trim(),
              icon: rawIcon,
              color: s.color,
              IconComponent: getIconComponentById(rawIcon),
            });
          }
        });

        setServiceTypes(Array.from(unique.values()));
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocationsAndBuildServices();
  }, []);

  const toggleFilter = (id) => {
    setSelectedFilters(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  // Existing filteredServices (kept; not tied to the map in this view)
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
      email: formData.get('email'),
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
      {/* Filter Section - now shows only services that have locations */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Admin Map View - Emergency Services</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {serviceTypes.length > 0 ? (
              serviceTypes.map((service) => {
                const IconComponent = service.IconComponent || getIconComponentById(service.icon || service.iconId);
                const colorProps = getColorProps(service.color);
                const isSelected = selectedFilters.includes(service._id);

                return (
                  <button
                    key={service._id}
                    onClick={() => toggleFilter(service._id)}
                    className={`p-4 border-2 rounded-lg transition-all hover:bg-accent flex flex-col items-center gap-2
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                  >
                    <IconComponent className={`h-6 w-6 ${colorProps.className}`} style={colorProps.style} />
                    <span className="text-xs font-medium text-center">
                      {service.name || service.iconId}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full text-sm text-muted-foreground">
                No services with locations available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Area (unchanged) */}
      <div className="flex-1 relative bg-gradient-subtle">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />

        {/* Service Details Popup */}
        {selectedService && !showEditForm && !showDeleteConfirm && (
          <div className="absolute inset-x-4 bottom-4 bg-card border border-border rounded-lg shadow-elegant p-4 z-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedService.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${selectedService.status === 'active'
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
                    <>
                      <Phone className="w-4 h-4 ml-4" />
                      {selectedService.phone2}
                    </>
                  )}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {selectedService.email}
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
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 ${selectedService.status === 'active'
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

        {/* Edit Form Popup (unchanged) */}
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

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={editingService.email}
                      required
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
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

        {/* Delete Confirmation Popup (unchanged) */}
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