# estímalo — AGENTS.md

## Overview

Planning Poker webapp with **weighted voting**. Teams estimate tasks in hours/person.  
The facilitator assigns per-participant weights (e.g. ×2 for the domain expert).  
Final result is a **weighted average**, not a simple mean.

**Stack**: React 18, Vite, TypeScript, TailwindCSS, Supabase (PostgreSQL + Realtime)  
**Hosting**: Cloudflare Pages (free), Supabase (free tier)  
**Repo**: `github.com/jpradanos00/estimalo`

---

## Project Conventions

### File naming
- Components: `PascalCase.tsx` (e.g. `CardSelector.tsx`)
- Hooks: `useCamelCase.ts` (e.g. `useSession.ts`)
- Utils: `camelCase.ts` (e.g. `weightedAverage.ts`)
- UI primitives under `src/components/ui/`

### Code style
- **No comments** unless the logic is truly non-obvious
- Prefer named exports over default exports
- Types/interfaces in `src/types/index.ts`
- All user-facing strings go through the i18n system — **zero hardcoded text**

### TailwindCSS conventions
- `dark:` prefix for dark mode variants (dark mode = `class`)
- Mobile-first: base styles for mobile, `sm:`, `md:`, `lg:` for breakpoints
- Custom colors via `tailwind.config.js` extend (indigo primary palette)
- Use `transition-colors duration-200` on all color-changing elements

### Accessibility (WCAG 2.1 AA)
- All interactives must have visible `focus-visible:ring-2 ring-indigo-500 ring-offset-2`
- Touch targets: minimum `min-h-[44px] min-w-[44px]`
- Semantic HTML: `<main>`, `<nav>`, `<section>`, heading hierarchy h1→h3
- `aria-label` on all icon-only buttons
- `aria-live="polite"` on real-time update regions
- Respect `prefers-reduced-motion: reduce` — use `motion-safe:` prefix for animations
- Color contrast ratio ≥ 4.5:1 (text) / 3:1 (large text)

### i18n
- Two locales: `es` (default), `en`
- Strings in `src/i18n/es.ts` and `src/i18n/en.ts`
- Hook: `useI18n()` returns `{ t, locale, setLocale }`
- Auto-detect via `navigator.language`, persist in `localStorage`
- Translate **everything**: labels, placeholders, errors, toasts, empty states

### Theme
- Dark/light via `darkMode: 'class'` in Tailwind
- Default: `prefers-color-scheme` media query
- Override persists in `localStorage` key `theme`
- Context: `ThemeContext` with `useTheme()` hook
- Toggle: animated sun/moon icon in header

### State management
- Session state in `SessionContext.tsx` (no Redux/Zustand needed for this scope)
- Realtime sync via Supabase subscriptions in `useRealtime.ts`
- Local component state with `useState` / `useReducer` for UI concerns

### Commands
```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

---

## Architecture

### Data Flow
```
User Action → Component → Supabase Client → PostgreSQL
                                         → Realtime broadcast
Other Clients ← Realtime Subscription ← Supabase
```

### Realtime Channels
- `session:{code}` — session state changes (status, currentTask)
- `participants:{sessionId}` — participant join/leave/weight changes
- `tasks:{sessionId}` — task CRUD
- `votes:{taskId}` — votes cast (only value broadcast, not who voted until reveal)

### Security (Row Level Security)
- No authentication required
- Access controlled by session code + participant ID (stored in localStorage)
- Admin flag checked server-side for privileged operations
- All tables have RLS policies in migration

---

## Card Sets

Default (hours): `0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 40, 80, ?, ☕`

The `?` card means "no idea / need more info". The `☕` card means "break / skip".

---

## Deployment Workflow

**CRITICAL: Never push directly to `main` for feature work.** Always use feature branches.

### Workflow
```bash
# 1. Create feature branch
git checkout -b feature-name

# 2. Develop and test locally
npm run dev

# 3. Commit and push to feature branch
git add -A
git commit -m "feat: description"
git push -u origin feature-name

# 4. Cloudflare Pages auto-deploys a preview URL
#    e.g. https://<hash>.feature-name.estimalo.pages.dev

# 5. Test on preview URL

# 6. Only merge to main when user approves:
git checkout main
git merge feature-name
git push
```

### Production URL
`https://estimalo.pages.dev`

### Preview URLs
Auto-generated per branch: `https://<hash>.<branch>.estimalo.pages.dev`

### Environment Variables (Cloudflare Pages)
Required for ALL environments (Production + Preview):
- `VITE_SUPABASE_URL` = `https://kenncensuqzzpwlwwrnj.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (see `.env` file)

### Supabase OAuth Redirect URLs
```
http://localhost:3000/**
https://**.estimalo.pages.dev/**
```
