import React, { useState } from 'react';
import { Menu, X, User, Lock, Sparkles, LogOut, Compass } from 'lucide-react';
import { User as UserType, WebsiteSettings } from '../types.js';

interface CustomerHeaderProps {
  settings: WebsiteSettings;
  currentUser: UserType | null;
  adminToken: string | null;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onLogout: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
}

export default function CustomerHeader({
  settings,
  currentUser,
  adminToken,
  activeTab,
  onTabChange,
  onLogout,
  onOpenAuth,
}: CustomerHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Vedic Home' },
    { id: 'gallery', label: 'Celestial Gallery' },
    { id: 'booking', label: 'Book Appointment' },
  ];

  const handleNav = (tabId: any) => {
    onTabChange(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-amber-500/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo and Title */}
        <div 
          className="flex cursor-pointer items-center space-x-2 text-xl font-bold tracking-tight text-amber-400"
          onClick={() => handleNav('home')}
          id="header-brand-logo"
        >
          <Sparkles className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
          <span className="font-sans text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            {settings.businessName}
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1" id="desktop-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/15'
                    : 'text-slate-300 hover:bg-slate-900/60 hover:text-amber-300'
                }`}
                id={`nav-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action controls buttons */}
        <div className="hidden md:flex items-center space-x-3" id="desktop-actions">
          {currentUser ? (
            <div className="flex items-center space-x-3">
              <button 
                className={`flex items-center space-x-1.5 cursor-pointer rounded-xl px-3 py-1.5 transition-all text-xs font-semibold ${
                  activeTab === 'profile' ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/15' : 'text-slate-300 hover:text-amber-300'
                }`}
                onClick={() => handleNav('profile')}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold uppercase text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 rounded-xl border border-slate-900 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 hover:border-red-500/10 hover:bg-red-500/[0.02] transition-colors"
                id="btn-logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors"
                id="btn-login-trigger"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/5"
                id="btn-register-trigger"
              >
                Register
              </button>
            </div>
          )}

          {/* Secure Doorway Admin toggle */}
          {adminToken && (
            <button
              onClick={() => handleNav('admin')}
              className="flex items-center space-x-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-400"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Mobile menu and portal items */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="rounded-xl border border-slate-900 bg-slate-950 p-2 text-slate-400 hover:text-white"
            id="btn-mobile-menu"
          >
            {isDrawerOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer layout */}
      {isDrawerOpen && (
        <div className="md:hidden border-t border-slate-900 bg-slate-950 px-4 py-4 space-y-2.5 animate-fade-in" id="mobile-drawer">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`block w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 font-bold border border-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <hr className="border-slate-900 my-3" />

          {currentUser ? (
            <div className="space-y-2">
              <button 
                onClick={() => handleNav('profile')}
                className="flex items-center space-x-2 px-3 py-2 w-full text-left rounded-xl hover:bg-slate-900"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
              </button>
              
              <button
                onClick={() => {
                  onLogout();
                  setIsDrawerOpen(false);
                }}
                className="flex w-full items-center space-x-2 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/5"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setIsDrawerOpen(false);
                }}
                className="rounded-xl border border-slate-900 bg-slate-950 py-2.5 text-center text-xs font-bold text-slate-300"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setIsDrawerOpen(false);
                }}
                className="rounded-xl bg-amber-500 py-2.5 text-center text-xs font-bold text-slate-950"
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

    </header>
  );
}
