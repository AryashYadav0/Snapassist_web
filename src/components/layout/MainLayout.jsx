import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, FileSpreadsheet, ScanLine, History } from 'lucide-react';
import { cn } from '../../utils/cn';

const MainLayout = () => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Sheets', path: '/sheets', icon: FileSpreadsheet },
    { name: 'Scan', path: '/scan', icon: ScanLine },
    { name: 'History', path: '/history', icon: History },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md p-4">
        <h1 className="text-xl font-bold">SnapAssist AI</h1>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile Feel */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-16 text-xs transition-colors",
                  isActive ? "text-blue-600 font-semibold" : "text-gray-500 hover:text-gray-900"
                )
              }
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MainLayout;
