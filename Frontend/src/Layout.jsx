import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed Base44 auth dependencies

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Search', icon: Search, page: 'Search' },
  { name: 'Saved Reports', icon: FileText, page: 'SavedReports' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Simple user display without auth
  const user = { full_name: 'User', email: 'user@example.com' };

  const handleLogout = () => {
    // Logout functionality removed - no auth needed
    console.log('Logout clicked');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 bg-white border-r border-slate-200">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Trend Pulse</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="text-slate-600">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Trend Pulse</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-14 z-30 bg-white border-b border-slate-200 shadow-lg"
          >
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}