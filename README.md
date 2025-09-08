# AnyZine - Neobrutalist Digital Zine Generator

AnyZine is a Next.js 15 application that generates neobrutalist-styled digital zines on any subject using OpenAI's GPT-4. The app features bold, minimalist design with interactive elements, authentication, rate limiting, and persistent storage.

## Features

- 🎨 **Neobrutalist Design**: Bold colors, thick borders, and retro-inspired animations
- 🤖 **AI-Powered Content**: Generate unique zines on any topic using GPT-4
- 🔐 **Authentication**: Clerk integration with magic links and Google OAuth
- 🚦 **Tiered Rate Limiting**: Anonymous (2/hour) and authenticated (10/day) user tiers
- 💾 **Persistent Storage**: Convex database for zines and rate limit tracking
- 🔄 **Session Migration**: Seamless transition from anonymous to authenticated usage
- 🔗 **Shareable Zines**: Public URLs for sharing generated zines
- ⚡ **Real-time Updates**: WebSocket-based rate limit status updates

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Convex
- **AI**: OpenAI GPT-4o-mini
- **Testing**: Vitest, React Testing Library
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- OpenAI API key
- Clerk account (free tier works)
- Convex account (free tier works)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT_URL=https://your-deployment.convex.cloud
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/phrazzld/anyzine.git
cd anyzine
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Clerk:
   - Create a Clerk application at [clerk.com](https://clerk.com)
   - Enable Email (magic link) and Google OAuth sign-in methods
   - Copy your API keys to `.env.local`

4. Set up Convex:
   - Install Convex CLI: `npm install -g convex`
   - Run `npx convex dev` to create a new Convex project
   - Follow the prompts to set up your project
   - The deployment URL will be added to `.env.local` automatically

5. Deploy Convex functions:
```bash
npx convex deploy
```

## Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

```bash
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
```

## Project Structure

```
anyzine/
├── app/
│   ├── api/              # API routes
│   │   └── generate-zine/  # Zine generation endpoint
│   ├── components/       # React components
│   │   ├── AuthButton.tsx
│   │   ├── CheckerLoadingState.tsx
│   │   ├── RateLimitIndicator.tsx
│   │   ├── SessionMigrationHandler.tsx
│   │   ├── SubjectForm.tsx
│   │   └── ZineDisplay.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useRateLimit.ts
│   │   └── useZineGeneration.ts
│   ├── utils/           # Utility functions
│   │   ├── api-resilience.ts
│   │   ├── content-sanitization.ts
│   │   └── validation.ts
│   └── zines/[id]/      # Public zine pages
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── zines.ts         # Zine CRUD operations
│   └── rateLimits.ts    # Rate limiting logic
├── lib/                 # Library code
│   └── sessionMigration.ts
├── middleware.ts        # Next.js middleware
└── tests/              # Test files
```

## Rate Limiting

The application implements a tiered rate limiting system:

- **Anonymous Users**: 2 requests per hour
- **Authenticated Users**: 10 requests per day

Rate limits are tracked using:
1. Session cookies for anonymous users (30-day expiry)
2. User IDs for authenticated users
3. IP addresses as fallback

The system includes automatic session migration when anonymous users sign in, preserving their usage history.

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run specific test suites
pnpm test app/components
pnpm test convex
pnpm test tests/integration

# Check coverage
pnpm test -- --coverage
```

Current test coverage: 232+ tests passing across unit and integration tests.

## Production Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variables in Production

Ensure all environment variables are set in your production environment:
- OpenAI API key must have sufficient credits
- Clerk keys should use production keys (not test keys)
- Convex URL should point to your production deployment

### Post-Deployment

1. Verify Convex functions are deployed:
```bash
npx convex deploy --prod
```

2. Test rate limiting works correctly
3. Verify authentication flow
4. Check that zines are saved and retrievable

## Security Features

- **Input Validation**: Comprehensive prompt injection protection
- **Content Sanitization**: DOMPurify with fallback HTML stripping
- **Rate Limiting**: Prevents abuse and manages API costs
- **CSP Headers**: Content Security Policy for XSS protection
- **Session Security**: httpOnly, secure, sameSite cookies
- **Environment Variables**: Sensitive data kept in `.env.local`

## Troubleshooting

### Common Issues

1. **"Rate limit exceeded" errors**
   - Check your tier (anonymous vs authenticated)
   - Wait for the reset period (shown in UI)
   - Sign in for higher limits

2. **Convex connection errors**
   - Verify `CONVEX_DEPLOYMENT_URL` is correct
   - Run `npx convex dev` to check connection
   - Check Convex dashboard for errors

3. **Authentication not working**
   - Verify Clerk API keys are correct
   - Check Clerk dashboard for configuration
   - Ensure redirect URLs are configured in Clerk

4. **Tests failing**
   - Run `pnpm install` to ensure dependencies are up to date
   - Clear test cache: `pnpm test -- --clearCache`
   - Check for missing environment variables

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Authentication by [Clerk](https://clerk.com)
- Database by [Convex](https://convex.dev)
- AI by [OpenAI](https://openai.com)