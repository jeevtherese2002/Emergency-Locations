import User from '../models/User.js';
import Location from '../models/Location.js';
import { sendMail, wrapHtml } from '../utils/sendMail.js';

/**
 * Compute Haversine distance (meters) between two lat/lng points.
 */
function haversineMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = d => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Find up to `limit` locations within a radius (meters) from (lat,lng) by:
 * 1. Creating a rough bounding box
 * 2. Filtering with Haversine
 * 3. Sorting by distance ascending
 */
async function findLocationsInRadius(lat, lng, radiusMeters, limit = 3) {
    // Latitude degrees ~111.32 km
    const degLat = radiusMeters / 111320;
    // Longitude degrees shrink with cos(latitude)
    const degLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - degLat;
    const maxLat = lat + degLat;
    const minLng = lng - degLng;
    const maxLng = lng + degLng;

    // Fetch a reasonable set (cap) within the bounding box
    const rawCandidates = await Location.find({
        isDisabled: { $ne: true },
        latitude: { $gte: minLat, $lte: maxLat },
        longitude: { $gte: minLng, $lte: maxLng },
        email: { $exists: true, $ne: '' }, // must have email
    })
        .select('name address email phone1 phone2 latitude longitude serviceId selectedIcon')
        .limit(200); // safety cap

    // Filter by actual distance
    const within = [];
    for (const loc of rawCandidates) {
        if (typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') continue;
        const dist = haversineMeters(lat, lng, loc.latitude, loc.longitude);
        if (dist <= radiusMeters) {
            within.push({ doc: loc, distance: dist });
        }
    }

    // Sort by distance and return up to limit
    within.sort((a, b) => a.distance - b.distance);
    return within.slice(0, limit).map(i => ({ location: i.doc, distance: i.distance }));
}

/**
 * POST /api/sos/services
 * Body (optional): { message: "optional user note" }
 *
 * Steps:
 *  - Load user + ensure current location
 *  - Try radii [2000, 7000, 12000] (meters)
 *  - Stop once we gather up to 3 services
 *  - Email each found service (if email exists)
 *  - Return summary
 */
export const sendSosToNearbyServices = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            'name mobile location lastLocationAt'
        );
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.location?.coordinates?.length) {
            return res.status(400).json({ message: 'User location unavailable' });
        }

        const [lng, lat] = user.location.coordinates;
        const radii = [2000, 7000, 12000]; // 2 km → +5 km → +5 km
        const maxTargets = 3;

        let collected = [];
        let radiusUsed = null;
        let radiiTried = [];

        for (const r of radii) {
            radiiTried.push(r);
            const found = await findLocationsInRadius(lat, lng, r, maxTargets - collected.length);
            // Merge unique (by _id)
            for (const f of found) {
                if (!collected.some(c => String(c.location._id) === String(f.location._id))) {
                    collected.push(f);
                }
                if (collected.length >= maxTargets) break;
            }
            if (collected.length >= maxTargets) {
                radiusUsed = r;
                break;
            }
            // If after this radius we have some but < max and it's the last radius, mark used
            radiusUsed = r;
        }

        if (!collected.length) {
            return res.status(200).json({
                message: 'No nearby services found within expanding radii',
                radiiTried,
                servicesNotified: 0,
                services: [],
            });
        }

        const mapGoogle = `https://maps.google.com/?q=${lat},${lng}`;
        const mapOsm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
        const customMsg = (req.body?.message || '').trim();

        const subject = `SOS ALERT near ${user.name}`;
        const htmlBody = wrapHtml(`
      <h2 style="margin-top:0;color:#d32f2f;">Proximity SOS Alert</h2>
      <p>An SOS alert was triggered by <strong>${user.name}</strong>.</p>
      ${user.mobile ? `<p><strong>Mobile:</strong> ${user.mobile}</p>` : ''}
      <p><strong>Reported Location:</strong></p>
      <ul>
        <li><a href="${mapGoogle}">Google Maps</a></li>
        <li><a href="${mapOsm}">OpenStreetMap</a></li>
      </ul>
      ${customMsg ? `<p style="padding:12px;background:#f8f8f8;border-left:4px solid #d32f2f;"><em>${customMsg}</em></p>` : ''}
      <p>You were selected based on proximity (radius up to ${(radiusUsed / 1000).toFixed(1)} km). Please coordinate or respond if appropriate.</p>
    `);
        const textFallback =
            `SOS alert near ${user.name}\nLocation: ${mapGoogle}` +
            (customMsg ? `\nMessage: ${customMsg}` : '');

        // Send emails
        const emailResults = await Promise.all(
            collected.map(obj =>
                sendMail({
                    to: obj.location.email,
                    subject,
                    html: htmlBody,
                    text: textFallback,
                }).then(r => ({
                    id: obj.location._id,
                    name: obj.location.name,
                    email: obj.location.email,
                    distanceMeters: Math.round(obj.distance),
                    success: r.success,
                    error: r.error ? String(r.error) : undefined
                }))
            )
        );

        const successCount = emailResults.filter(r => r.success).length;

        return res.status(200).json({
            message: 'Nearby service notifications processed',
            userLocation: { lat, lng },
            radiiTried,
            radiusUsed,
            servicesNotified: successCount,
            results: emailResults,
        });
    } catch (err) {
        console.error('sendSosToNearbyServices error:', err);
        return res.status(500).json({ message: 'Server error sending to services' });
    }
};