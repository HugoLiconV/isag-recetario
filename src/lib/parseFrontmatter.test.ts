import { describe, it, expect } from 'vitest'
import { parseFrontmatter } from './parseFrontmatter'

describe('parseFrontmatter', () => {
  it('parses strings (unquoted)', () => {
    const { data } = parseFrontmatter('---\nmodulo: Repostería\n---\nBody')
    expect(data.modulo).toBe('Repostería')
  })

  it('parses strings (double-quoted)', () => {
    const { data } = parseFrontmatter('---\nmodulo: "Repostería"\n---\nBody')
    expect(data.modulo).toBe('Repostería')
  })

  it('parses strings (single-quoted)', () => {
    const { data } = parseFrontmatter("---\nmodulo: 'Repostería'\n---\nBody")
    expect(data.modulo).toBe('Repostería')
  })

  it('parses numbers', () => {
    const { data } = parseFrontmatter('---\ndia: 2\nporciones: 4\n---\nBody')
    expect(data.dia).toBe(2)
    expect(data.porciones).toBe(4)
  })

  it('parses bracket arrays', () => {
    const { data } = parseFrontmatter('---\ntags: [frambuesa, merengue, francés]\n---\nBody')
    expect(data.tags).toEqual(['frambuesa', 'merengue', 'francés'])
  })

  it('parses bracket arrays with quoted items', () => {
    const { data } = parseFrontmatter('---\ntags: ["one", \'two\', three]\n---\nBody')
    expect(data.tags).toEqual(['one', 'two', 'three'])
  })

  it('returns body content after the closing ---', () => {
    const { content } = parseFrontmatter('---\ndia: 1\n---\n# Title\n\nSome body')
    expect(content).toBe('# Title\n\nSome body')
  })

  it('handles multiple keys together (full recipe frontmatter)', () => {
    const input = [
      '---',
      'modulo: "Repostería"',
      'modulo_slug: "07-reposteria"',
      'dia: 2',
      'dia_tema: "Merengues y Macarrones"',
      'orden: 1',
      'tags: [frambuesa, merengue, francés]',
      'porciones: 4',
      '---',
      '',
      '# Macarrones de Frambuesa',
    ].join('\n')

    const { data, content } = parseFrontmatter(input)

    expect(data.modulo).toBe('Repostería')
    expect(data.modulo_slug).toBe('07-reposteria')
    expect(data.dia).toBe(2)
    expect(data.dia_tema).toBe('Merengues y Macarrones')
    expect(data.orden).toBe(1)
    expect(data.tags).toEqual(['frambuesa', 'merengue', 'francés'])
    expect(data.porciones).toBe(4)
    expect(content).toContain('# Macarrones de Frambuesa')
  })

  it('returns raw string as content when no frontmatter delimiters exist', () => {
    const raw = '# Just a title\n\nNo frontmatter here.'
    const { data, content } = parseFrontmatter(raw)
    expect(data).toEqual({})
    expect(content).toBe(raw)
  })

  it('handles empty values', () => {
    const { data } = parseFrontmatter('---\nimagen_portada:\n---\nBody')
    expect(data.imagen_portada).toBe('')
  })

  it('handles Windows-style line endings (CRLF)', () => {
    const { data, content } = parseFrontmatter('---\r\ndia: 3\r\n---\r\n# Title')
    expect(data.dia).toBe(3)
    expect(content).toBe('# Title')
  })

  it('handles optional quoted path values', () => {
    const { data } = parseFrontmatter(
      '---\nimagen_portada: "/images/platillos/macarrones-frambuesa.jpg"\n---\nBody'
    )
    expect(data.imagen_portada).toBe('/images/platillos/macarrones-frambuesa.jpg')
  })
})
