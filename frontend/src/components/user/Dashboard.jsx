import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Share2, Navigation, X, Mail } from 'lucide-react';
import MapboxMap from './MapboxMap';
import * as LucideIcons from "lucide-react";

const Dashboard = ({ onMenuItemClick }) => {
  const [selectedFilters, setSelectedFilters] = useState([]); // array of serviceId strings
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]); // services that have at least one location
  const [locations, setLocations] = useState([]);

  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Helpers to resolve Lucide icon ids to components (same logic as admin)
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
        const res = await fetch(`${BASE_URL}/api/locations`, {
          method: "GET",
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to fetch locations:", data?.message);
          return;
        }

        const uniqueServices = new Map();

        const mapped = (data.data || []).map(loc => {
          const s = loc?.serviceId;
          const rawIcon = s?.icon || s?.iconId || s?.iconName;
          const serviceObj = s && s._id ? {
            _id: s._id,
            name: s.name,
            iconId: String(rawIcon || "").trim(),
            color: s.color,
            IconComponent: getIconComponentById(rawIcon),
          } : null;

          if (serviceObj && !uniqueServices.has(serviceObj._id)) {
            uniqueServices.set(serviceObj._id, serviceObj);
          }

          return {
            _id: loc._id,
            name: loc.name,
            address: loc.address,
            phone1: loc.phone1,
            phone2: loc.phone2,
            email: loc.email,
            latitude: loc.latitude,
            longitude: loc.longitude,
            service: serviceObj,
          };
        });

        setLocations(mapped);
        setServiceTypes(Array.from(uniqueServices.values()));
      } catch (e) {
        console.error("Failed to load locations:", e);
      }
    };

    fetchLocations();
  }, [BASE_URL]);

  const toggleFilter = (serviceId) => {
    setSelectedFilters(prev =>
      prev.includes(serviceId)
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
      navigator.share({
        title: loc.name,
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Service details copied to clipboard!');
    }
  };

  const handleGetDirections = (loc) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Filter Section - services with locations (same UX as admin) */}
      <div className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">Emergency Services</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {serviceTypes.length > 0 ? (
              serviceTypes.map((service) => {
                const IconComponent = service.IconComponent || getIconComponentById(service.icon || service.iconId);
                const isSelected = selectedFilters.includes(service._id);

                return (
                  <button
                    key={service._id}
                    onClick={() => toggleFilter(service._id)}
                    className={`p-4 border-2 rounded-lg transition-all hover:bg-accent flex flex-col items-center gap-2
                      ${isSelected ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                  >
                    <IconComponent className="h-6 w-6" style={{ color: service.color || '#2563eb' }} />
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

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapboxMap
          locations={locations}
          selectedFilters={selectedFilters}
          onMarkerClick={setSelectedLocation}
        />

        {/* Location Details Popup (no edit/delete/toggle for user) */}
        {selectedLocation && (
          <div className="absolute inset-x-4 bottom-4 bg-card border border-border rounded-lg shadow-elegant p-4 z-50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedLocation.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedLocation.address}
                </p>
                {selectedLocation.phone1 && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Phone className="w-4 h-4" />
                    {selectedLocation.phone1}
                    {selectedLocation.phone2 && (
                      <>
                        <Phone className="w-4 h-4 ml-4" />
                        {selectedLocation.phone2}
                      </>
                    )}
                  </p>
                )}
                {selectedLocation.email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="w-4 h-4" />
                    {selectedLocation.email}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              {selectedLocation.phone1 && (
                <button
                  onClick={() => handleCall(selectedLocation.phone1)}
                  className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              )}
              <button
                onClick={() => handleGetDirections(selectedLocation)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
              <button
                onClick={() => handleShare(selectedLocation)}
                className="flex-1 bg-muted text-foreground py-2 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;