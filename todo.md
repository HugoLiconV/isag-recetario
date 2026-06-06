# Todo — Recetario Digital Personal

Tasks ordered by dependency. P0 = must have (v1 launch), P1 = should have.

---

## 1. Project Setup ✅

- [x] Install dependencies: `react-router-dom`, `@supabase/supabase-js`, `gray-matter`
- [x] Configure Vite to handle `.md` files as raw strings (via `?raw` imports — works out of the box in Vite)
- [x] Add Google Fonts: Playfair Display (700) + DM Sans (400/500/600) — imported in `tokens.css`
- [x] Create `src/styles/tokens.css` with all CSS custom properties from PRD (colors, typography, spacing)
- [x] Create `src/styles/reset.css` (box-sizing, margin reset, base font)
- [x] Import both stylesheets in `main.tsx`, remove Vite boilerplate styles
- [x] Set up `src/lib/supabase.ts` with typed Supabase client (reads from `.env`)
- [x] Create `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [x] Add `.env` to `.gitignore`
- [x] Clean up Vite boilerplate (`App.css`, placeholder content in `App.tsx`, unused assets)
- [x] Add `.nvmrc` pinned to Node 22 (Vite 8 requires Node 20+)

---

## 2. Supabase Configuration ✅

- [x] Create Supabase project
- [x] Create `notes` table
- [x] Enable Row Level Security on `notes` table
- [x] Create author user via Supabase Auth dashboard (email + password)
- [x] Create `notes_author_only` RLS policy with real author UID
- [x] Add Supabase project URL and anon key to `.env`

---

## 3. Data Layer — Recipes ✅

- [x] Define `Recipe` TypeScript type — `src/lib/types.ts`
- [x] Define `Modulo` type — includes slug, name, number, days, recipe_count, color
- [x] Create `src/content/recipes/` with one sample recipe (macarrones de frambuesa)
- [x] Write `src/lib/recipes.ts` — uses `import.meta.glob` with `?raw` + `gray-matter`
- [x] Parse frontmatter, title, ingredient groups (with named sections), and steps
- [x] Helpers: `getModulos()`, `getRecipesByModulo()`, `getRecipesByDay()`, `getRecipe(id)`
- [x] In-memory search: matches recipe title, tags, and ingredient descriptions
- [x] `src/lib/moduleColors.ts` — stable earthy color assigned per module slug

---

## 4. Auth Context ✅

- [x] Create `src/context/AuthContext.tsx` — wraps app, exposes `session`, `signIn`, `signOut`
- [x] On mount, restore session from `localStorage` via `supabase.auth.getSession()`
- [x] Listen to `supabase.auth.onAuthStateChange` to keep session in sync
- [x] Export `useAuth()` hook for consuming components

---

## 5. Routing ✅

- [x] Install and configure `react-router-dom` in `App.tsx`
- [x] Define routes:
  - `/` → `HomePage`
  - `/search` → `SearchPage`
  - `/module/:slug` → `ModulePage`
  - `/module/:slug/recipe/:recipeId` → `RecipePage`
  - `/login` → `LoginPage` (no link anywhere in UI)
- [x] Wrap router with `AuthProvider`

---

## 6. Shared Components ✅

- [x] `BottomTabBar` — Inicio + Buscar tabs, highlights active tab, hidden on Módulo/Receta screens
- [x] `BackButton` — back arrow for full-screen pages (Módulo, Receta)
- [x] `Tag` — small pill for recipe tags
- [x] `Badge` — accent-colored badge (recipe number like "1.3")

---

## 7. Home Screen (`/`) ✅

- [x] Layout: header ("Mi Recetario" + decorative search bar) + module grid + bottom tab bar
- [x] Decorative search bar — tap navigates to `/search`
- [x] Module grid: 2-column layout, first module card spans full width (featured)
- [x] `ModuleCard` component: module color background, large faded module number, module name, day count chip, recipe count chip
- [x] Tapping a card navigates to `/module/:slug`

---

## 8. Search Screen (`/search`) ✅

- [x] Layout: input with autofocus + results area + bottom tab bar
- [x] Empty state: list of all modules with their color (same visual as home cards, compact)
- [x] With query: real-time search across all recipes, results grouped by module
- [x] Each result shows recipe name + module + day context
- [x] No-results state: friendly message
- [x] Tapping a result navigates to the recipe

---

## 9. Module Screen (`/module/:slug`) ✅

- [x] Full-screen layout, no bottom tab bar
- [x] Hero section: module color background, large faded module number, module name, back button
- [x] Horizontal scrollable day pills (Día 1 · Día 2 · Día 3…), first day selected by default
- [x] Recipe list filtered by selected day
- [x] `RecipeCard` component: badge with recipe number (e.g. "1.3"), recipe name in Playfair Display, cook time if present
- [x] Tapping a card navigates to `/module/:slug/recipe/:recipeId`

---

## 10. Recipe Screen (`/module/:slug/recipe/:recipeId`) ✅

- [x] Full-screen layout, no bottom tab bar
- [x] Hero: module color background, recipe number badge, module name + day label, recipe title in Playfair Display, tags row
- [x] Back button to module screen
- [x] Two tabs: **Ingredientes** | **Pasos** — equal visual weight, no default tab prominence
- [x] Ingredientes tab: table with columns Cantidad / Unidad / Ingrediente, support grouped sections if frontmatter defines them
- [x] Pasos tab: numbered cards, step number in Playfair Display accent color, body text large
- [x] Floating notes button — visible only when `useAuth().session` is active

---

## 11. Notes Feature (author only) ✅

- [x] `NotesModal` component — full-screen overlay with markdown textarea
- [x] On open: fetch note from Supabase by `recipe_id`
- [x] Auto-save on blur or explicit save button (debounced)
- [x] Render saved note as markdown below the recipe hero (author session only)
- [x] On save: upsert to Supabase `notes` table
- [x] Handle loading + error states gracefully

---

## 12. Login Screen (`/login`) ✅

- [x] Minimal form: email + password fields + submit button
- [x] No branding or links — plain, functional
- [x] On submit: call `supabase.auth.signInWithPassword()`
- [x] On success: redirect to `/`
- [x] On error: show inline error message
- [x] If already logged in: redirect to `/`

---

## 13. P1 — Portion Scaling

- [ ] Add porciones state (default from frontmatter) to Recipe screen
- [ ] Add +/− control in the Ingredientes tab header
- [ ] Multiply all numeric quantities by `(selected / original)` ratio when rendering the table

---

## 14. P1 — Step-by-Step Mode

- [ ] Add "Modo Cocina" button on Recipe screen (Pasos tab)
- [ ] Full-screen overlay showing one step at a time: large step number, large text, prev/next navigation
- [ ] Swipe gesture support (touch events) or large prev/next buttons

---

## 15. Deploy

- [ ] Create GitHub repository and push code
- [ ] Connect repo to Vercel (or Netlify)
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in hosting dashboard
- [ ] Verify production build loads recipes correctly (Vite glob imports work in build mode)
- [ ] Test author login flow on production URL
- [ ] Test that notes are invisible without auth (check network tab — no payload)

---

## 16. Content — Recipe Digitization (external process)

- [ ] Photograph each recipe page from the physical book
- [ ] Process each photo through Claude Vision to extract structured markdown + frontmatter
- [ ] Review and correct each generated `.md` file (~5 min/recipe)
- [ ] Save files to `src/content/recipes/` following the naming convention `modulo-slug-dia-N-nombre.md`
- [ ] Verify all recipes render correctly in the app
- [ ] Add cover images to `public/images/platillos/` if available (optional per PRD)

---

## Done

_(move completed tasks here)_
