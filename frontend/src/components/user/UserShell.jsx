import React from 'react';
import { Outlet } from 'react-router-dom';
import useLocationHeartbeat from '../../hooks/useLocationHeartbeat';

const UserShell = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useLocationHeartbeat({
    baseUrl: BASE_URL,
    intervalMs: 180000, // production: 3 minutes
    highAccuracy: false,
  });

  return <Outlet />;
};

export default UserShell;