import type { Recipe, Modulo, IngredientGroup, Ingredient } from './types';
import { getModuleColor } from './moduleColors';
import { parseFrontmatter } from './parseFrontmatter';

// Load all .md files as raw strings at build time
const modules = import.meta.glob(
  ['../content/recipes/**/*.md', '!../content/recipes/README.md'],
  {
    eager: true,
    query: '?raw',
    import: 'default'
  }
) as Record<string, string>;

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

function parseIngredients(body: string): IngredientGroup[] {
  const groups: IngredientGroup[] = [];
  // Split on h3 headings (### Section) to detect named groups
  const sections = body.split(/^###\s+/m);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const sectionName = lines[0].trim();
    const tableLines = lines.filter(
      l => l.startsWith('|') && !l.match(/^[\s|:-]+$/)
    );

    const items: Ingredient[] = [];
    for (const line of tableLines) {
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter(Boolean);
      if (cells.length >= 3 && cells[0].toLowerCase() !== 'cantidad') {
        items.push({ amount: cells[0], unit: cells[1], description: cells[2] });
      }
    }

    if (items.length === 0) continue;

    // A section is named if it came after a ### heading that isn't the table header
    const hasName = sections.indexOf(section) > 0;
    groups.push({ section: hasName ? sectionName : undefined, items });
  }

  return groups;
}

function parseSteps(body: string): string[] {
  const stepsMatch = body.match(/## Pasos\n([\s\S]*?)(?=\n## |\n# |$)/);
  if (!stepsMatch) return [];
  return stepsMatch[1]
    .split('\n')
    .filter(l => /^\d+\./.test(l.trim()))
    .map(l => l.replace(/^\d+\.\s*/, '').trim());
}

function parseTitle(body: string): string {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

/** Extract the three path segments from a glob path like `../content/recipes/07-reposteria/02-merengues/01-receta.md` */
function parseRecipePath(path: string) {
  const segments = path.split('/');
  const moduleFolder = segments[segments.length - 3]; // e.g. "07-reposteria"
  const dayFolder = segments[segments.length - 2]; // e.g. "02-merengues-y-macarrones"
  const filename = segments[segments.length - 1]; // e.g. "01-macarrones-frambuesa.md"
  const slug = filename.replace(/\.md$/, '');

  const moduloSlug = moduleFolder;
  const dia = parseInt(dayFolder.split('-')[0], 10);
  const orden = parseInt(filename.split('-')[0], 10);

  return { slug, moduloSlug, dia, orden };
}

// ---------------------------------------------------------------------------
// Recipe collection (built once, reused everywhere)
// ---------------------------------------------------------------------------

let _recipes: Recipe[] | null = null;

function buildRecipes(): Recipe[] {
  return Object.entries(modules)
    .map(([path, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const { slug, moduloSlug, dia, orden } = parseRecipePath(path);
      const ingredientsSection = content.match(
        /## Ingredientes\n([\s\S]*?)(?=\n## |\n# |$)/
      );
      const ingredientsBody = ingredientsSection ? ingredientsSection[1] : '';

      return {
        id: `${moduloSlug}-dia${dia}-${slug}`,
        slug,
        modulo: data.modulo as string,
        modulo_slug: moduloSlug,
        dia,
        dia_tema: data.dia_tema as string,
        orden,
        tags: (data.tags as string[]) ?? [],
        porciones: data.porciones as number,
        imagen_portada: data.imagen_portada as string | undefined,
        title: parseTitle(content),
        ingredient_groups: parseIngredients(ingredientsBody),
        steps: parseSteps(content),
        raw: content
      };
    })
    .sort((a, b) => {
      if (a.modulo_slug !== b.modulo_slug)
        return a.modulo_slug.localeCompare(b.modulo_slug);
      if (a.dia !== b.dia) return a.dia - b.dia;
      return a.orden - b.orden;
    });
}

function getRecipes(): Recipe[] {
  if (!_recipes) _recipes = buildRecipes();
  return _recipes;
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function getModulos(): Modulo[] {
  const recipes = getRecipes();
  const map = new Map<string, Modulo>();

  for (const r of recipes) {
    if (!map.has(r.modulo_slug)) {
      const number = parseInt(r.modulo_slug.split('-')[0], 10) || 0;
      map.set(r.modulo_slug, {
        slug: r.modulo_slug,
        name: r.modulo,
        number,
        days: [],
        recipe_count: 0,
        color: getModuleColor(r.modulo_slug)
      });
    }
    const m = map.get(r.modulo_slug)!;
    if (!m.days.includes(r.dia)) m.days.push(r.dia);
    m.recipe_count++;
  }

  return Array.from(map.values())
    .map(m => ({ ...m, days: m.days.sort((a, b) => a - b) }))
    .sort((a, b) => a.number - b.number);
}

export function getRecipesByModulo(slug: string): Recipe[] {
  return getRecipes().filter(r => r.modulo_slug === slug);
}

export function getRecipesByDay(moduloSlug: string, dia: number): Recipe[] {
  return getRecipes().filter(
    r => r.modulo_slug === moduloSlug && r.dia === dia
  );
}

export function getRecipe(id: string): Recipe | undefined {
  return getRecipes().find(r => r.id === id);
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export type SearchResult = {
  recipe: Recipe;
  modulo_name: string;
  modulo_color: string;
};

export function search(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const modulos = getModulos();
  const moduloMap = new Map(modulos.map(m => [m.slug, m]));

  return getRecipes()
    .filter(r => {
      if (r.title.toLowerCase().includes(q)) return true;
      if (r.tags.some(t => t.toLowerCase().includes(q))) return true;
      if (
        r.ingredient_groups.some(g =>
          g.items.some(i => i.description.toLowerCase().includes(q))
        )
      )
        return true;
      return false;
    })
    .map(r => ({
      recipe: r,
      modulo_name: moduloMap.get(r.modulo_slug)?.name ?? r.modulo,
      modulo_color: moduloMap.get(r.modulo_slug)?.color ?? '#ccc'
    }));
}
