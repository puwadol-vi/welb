# WelB

## Project structure

- `ai/` — AI scraper (Facebook → events pipeline). See `ai/CLAUDE.md` for full details.
- `src/` — Next.js web app (frontend + API routes). This is the web part of the project.
- `supabase/` — Database migrations and seed data.

## AI scraper

All scraper context, commands (in `ai/.claude/commands/scrape.md`), and workflow are documented in `ai/CLAUDE.md`. Read that file when working on anything inside `ai/`.

## Web app (`src/`)

Built with Next.js (App Router). Key areas:

- `src/app/api/` — API routes (events, spots, upload-image)
- `src/types/` — Shared TypeScript types (`event.ts`, `spot.ts`, etc.)
- `src/actions/` — Server actions
- `src/lib/` — Supabase client and utilities

API docs for the scraper live in `ai/docs/`.
