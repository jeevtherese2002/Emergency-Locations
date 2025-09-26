import User from '../models/User.js';
import { sendMail, wrapHtml } from '../utils/sendMail.js';

export const sendSosToContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      'name email mobile location sosContacts lastLocationAt'
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.location?.coordinates?.length) {
      return res.status(400).json({ message: 'Location not available for this user. Cannot send SOS.' });
    }

    const contacts = (user.sosContacts || []).filter(c => !!c.email);
    if (!contacts.length) {
      return res.status(200).json({
        message: 'No SOS contacts with email to notify',
        dispatched: 0,
        contacts: [],
      });
    }

    const [lng, lat] = user.location.coordinates;
    const mapGoogle = `https://maps.google.com/?q=${lat},${lng}`;
    const mapOsm = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;

    const customMsg = (req.body?.message || '').trim();

    const subject = `SOS ALERT: ${user.name} needs assistance`;
    const baseHtml = wrapHtml(`
      <h2 style="margin-top:0;color:#d32f2f;">Emergency SOS Alert</h2>
      <p><strong>${user.name}</strong> has triggered an SOS alert.</p>
      ${user.mobile ? `<p><strong>Mobile:</strong> ${user.mobile}</p>` : ''}
      <p><strong>Location:</strong></p>
      <ul>
        <li><a href="${mapGoogle}">Google Maps</a></li>
        <li><a href="${mapOsm}">OpenStreetMap</a></li>
      </ul>
      ${customMsg ? `<p style="padding:12px;background:#f8f8f8;border-left:4px solid #d32f2f;"><em>${customMsg}</em></p>` : ''}
      <p>Please try to contact them or arrange help if it is safe to do so.</p>
    `);
    const textFallback = `${user.name} triggered SOS.\nLocation: ${mapGoogle}${customMsg ? `\nMessage: ${customMsg}` : ''}`;

    // Send emails (in parallel)
    const results = await Promise.all(
      contacts.map(c =>
        sendMail({
          to: c.email,
          subject,
          html: baseHtml,
          text: textFallback,
        }).then(r => ({ email: c.email, success: r.success, error: r.error ? String(r.error) : undefined }))
      )
    );

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      message: 'SOS contact notifications processed',
      dispatched: successCount,
      totalContacts: contacts.length,
      results,
      locationUsed: { lat, lng },
      customMessageIncluded: !!customMsg,
    });
  } catch (err) {
    console.error('sendSosToContacts error:', err);
    return res.status(500).json({ message: 'Server error sending SOS' });
  }
};