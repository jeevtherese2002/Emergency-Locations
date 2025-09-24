import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Share2, Navigation, X, Mail, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MapboxMap from './MapboxMap';
import * as LucideIcons from "lucide-react";

const Dashboard = ({ onMenuItemClick }) => {
  const [selectedFilters, setSelectedFilters] = useState([]); // serviceId[]
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]); // services with at least one location
  const [locations, setLocations] = useState([]);
  const [destination, setDestination] = useState(null);
  const [routeActive, setRouteActive] = useState(false); // show/hide Clear button

  const navigate = useNavigate(); // NEW
  const BASE_URL = import.meta.env.VITE_BASE_URL;

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
    if (!id) return LucideIcons.Hospital;
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

  // Fetch enabled locations and derive services-for-filter
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/locations`, { method: "GET", headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (!res.ok) {
          console.error("Failed to fetch locations:", data?.message);
          return;
        }

        const unique = new Map();
        const mapped = (data.data || []).map(loc => {
          const s = loc?.serviceId;
          const rawIcon = s?.icon || s?.iconId || s?.iconName;
          const svc = s && s._id ? {
            _id: s._id,
            name: s.name,
            iconId: String(rawIcon || "").trim(),
            color: s.color,
            IconComponent: getIconComponentById(rawIcon),
          } : null;

          if (svc && !unique.has(svc._id)) unique.set(svc._id, svc);

          return {
            _id: loc._id,
            name: loc.name,
            address: loc.address,
            phone1: loc.phone1,
            phone2: loc.phone2,
            email: loc.email,
            latitude: loc.latitude,
            longitude: loc.longitude,
            service: svc,
          };
        });

        setLocations(mapped);
        setServiceTypes(Array.from(unique.values()));
      } catch (e) {
        console.error("Failed to load locations:", e);
      }
    };

    fetchLocations();
  }, [BASE_URL]);

  const toggleFilter = (serviceId) => {
    setSelectedFilters(prev => prev.includes(serviceId)
      ? prev.filter(id => id !== serviceId)
      : [...prev, serviceId]
    );
  };

  const handleCall = (phone) => {
    if (!phone) return;
    window.open(`tel:${phone}`);
  };

  const handleShare = (loc) => {
    const text = `${loc.name} - ${loc.address}${loc.phone1 ? ` - ${loc.phone1}` : ''}`;
    if (navigator.share) {
      navigator.share({ title: loc.name, text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('Service details copied to clipboard!');
    }
  };

  const handleGetDirections = (loc) => {
    setDestination({ longitude: loc.longitude, latitude: loc.latitude });
  };

  const clearDirections = () => {
    setDestination(null);
  };

  const baseActionCols = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Filter Section - services with locations */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Emergency Services</h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
            {/* NEW: SOS tile (first item) */}
            <button
              onClick={() => navigate('/user/sos')}
              className="h-14 sm:h-16 p-0.5 rounded-lg border-2 border-red-600/60
                         bg-gradient-to-b from-red-600 to-red-700 text-white
                         shadow-[0_6px_20px_rgba(220,38,38,0.35)]
                         hover:brightness-110 active:scale-[0.98] transition"
              aria-label="Open SOS Alert"
              title="Open SOS Alert"
            >
              <div className="h-full w-full rounded-md flex flex-col items-center justify-center gap-1 sm:gap-2 bg-red-600/10">
                <AlertTriangle className="h-6 w-6" />
                <span className="text-xs font-semibold tracking-wide">SOS</span>
              </div>
            </button>

            {serviceTypes.length > 0 ? (
              serviceTypes.map((service) => {
                const IconComponent = service.IconComponent || getIconComponentById(service.icon || service.iconId);
                const isSelected = selectedFilters.includes(service._id);

                return (
                  <button
                    key={service._id}
                    onClick={() => toggleFilter(service._id)}
                    className={`h-14 sm:h-18 p-2 sm:p-3 border-2 rounded-lg transition-all hover:bg-accent
                          flex flex-col items-center justify-center gap-1 sm:gap-2
                          ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                  >
                    <IconComponent className="h-6 w-6" style={{ color: service.color || '#2563eb' }} />
                    <span className="text-xs font-medium text-center truncate w-full">
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

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapboxMap
          locations={locations}
          selectedFilters={selectedFilters}
          onMarkerClick={setSelectedLocation}
          destination={destination}
          onRouteActiveChange={setRouteActive}
        />

        {/* Location Details Popup */}
        {selectedLocation && (
          <div className="absolute inset-x-2 sm:inset-x-4 bottom-2 sm:bottom-4 bg-card border border-border rounded-lg shadow-elegant p-3 sm:p-4 z-50">
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{selectedLocation.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-none" />
                  <span className="truncate">{selectedLocation.address}</span>
                </p>
                {selectedLocation.phone1 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-4 h-4 flex-none" />
                    {selectedLocation.phone1}
                    {selectedLocation.phone2 && (
                      <>
                        <Phone className="w-4 h-4 ml-4 flex-none" />
                        {selectedLocation.phone2}
                      </>
                    )}
                  </p>
                )}
                {selectedLocation.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4 flex-none" />
                    <span className="truncate">{selectedLocation.email}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-muted-foreground hover:text-foreground p-1 flex-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className={`grid ${baseActionCols} gap-2`}>
              {selectedLocation.phone1 && (
                <button
                  onClick={() => handleCall(selectedLocation.phone1)}
                  className="w-full bg-primary text-primary-foreground py-2 px-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call</span>
                </button>
              )}
              <button
                onClick={() => handleGetDirections(selectedLocation)}
                className="w-full bg-green-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span className="text-sm">Directions</span>
              </button>
              <button
                onClick={() => handleShare(selectedLocation)}
                className="w-full bg-muted text-foreground py-2 px-3 rounded-lg font-medium hover:bg-muted/80 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>

              {routeActive && (
                <button
                  onClick={clearDirections}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-foreground py-2 px-3 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
                  title="Clear directions"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm">Clear</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;