// /src/components/user/MapboxMap.jsx

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import { createRoot } from 'react-dom/client';
import * as LucideIcons from "lucide-react";
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../assets/css/mapbox-overrides.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({
  locations = [],
  selectedFilters = [],
  onMarkerClick,
  destination,
  onRouteActiveChange,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const geocoderRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const directionsRef = useRef(null);
  const markersRef = useRef([]); // [{ marker, root, el }]
  const routeActiveRef = useRef(false);
  const userOriginRef = useRef(null); // [lng, lat]
  const clearCtrlElRef = useRef(null); // top-left X control
  const toggleCtrlElRef = useRef(null); // floating »/« control
  const collapsedRef = useRef(false);
  const geocoderObserverRef = useRef(null); // NEW: observer to dedupe geocoders

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

  // Top-left Clear (X) control
  class ClearRouteControl {
    constructor(onClear, onReady) {
      this._container = null;
      this._onClear = onClear;
      this._onReady = onReady;
    }
    onAdd() {
      const container = document.createElement('div');
      container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
      container.style.marginTop = '4px';
      container.style.marginLeft = '4px';
      container.style.zIndex = '1001';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mapboxgl-ctrl-icon';
      btn.title = 'Close directions';
      btn.style.fontSize = '18px';
      btn.style.fontWeight = 'bold';
      btn.style.lineHeight = '1';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.textContent = '×';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onClear?.();
      });

      container.appendChild(btn);
      container.style.display = 'none'; // hidden until route appears
      this._container = container;
      this._onReady?.(container);
      return container;
    }
    onRemove() {
      if (this._container?.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._container = null;
    }
  }

  // Floating minimize/expand »/« control
  class DirectionsToggleControl {
    constructor(onToggle, getCollapsed, onReady) {
      this._container = null;
      this._onToggle = onToggle;
      this._getCollapsed = getCollapsed;
      this._onReady = onReady;
    }
    onAdd(map) {
      const container = document.createElement('div');
      // Absolute overlay so it’s reachable on mobile even with the panel
      container.style.position = 'absolute';
      container.style.right = '2px';
      container.style.top = '90px';
      container.style.zIndex = '1002';
      container.style.pointerEvents = 'auto';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = 'Collapse/expand directions';
      btn.style.background = 'rgba(17,17,17,0.85)';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.width = '32px';
      btn.style.height = '28px';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.fontWeight = 'bold';
      btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.25)';
      btn.textContent = this._getCollapsed?.() ? '«' : '»';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const next = !this._getCollapsed?.();
        this._onToggle?.(next);
        btn.textContent = next ? '«' : '»';
      });

      container.appendChild(btn);
      container.style.display = 'none'; // hidden until route appears
      this._container = container;
      this._onReady?.(container);
      // Append to map container (not corner controls)
      map.getContainer().appendChild(container);
      return container;
    }
    onRemove() {
      if (this._container?.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._container = null;
    }
  }

  const showElement = (el, show) => {
    if (!el) return;
    el.style.display = show ? '' : 'none';
  };

  const notifyRouteActive = (active) => {
    routeActiveRef.current = active;
    showElement(clearCtrlElRef.current, active);
    showElement(toggleCtrlElRef.current, active);
    onRouteActiveChange?.(active);
  };

  // NEW: keep only the primary geocoder (remove any duplicates)
  const cleanupExtraGeocoders = () => {
    const mapEl = mapRef.current?.getContainer();
    const primary = geocoderRef.current?._container;
    if (!mapEl || !primary) return;
    const all = Array.from(
      mapEl.querySelectorAll('.mapboxgl-ctrl-top-left .mapboxgl-ctrl-geocoder')
    );
    all.forEach((el) => {
      if (el !== primary) {
        try { el.remove(); } catch {}
      }
    });
  };

  // NEW: collapse by toggling a class on the map container. CSS will force-hide the panel.
  const setDirectionsCollapsed = (collapsed) => {
    collapsedRef.current = collapsed;
    const mapEl = mapRef.current?.getContainer();
    if (mapEl) {
      mapEl.classList.toggle('directions-collapsed', collapsed);
    }
    try {
      const btn = toggleCtrlElRef.current?.querySelector('button');
      if (btn) btn.textContent = collapsed ? '«' : '»';
    } catch {}
  };

  const clearDirections = () => {
    if (!directionsRef.current) return;
    try {
      directionsRef.current.removeRoutes();
      try { directionsRef.current.setDestination(); } catch {}
      if (userOriginRef.current) {
        try { directionsRef.current.setOrigin(userOriginRef.current); } catch {}
      }
      notifyRouteActive(false);
      setDirectionsCollapsed(false);
      cleanupExtraGeocoders(); // ensure any extra geocoder goes away
    } catch {}
  };

  const setupCommonControls = (center) => {
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // Add top-left Clear (X) first so it’s reachable on mobile
    const clearCtrl = new ClearRouteControl(clearDirections, (el) => {
      clearCtrlElRef.current = el;
      el.style.display = 'none';
    });
    mapRef.current.addControl(clearCtrl, 'top-left');

    // Geocoder (top-left)
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: 'Search location...',
      types: 'poi,place,address,neighborhood,locality,region,country',
    });
    mapRef.current.addControl(geocoder, 'top-left');
    geocoderRef.current = geocoder;

    // Tag the primary geocoder so we can keep it
    try { geocoderRef.current._container.setAttribute('data-primary-geocoder', 'true'); } catch {}

    // Watch the top-left control stack and remove any extra geocoders that appear
    try {
      const topLeft = mapRef.current.getContainer().querySelector('.mapboxgl-ctrl-top-left');
      if (topLeft) {
        geocoderObserverRef.current = new MutationObserver(() => cleanupExtraGeocoders());
        geocoderObserverRef.current.observe(topLeft, { childList: true });
      }
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

    // Constrain geocoder width on mobile
    try {
      const el = geocoder._container;
      if (el) {
        el.style.maxWidth = '75vw';
        el.style.minWidth = '160px';
      }
    } catch {}

    // Directions control (panel on right)
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      alternatives: true,
      geometries: 'geojson',
      controls: {
        inputs: false,
        instructions: true,
        profileSwitcher: false,
      },
    });
    mapRef.current.addControl(directions, 'top-right');
    directionsRef.current = directions;

    directions.on('route', () => {
      notifyRouteActive(true);
      cleanupExtraGeocoders(); // remove any extra geocoder that showed up
    });
    directions.on('clear', () => {
      notifyRouteActive(false);
      cleanupExtraGeocoders();
    });

    // Floating »/« toggle overlay (right side)
    const toggleCtrl = new DirectionsToggleControl(
      setDirectionsCollapsed,
      () => collapsedRef.current,
      (el) => { toggleCtrlElRef.current = el; }
    );
    mapRef.current.addControl(toggleCtrl, 'top-right');

    // Clear directions when clicking background (not on markers or controls)
    mapRef.current.on('click', (e) => {
      const t = e.originalEvent.target;
      const clickedMarker = t.closest?.('.service-marker');
      const inDirections = t.closest?.('.mapboxgl-ctrl-directions');
      const inGeocoder = t.closest?.('.mapboxgl-ctrl-geocoder');
      const inCtrlGroup = t.closest?.('.mapboxgl-ctrl-group');
      const inToggle = toggleCtrlElRef.current?.contains(t);
      if (!clickedMarker && !inDirections && !inGeocoder && !inCtrlGroup && !inToggle) {
        setTimeout(clearDirections, 0);
      }
    });

    // ESC key closes directions
    const onKey = (ev) => {
      if (ev.key === 'Escape') clearDirections();
    };
    window.addEventListener('keydown', onKey);
    mapRef.current.__clearKeyHandler = onKey;

    // Initial dedupe just in case
    cleanupExtraGeocoders();
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = [position.coords.longitude, position.coords.latitude];
        userOriginRef.current = userCoords;

        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz',
          center: userCoords,
          zoom: 13,
        });

        setupCommonControls(userCoords);

        try {
          geocoderRef.current?.setProximity({ longitude: userCoords[0], latitude: userCoords[1] });
        } catch {}

        try { directionsRef.current?.setOrigin(userCoords); } catch {}

        userMarkerRef.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat(userCoords)
          .setPopup(new mapboxgl.Popup().setText('Your Location'))
          .addTo(mapRef.current);
      },
      () => {
        const fallback = [76.5222, 9.590026];
        userOriginRef.current = fallback;

        mapRef.current = new mapboxgl.Map({
          container: mapboxgl.supported() ? mapContainerRef.current : undefined,
          style: 'mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz',
          center: fallback,
          zoom: 12,
        });

        setupCommonControls(fallback);
        try { directionsRef.current?.setOrigin(fallback); } catch {}
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
      try {
        if (directionsRef.current) {
          mapRef.current?.removeControl(directionsRef.current);
          directionsRef.current = null;
        }
      } catch {}
      try {
        const h = mapRef.current?.__clearKeyHandler;
        if (h) window.removeEventListener('keydown', h);
      } catch {}
      try {
        if (toggleCtrlElRef.current?.parentNode) {
          toggleCtrlElRef.current.parentNode.removeChild(toggleCtrlElRef.current);
        }
      } catch {}
      // NEW: disconnect geocoder MutationObserver
      try {
        geocoderObserverRef.current?.disconnect();
        geocoderObserverRef.current = null;
      } catch {}
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
      el.className = 'service-marker';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.width = '36px';
      el.style.height = '36px';
      el.style.borderRadius = '50%';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      el.style.background = bg;
      el.style.cursor = 'pointer';

      // Stop map click from firing when marker is clicked
      el.addEventListener('click', (evt) => {
        evt.stopPropagation();
        onMarkerClick?.(loc);
      });

      const root = createRoot(el);
      root.render(
        <IconComponent style={{ color: '#ffffff', width: 22, height: 22 }} />
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.longitude, loc.latitude])
        .addTo(mapRef.current);

      markersRef.current.push({ marker, root, el });
    });
  }, [locations, selectedFilters, onMarkerClick]);

  // When Dashboard sets a destination, plot a route
  useEffect(() => {
    if (!directionsRef.current || !mapRef.current) return;

    if (!destination) {
      // clear
      try {
        directionsRef.current.removeRoutes();
        try { directionsRef.current.setDestination(); } catch {}
      } finally {
        const mapEl = mapRef.current.getContainer();
        mapEl?.classList.remove('directions-collapsed');
        collapsedRef.current = false;
        notifyRouteActive(false);
        cleanupExtraGeocoders(); // ensure only one stays
      }
      return;
    }
    const destLng = destination.longitude ?? destination.lng;
    const destLat = destination.latitude ?? destination.lat;
    if (!isFinite(destLng) || !isFinite(destLat)) return;

    // Ensure origin remains user location
    if (userOriginRef.current) {
      try { directionsRef.current.setOrigin(userOriginRef.current); } catch {}
    }
    directionsRef.current.setDestination([destLng, destLat]);
    mapRef.current.flyTo({ center: [destLng, destLat], zoom: 14 });

    // Open panel when a new route is requested
    setDirectionsCollapsed(false);
    // Just in case, clean up extra geocoder
    cleanupExtraGeocoders();
  }, [destination]);

  return (
    <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
  );
};

export default MapboxMap;