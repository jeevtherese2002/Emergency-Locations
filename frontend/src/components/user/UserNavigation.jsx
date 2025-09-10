import React, { useEffect, useState } from 'react';
import { User, ChevronDown, Settings, Key, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserNavigation = ({ onMenuItemClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const baseurl = import.meta.env.VITE_BASE_URL;

  const [userDetails, setUserDetails] = useState({
    name: '',
    profilePicture: null,
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${baseurl}/api/user/base-details`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUserDetails({
            name: data.name || '',
            profilePicture: data.profilePicture || null,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    fetchUserDetails();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuItemClick = (item) => {
    if (item === 'logout') {
      logout();
    }
    onMenuItemClick(item);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-foreground">EasyConnect</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  {userDetails.profilePicture ? (
                    <img
                      src={`${baseurl}${userDetails.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <span>{userDetails.name || "User"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-elegant py-2 z-50">
                  <button
                    onClick={() => handleMenuItemClick('myAccount')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    My Account
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('changePassword')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                  <hr className="my-2 border-border" />
                  <button
                    onClick={() => handleMenuItemClick('logout')}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-foreground hover:bg-muted transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  {userDetails.profilePicture ? (
                    <img
                      src={`${baseurl}${userDetails.profilePicture}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <span>{userDetails.name || "User"}</span>
              </div>
              <button
                onClick={() => handleMenuItemClick('myAccount')}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <Settings className="w-4 h-4" />
                My Account
              </button>
              <button
                onClick={() => handleMenuItemClick('changePassword')}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={() => handleMenuItemClick('logout')}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default UserNavigation;