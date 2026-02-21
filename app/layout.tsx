import './globals.css';
import { PostHogProvider } from '@/lib/posthog/PostHogProvider';
import { PostHogPageview } from '@/lib/posthog/PostHogPageview';

// Force dynamic rendering to ensure middleware CSP headers are applied in production
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PostHogProvider>
          <PostHogPageview />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
