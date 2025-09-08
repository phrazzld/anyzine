import { notFound } from 'next/navigation';
import { ConvexHttpClient } from 'convex/browser';
import { ZineDisplay, TZineSection } from '@/app/components/ZineDisplay';
import Link from 'next/link';
import { ShareButtons } from './ShareButtons';

// Get Convex client for server-side data fetching
function getConvexClient(): ConvexHttpClient {
  const convexUrl = process.env.NODE_ENV === 'production'
    ? process.env.NEXT_PUBLIC_CONVEX_URL_PROD || 'https://laudable-hare-856.convex.cloud'
    : process.env.NEXT_PUBLIC_CONVEX_URL_DEV || 'https://youthful-albatross-854.convex.cloud';
  
  return new ConvexHttpClient(convexUrl);
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicZinePage({ params }: PageProps) {
  const { id } = await params;
  const convex = getConvexClient();
  
  // Fetch zine from Convex
  let zine;
  try {
    zine = await convex.query("zines.getZineByPublicId" as any, {
      publicId: id,
    });
  } catch (error) {
    console.error('Failed to fetch zine:', error);
    notFound();
  }
  
  if (!zine) {
    notFound();
  }
  
  // Convert database format to display format
  const sections: TZineSection[] = [
    { type: 'banner', content: zine.banner },
    { type: 'subheading', content: zine.subheading },
    { type: 'intro', content: zine.intro },
    { type: 'mainArticle', content: zine.mainArticle },
    { type: 'opinion', content: zine.opinion },
    { type: 'funFacts', content: zine.funFacts },
    { type: 'conclusion', content: zine.conclusion },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Header with back button and share info */}
      <header className="border-b-4 border-black bg-yellow-400 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link 
            href="/"
            className="px-4 py-2 bg-black text-white font-bold uppercase border-4 border-black hover:bg-white hover:text-black transition-all"
          >
            ← Create Your Own
          </Link>
          
          <div className="text-right">
            <div className="text-sm font-bold uppercase">Public Zine</div>
            <div className="text-xs font-mono">ID: {id}</div>
            <div className="text-xs">Views: {zine.viewCount || 0}</div>
          </div>
        </div>
      </header>
      
      {/* Zine content */}
      <main className="py-8">
        <ZineDisplay sections={sections} />
      </main>
      
      {/* Share section */}
      <footer className="border-t-4 border-black bg-lime-400 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold uppercase mb-4">Share This Zine!</h3>
          <ShareButtons subject={zine.subject} publicId={id} />
        </div>
      </footer>
    </div>
  );
}