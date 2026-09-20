# UI/UX + Debug pass — summary of changes

Scope: UI/UX polish and bug fixes only. No content, data model, or backend changes.

## Fixed

1. **Duplicate header on every page** (`src/components/dashboard3/DashboardHeader.tsx`)
   The dashboard header was rendering its own streak/XP chips and a second
   `QuickFind` search box — both already provided by the global `Topbar`
   (streak/XP) and `Sidebar` (search). Every page showed two functioning
   search boxes and two different-looking streak/XP chips stacked in the
   same viewport. Trimmed the component down to the one thing it uniquely
   provides: the current World/Level/Lesson context line. Also slightly
   increased that line's visual weight (`.d3-context`) since it's now the
   header's sole content.

2. **Analytics Band empty grid cell** (`src/components/dashboard3/dashboard3.css`)
   The band always renders exactly 5 metric units (velocity, mastery,
   consistency, accuracy, revision — confirmed in `bandSelectors.ts`), but
   the 3-column and 2-column responsive breakpoints left a visible empty
   cell on the last row (5 items don't divide evenly into 3 or 2 columns).
   Added targeted `nth-child` rules so the last unit spans the remaining
   columns instead of leaving a blank box.

3. **Orphaned `/achievements` page** (`src/App.tsx`)
   `Achievements.tsx` is a fully built, correctly-gated page (real
   locked/unlocked state from `achievementsData` + `stats`), and the
   Topbar's breadcrumb label map already had an entry for `/achievements` —
   but the route itself was never registered, so the page was completely
   unreachable except by typing the URL by hand. Added the route.

4. **Orphaned admin routes** (`src/App.tsx`)
   `AdminLayout.tsx`'s nav list (and links inside `AdminDashboard.tsx`)
   pointed at `/admin/settings` and `/admin/theme`, both backed by real,
   already-written pages (`SettingsAdmin.tsx`, `ThemeAdmin.tsx`) — neither
   route was registered. Added both, following the existing route pattern.

5. **Profile page upgrade** (`src/pages/Profile.tsx`)
   - Wired in the existing `AuthPanel` component (real Supabase sign
     in/up/reset/sign-out) into the Account section. It was fully built
     but not used anywhere in the app; it also correctly renders nothing
     on a deployment with no Supabase project configured, so this is safe
     regardless of environment.
   - Added a "Milestones" section: the 3 most recently unlocked
     achievements (icon, title, description, XP), sourced from the same
     `achievementsData` the Achievements page uses, with a real empty
     state and a "View all →" link to the now-reachable Achievements page.
   - Made the "milestones" stat in the summary strip a link to
     `/achievements`.
   - Added an "Export My Data" button (downloads the learner's own stats
     as JSON) next to the existing "Reset Local Progress" control.
   - Fixed a CSS regression this introduced: `.p-strip`'s stat cells were
     styled via a `.p-strip > div` selector; making the milestones cell a
     `<Link>` (renders as `<a>`) would have silently dropped its padding
     and divider border. Changed the selector to `.p-strip > *` so any
     interactive or non-interactive cell gets the same treatment, plus a
     focus/hover state for the new link.

## Verified, not changed

- **Knowledge Graph** (`KnowledgeGraph.tsx`) — fully built and working
  (pan/zoom canvas, inspector, keyboard-accessible list fallback, legend).
  It renders its own honest empty state when zero concepts are
  `PUBLISHED` yet — that's correct behavior, not a bug.
- **World count** — the curriculum is a deliberate, fully-authored 10
  World × 10 Level = 100 Level structure (`src/data/curriculum.ts`), not a
  stub. No change needed; earlier "13 Worlds" language was outdated.

## Not done in this pass (flagged, not fixed)

- `AdminLayout.tsx` exists as a more complete admin shell (with the
  settings/theme nav links already built in) but `App.tsx` uses its own
  inline `AdminShell` instead. Left the inline `AdminShell` in place and
  just added the two missing routes to it, since swapping the whole shell
  component is a larger change than this pass's scope and couldn't be
  visually verified without a live build.
- Could not run `npm install` / `tsc` / `vite build` in this environment
  (no network access), so these changes were verified by careful manual
  review and brace/paren balance checks rather than a live compile —
  worth running `npm run build` once before deploying.
