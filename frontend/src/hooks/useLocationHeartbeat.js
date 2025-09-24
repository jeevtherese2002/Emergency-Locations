import { useEffect } from 'react';

/**
 * Production heartbeat:
 * - Sends immediately on mount
 * - Sends every `intervalMs` (default 3 minutes), regardless of movement
 * - Reads a fresh token each time
 * - Silent (no console logs)
 */
export default function useLocationHeartbeat({
  baseUrl,
  intervalMs = 180000, // 3 minutes
  highAccuracy = false,
}) {
  useEffect(() => {
    if (!baseUrl) return;

    const sendUpdate = async ({ latitude, longitude }) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch(`${baseUrl}/api/user/location`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ longitude, latitude }),
          keepalive: true,
        });
      } catch {
        // silently ignore network errors
      }
    };

    const requestAndSend = () => {
      if (!navigator.onLine || !navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords || {};
          if (typeof latitude === 'number' && typeof longitude === 'number') {
            sendUpdate({ latitude, longitude });
          }
        },
        () => {
          // silently ignore geolocation errors
        },
        {
          enableHighAccuracy: highAccuracy,
          maximumAge: intervalMs, // reuse recent fix between intervals
          timeout: 10000,
        }
      );
    };

    // Fire immediately
    requestAndSend();

    // Fixed interval polling
    const id = setInterval(requestAndSend, intervalMs);

    // Extra triggers on focus/visibility/online
    const onVisibleOrFocus = () => requestAndSend();
    const onOnline = () => requestAndSend();

    document.addEventListener('visibilitychange', onVisibleOrFocus);
    window.addEventListener('focus', onVisibleOrFocus);
    window.addEventListener('online', onOnline);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibleOrFocus);
      window.removeEventListener('focus', onVisibleOrFocus);
      window.removeEventListener('online', onOnline);
    };
  }, [baseUrl, intervalMs, highAccuracy]);
}