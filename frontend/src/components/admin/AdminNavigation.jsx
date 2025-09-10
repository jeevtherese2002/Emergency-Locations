import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminNavigation = () => {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [adminName, setAdminName] = useState('');
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const baseurl = import.meta.env.VITE_BASE_URL;

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Close dropdown on route change
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseurl}/api/admin/base-detail`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAdminName(data.data.name);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <nav className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Logo and Title */}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">EC</span>
        </div>
        <span className="text-xl font-bold text-foreground">EasyConnect Admin</span>
      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <img
              src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740"
              alt="user"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          <span className="text-foreground font-medium hidden md:block">{adminName}</span>
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
            <div className="py-2">
              <button
                onClick={() => navigate('/admin/account')}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                My Account
              </button>
              <button
                onClick={() => navigate('/admin/change-password')}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                Change Password
              </button>
              <hr className="my-2 border-border" />
              <button
                onClick={() => logout()}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavigation;
