# KukuSmart

KukuSmart is a poultry-focused farm assistant built with Next.js. It combines farm workflows (resources, scans, supplier/store flows) with Gemini-powered assistant features for farmer Q and A, image-based checks, and progress guidance.

Built for MKU AI Hackathon 2025 (School of Computing and Informatics).

Event context:
- Mount Kenya University, School of Computing and Informatics
- Google Developer Group (GDG) on Campus MKU

## Current Setup

- Frontend and backend in one Next.js App Router project.
- Server Actions handle most business logic.
- Prisma 7 with generated client output under src/generated/prisma.
- PostgreSQL database access through Prisma adapter-pg.
- Supabase Storage for image uploads.
- NextAuth v5 for authentication and roles.
- Gemini API via @google/genai for AI responses.
- Homepage chat supports voice input/output with Kiswahili (default) and English.

## AI and Voice Features

- API route for chat: src/app/api/ai/chat/route.ts
- Uses GOOGLE_API_KEY on the server.
- Language-aware response behavior:
	- sw-KE (default)
	- en-US
- Browser voice features in homepage chat:
	- Speech-to-text for farmer input
	- Text-to-speech for assistant replies

## Environment Variables

Copy .env.example to .env and fill values.

Required keys:

- DATABASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- AUTH_SECRET
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- AUTH_GITHUB_ID
- AUTH_GITHUB_SECRET
- GOOGLE_API_KEY
- GOOGLE_MAPS_KEY
- ORG_EMAIL
- APP_PASSWORD

## Local Development

1. Install dependencies

npm install

2. Generate Prisma client

npx prisma generate

3. Start dev server

npm run dev

4. Open app

http://localhost:3000

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## Notes

- The app now uses Gemini, not OpenAI.
- Prisma enums used by app code come from src/generated/prisma/enums.ts.
- If auth endpoints fail with MissingSecret, set AUTH_SECRET in .env.

## Troubleshooting

If you see Prisma runtime or module errors during dev:

1. Delete .next
2. Run npm install
3. Run npx prisma generate
4. Run npm run dev