import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-[#111111] border-b border-[#1D1D1D] z-50">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bottom-0 w-64 bg-[#111111] border-r border-[#1D1D1D] transform transition-transform duration-200 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 pt-16">
        <main className="min-h-[calc(100vh-4rem)] bg-[#0A0A0A]">
          <div className="max-w-screen-2xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Version number */}
      <div className="fixed bottom-4 left-4 text-xs text-zinc-600 lg:pl-64">
        Version 1.0.0
      </div>
    </div>
  );
}; 