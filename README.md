# 🃏 estímalo — Planning Poker Ponderado

**La herramienta de estimación ágil más rápida, libre y sin fricción para tu equipo.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4%EF%B8%8F-red)](https://github.com/jpradanos00/estimalo)
[![Built with AI](https://img.shields.io/badge/Built%20with-AI%20%F0%9F%A4%96-purple)](#-hecho-con-ia--vibe-coding)

<p align="center">
  <img src="https://img.shields.io/badge/stack-React%2018-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/stack-TypeScript-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/stack-TailwindCSS-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/host-Cloudflare%20Pages-F38020?logo=cloudflare" alt="Cloudflare Pages">
  <img src="https://img.shields.io/badge/cost-$0-green" alt="Free">
</p>

---

## ¿Qué es estímalo?

Una **webapp de Planning Poker** donde tu equipo estima tareas de desarrollo en **horas por persona**. Pero no es el Planning Poker de siempre: aquí **el que más sabe, más pesa**.

El facilitador asigna un **multiplicador de peso** a cada participante (×2 para la experta en backend, ×3 para el arquitecto...). El resultado final es una **media ponderada**, no una simple media aritmética.

```
María (×3.0): 4h → 12
Carlos (×2.0): 8h → 16
Ana (×1.0): 16h → 16
────────────────────────
Media simple: 9.3h
Media ponderada: 7.3h ← la que importa
```

---

## Características

| | |
|---|---|
| ⚖️ **Votación ponderada** | Asigna pesos a participantes según su expertise |
| 📋 **Historias de usuario** | Agrupa tareas bajo historias, acordeones colapsables |
| ⚡ **Tiempo real** | Los votos y cambios se sincronizan al instante vía WebSocket |
| 🌐 **i18n** | Español (default) e inglés, detección automática |
| 🌓 **Tema oscuro** | Dark/light mode con toggle, respeta tu sistema |
| ♿ **Accesible** | WCAG 2.1 AA, navegable con teclado, screen-reader friendly |
| 📱 **Responsive** | Mobile-first, funciona en cualquier dispositivo |
| 🔐 **Admin auth** | Registro con email o Google, recupera sesiones desde cualquier dispositivo |
| 👑 **Transferir admin** | El facilitador puede ceder el rol a otro participante autenticado |
| 🎉 **Unanimidad** | Lluvia de emojis cuando todo el equipo coincide en el voto |
| 🔔 **Nudge** | Avisa con emojis y sonido a quien no ha votado, visible para todos |
| 💡 **Feedback** | Botón para enviar sugerencias y bugs directamente desde la app |
| 🆓 **Gratis** | 100% free tier: Cloudflare Pages + Supabase |

---

## 🚀 Despliega el tuyo en 5 minutos

### Requisitos previos

- Cuenta gratuita en [Supabase](https://supabase.com)
- Cuenta gratuita en [Cloudflare](https://cloudflare.com)
- Node.js 18+

### Paso 1: Fork y clona

```bash
git clone https://github.com/jpradanos00/estimalo.git
cd estimalo
npm install
```

### Paso 2: Crea tu proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) → New Project
2. Nombre: `estimalo`, elige la región más cercana
3. Una vez creado, ve a **SQL Editor** → New Query
4. Pega el contenido de estos archivos (en orden):
   - `supabase/migrations/0000_initial.sql`
   - `supabase/migrations/0001_grants.sql`
   - `supabase/migrations/0002_user_stories.sql`
   - `supabase/migrations/0003_auth_admin.sql`
   - `supabase/migrations/0004_delete_session_policy.sql`
   - `supabase/migrations/0005_participant_delete_policy.sql`
   - `supabase/migrations/0006_vote_weight.sql`
   - `supabase/migrations/0007_vote_delete_policy.sql`
   - `supabase/migrations/0008_participant_user_id.sql`
5. Ejecuta cada uno con **Run**

### Paso 3: Configura Auth (opcional pero recomendado)

1. **Auth → Settings → Confirm email**: **desmarca** esta opción (evita emails de confirmación y rate limits)
2. **Auth → Providers → Google**: activa si quieres login con Google (necesitas Client ID de Google Cloud Console — [guía](https://supabase.com/docs/guides/auth/social-login/auth-google))

### Paso 4: Configura las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase (**Project Settings → API**):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Paso 5: Despliega en Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy dist
```

O conecta el repo directamente desde el dashboard de Cloudflare Pages:

| Campo | Valor |
|---|---|
| Build command | `npm run build` |
| Build output | `dist` |
| Framework | None (Vite) |

Añade las mismas variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en **Settings → Environment variables**.

---

## 🤖 Hecho con IA + Vibe Coding

**El 95% de este código ha sido generado por IA.** No es una exageración — este proyecto es un experimento real de **vibe coding** y **prompt engineering** avanzado, iterando con agentes de IA para:

- Definir la arquitectura y el modelo de datos
- Implementar componentes React con TailwindCSS
- Configurar migraciones de Supabase y Row Level Security
- Escribir el sistema de i18n y temas
- Resolver bugs y optimizar rendimiento
- Diseñar la UI/UX

Cada commit es un paso colaborativo entre humanos e IA. El código resultante es limpio, mantenible y listo para producción — demostrando que el desarrollo asistido por IA ya no es el futuro: es el presente.

---

## 🧑‍💻 Para desarrolladores

```bash
npm run dev       # Dev server en localhost:3000
npm run build     # Build de producción
npm run preview   # Previsualizar build
```

### Estructura del proyecto

```
src/
├── components/        # Componentes React
│   ├── ui/            # Primitivas (Button, Input, Card, ...)
│   ├── CardSelector.tsx
│   ├── VotingRound.tsx
│   └── RevealView.tsx
├── context/           # SessionContext, AuthContext, ThemeContext
├── hooks/             # useSession, useAuth, useRealtime, ...
├── i18n/              # es.ts, en.ts
├── pages/             # Landing, SessionRoom, AuthPage, MySessions
├── types/             # TypeScript interfaces
├── utils/             # weightedAverage, cards
└── lib/               # Cliente Supabase

supabase/migrations/   # Migraciones SQL (ejecutar en orden)
```

---

## ❤️ Open Source

**De la comunidad, para la comunidad.** Creemos que las herramientas ágiles deberían ser libres, privadas y autogestionables. Sin trackers, sin anuncios, sin coste.

¿Te gusta el proyecto? Dale una ⭐ en GitHub. ¿Quieres contribuir? Abre un issue o un PR. Toda ayuda es bienvenida.

---

MIT © 2026 — [github.com/jpradanos00/estimalo](https://github.com/jpradanos00/estimalo)
