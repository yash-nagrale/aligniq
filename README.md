<!--
  README updated to be GitHub-friendly and conflict-free.
  - Clean, concise overview
  - Quick start (zero-config demo)
  - Full Supabase + Gemini notes
  - Scripts, structure, and deployment guidance
-->

# AlignIQ

> AI-assisted performance management: goal-setting, KPI tracking, manager approvals, and analytics.

## Quick start — Zero-config demo

No external services required to try the app locally.

```bash
npm install
npm run dev
# open http://localhost:3000
```

Switch roles from the sidebar to explore Employee / Manager / Admin views.

## Full setup (Supabase + Gemini)

1. Create a Supabase project at https://app.supabase.com.
2. Run the database schema: open `supabase/schema.sql` in Supabase SQL editor and execute.
3. Copy ` .env.example` to `.env.local` and fill these values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for migrations or server tasks)
- `GEMINI_API_KEY` (optional — AI features fall back to demo responses)

## Features

- Employee goal CRUD with validation and configurable weightage
- Manager approval workflow and goal locking
- Quarterly check-ins and progress engine (Min / Max / Timeline / Zero)
- Role-based dashboards and admin controls
- Analytics: charts, heatmaps, trend views, CSV export
- AI helpers: SMART goal enhancer, KPI suggestions, performance summaries

## Project structure (top-level)

```
src/
├─ app/             # Next.js app pages and API routes
├─ components/      # UI, layout, goals, analytics components
├─ lib/             # clients, helpers, business logic
└─ hooks/ types/     # hooks and TypeScript types
```

## Common scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — start production server
- `npx tsc --noEmit` — type check

The repository also includes `SETUP.bat` and `START-APP.bat` for Windows convenience.

## Deploy

Recommended: Vercel. Add your environment variables in the Vercel dashboard, then deploy the `main` branch.

## Contributing

Contributions are welcome. Open an issue or a pull request detailing the change. For significant updates, please add tests and update documentation.

## License

See the `LICENSE` file (if present) or add your preferred license.

---

If you'd like, I can also:

- add badges (build, license, coverage)
- expand the Getting Started section for Supabase setup with exact env examples
- create a short CONTRIBUTING.md

<!-- End of file -->
