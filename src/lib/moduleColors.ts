// Earthy, warm tones — one per module slot (up to 12)
const PALETTE = [
  '#E8D5B0', // warm sand
  '#C9B99A', // taupe
  '#B5C4B1', // sage
  '#D4B896', // terracotta light
  '#A8B5A2', // muted green
  '#D6C5A0', // wheat
  '#BFB0A3', // greige
  '#C4BDA5', // linen
  '#A9C0A6', // soft sage
  '#CEBFA8', // camel
  '#B8C4B8', // silver sage
  '#D2C0AA', // champagne
]

// Assign colors by module slug — stable across reloads
const cache = new Map<string, string>()
const slugOrder: string[] = []

export function getModuleColor(slug: string): string {
  if (!cache.has(slug)) {
    if (!slugOrder.includes(slug)) slugOrder.push(slug)
    const index = slugOrder.indexOf(slug) % PALETTE.length
    cache.set(slug, PALETTE[index])
  }
  return cache.get(slug)!
}
