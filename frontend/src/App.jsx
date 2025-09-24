import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

import ProtectedRoute from './components/ProtectedRoute'


import Landing from './pages/landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';



import UserApp from './components/user/UserApp.jsx';
import ProfileCompletion from './pages/user/ProfileCompletion.jsx'
import SosAlert from './components/user/SOSAlert.jsx'

import AdminLogin from './pages/admin/Login.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminPassword from './pages/admin/ChangePassword.jsx'
import AdminMyAccount from './pages/admin/AdminMyAccount.jsx'
import AdminAddLocation from './pages/admin/AddLocation.jsx'
import AdminViewLocation from './pages/admin/ViewLocations.jsx'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/user"  >
            <Route path="dashboard" element={<UserApp />} />
            <Route path="complete-profile" element={<ProfileCompletion />} />
            <Route path="sos" element={<SosAlert />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='change-password' element={<AdminPassword />} />
            <Route path='account' element={<AdminMyAccount />} />
            <Route path='locations/add' element={<AdminAddLocation />} />
            <Route path='locations/view' element={<AdminViewLocation />} />
          </Route>
        </Route>





      </Routes >
      <ToastContainer />
    </>
  )
}

export default App