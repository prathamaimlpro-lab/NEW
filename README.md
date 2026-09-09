# PIXEL

Pixel is a professional technology learning platform: a structured 100-level curriculum, interactive visualizations, deliberate practice tracking, mastery analytics and a full content Admin CMS — built as a serious engineering product, not a game.

## Stack

- React + TypeScript + Vite
- Supabase-ready architecture (Auth + Postgres + RLS); local-first cache when unconfigured
- Monochrome Pixel design system (Geist + JetBrains Mono)

## Setup

```bash
npm install
npm run dev -- --host
npm run build
npm run preview
```

## Architecture

- `src/data/*` — seed curriculum content (worlds, levels, lessons, problems, projects)
- `src/services/contentStore.ts` — single content repository (local snapshot → Supabase `content_snapshot`)
- `src/services/authService.ts` — Supabase Auth (roles: student / reviewer / content_admin / super_admin); dev-mode fallback only when unconfigured
- `src/services/progressRepository.ts` — server-side per-user progress (`trackers`), local cache
- `src/services/validationService.ts` — content validation before save/import
- `src/components/brand/PixelLogo.tsx` — official monochrome wordmark & mark
- `src/pages/admin/*` — Admin CMS (curriculum, lessons, problems, projects, achievements, theme, settings, import/export)

## Supabase

Run `supabase/schema.sql` then `supabase/migrations/0002_real_accounts_rls.sql`.
Set locally (never commit): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
Authorization is enforced server-side by Row Level Security; students read only PUBLISHED content.

## Brand

Pixel identity is monochrome: black/white/neutral gray with a custom segmented-X mark.
Semantic colors (success/warning/error/info) are reserved for application state only.
