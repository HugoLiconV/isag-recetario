import { describe, it, expect } from 'vitest'
import {
  validateNNSlugFolder,
  validateRecipeFilename,
  validateFrontmatter,
  checkDeprecatedKeys,
} from './validate-recipes.ts'

describe('validateNNSlugFolder', () => {
  it('accepts valid NN-slug folder names', () => {
    expect(validateNNSlugFolder('07-reposteria', 'Module folder')).toBeNull()
    expect(validateNNSlugFolder('01-cocina-basica', 'Module folder')).toBeNull()
    expect(validateNNSlugFolder('12-pan', 'Day folder')).toBeNull()
    expect(validateNNSlugFolder('01-terminologia-culinaria', 'Day folder')).toBeNull()
  })

  it('rejects invalid folder names', () => {
    expect(validateNNSlugFolder('reposteria', 'Module folder')).not.toBeNull()
    expect(validateNNSlugFolder('7-reposteria', 'Module folder')).not.toBeNull()
    expect(validateNNSlugFolder('abc', 'Day folder')).not.toBeNull()
    expect(validateNNSlugFolder('007-reposteria', 'Module folder')).not.toBeNull()
    expect(validateNNSlugFolder('dia-1-intro', 'Day folder')).not.toBeNull()
  })

  it('includes the label in the error message', () => {
    const error = validateNNSlugFolder('bad', 'Day folder')
    expect(error).toContain('Day folder')
  })
})

describe('validateRecipeFilename', () => {
  it('accepts valid NN-slug.md filenames', () => {
    expect(validateRecipeFilename('01-corte-de-vegetales.md')).toBeNull()
    expect(validateRecipeFilename('03-macarrones-frambuesa.md')).toBeNull()
  })

  it('rejects non-md files', () => {
    expect(validateRecipeFilename('recipe.txt')).not.toBeNull()
  })

  it('rejects md files without NN- prefix', () => {
    expect(validateRecipeFilename('macarrones-frambuesa.md')).not.toBeNull()
  })
})

describe('validateFrontmatter', () => {
  const validData = {
    modulo: 'Repostería',
    dia_tema: 'Merengues y Macarrones',
    tags: ['frambuesa', 'merengue'],
    porciones: 4,
  }

  it('returns no errors for valid frontmatter', () => {
    expect(validateFrontmatter(validData)).toEqual([])
  })

  it('reports missing required keys', () => {
    const { dia_tema: _, porciones: __, ...partial } = validData
    const errors = validateFrontmatter(partial)
    expect(errors).toHaveLength(2)
    expect(errors[0]).toContain('dia_tema')
    expect(errors[1]).toContain('porciones')
  })

  it('reports empty string values as missing', () => {
    const errors = validateFrontmatter({ ...validData, modulo: '' })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('modulo')
  })
})

describe('checkDeprecatedKeys', () => {
  it('returns no warnings when no deprecated keys are present', () => {
    expect(checkDeprecatedKeys({ modulo: 'Test', tags: [] })).toEqual([])
  })

  it('warns about modulo_slug', () => {
    const warnings = checkDeprecatedKeys({ modulo_slug: '07-reposteria' })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('modulo_slug')
  })

  it('warns about dia', () => {
    const warnings = checkDeprecatedKeys({ dia: 2 })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('"dia"')
  })

  it('warns about orden', () => {
    const warnings = checkDeprecatedKeys({ orden: 1 })
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('orden')
  })

  it('warns about all deprecated keys at once', () => {
    const warnings = checkDeprecatedKeys({ modulo_slug: 'x', dia: 1, orden: 1 })
    expect(warnings).toHaveLength(3)
  })
})
