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
  // Frontmatter
  id: string              // derived: "{modulo_slug}-dia{dia}-{slug}"
  slug: string            // derived from filename
  modulo: string
  modulo_slug: string
  dia: number
  dia_tema: string
  orden: number
  tags: string[]
  porciones: number
  imagen_portada?: string
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
