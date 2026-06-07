export type IngredientGroup = {
  section?: string
  items: Ingredient[]
}

export type Ingredient = {
  amount: string
  unit: string
  description: string
}

export type Recipe = {
  id: string              // derived: "{modulo_slug}-dia{dia}-{slug}"
  slug: string            // from filename (NN-slug.md)
  modulo: string          // frontmatter
  modulo_slug: string     // from module folder (NN-slug)
  dia: number             // from day folder prefix (NN)
  dia_tema: string        // frontmatter
  orden: number           // from recipe filename prefix (NN)
  tags: string[]          // frontmatter
  porciones: number       // frontmatter
  imagen_portada?: string // frontmatter (optional)
  // Parsed body
  title: string
  ingredient_groups: IngredientGroup[]
  steps: string[]
  raw: string             // full markdown body, for search
}

export type Modulo = {
  slug: string
  name: string
  number: number          // extracted from slug prefix e.g. "01-salsas" → 1
  days: number[]          // sorted unique list of day numbers
  recipe_count: number
  color: string
}
