import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserNavigation from './UserNavigation';
import Dashboard from './Dashboard';
import MyAccount from './MyAccount';
import ChangePassword from './ChangePassword';

const UserApp = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, myAccount, changePassword

  const handleMenuItemClick = (item) => {
    switch (item) {
      case 'myAccount':
        setCurrentView('myAccount');
        break;
      case 'changePassword':
        setCurrentView('changePassword');
        break;
      case 'logout':
        // Handle logout logic here
        console.log('User logged out');
        break;
      default:
        setCurrentView('dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleProfileComplete = () => {
    setIsProfileComplete(true);
    setCurrentView('dashboard');
  };

  // Show profile completion if profile is not complete
//   if (!isProfileComplete) {
//     return <ProfileCompletion onComplete={handleProfileComplete} />;
//   }

  // Render main application with navigation
  return (
    <div className="min-h-screen bg-background">
      <UserNavigation onMenuItemClick={handleMenuItemClick} />
      <Outlet />

      {currentView === 'dashboard' && (
        <Dashboard onMenuItemClick={handleMenuItemClick} />
      )}
      
      {currentView === 'myAccount' && (
        <MyAccount onBack={handleBackToDashboard} />
      )}
      
      {currentView === 'changePassword' && (
        <ChangePassword onBack={handleBackToDashboard} />
      )}
    </div>
  );
};

export default UserApp;