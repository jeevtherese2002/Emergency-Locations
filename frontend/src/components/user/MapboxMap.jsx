// /src/components/user/MapboxMap.jsx

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// import { emergencyCategories } from '../../data/emergencyCategories'; // Adjust if needed

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapboxMap = ({ services = [], selectedFilters = [], onServiceClick }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);



  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userCoords = {
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        };

        // Init map
        mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: 'mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz', //outdoors-v11
          center: [userCoords.lng, userCoords.lat],
          zoom: 13,
        });

        // Add user location marker
        userMarkerRef.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([userCoords.lng, userCoords.lat])
          .setPopup(new mapboxgl.Popup().setText('Your Location'))
          .addTo(mapRef.current);
      },
      
      () => {
        alert("Location access denied. Showing blank map.");
      }
    );

    return () => {
      mapRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old service markers
    const currentMarkers = mapRef.current._serviceMarkers || [];
    currentMarkers.forEach(marker => marker.remove());

    const visibleServices = selectedFilters.length === 0
      ? services
      : services.filter(service => selectedFilters.includes(service.category));

    const newMarkers = visibleServices.map(service => {
      const category = service; // Since your `services` already include icon, category, etc.


      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = 'white';
      el.style.border = '2px solid black';
      el.style.borderRadius = '50%';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '18px';
      el.innerHTML = category?.icon || '?';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([service.lng, service.lat])
        .setPopup(new mapboxgl.Popup().setText(`${service.name}\n${service.address}`))
        .addTo(mapRef.current);

      el.onclick = () => onServiceClick?.(service);

      return marker;
    });

    mapRef.current._serviceMarkers = newMarkers;
  }, [selectedFilters, services]);

  return (
  <div
    ref={mapContainerRef}
    className="w-full h-full"
    style={{ minHeight: '400px' }} // you can adjust height as needed
  />
);

};

export default MapboxMap;
