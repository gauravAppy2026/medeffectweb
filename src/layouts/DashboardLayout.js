import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="ml-[240px] p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
