"use client";

import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function AuthButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-black text-white font-bold uppercase text-sm border-4 border-black hover:bg-white hover:text-black transition-all transform hover:translate-y-[-2px] active:translate-y-0">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <div className="flex items-center gap-4">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-12 h-12 border-4 border-black",
                userButtonPopoverCard: "border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              }
            }}
          />
          <SignOutButton>
            <button className="px-4 py-2 bg-red-500 text-white font-bold uppercase text-xs border-4 border-black hover:bg-red-600 transition-all transform hover:translate-y-[-2px] active:translate-y-0">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </SignedIn>
    </div>
  );
}