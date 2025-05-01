import { useState } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="overflow-x-hidden">
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Sidebar */}
      <div className="flex justify-between w-full">
        <div className="h-full lg:w-64">
          <div
            className={`fixed top-16 w-64 left-0 bottom-0 bg-[#111111] border-r border-[#1D1D1D]   transform transition-transform duration-200 ease-in-out z-40
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
        {/* Main content */}
        <div className="mt-16 w-full px-4 sm:px-6">{children}</div>
      </div>
    </div>
  );
};
