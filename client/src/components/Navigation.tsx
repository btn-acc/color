import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Eye, Home, ShieldX, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const getUserInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  };

  const navItems = [
    ...(isTeacher ? [{
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      active: location === '/' || location === '/dashboard'
    }] : []),
    ...(isAdmin ? [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: Home,
        active: location === '/dashboard'
      },
      {
        path: '/admin',
        label: 'Admin Panel',
        icon: ShieldX,
        active: location === '/' || location === '/admin'
      }
    ] : [])
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <Eye className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">WarnaLyze</h1>
            </div>
          </div>

          {/* Navigation Items & Profile Section */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="hidden sm:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${item.active 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                    onClick={() => setLocation(item.path)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {getUserInitials(user?.name)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  showProfileMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  
                  {/* Mobile Navigation */}
                  <div className="sm:hidden border-b border-gray-100 py-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            setLocation(item.path);
                            setShowProfileMenu(false);
                          }}
                          className={`
                            w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center space-x-2
                            ${item.active 
                              ? 'text-blue-700 bg-blue-50' 
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      {showProfileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </nav>
  );
}