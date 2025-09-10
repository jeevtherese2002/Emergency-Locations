import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const AdminMap = ({ latitude, longitude, onLocationSelect }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const geocoderContainerRef = useRef(null);

    useEffect(() => {
        if (!mapContainerRef.current || !geocoderContainerRef.current) return;

        // Initialize map
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/jeev1/cmf0j5j8r018l01sd5sdga9hz", // your Studio style
            center: [longitude || 76.5222, latitude || 9.590026],
            zoom: 12,
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl());

        // Create geocoder
        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            marker: false,
        });

        // ✅ Clear container before mounting (fixes double search bar issue)
        geocoderContainerRef.current.innerHTML = "";
        geocoderContainerRef.current.appendChild(geocoder.onAdd(mapRef.current));

        // On map click → place marker
        mapRef.current.on("click", (e) => {
            const { lng, lat } = e.lngLat;

            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
            } else {
                markerRef.current = new mapboxgl.Marker({ color: "red" })
                    .setLngLat([lng, lat])
                    .addTo(mapRef.current);
            }

            onLocationSelect(lat, lng);
        });

        // On geocoder search → place marker
        geocoder.on("result", (e) => {
            const [lng, lat] = e.result.center;

            if (markerRef.current) {
                markerRef.current.setLngLat([lng, lat]);
            } else {
                markerRef.current = new mapboxgl.Marker({ color: "red" })
                    .setLngLat([lng, lat])
                    .addTo(mapRef.current);
            }

            onLocationSelect(lat, lng);
        });

        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <div className="space-y-2">
            {/* Geocoder search bar */}
            <div ref={geocoderContainerRef} className="w-full" />

            {/* Map container */}
            <div
                ref={mapContainerRef}
                className="w-full h-64 rounded-lg border border-border"
            />
        </div>
    );

};

export default AdminMap;
