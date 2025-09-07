import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from './providers/ConvexClientProvider';

// Force dynamic rendering to ensure middleware CSP headers are applied in production
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ConvexClientProvider>
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
