'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { Search, ChevronDown, Settings, LogOut, Menu, Car, X, HelpCircle, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/admin')) {
      if (pathname === '/admin') return 'Dashboard';
      if (pathname.includes('/approvals')) return 'User Approvals';
      if (pathname.includes('/management')) return 'User Management';
      if (pathname.includes('/analytics')) return 'Driver Management';
      if (pathname.includes('/rides')) return 'Rides Log';
      if (pathname.includes('/students')) return 'Students';
      return 'Admin Panel';
    }
    if (pathname.includes('/driver')) {
      if (pathname === '/driver') return 'Dashboard';
      if (pathname.includes('/rides')) return 'My Rides';
      if (pathname.includes('/vehicle')) return 'Vehicle';
      if (pathname.includes('/earnings')) return 'Earnings';
      return 'Driver Panel';
    }
    if (pathname.includes('/student')) {
      if (pathname === '/student') return 'Dashboard';
      if (pathname.includes('/rides')) return 'My Rides';
      if (pathname.includes('/request')) return 'Request Ride';
      return 'Student Panel';
    }
    if (pathname.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token || !user.id) {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    setLoading(false);
  }, [router]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setCurrentUser(updatedUser);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Handle verification and approval states
  if (!currentUser.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600 mb-4">Please check your email and click the verification link to activate your account.</p>
          <button
            onClick={() => alert('Resend verification email - implement if needed')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  // Handle unapproved users
  if (!currentUser.is_approved) {
    // If on settings page, show minimal layout with just settings
    if (pathname.includes('/settings')) {
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Minimal header for unapproved users */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Car className="w-8 h-8 text-indigo-600 mr-2" />
                  <h1 className="text-xl font-bold text-gray-900">Uber Transport</h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800">Pending Approval</span>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      router.push('/');
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings content */}
          <main className="max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      );
    }
    
    // If trying to access other pages, show pending approval message
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h2>
          <p className="text-gray-600 mb-4">Your account is waiting for admin approval. You'll be notified via email once approved.</p>
          <p className="text-sm text-gray-500 mb-4">You can update your profile information by visiting the settings page.</p>
          <button
            onClick={() => {
              router.push('/settings');
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mr-2"
          >
            Go to Settings
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/');
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        userType={currentUser.user_type}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
        onHoverChange={setIsSidebarHovered}
      />

      {/* Main content - smoothly adjusts when sidebar expands */}
      <div 
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isDesktop 
            ? (isSidebarHovered ? '16rem' : '3.5rem') 
            : (sidebarOpen ? '16rem' : '0') // Mobile: shift when sidebar is open
        }}
      >
        {/* Top Bar - Ethira Style */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Logo + Project Name + Page Title */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button - Shows X when sidebar is open */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Logo and Project Name */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm font-semibold text-gray-900">Uber</h1>
                  <p className="text-xs text-gray-700">Ride Management</p>
                </div>
              </div>

              {/* Page Title Badge */}
              <div className="hidden md:flex items-center">
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-md">
                  {getPageTitle()}
                </span>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4 text-black">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input
                  type="text text-"
                  placeholder="Search for someone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right: User Profile */}
            <div className="flex items-center space-x-3">
              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 pl-4 pr-3 py-2 border-l border-gray-200/60 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-indigo-50/50 rounded-r-xl transition-all duration-200 cursor-pointer select-none group"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full overflow-hidden shadow-sm">
                    {(currentUser.profile_picture || currentUser.profilePicture) ? (
                      <img
                        src={currentUser.profile_picture || currentUser.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {currentUser.full_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                      {currentUser.full_name}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
                      {currentUser.email}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-all duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu - Exact Ethira Style */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 lg:w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full overflow-hidden">
                          {(currentUser.profile_picture || currentUser.profilePicture) ? (
                            <img
                              src={currentUser.profile_picture || currentUser.profilePicture}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm font-semibold">
                              {currentUser.full_name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {currentUser.full_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/settings');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer select-none"
                      >
                        <Settings className="w-4 h-4 mr-3 text-gray-400" />
                        Account Settings
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer select-none"
                      >
                        <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                        Help & Support
                      </button>
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 cursor-pointer select-none"
                      >
                        <LogOut className="w-4 w-4 mr-3 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
