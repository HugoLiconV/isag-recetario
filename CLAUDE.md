# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project uses **yarn** as its package manager.

```bash
yarn dev             # Start Vite dev server
yarn build           # Type-check (tsc -b) then bundle (vite build)
yarn lint            # ESLint across the project
yarn test            # Vitest single run
yarn test:watch      # Vitest watch mode
yarn vitest run src/lib/parseFrontmatter.test.ts  # Run a single test file
```

## Architecture

Mobile-first recipe book app. Recipes are stored as markdown files with YAML frontmatter, parsed at build time. Private author notes are stored in Supabase (Postgres + RLS). The app is public by default; only the author logs in via a hidden `/login` route.

### Data flow

Markdown files in `src/content/recipes/` → loaded via `import.meta.glob('**/*.md', { query: '?raw' })` at build time → parsed by `parseFrontmatter.ts` (custom, no Node dependencies) + body parsers in `recipes.ts` → cached in-memory as `Recipe[]`.

### Key modules

- **`src/lib/recipes.ts`** — Core data layer. Parses markdown into `Recipe` objects, aggregates into `Modulo` groups. Exports `getModulos()`, `getRecipesByModulo()`, `getRecipesByDay()`, `getRecipe()`, `search()`.
- **`src/lib/parseFrontmatter.ts`** — Lightweight YAML frontmatter parser (replaces `gray-matter` to avoid Node.js `Buffer` dependency in the browser). Handles strings, numbers, and bracket arrays.
- **`src/lib/moduleColors.ts`** — Assigns stable earthy background colors to modules by slug order.
- **`src/context/AuthContext.tsx`** — Supabase Auth session management. Provides `useAuth()` hook with `session`, `signIn`, `signOut`.

### Recipe markdown format

Files are organized in nested folders: `{module-slug}/{dia-N-tema}/{recipe-name}.md` (e.g. `07-reposteria/dia-2-merengues-y-macarrones/macarrones-frambuesa.md`). Frontmatter keys: `modulo`, `modulo_slug`, `dia`, `dia_tema`, `orden`, `tags` (bracket array), `porciones`, `imagen_portada` (optional). Body has `# Title`, `## Ingredientes` (markdown tables, optionally split by `### Section`), and `## Pasos` (numbered list).

### Routing

`/` → Home (module grid) · `/search` → Search · `/module/:slug` → Module detail · `/module/:slug/recipe/:recipeId` → Recipe detail · `/login` → Hidden auth page

Home and Search show `BottomTabBar`; Module and Recipe are full-screen without it.

### Design system

CSS custom properties in `src/styles/tokens.css`. Two font families: Playfair Display (display/headings) and DM Sans (UI). Spacing scale in 4px increments (`--space-1` through `--space-16`). Accent color `--accent: #C8401A`.

## Environment

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (see `.env.example`). These are only needed for the notes feature; recipe browsing works without them.

## Conventions

- All UI text is in Spanish
- CSS is plain CSS files (no modules, no CSS-in-JS), one per component
- Components use design tokens from `tokens.css` — don't hardcode colors, spacing, or fonts
- React Compiler is enabled via Babel preset — no manual `useMemo`/`useCallback` needed
