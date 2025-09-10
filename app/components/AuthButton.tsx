"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export function AuthButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="
            h-full px-6 py-3 bg-black text-white font-bold uppercase
            transition-all transform-gpu duration-150
            hover:bg-gray-800 hover:-translate-y-0.5
            active:translate-y-0
          ">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      
      <SignedIn>
        <div className="h-full flex items-center justify-center px-4">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-black",
                userButtonPopoverCard: "border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              }
            }}
          />
        </div>
      </SignedIn>
    </>
  );
}