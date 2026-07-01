---
name: estimalo
description: Planning Poker webapp with weighted voting and Supabase backend. Use when working on estimalo features, realtime sync, i18n, theme, or Supabase integration.
---

# estímalo — Planning Poker Ponderado

## What is this project?

A **Planning Poker** webapp where teams estimate development tasks in **hours per person**.  
The unique feature: the session admin can assign **weights** to participants based on their
expertise in the specific task being estimated. The final result is a **weighted average**.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend/DB**: Supabase (PostgreSQL + Realtime subscriptions)
- **Hosting**: Cloudflare Pages (static) + Supabase free tier
- **No auth**: access via room code + participant name

## Key Features
1. Create/join session with 6-char code
2. Admin manages tasks to estimate
3. Participants vote on active task (private)
4. Admin reveals — all see votes with weighted average
5. Admin can adjust participant weights (0.5–3.0×) per session
6. Dark/light mode, Spanish/English i18n
7. Mobile-first, WCAG 2.1 AA accessible

## When to use this skill
- Adding new features to the planning poker app
- Modifying the realtime sync logic
- Working on i18n or theme systems
- Debugging Supabase RLS or subscriptions
- Adding new card sets or estimation types

## Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable primitives (Button, Input, Card, Slider, Badge)
│   ├── CreateSession.tsx
│   ├── JoinSession.tsx
│   ├── ParticipantList.tsx
│   ├── WeightEditor.tsx
│   ├── TaskBoard.tsx
│   ├── TaskForm.tsx
│   ├── CardSelector.tsx
│   ├── VotingRound.tsx
│   ├── RevealView.tsx
│   └── SessionHeader.tsx
├── context/
│   ├── SessionContext.tsx
│   ├── ThemeContext.tsx
│   └── I18nContext.tsx
├── hooks/
│   ├── useSession.ts
│   ├── useRealtime.ts
│   ├── useI18n.ts
│   └── useTheme.ts
├── i18n/
│   ├── index.ts
│   ├── es.ts
│   └── en.ts
├── lib/
│   └── supabase.ts
├── pages/
│   ├── Landing.tsx
│   └── SessionRoom.tsx
├── types/
│   └── index.ts
├── utils/
│   ├── weightedAverage.ts
│   └── cards.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Database Schema (Supabase)
- `sessions`: room metadata (code, status, current task)
- `participants`: per-user data (name, weight, is_admin)
- `tasks`: estimation items (title, status, final_estimate)
- `votes`: individual votes per task (value, participant_id)

## Translation keys convention
All keys use dot notation: `section.key`
Example: `t('landing.createSession')` → "Crear sala" (es) / "Create room" (en)

## Responsive breakpoints (Tailwind)
- Default: mobile (< 640px)
- `sm:` ≥ 640px (tablet)
- `md:` ≥ 768px (small desktop)
- `lg:` ≥ 1024px (desktop)
- `xl:` ≥ 1280px (wide)

## Weight calculation
```
weightedAvg = Σ(vote_i × weight_i) / Σ(weight_i)
```
Display both simple mean and weighted mean on reveal screen.
