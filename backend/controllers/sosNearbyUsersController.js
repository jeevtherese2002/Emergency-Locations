import User from '../models/User.js';
import { sendMail, wrapHtml } from '../utils/sendMail.js';

/**
 * POST /api/sos/nearby-users
 * Body (optional): { message: "optional note", maxUsers?: number, freshnessMinutes?: number }
 *
 * Finds up to `maxUsers` (default 3) other users near the requester:
 *  - Excludes the requester
 *  - Only users with a recent lastLocationAt (default: 10 minutes)
 *  - Uses a $near geospatial query on User.location
 *  - Optionally expands search radius if you want (simple single radius here)
 */
export const sendSosToNearbyUsers = async (req, res) => {
    try {
        const requester = await User.findById(req.user._id).select(
            'name email mobile location lastLocationAt'
        );
        if (!requester) return res.status(404).json({ message: 'User not found' });

        if (!requester.location?.coordinates?.length) {
            return res.status(400).json({ message: 'User location unavailable' });
        }

        const [lng, lat] = requester.location.coordinates;
        const customMsg = (req.body?.message || '').trim();
        const maxUsers = Number(req.body?.maxUsers) > 0 ? Math.min(Number(req.body.maxUsers), 10) : 3;
        const freshnessMinutes =
            Number(req.body?.freshnessMinutes) > 0 ? Number(req.body.freshnessMinutes) : 10;

        const freshnessCutoff = new Date(Date.now() - freshnessMinutes * 60 * 1000);

        // Single radius; adjust or make an array if you want expansions later.
        const MAX_DISTANCE_METERS = 8000; // 8 km

        // Geospatial query using $near (requires 2dsphere index which you already have)
        let candidates = await User.find({
            _id: { $ne: requester._id },
            lastLocationAt: { $gte: freshnessCutoff },
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: MAX_DISTANCE_METERS,
                },
            },
        })
            .limit(12) // over-fetch slightly, then slice
            .select('name email location');

        // Limit to maxUsers and ensure email present
        candidates = candidates.filter(u => !!u.email).slice(0, maxUsers);

        if (!candidates.length) {
            return res.status(200).json({
                message: 'No nearby active users found within radius',
                nearbyNotified: 0,
                maxDistanceUsed: MAX_DISTANCE_METERS,
                freshnessMinutes,
                users: [],
            });
        }

        const mapGoogle = `https://maps.google.com/?q=${lat},${lng}`;
        const mapOsm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

        const subject = `Nearby SOS: ${requester.name} needs help`;
        const htmlBody = wrapHtml(`
      <h2 style="margin-top:0;color:#d32f2f;">Nearby SOS Alert</h2>
      <p>You are near <strong>${requester.name}</strong> who triggered an SOS.</p>
      ${requester.mobile ? `<p><strong>Mobile:</strong> ${requester.mobile}</p>` : ''}
      <p><strong>Location:</strong></p>
      <ul>
        <li><a href="${mapGoogle}">Google Maps</a></li>
        <li><a href="${mapOsm}">OpenStreetMap</a></li>
      </ul>
      ${customMsg
                ? `<p style="padding:12px;background:#f8f8f8;border-left:4px solid #d32f2f;"><em>${customMsg}</em></p>`
                : ''
            }
      <p>If it is safe, consider assisting or alerting authorities.</p>
    `);
        const textFallback =
            `Nearby SOS from ${requester.name}\nLocation: ${mapGoogle}` +
            (customMsg ? `\nMessage: ${customMsg}` : '');

        const results = await Promise.all(
            candidates.map(u =>
                sendMail({
                    to: u.email,
                    subject,
                    html: htmlBody,
                    text: textFallback,
                }).then(r => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    success: r.success,
                    error: r.error ? String(r.error) : undefined,
                }))
            )
        );

        const successCount = results.filter(r => r.success).length;

        return res.status(200).json({
            message: 'Nearby user notifications processed',
            nearbyNotified: successCount,
            maxDistanceUsed: MAX_DISTANCE_METERS,
            freshnessMinutes,
            results,
            requesterLocation: { lat, lng },
            customMessageIncluded: !!customMsg,
        });
    } catch (err) {
        console.error('sendSosToNearbyUsers error:', err);
        return res.status(500).json({ message: 'Server error sending to nearby users' });
    }
};