# Legalhubly

AI-powered legal platform connecting clients with lawyers.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Postgres + Auth + Storage)

## Getting Started

1. Clone this repository.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

Configure Supabase URL and anon key in your environment (see project docs or `.env.example` if present).

## Features

The following are implemented in the app today:

- Lawyer discovery
- Save lawyers
- User authentication
- Case management

## Supabase Edge Functions (AI & email)

AI chat functions expect:

- `AI_API_KEY` — API key for your OpenAI-compatible provider
- Optional: `AI_CHAT_COMPLETIONS_URL` (default `https://api.openai.com/v1/chat/completions`)
- Optional: `AI_CHAT_MODEL` (default `gpt-4o-mini`)

Transactional email uses `EMAIL_SERVICE_SECRET`, `TRANSACTIONAL_EMAIL_SEND_URL` or `TRANSACTIONAL_EMAIL_API_BASE` as configured for your sending backend.
