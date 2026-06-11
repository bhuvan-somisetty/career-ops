'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Columns,
  FileText,
  BarChart3,
  ClipboardCheck,
  User,
  Settings,
  Menu,
  X,
  Bell,
  Globe,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useCurrency, CURRENCIES } from '@/context/CurrencyContext';

interface CandidateProfile {
  name: string;
  headline: string;
}

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { currency, setCurrency, symbol } = useCurrency();
  const [profile, setProfile] = useState<CandidateProfile>({
    name: 'My Profile',
    headline: 'Complete your profile'
  });
  // The logged-in student's profile picture (falls back to initials when absent).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    // The console belongs to the logged-in student: show THEIR name, headline,
    // and avatar from their saved Master Profile (never a hardcoded sample).
    const studentId = localStorage.getItem('career_officer_student_id');
    if (studentId) {
      fetch(`/api/students/${studentId}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.profile) {
            const p = data.profile;
            const name = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
            setProfile({
              name: name || 'My Profile',
              headline: p.experience?.[0]?.jobTitle || p.summary?.slice(0, 40) || 'Complete your profile',
            });
          }
          if (data?.avatar?.hasFile) {
            setAvatarUrl(`/api/students/${studentId}/avatar?v=${encodeURIComponent(data.avatar.uploadedAt || '')}`);
          }
        })
        .catch(() => {});
    }
  }, [pathname]);

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Job Discovery', href: '/jobs', icon: Briefcase },
        { name: 'Job Pipeline', href: '/tracker', icon: Columns },
      ]
    },
    {
      title: 'Intelligence',
      items: [
        { name: 'Resume Match', href: '/resume', icon: FileText },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'AI Reports', href: '/reports', icon: ClipboardCheck },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  // Premium CO Monogram SVG branding (Career Officer + Trajectory)
  const BrandLogo = () => (
    <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
      <svg className="w-full h-full text-emerald-500" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Interlocking 'C' */}
        <path d="M12 24C8.68629 24 6 21.3137 6 18C6 14.6863 8.68629 12 12 12C14.7614 12 17.1 13.8 17.8 16.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Interlocking 'O' */}
        <circle cx="23" cy="18" r="6" stroke="currentColor" strokeWidth="2.5" />
        {/* Growth/Trajectory Needle */}
        <path d="M16 22L21 17L26 12M26 12H21M26 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-950/70 backdrop-blur-md border-r border-zinc-900 px-4 py-6 justify-between shrink-0 z-20">
        <div className="space-y-7">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <BrandLogo />
            <div>
              <span className="font-bold text-zinc-100 tracking-tight text-sm group-hover:text-emerald-400 transition-colors">
                Career Officer
              </span>
              <span className="text-[9px] text-zinc-500 font-mono block">Career Operating OS</span>
            </div>
          </Link>

          {/* Grouped Navigation Links */}
          <div className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase px-3 block">
                  {group.title}
                </span>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <div className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all group duration-200 cursor-pointer ${
                          active 
                            ? 'text-zinc-100 font-medium' 
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40'
                        }`}>
                          {active && (
                            <motion.div
                              layoutId="active-nav-bg"
                              className="absolute inset-0 bg-zinc-900/60 border border-zinc-900 rounded-lg z-0"
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            />
                          )}
                          <Icon className={`w-3.5 h-3.5 relative z-10 transition-colors duration-200 ${
                            active ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                          }`} />
                          <span className="relative z-10">{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* User Card with Profile Menu Dropdown */}
        <div className="mt-auto border-t border-zinc-900 pt-4 px-2 relative">
          <div 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-zinc-900/40 cursor-pointer transition-colors duration-155 select-none overflow-hidden"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-zinc-850 shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-emerald-400 border border-zinc-850 shrink-0">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <span className="font-semibold text-xs text-zinc-200 block truncate">{profile.name}</span>
                <span className="text-[9px] text-zinc-550 block truncate font-mono">{profile.headline}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          </div>

          <AnimatePresence>
            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-1.5 w-full bg-zinc-950 border border-zinc-900 rounded-xl shadow-xl py-1.5 z-50 font-mono text-[10px] text-zinc-400"
                >
                  <Link href="/profile" onClick={() => setProfileMenuOpen(false)}>
                    <div className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100 transition-colors flex items-center gap-2 cursor-pointer">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Profile</span>
                    </div>
                  </Link>
                  <Link href="/settings" onClick={() => setProfileMenuOpen(false)}>
                    <div className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-900/60 hover:text-zinc-100 transition-colors flex items-center gap-2 cursor-pointer">
                      <Settings className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Settings</span>
                    </div>
                  </Link>
                  <div className="h-[1px] bg-zinc-900/60 my-1" />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo />
          <span className="font-bold text-zinc-100 tracking-tight text-sm">Career Officer</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-400"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-zinc-950 border-r border-zinc-900 p-6 z-50 md:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2.5">
                    <BrandLogo />
                    <span className="font-bold text-zinc-100 tracking-tight text-sm">Career Officer</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg border border-zinc-800 text-zinc-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-6">
                  {navGroups.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-500 uppercase px-1 block">
                        {group.title}
                      </span>
                      <nav className="space-y-1">
                        {group.items.map((item) => {
                          const active = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <Link 
                              key={item.name} 
                              href={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs ${
                                active 
                                  ? 'text-zinc-100 bg-zinc-900 font-medium border border-zinc-800' 
                                  : 'text-zinc-400'
                              }`}>
                                <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-zinc-500'}`} />
                                <span>{item.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-zinc-850" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center font-bold text-xs text-emerald-400 border border-zinc-850">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-xs text-zinc-200 block truncate">{profile.name}</span>
                    <span className="text-[9px] text-zinc-500 block truncate max-w-[150px] font-mono">{profile.headline}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setLogoutModalOpen(true);
                  }}
                  className="p-2 rounded-lg border border-zinc-900 text-zinc-300 hover:text-red-400 hover:bg-red-500/5 cursor-pointer shrink-0"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070708] relative">
        {/* Top Header/Bar */}
        <header className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-zinc-900/60 sticky top-0 bg-[#070708]/80 backdrop-blur-md z-30">
          <div>
            <h1 className="text-xs font-semibold text-zinc-300 tracking-tight">
              {pathname === '/dashboard' && 'Operations Center'}
              {pathname === '/jobs' && 'AI Portals Scanner'}
              {pathname === '/tracker' && 'Applications Funnel (Job Pipeline)'}
              {pathname === '/resume' && 'Resume Alignment Engine'}
              {pathname === '/analytics' && 'Search Analytics'}
              {pathname === '/reports' && 'AI Evaluation Reports'}
              {pathname === '/profile' && 'Professional Profile Context'}
              {pathname === '/settings' && 'Platform Settings'}
            </h1>
            <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">
              Career Officer — Command console
            </p>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-900 bg-zinc-950/40 text-[10px] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 transition-colors duration-150 cursor-pointer font-mono"
              >
                <Globe className="w-3.5 h-3.5 text-zinc-500" />
                <span>{currency} ({symbol})</span>
                <ChevronDown className="w-3 h-3 text-zinc-650" />
              </button>

              <AnimatePresence>
                {currencyOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setCurrencyOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-1.5 w-32 bg-zinc-950 border border-zinc-900 rounded-lg shadow-xl py-1 z-50 font-mono text-[10px]"
                    >
                      {Object.values(CURRENCIES).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c.code);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 hover:bg-zinc-900/60 transition-colors flex items-center justify-between cursor-pointer ${
                            currency === c.code ? 'text-emerald-400 font-bold' : 'text-zinc-400'
                          }`}
                        >
                          <span>{c.code}</span>
                          <span>{c.symbol}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-4 w-[1px] bg-zinc-900" />

            <button className="p-1.5 rounded-lg border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 relative cursor-pointer">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-emerald-500 top-1.5 right-1.5" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto z-10 relative">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLogoutModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl z-50 space-y-5"
            >
              <div className="space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-zinc-200 uppercase tracking-wider font-mono">Logout?</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-sans">
                  You will be signed out of your current session.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLogoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-zinc-50 hover:bg-zinc-800 text-xs font-bold transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('career_officer_logged_in');
                    localStorage.removeItem('career_officer_token');
                    router.push('/portal');
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500 font-bold text-xs transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400/60"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
