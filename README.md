# 🚨 Emergency Services Locator

## 📌 About the Project

The **Emergency Services Locator** is a web-based application designed to help users quickly locate nearby emergency services such as **hospitals, police stations, fire stations, and other essential facilities**. The system provides an interactive map with categorized service pins, enabling users to filter and find exactly what they need in urgent situations.

Admins can add and manage emergency service locations, while users can view, filter, and give feedback on available services. The project emphasizes **accessibility, reliability, and efficiency** in emergency response scenarios.

---

## ✨ Features

* 🗺️ **Interactive Map Integration** – Displays emergency service pins with categories.
* 📍 **Location Access** – Detects user location for nearby service recommendations.
* 🔎 **Filter Options** – Users can filter services by type (hospital, police, etc.).
* 🛠️ **Admin Panel** – Admins can add, update, or remove emergency service locations.
* ⭐ **Feedback System** – Users can rate and review emergency services.
* 🔐 **Secure Authentication** – Separate access for users and admins.
* 📱 **Mobile Responsive** – Works seamlessly across devices.

---

## 🏗️ Project Structure

* **Frontend**: React (Vite + JSX) with Tailwind CSS for styling.
* **Backend**: Node.js + Express.js for APIs.
* **Database**: MongoDB with collections:

  * `Tbl_users` – User details
  * `Tbl_admin` – Admin accounts
  * `Tbl_emergency_locations` – Emergency services data
  * `Tbl_feedback` – User feedback & ratings
* **Map Integration**: Mapbox GL JS for interactive map rendering.

---

## 📄 Modules

1. **User Module**

   * Register/Login
   * Profile completion
   * View and filter emergency services
   * Submit feedback

2. **Admin Module**

   * Manage emergency locations (Add, Update, Delete)
   * View user feedback
   * Secure admin authentication

3. **Location Module**

   * Map-based pin placement
   * Category-based icons
   * Geolocation-based nearest services

---

## 📋 Forms in the System

* 📝 User Registration Form
* 🔑 Login Form
* 👤 Profile Completion Form
* ⭐ Feedback Form
* 📍 Admin Location Adding Form

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/jerryjames2001/Emergency-Locations.git
cd frontend
cd backend

# Install dependencies
npm install

# Run development server
npm run dev
```

---

## 📸 Screenshots (To be added)

* User Dashboard
* Admin Dashboard
* Map with Service Pins

---

## 📌 Future Enhancements

* 🚑 Navigation to emergency service locations
* 📢 Real-time notifications for critical alerts
* 🌐 Multi-language support
* 📊 Analytics dashboard for admins

---

## 👨‍💻 Contributors

* **Jerry James** – Project Lead
* Additional contributors can be listed here.

---

## 📜 License

This project is licensed under the **MIT License** – you are free to use, modify, and distribute it with attribution.
