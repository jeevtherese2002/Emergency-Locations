import { LayoutDashboard, MapPin, FileText, UserCog, Lock } from 'lucide-react';

const adminSidebarConfig = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin/dashboard'
  },
  {
    id: 'locations',
    title: 'Emergency Locations',
    icon: MapPin,
    subitems: [
      {
        id: 'view-locations',
        title: 'View Locations',
        path: '/admin/locations/view'
      },
      {
        id: 'add-location',
        title: 'Add Location',
        path: '/admin/locations/add'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Feedback',
    icon: FileText,
    path: '/admin/reports'
  },
];

export default adminSidebarConfig;