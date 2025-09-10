import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import adminSidebarConfig from './AdminSidebarConfig';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (itemId) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const isActiveItem = (path) => {
    return location.pathname === path;
  };

  const isActiveParent = (item) => {
    if (item.subitems) {
      return item.subitems.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-64px)] bg-card border-r border-border w-16 md:w-64 z-40">
      <div className="p-2 md:p-4">
        <nav className="space-y-2">
          {adminSidebarConfig.map((item) => {
            const hasSubitems = item.subitems && item.subitems.length > 0;
            const isOpen = openSubmenus[item.id];
            const isParentActive = isActiveParent(item);
            const isDirectActive = isActiveItem(item.path);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (hasSubitems) {
                      toggleSubmenu(item.id);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={`w-full flex items-center justify-center md:justify-between p-3 rounded-lg transition-colors ${
                    isDirectActive || isParentActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-center md:justify-start">
                    <item.icon className="w-5 h-5" />
                    <span className="hidden md:block ml-3 font-normal">{item.title}</span>
                  </div>
                  
                  {hasSubitems && (
                    <div className="hidden md:block">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  )}
                </button>

                {/* Subitems */}
                {hasSubitems && isOpen && (
                  <div className="mt-1 ml-4 md:ml-8 space-y-1">
                    {item.subitems.map((subItem) => {
                      const isSubActive = isActiveItem(subItem.path);

                      return (
                        <button
                          key={subItem.id}
                          onClick={() => navigate(subItem.path)}
                          className={`w-full flex items-center justify-center md:justify-start p-2 rounded-md text-sm transition-colors ${
                            isSubActive
                              ? 'bg-primary/20 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <span className="hidden md:block">{subItem.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;