import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getModulos, search } from '../lib/recipes'
import type { SearchResult } from '../lib/recipes'
import type { Modulo } from '../lib/types'
import BottomTabBar from '../components/BottomTabBar'
import './SearchPage.css'

function groupByModule(results: SearchResult[]): Map<string, { modulo_name: string; modulo_color: string; items: SearchResult[] }> {
  const groups = new Map<string, { modulo_name: string; modulo_color: string; items: SearchResult[] }>()
  for (const r of results) {
    const slug = r.recipe.modulo_slug
    if (!groups.has(slug)) {
      groups.set(slug, { modulo_name: r.modulo_name, modulo_color: r.modulo_color, items: [] })
    }
    groups.get(slug)!.items.push(r)
  }
  return groups
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = search(query)
  const modulos = getModulos()
  const hasQuery = query.trim().length > 0

  return (
    <div className="search">
      <header className="search__header">
        <div className="search__input-wrapper">
          <svg className="search__input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search__input"
            type="text"
            placeholder="Buscar recetas…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          {hasQuery && (
            <button className="search__clear" onClick={() => setQuery('')} aria-label="Limpiar búsqueda">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="search__body">
        {!hasQuery && <EmptyState modulos={modulos} />}
        {hasQuery && results.length === 0 && <NoResults query={query} />}
        {hasQuery && results.length > 0 && <Results results={results} />}
      </div>

      <BottomTabBar />
    </div>
  )
}

function EmptyState({ modulos }: { modulos: Modulo[] }) {
  return (
    <div className="search__modules">
      {modulos.map(m => (
        <Link key={m.slug} to={`/module/${m.slug}`} className="search__module-row" style={{ '--module-color': m.color } as React.CSSProperties}>
          <span className="search__module-dot" />
          <span className="search__module-name">{m.name}</span>
          <span className="search__module-count">{m.recipe_count} {m.recipe_count === 1 ? 'receta' : 'recetas'}</span>
        </Link>
      ))}
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="search__empty">
      <p className="search__empty-text">No se encontraron recetas para «{query}»</p>
    </div>
  )
}

function Results({ results }: { results: SearchResult[] }) {
  const groups = groupByModule(results)

  return (
    <div className="search__results">
      {[...groups.entries()].map(([slug, group]) => (
        <div key={slug} className="search__group">
          <div className="search__group-header">
            <span className="search__group-dot" style={{ backgroundColor: group.modulo_color }} />
            <span className="search__group-name">{group.modulo_name}</span>
          </div>
          <div className="search__group-list">
            {group.items.map(r => (
              <Link
                key={r.recipe.id}
                to={`/module/${r.recipe.modulo_slug}/recipe/${r.recipe.id}`}
                className="search__result"
              >
                <span className="search__result-name">{r.recipe.title}</span>
                <span className="search__result-context">Día {r.recipe.dia}{r.recipe.dia_tema ? ` · ${r.recipe.dia_tema}` : ''}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
