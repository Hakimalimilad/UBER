'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home,
  Car,
  Clock,
  Settings,
  Users,
  CheckSquare,
  LogOut,
  X,
  Star,
  HelpCircle,
  UserPlus,
  ShieldCheck,
  Activity,
  BookOpen,
  Lock,
  Menu,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  Building2,
  Globe,
  Layers,
  CheckCircle,
  TrendingUp,
  Cpu,
  Brain,
  Lightbulb,
  Sparkles,
  Bot,
  CircuitBoard,
  Atom,
  Rocket,
  Satellite,
  Orbit,
  Moon,
  Space,
  BrainCircuit
} from 'lucide-react';

interface SidebarProps {
  userType: string;
  onClose: () => void;
  isOpen: boolean;
  onSettingsClick?: () => void;
  onHoverChange?: (isHovered: boolean) => void;
}

const Sidebar = ({ userType, onClose, isOpen, onSettingsClick, onHoverChange }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  // Helper function to determine active tab from pathname
  const getActiveTab = (pathname: string): string => {
    // Handle settings page
    if (pathname.includes('/settings')) {
      return 'settings';
    }

    // Handle user-specific routes
    const pathParts = pathname.split('/');
    if (pathParts.length >= 3) {
      const userType = pathParts[1]; // student, driver, admin
      const tab = pathParts[2]; // rides, request, vehicle, etc.

      // Map some tabs to match menu items
      if (tab === 'dashboard' && userType !== 'admin') {
        return 'dashboard';
      }

      return tab;
    }

    // Default to dashboard
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(() => getActiveTab(pathname));
  const [isDesktopHovered, setIsDesktopHovered] = useState<boolean>(false);
  const [isSidebarLockedOpen, setIsSidebarLockedOpen] = useState<boolean>(false);

  const handleNavigation = (tab: string) => {
    if (tab === 'settings') {
      router.push('/settings');
      // Only close on mobile
      if (window.innerWidth < 1024) {
        onClose();
      }
      return;
    }

    setActiveTab(tab);
    
    // Handle dashboard - goes to main page for each role
    if (tab === 'dashboard') {
      if (userType === 'student') {
        router.push('/student');
      } else if (userType === 'driver') {
        router.push('/driver');
      } else if (userType === 'admin') {
        router.push('/admin');
      }
    } else {
      // Other tabs follow the pattern /userType/tab
      if (userType === 'student') {
        router.push(`/student/${tab}`);
      } else if (userType === 'driver') {
        router.push(`/driver/${tab}`);
      } else if (userType === 'admin') {
        router.push(`/admin/${tab}`);
      }
    }
    
    // Only close sidebar on mobile, keep it visible on desktop
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  interface MenuItems {
    student: MenuItem[];
    driver: MenuItem[];
    admin: MenuItem[];
  }

  const menuItems: MenuItems = {
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'rides', label: 'My Rides', icon: Car },
      { id: 'request', label: 'Request Ride', icon: Clock },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    driver: [
      { id: 'dashboard', label: 'Dashboard', icon: Home, badge: 5 },
      { id: 'rides', label: 'My Rides', icon: Car },
      { id: 'vehicle', label: 'Vehicle', icon: Car },
      { id: 'earnings', label: 'Earnings', icon: TrendingUp },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'approvals', label: 'Pending Approvals', icon: CheckSquare,  },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'rides', label: 'Rides Log', icon: Clock },
      { id: 'analytics', label: 'Analytics', icon: Activity },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  };

  const items = menuItems[userType as keyof typeof menuItems] || [];

  return (
    <div className="sidebar-container">
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && onClose()}
        />
      )}

      {/* Main Sidebar */}
      <nav
        className={`group/sidebar fixed top-0 left-0 h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-r border-indigo-700/30 shadow-2xl z-40 overflow-hidden relative sidebar-fixed ${
          isOpen
            ? 'translate-x-0 w-64'
            : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarLockedOpen
            ? 'lg:w-64'
            : 'lg:w-14 lg:hover:w-64'
        }`}
        data-sidebar-state={isSidebarLockedOpen ? 'locked-open' : 'collapsed'}
        onMouseEnter={() => {
          if (!isSidebarLockedOpen) {
            setIsDesktopHovered(true);
            onHoverChange?.(true);
          }
        }}
        onMouseLeave={() => {
          if (!isSidebarLockedOpen) {
            setIsDesktopHovered(false);
            onHoverChange?.(false);
          }
        }}
        style={{
          transition: 'all 0.3s ease-in-out',
          width: isSidebarLockedOpen ? '16rem' : undefined
        }}
      >
        {/* Scrollable content container - hide scrollbar using CSS */}
        <div className="h-screen overflow-y-auto overflow-x-hidden flex flex-col" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Header - Logo/Branding */}
          <div className="flex-shrink-0 p-4 border-b border-slate-700/30 transition-colors duration-500">
            {/* Show full logo on mobile or desktop expanded states */}
            {(isOpen) || (isDesktopHovered || isSidebarLockedOpen) ? (
              <div className="text-center relative">
                {/* Star particles around logo */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top area particles */}
                  <div className="absolute -top-1 -left-1 w-1 h-1 bg-slate-400/30 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute -top-1 right-2 w-1 h-1 bg-indigo-400/25 rounded-full animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}></div>
                  <div className="absolute top-1 left-3 w-0.5 h-0.5 bg-slate-300/20 rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '1s' }}></div>

                  {/* Side particles */}
                  <div className="absolute top-3 -left-2 w-1 h-1 bg-indigo-300/30 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.8s' }}></div>
                  <div className="absolute top-4 right-0 w-0.5 h-0.5 bg-slate-400/25 rounded-full animate-pulse" style={{ animationDuration: '2.8s', animationDelay: '1.2s' }}></div>

                  {/* Bottom area particles */}
                  <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.3s' }}></div>
                  <div className="absolute -bottom-1 right-1 w-0.5 h-0.5 bg-slate-300/25 rounded-full animate-pulse" style={{ animationDuration: '3.2s', animationDelay: '1.8s' }}></div>
                  <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-indigo-400/20 rounded-full animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.7s' }}></div>
                </div>

                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-1 relative z-10"
                    style={{ fontFamily: "'Arial', sans-serif", letterSpacing: '0.05em' }}>
                  Uber Portal
                </h1>
                <p className="text-xs text-slate-300 font-medium tracking-wide relative z-10">
                  {userType === 'student' ? 'Student Hub' : userType === 'driver' ? 'Driver Hub' : 'Admin Hub'}
                </p>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center">
                <Car size={24} className="text-slate-300/80 hover:text-indigo-400 transition-all duration-300 drop-shadow-lg" strokeWidth={1.5} />
                {/* Star particles distributed along collapsed sidebar */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-400/25 rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-indigo-400/20 rounded-full animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                  <div className="absolute top-32 left-1/2 -translate-x-1/2 w-1 h-1 bg-slate-300/30 rounded-full animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
                  <div className="absolute top-44 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-indigo-300/25 rounded-full animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '2s' }}></div>
                  <div className="absolute top-56 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400/20 rounded-full animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}></div>
                  <div className="absolute top-72 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-slate-400/20 rounded-full animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.8s' }}></div>
                  <div className="absolute top-80 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-400/25 rounded-full animate-pulse" style={{ animationDuration: '3.8s', animationDelay: '2.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 px-2 py-3">
            {/* Core Navigation Section */}
            <div className="mb-4 group/section">
              <div className={`flex items-center gap-2 px-2 mb-2 group-hover/section:px-3 transition-all duration-300 ${
                (isOpen) || (isDesktopHovered || isSidebarLockedOpen) ? 'opacity-100' : 'lg:opacity-0'
              }`}>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider group-hover/section:text-indigo-200 transition-colors duration-300">
                  Core
                </span>
                <div className="flex-1 h-px bg-slate-700/50 group-hover/section:bg-indigo-500/30 transition-colors duration-500"></div>
              </div>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`group/item flex items-center gap-3 px-2 py-2 mx-0 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer select-none relative overflow-hidden w-full text-left before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/0 before:via-purple-500/0 before:to-indigo-500/0 before:scale-x-0 before:origin-left before:transition-transform before:duration-500 hover:before:scale-x-100 hover:before:from-indigo-500/20 hover:before:via-purple-500/20 hover:before:to-indigo-500/20 ${
                        (isOpen) || (isDesktopHovered || isSidebarLockedOpen)
                          ? 'justify-start'
                          : 'lg:justify-center lg:w-10 lg:h-10 lg:mx-0 lg:p-0'
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                          : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-md"
                      }`}
                      title={item.label}
                    >
                      <span className={`transition-all duration-300 relative z-10 flex items-center justify-center ${
                        isActive
                          ? "text-white"
                          : "text-slate-300 group-hover/item:text-indigo-300 group-hover/item:scale-110"
                      } ${
                        !((isOpen) || (isDesktopHovered || isSidebarLockedOpen)) ? 'lg:w-full lg:h-full' : ''
                      }`}>
                        <Icon size={18} />
                      </span>
                      <span className={`relative z-10 whitespace-nowrap transition-all duration-300 ease-in-out ${
                        (isOpen) || (isDesktopHovered || isSidebarLockedOpen)
                          ? 'opacity-100 translate-x-0 group-hover/item:translate-x-1'
                          : 'lg:opacity-0 lg:w-0 lg:overflow-hidden lg:absolute lg:invisible'
                      }`}>
                        {item.label}
                        {item.badge && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Protected Section */}
            <div className="mb-4 group/section">
              <div className={`flex items-center gap-2 px-2 mb-2 group-hover/section:px-3 transition-all duration-300 ${
                (isOpen) || (isDesktopHovered || isSidebarLockedOpen) ? 'opacity-100' : 'lg:opacity-0'
              }`}>
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider group-hover/section:text-purple-200 transition-colors duration-300">
                  Protected
                </span>
                <div className="flex-1 h-px bg-slate-700/50 group-hover/section:bg-purple-500/30 transition-colors duration-500"></div>
              </div>
              <div className="space-y-0.5">
                {items.slice(3).map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`group/item flex items-center gap-3 px-2 py-2 mx-0 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer select-none relative overflow-hidden w-full text-left before:absolute before:inset-0 before:bg-gradient-to-r before:from-indigo-500/0 before:via-purple-500/0 before:to-indigo-500/0 before:scale-x-0 before:origin-left before:transition-transform before:duration-500 hover:before:scale-x-100 hover:before:from-indigo-500/20 hover:before:via-purple-500/20 hover:before:to-indigo-500/20 ${
                        (isOpen) || (isDesktopHovered || isSidebarLockedOpen)
                          ? 'justify-start'
                          : 'lg:justify-center lg:w-10 lg:h-10 lg:mx-0 lg:p-0'
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                          : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:text-white hover:shadow-md"
                      }`}
                      title={item.label}
                    >
                      <span className={`transition-all duration-300 relative z-10 flex items-center justify-center ${
                        isActive
                          ? "text-white"
                          : "text-slate-300 group-hover/item:text-purple-300 group-hover/item:scale-110"
                      } ${
                        !((isOpen) || (isDesktopHovered || isSidebarLockedOpen)) ? 'lg:w-full lg:h-full' : ''
                      }`}>
                        <Icon size={18} />
                      </span>
                      <span className={`relative z-10 whitespace-nowrap flex items-center gap-2 transition-all duration-300 ease-in-out ${
                        (isOpen) || (isDesktopHovered || isSidebarLockedOpen)
                          ? 'opacity-100 translate-x-0 group-hover/item:translate-x-1 pointer-events-auto'
                          : 'opacity-0 w-0 overflow-hidden pointer-events-none lg:absolute lg:invisible'
                      }`}>
                        {item.label}
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer - positioned at bottom */}
          <div className={`mt-auto relative z-10 ${
            (isOpen) || (isDesktopHovered || isSidebarLockedOpen)
              ? 'px-6 pb-0'
              : 'px-2 pb-0 flex flex-col items-center'
          }`}>
            <div className={`border-t border-slate-700/30 group-hover/sidebar:border-slate-600/50 pt-6 pb-6 space-y-6 transition-colors duration-500 ${
              (isOpen) || (isDesktopHovered || isSidebarLockedOpen) ? '' : 'border-none pt-4 pb-4'
            }`}>
              {/* Hide tagline text in collapsed state */}
              {((isOpen) || (isDesktopHovered || isSidebarLockedOpen)) && (
                <div className="text-center group-hover/sidebar:scale-105 transition-transform duration-500">
                  <p className="text-xs text-slate-300 leading-relaxed group-hover/sidebar:text-slate-200 transition-colors duration-500">
                    Safe, Reliable & Efficient Rides
                  </p>
                </div>
              )}

              {/* Logout button - show icon only when collapsed, full button when expanded */}
              {(isOpen) || (isDesktopHovered || isSidebarLockedOpen) ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-700/50 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-orange-600/20 text-slate-300 hover:text-white text-sm border border-slate-600/50 hover:border-red-500/50 transition-all duration-300 group/logout cursor-pointer select-none relative overflow-hidden"
                  type="button"
                >
                  <LogOut size={16} className="text-slate-300 group-hover/logout:text-red-400 group-hover/logout:scale-110 transition-all duration-300 relative z-10" />
                  <span className="font-medium relative z-10 group-hover/logout:translate-x-1 transition-transform duration-300">
                    Sign Out
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600/20 hover:to-orange-600/20 text-slate-300/80 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 group/logout cursor-pointer select-none relative overflow-hidden hover:scale-110"
                  title="Sign Out"
                  type="button"
                >
                  <LogOut size={22} className="transition-all duration-300 relative z-10" />
                </button>
              )}
            </div>
          </div>

          {/* Cosmic Space Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Animated Stars Field */}
            <div className="absolute inset-0">
              {/* Large Stars */}
              <div className="absolute top-10 left-6 w-1 h-1 bg-white rounded-full animate-pulse opacity-80" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
              <div className="absolute top-20 right-8 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse opacity-60" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
              <div className="absolute top-32 left-12 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse opacity-70" style={{animationDelay: '2s', animationDuration: '2.5s'}}></div>
              <div className="absolute top-48 right-4 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse opacity-50" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
              <div className="absolute top-64 left-8 w-1 h-1 bg-cyan-200 rounded-full animate-pulse opacity-60" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}></div>

              {/* Medium Stars */}
              <div className="absolute top-80 right-10 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-40" style={{animationDelay: '3s', animationDuration: '2s'}}></div>
              <div className="absolute top-96 left-4 w-1 h-1 bg-indigo-200 rounded-full animate-pulse opacity-50" style={{animationDelay: '2.5s', animationDuration: '3s'}}></div>
              <div className="absolute bottom-32 right-6 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse opacity-60" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
              <div className="absolute bottom-48 left-10 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-45" style={{animationDelay: '3.5s', animationDuration: '2.8s'}}></div>

              {/* Small Twinkling Stars */}
              <div className="absolute top-16 left-3 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-30" style={{animationDelay: '0s', animationDuration: '5s'}}></div>
              <div className="absolute top-40 right-3 w-0.5 h-0.5 bg-cyan-100 rounded-full animate-ping opacity-25" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
              <div className="absolute bottom-20 left-6 w-0.5 h-0.5 bg-indigo-100 rounded-full animate-ping opacity-35" style={{animationDelay: '4s', animationDuration: '4.5s'}}></div>
            </div>

            {/* Floating Space Elements */}
            <div className="absolute inset-0 opacity-20">
              {/* Floating Car Emoji */}
              <div className="absolute top-24 right-2 text-lg animate-bounce opacity-40" style={{animationDelay: '1s', animationDuration: '8s'}}>
                🚗
              </div>
              <div className="absolute bottom-40 left-2 text-sm animate-bounce opacity-30" style={{animationDelay: '3s', animationDuration: '10s'}}>
                🗺️
              </div>
              <div className="absolute top-60 right-1 text-xs animate-bounce opacity-25" style={{animationDelay: '5s', animationDuration: '12s'}}>
                ⭐
              </div>
            </div>

            {/* Cosmic Nebula Effect */}
            <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 via-transparent to-transparent opacity-30"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-900/10 to-transparent"></div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
