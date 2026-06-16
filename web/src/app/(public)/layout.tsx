'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Simple geometric CO monogram logo
  const BrandLogo = () => (
    <div className="w-7 h-7 relative flex items-center justify-center shrink-0">
      <svg className="w-full h-full text-emerald-500" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 24C8.68629 24 6 21.3137 6 18C6 14.6863 8.68629 12 12 12C14.7614 12 17.1 13.8 17.8 16.3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="23" cy="18" r="6" stroke="currentColor" strokeWidth="2.5" />
        <path d="M16 22L21 17L26 12M26 12H21M26 12V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#050507] text-zinc-100 overflow-x-clip relative">
      {/* Background glowing gradients — pinned to the viewport in a clipped
          fixed layer so they never extend the scrollable area (otherwise the
          bottom glow added ~500px of empty space below the footer). */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[160px]" />
      </div>

      {/* Navigation Header */}
      <header className="w-full border-b border-zinc-900/50 bg-[#050507]/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <BrandLogo />
            <div>
              <span className="font-bold text-zinc-100 tracking-tight text-sm group-hover:text-emerald-400 transition-colors">
                Career Ops
              </span>
              <span className="text-[8px] text-zinc-500 font-mono block">Career Operating System</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold text-xs cursor-pointer transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main page content wrapper */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        {children}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/60 bg-[#050507] py-8 px-6 text-[10px] text-zinc-650 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Career Ops Inc. All placement intelligence operations are running locally.</p>
          <div className="flex items-center gap-4 text-zinc-500">
            <Link href="/login" className="hover:text-zinc-300">Sign in</Link>
            <Link href="/signup" className="hover:text-zinc-300">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
