import { Link } from 'react-router-dom'
import { getModulos } from '../lib/recipes'
import BottomTabBar from '../components/BottomTabBar'
import './HomePage.css'

export default function HomePage() {
  const modulos = getModulos()

  return (
    <div className="home">
      <header className="home__header">
        <h1 className="home__title">Mi Recetario</h1>
        <Link to="/search" className="home__search-bar">
          <svg className="home__search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="home__search-placeholder">Buscar recetas…</span>
        </Link>
      </header>

      <div className="home__grid">
        {modulos.map((m, i) => (
          <Link
            key={m.slug}
            to={`/module/${m.slug}`}
            className={`module-card${i === 0 ? ' module-card--featured' : ''}`}
            style={{ backgroundColor: m.color }}
          >
            <span className="module-card__number">{m.number}</span>
            <div className="module-card__content">
              <h2 className="module-card__name">{m.name}</h2>
              <div className="module-card__chips">
                <span className="module-card__chip">{m.days.length} {m.days.length === 1 ? 'día' : 'días'}</span>
                <span className="module-card__chip">{m.recipe_count} {m.recipe_count === 1 ? 'receta' : 'recetas'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <BottomTabBar />
    </div>
  )
}
