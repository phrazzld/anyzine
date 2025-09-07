"use client";

import { useState } from 'react';

interface ShareButtonsProps {
  subject: string;
  publicId: string;
}

export function ShareButtons({ subject, publicId }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/zines/${publicId}`
    : '';
  
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={handleCopyLink}
        className="px-6 py-3 bg-black text-white font-bold uppercase border-4 border-black hover:bg-white hover:text-black transition-all"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=Check out this zine about ${encodeURIComponent(subject)}!&url=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-blue-500 text-white font-bold uppercase border-4 border-black hover:bg-blue-600 transition-all"
      >
        Share on X
      </a>
    </div>
  );
}