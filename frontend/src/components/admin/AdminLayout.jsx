import React from 'react';
import AdminNavigation from './AdminNavigation';
import AdminSidebar from './AdminSidebar'; // or use a shared Sidebar if you want
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />

      <div className="flex h-[calc(100vh-64px)]">
        <AdminSidebar />
        
        <main className="flex-1 ml-16 md:ml-64 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
