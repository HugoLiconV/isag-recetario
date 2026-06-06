export function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':')
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    let val: string | number | string[] = line.slice(sep + 1).trim()

    // Bracket array: [a, b, c]
    const arrMatch = val.match(/^\[(.+)]$/)
    if (arrMatch) {
      data[key] = arrMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
      continue
    }

    // Strip surrounding quotes
    val = val.replace(/^["']|["']$/g, '')

    // Number
    const num = Number(val)
    if (val !== '' && !isNaN(num)) {
      data[key] = num
      continue
    }

    data[key] = val
  }

  return { data, content: match[2] }
}
