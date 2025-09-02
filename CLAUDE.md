# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AnyZine is a Next.js 15 application that generates neobrutalist-styled digital zines on any subject using OpenAI's GPT-4. The app features a bold, minimalist design with interactive elements and uses React 19 with TypeScript.

## Commands

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

## Architecture

### API Layer
- **`/api/generate-zine`**: POST endpoint that accepts a subject and returns structured zine content
  - Uses OpenAI GPT-4o-mini model
  - Returns JSON with specific sections: banner, subheading, intro, mainArticle, opinion, funFacts, conclusion
  - Requires `OPENAI_API_KEY` environment variable

### Component Structure
- **`SubjectForm`**: Main client component handling user input, API calls, and state management
  - Manages loading states, error handling, and random subject selection
  - Uses constants from `app/constants.ts` for subject suggestions
  
- **`ZineDisplay`**: Presentational component rendering the zine content
  - Implements responsive 2-column layout on desktop
  - Color-coded sections with neobrutalist styling

### Styling Approach
- Tailwind CSS for utility-first styling
- Neobrutalist design patterns: thick borders, bold colors, uppercase text
- Interactive hover/active states with transform animations

## Environment Setup

Required environment variable:
```
OPENAI_API_KEY=your-openai-api-key
```

## Key Technical Details

- TypeScript strict mode enabled
- Path alias configured: `@/*` maps to project root
- Next.js App Router with React Server Components
- Client-side state management in SubjectForm component
- Structured JSON response format enforced via OpenAI system prompt