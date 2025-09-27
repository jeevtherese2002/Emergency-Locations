# 🚨 Emergency Services Locator & SOS Platform

A modern, real‑time, geolocation‑driven platform that helps users quickly discover nearby emergency services (hospitals, police, fire, clinics, etc.), trigger multi‑channel SOS alerts, and share structured feedback—backed by an admin dashboard for moderation and analytics.

---

## ✨ Key Highlights

| Feature | Description |
|---------|-------------|
| 🗺️ Interactive Map & Geo Search | Fast geospatial queries for nearby emergency services. |
| 🆘 Multi‑Stage SOS Dispatch | Sends alerts to user SOS contacts → nearby services → nearby users (with smart radius expansion & freshness filters). |
| 📡 Live Location Heartbeat | Background heartbeat updates user coordinates (2dsphere index ready). |
| ⭐ Feedback & Ratings | Users can submit ratings & reviews (with anonymous option). |
| 🛡️ Moderation Workflow | Admins can approve / remove / flag feedback and view trends. |
| 📊 Dynamic Admin Dashboard | Live metrics: user growth (dampened), location distribution, reports (feedback) trend, recent activity feed. |
| 🎯 Service Categorization | Icon + color tagged emergency service categories (admin‑managed). |
| 🔐 Role‑Based Access | Separate user/admin flows with JWT auth & protected routes. |
| 📨 Email Dispatch | Nodemailer integration for SOS email notifications. |
| 🧭 Location Expansion Logic | Progressive radius strategy (2km → +5km → +5km) for service discovery. |
| 🧪 Scalable Architecture | Modular controllers, reusable mail utilities, geospatial-ready models. |

---

## 🧠 Recent Additions (Dynamic Enhancements)

- SOS Pipeline (contacts → services → nearby users) with per-stage resilience.
- Feedback system with moderation + flagging + status controls.
- Location feedback aggregation (average, breakdown, pagination).
- Admin dashboard auto‑generated analytics (dampened monthly growth, 7‑day report bars, color‑stable distribution).
- Distinct dynamic color assignment for service distribution slices.
- Custom user SOS message overlay (optional per trigger).
- Protective cooldown timers to prevent SOS spam (UI enforced).
- Anonymous feedback submission & duplicate prevention (user+location uniqueness).
- Smart geolocation fallback (supports future GeoJSON migrations).

---

## 🏗️ Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React (Vite), Tailwind CSS, Lucide Icons, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Geospatial | GeoJSON Point + 2dsphere index (Users) |
| Auth | JWT (role‑based middleware) |
| Email | Nodemailer (Gmail / SMTP) |
| Mapping* | (Pluggable: Mapbox / Leaflet readiness) |

> *Map visualization layer can be adapted; current logic abstracts location retrieval.

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/jerryjames2001/Emergency-Locations.git
cd Emergency-Locations

# Install (backend & frontend)
cd backend && npm install
cd ../frontend && npm install

# Environment (example backend .env)
# (Adjust values for your deployment)
```

```bash
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_app_email@gmail.com
SMTP_PASS=your_generated_app_password
FRONTEND_URL=http://localhost:5173
APP_NAME=Emergency Locator
```

```bash
# Run (in separate terminals)
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Open: `http://localhost:5173`

---

## 🔐 Authentication Flow

- User registers & logs in → receives JWT.
- Heartbeat hook updates their location periodically.
- Admin accounts manage services & locations.
- Role‑gated endpoints: `/api/admin/*`, service management, feedback moderation, dashboard summary.

---

## 🆘 SOS Flow (Behind One Button)

1. Validate cooldown + token.
2. Dispatch to personal SOS contacts (with map links).
3. Expand search to emergency services (progressive radius).
4. Identify up to 3 fresh nearby users (recent location heartbeat).
5. Aggregate results & toast UI feedback.
6. Optional custom message propagates to all recipients.

Fails gracefully per stage without cancelling earlier successes.

---

## ⭐ Feedback Lifecycle

| Stage | Action |
|-------|--------|
| Submit | User posts rating/comment (pending by default). |
| Moderate | Admin approves / flags / removes. |
| Display | Only approved feedback appears publicly. |
| Metrics | Aggregation powers averages & per‑star breakdown. |
| Integrity | Unique constraint prevents multiple submissions per user/location. |

---

## 📊 Admin Dashboard Metrics

| Metric | Source |
|--------|--------|
| Total / Active Users | User collection (Active = Total by design). |
| Emergency Locations | Enabled locations count. |
| Total Feedback | All feedback documents. |
| Reports Today | Feedback created today (proxy for “reports”). |
| Growth Chart | Last 12 months (dampened monthly increments capped at 100). |
| Report Trend | Last 7 days grouped by status. |
| Distribution | Active locations grouped by service. |
| Recent Activity | New users + recent feedback (merged & sorted). |
| Response Time | Static placeholder (future SLA integration). |

---

## 🧩 Directory Overview (Conceptual)

```
backend/
  controllers/
  models/
  routes/
  middleware/
  utils/
frontend/
  src/
    components/
    pages/
    hooks/
    context/
```

*(Simplified—structure may expand with scaling: queues, workers, notifications.)*

---

## 🛡️ Security & Integrity Notes

- JWT + role middleware (`verifyToken`, `checkRole`).
- Protected admin endpoints.
- Email validation & silent failure tolerance on dispatch.
- Rate limiting & abuse detection recommended (future enhancement).
- Geolocation queries use `$near` + freshness window filter.

---

## 🧪 Suggested Future Enhancements

| Category | Idea |
|----------|------|
| Alerts | Push notifications / WebSocket proximity alerts |
| Reliability | Queue (Bull / Redis) for outbound email & SOS tasks |
| Intelligence | Heatmaps of high incident report frequency |
| Localization | Multi‑language UI & message templates |
| Offline | Local caching of last known services |
| Compliance | Audit log for admin moderation actions |
| Mobile | PWA install & background geolocation optimization |
| SLA | Real response time measurement from service acknowledgment events |

---

## 🤝 Contributing

1. Fork & clone
2. Create feature branch: `git checkout -b feat/your-idea`
3. Commit with clear messages
4. Open PR—describe scope & testing notes

---

## 🧾 License

MIT License – free to use & adapt with attribution.  
See `LICENSE` (add if not present).

---

## 💬 Acknowledgements

- Built with focus on speed + clarity under emergency constraints.
- Thanks to contributors & open‑source ecosystem powering React, Express, MongoDB.

---

> Need deployment hardening, queue integration, or push notification scaffolding next? Open an issue or extend the roadmap!

Made with resilience 🔴🟡🟢