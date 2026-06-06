# Recetario Digital Personal

Mobile-first web app for browsing, searching, and annotating digitized recipes from a cooking course. Public read-only access for classmates, with private notes exclusively for the author.

## Stack

- **React 19** + TypeScript
- **Vite 8** (dev server + build)
- **React Router** (client-side routing)
- **Supabase** (auth + private notes with RLS)
- **CSS custom properties** (design tokens, no CSS-in-JS)

## Getting started

```bash
# Install dependencies
yarn

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start dev server
yarn dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Vite dev server |
| `yarn build` | Type-check + production bundle |
| `yarn lint` | ESLint |
| `yarn test` | Vitest (single run) |
| `yarn test:watch` | Vitest (watch mode) |

## Architecture

Recipes are stored as Markdown files with YAML frontmatter in `src/content/recipes/`. They are parsed at build time and served as static data — no backend required for browsing.

The author's private notes are stored in Supabase (Postgres + Row Level Security) and only visible after authenticating via `/login`.

### Routes

- `/` — Home (module grid)
- `/search` — Search
- `/module/:slug` — Module detail
- `/module/:slug/recipe/:recipeId` — Recipe detail
- `/login` — Author authentication (hidden)

## Documentation

- [PRD (Product Requirements Document)](./PRD.md)
- [Todo / Roadmap](./todo.md)
- [Claude Code instructions](./CLAUDE.md)

## Environment variables

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` for the notes feature. Recipe browsing works without them.
