import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { getModulos, getRecipesByDay } from '../lib/recipes'
import BackButton from '../components/BackButton'
import Badge from '../components/Badge'
import './ModulePage.css'

export default function ModulePage() {
  const { slug } = useParams<{ slug: string }>()
  const modulos = getModulos()
  const modulo = modulos.find(m => m.slug === slug)

  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  if (!modulo) return <Navigate to="/" replace />

  const day = selectedDay ?? modulo.days[0]
  const recipes = getRecipesByDay(modulo.slug, day)

  return (
    <div>
      {/* Hero */}
      <div className="module-page__hero" style={{ backgroundColor: modulo.color }}>
        <div className="module-page__back">
          <BackButton light />
        </div>
        <span className="module-page__hero-number">{modulo.number}</span>
        <h1 className="module-page__name">{modulo.name}</h1>
      </div>

      {/* Day pills */}
      <div className="module-page__days">
        {modulo.days.map(d => (
          <button
            key={d}
            className={`module-page__day-pill${d === day ? ' module-page__day-pill--active' : ''}`}
            onClick={() => setSelectedDay(d)}
          >
            Día {d}
          </button>
        ))}
      </div>

      {/* Recipe list */}
      <div className="module-page__recipes">
        {recipes.map(recipe => (
          <Link
            key={recipe.id}
            to={`/module/${slug}/recipe/${recipe.id}`}
            className="recipe-card"
          >
            <Badge label={`${modulo.number}.${recipe.orden}`} />
            <div className="recipe-card__info">
              <div className="recipe-card__name">{recipe.title}</div>
              {recipe.porciones > 0 && (
                <div className="recipe-card__meta">
                  {recipe.porciones} {recipe.porciones === 1 ? 'porción' : 'porciones'}
                </div>
              )}
            </div>
            <svg className="recipe-card__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
