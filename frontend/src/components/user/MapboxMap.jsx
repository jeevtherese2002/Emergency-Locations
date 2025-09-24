// /src/components/user/MapboxMap.jsx

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { createRoot } from 'react-dom/client';
import * as LucideIcons from "lucide-react";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({ locations = [], selectedFilters = [], onMarkerClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const markersRef = useRef([]); // [{ marker, root }]

  // Safely unmount marker React roots after current commit
  const scheduleRootUnmount = (root) => {
    if (!root?.unmount) return;
    queueMicrotask(() => {
      try { root.unmount(); } catch {}
    });
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

  useEffect(() => {
    // Init map centered on user's geolocation if available
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        };

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz',
          center: [userCoords.lng, userCoords.lat],
          zoom: 13,
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl());

        // Geocoder
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl,
          marker: false,
          placeholder: 'Search location...',
          types: 'poi,place,address,neighborhood,locality,region,country',
        });
        mapRef.current.addControl(geocoder, 'top-left');
        geocoderRef.current = geocoder;

        // Bias to user's location
        try {
          geocoder.setProximity({ longitude: userCoords.lng, latitude: userCoords.lat });
        } catch {}

        geocoder.on('result', (e) => {
          const coords = e.result?.center || e.result?.geometry?.coordinates;
          if (!coords) return;

          try {
            if (searchMarkerRef.current) {
              searchMarkerRef.current.remove();
              searchMarkerRef.current = null;
            }
          } catch {}
          searchMarkerRef.current = new mapboxgl.Marker({ color: '#111827' }) // neutral-900
            .setLngLat(coords)
            .addTo(mapRef.current);

          mapRef.current.flyTo({ center: coords, zoom: 14 });
        });

        geocoder.on('clear', () => {
          try {
            if (searchMarkerRef.current) {
              searchMarkerRef.current.remove();
              searchMarkerRef.current = null;
            }
          } catch {}
        });

        // Add user location marker
        userMarkerRef.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([userCoords.lng, userCoords.lat])
          .setPopup(new mapboxgl.Popup().setText('Your Location'))
          .addTo(mapRef.current);
      },
      // Permission denied or error: init map at fallback center
      () => {
        const fallback = { lng: 76.5222, lat: 9.590026 };
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz',
          center: [fallback.lng, fallback.lat],
          zoom: 12,
        });
        mapRef.current.addControl(new mapboxgl.NavigationControl());

        // Geocoder
        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl,
          marker: false,
          placeholder: 'Search location...',
          types: 'poi,place,address,neighborhood,locality,region,country',
        });
        mapRef.current.addControl(geocoder, 'top-left');
        geocoderRef.current = geocoder;

        geocoder.on('result', (e) => {
          const coords = e.result?.center || e.result?.geometry?.coordinates;
          if (!coords) return;

          try {
            if (searchMarkerRef.current) {
              searchMarkerRef.current.remove();
              searchMarkerRef.current = null;
            }
          } catch {}
          searchMarkerRef.current = new mapboxgl.Marker({ color: '#111827' })
            .setLngLat(coords)
            .addTo(mapRef.current);

          mapRef.current.flyTo({ center: coords, zoom: 14 });
        });

        geocoder.on('clear', () => {
          try {
            if (searchMarkerRef.current) {
              searchMarkerRef.current.remove();
              searchMarkerRef.current = null;
            }
          } catch {}
        });
      }
    );

    return () => {
      try {
        if (searchMarkerRef.current) {
          searchMarkerRef.current.remove();
          searchMarkerRef.current = null;
        }
      } catch {}
      try {
        if (geocoderRef.current) {
          mapRef.current?.removeControl(geocoderRef.current);
          geocoderRef.current = null;
        }
      } catch {}
      if (markersRef.current.length) {
        markersRef.current.forEach(({ marker, root }) => {
          try { marker.remove(); } catch {}
          scheduleRootUnmount(root);
        });
        markersRef.current = [];
      }
      mapRef.current?.remove();
    };
  }, []);

  // Render colored markers with Lucide icons
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old service markers
    markersRef.current.forEach(({ marker, root }) => {
      try { marker.remove(); } catch {}
      scheduleRootUnmount(root);
    });
    markersRef.current = [];

    const visible = selectedFilters.length === 0
      ? locations
      : locations.filter(l => l.service && selectedFilters.includes(l.service._id));

    visible.forEach(loc => {
      if (!isFinite(loc.longitude) || !isFinite(loc.latitude)) return;

      const IconComponent = loc.service?.IconComponent
        || getIconComponentById(loc.service?.iconId || loc.selectedIcon);
      const bg = loc.service?.color || '#2563eb';

      const el = document.createElement('div');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      el.style.background = bg;
      el.style.cursor = 'pointer';

      const root = createRoot(el);
      root.render(
        <IconComponent style={{ color: '#ffffff', width: 22, height: 22 }} />
      );

      el.addEventListener('click', () => {
        onMarkerClick?.(loc);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(mapRef.current);

      markersRef.current.push({ marker, root });
    });

    // Optionally fit to visible markers
    // if (visible.length > 0) {
    //   const bounds = new mapboxgl.LngLatBounds();
    //   visible.forEach(l => bounds.extend([l.longitude, l.latitude]));
    //   mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 500 });
    // }
  }, [locations, selectedFilters, onMarkerClick]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
  );
};

export default MapboxMap;