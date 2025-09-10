"use client";

import { AuthButton } from './AuthButton';

export function Header() {
  return (
    <header className="w-full bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              ANY<span className="text-purple-600">ZINE</span>
            </h1>
            <div className="hidden md:block text-xs font-bold uppercase bg-lime-400 px-2 py-1 border-2 border-black">
              AI-Powered
            </div>
          </div>
          
          {/* Right: Auth Button */}
          <div>
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}