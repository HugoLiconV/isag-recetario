import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parseFrontmatter } from '../src/lib/parseFrontmatter.ts'

// Uniform NN-slug pattern used at all three levels (module, day, recipe file)
const NN_SLUG_RE = /^(\d{2})-.+$/
const REQUIRED_KEYS = ['modulo', 'dia_tema', 'tags', 'porciones'] as const
const DEPRECATED_KEYS = ['modulo_slug', 'dia', 'orden'] as const

export interface ValidationResult {
  path: string
  message: string
}

export interface ValidationOutput {
  errors: ValidationResult[]
  warnings: ValidationResult[]
}

export function validateNNSlugFolder(name: string, label: string): string | null {
  if (!NN_SLUG_RE.test(name)) {
    return `${label} "${name}" does not match pattern NN-slug (e.g. 07-reposteria, 01-terminologia-culinaria)`
  }
  return null
}

export function validateRecipeFilename(name: string): string | null {
  if (!name.endsWith('.md')) {
    return `Only .md files are allowed in day folders`
  }
  const stem = name.replace(/\.md$/, '')
  if (!NN_SLUG_RE.test(stem)) {
    return `Recipe filename "${name}" does not match pattern NN-slug.md (e.g. 01-corte-de-vegetales.md)`
  }
  return null
}

export function validateFrontmatter(data: Record<string, unknown>): string[] {
  const errors: string[] = []
  for (const key of REQUIRED_KEYS) {
    if (!(key in data) || data[key] === '' || data[key] === undefined) {
      errors.push(`Missing required frontmatter key: ${key}`)
    }
  }
  return errors
}

export function checkDeprecatedKeys(data: Record<string, unknown>): string[] {
  const warnings: string[] = []
  for (const key of DEPRECATED_KEYS) {
    if (key in data) {
      warnings.push(`Deprecated frontmatter key "${key}" can be inferred from the folder/file structure and should be removed`)
    }
  }
  return warnings
}

export function validateRecipesDir(recipesDir: string): ValidationOutput {
  const errors: ValidationResult[] = []
  const warnings: ValidationResult[] = []

  let entries: string[]
  try {
    entries = readdirSync(recipesDir)
  } catch {
    errors.push({ path: recipesDir, message: 'Could not read recipes directory' })
    return { errors, warnings }
  }

  for (const entry of entries) {
    const entryPath = join(recipesDir, entry)
    const stat = statSync(entryPath)

    if (!stat.isDirectory()) {
      errors.push({ path: relative(recipesDir, entryPath), message: 'Unexpected file at root level (expected module folders only)' })
      continue
    }

    const moduleFolderError = validateNNSlugFolder(entry, 'Module folder')
    if (moduleFolderError) {
      errors.push({ path: entry, message: moduleFolderError })
      continue
    }

    const dayEntries = readdirSync(entryPath)
    for (const dayEntry of dayEntries) {
      const dayPath = join(entryPath, dayEntry)
      const dayStat = statSync(dayPath)

      if (!dayStat.isDirectory()) {
        errors.push({ path: relative(recipesDir, dayPath), message: 'Unexpected file at module level (expected day folders only)' })
        continue
      }

      const dayFolderError = validateNNSlugFolder(dayEntry, 'Day folder')
      if (dayFolderError) {
        errors.push({ path: relative(recipesDir, dayPath), message: dayFolderError })
        continue
      }

      const recipeFiles = readdirSync(dayPath)
      for (const recipeFile of recipeFiles) {
        const recipePath = join(dayPath, recipeFile)
        const recipeStat = statSync(recipePath)
        const relPath = relative(recipesDir, recipePath)

        if (recipeStat.isDirectory()) {
          errors.push({ path: relPath, message: 'Unexpected subdirectory inside day folder' })
          continue
        }

        const filenameError = validateRecipeFilename(recipeFile)
        if (filenameError) {
          errors.push({ path: relPath, message: filenameError })
          continue
        }

        const raw = readFileSync(recipePath, 'utf-8')
        const { data } = parseFrontmatter(raw)

        const fmErrors = validateFrontmatter(data)
        for (const e of fmErrors) {
          errors.push({ path: relPath, message: e })
        }

        const deprecatedWarnings = checkDeprecatedKeys(data)
        for (const w of deprecatedWarnings) {
          warnings.push({ path: relPath, message: w })
        }
      }
    }
  }

  return { errors, warnings }
}

// CLI entry point
const isMainModule = process.argv[1]?.endsWith('validate-recipes.ts')
if (isMainModule) {
  const recipesDir = join(import.meta.dirname!, '..', 'src', 'content', 'recipes')
  const { errors, warnings } = validateRecipesDir(recipesDir)

  for (const { path, message } of warnings) {
    console.warn(`  ⚠ ${path}: ${message}`)
  }

  if (errors.length === 0) {
    if (warnings.length > 0) console.log()
    console.log('✓ All recipes are valid')
    if (warnings.length > 0) {
      console.log(`  (${warnings.length} warning(s) above)`)
    }
    process.exit(0)
  } else {
    console.error(`\nFound ${errors.length} validation error(s):\n`)
    for (const { path, message } of errors) {
      console.error(`  ✗ ${path}: ${message}`)
    }
    process.exit(1)
  }
}
