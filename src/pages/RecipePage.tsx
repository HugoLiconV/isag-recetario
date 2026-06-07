import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { getModulos, getRecipe } from '../lib/recipes'
import { useAuth } from '../context/AuthContext'
import { supabase, type Note } from '../lib/supabase'
import { scaleAmount } from '../lib/scaleAmount'
import BackButton from '../components/BackButton'
import Badge from '../components/Badge'
import Tag from '../components/Tag'
import NotesModal from '../components/NotesModal'
import StepByStepModal from '../components/StepByStepModal'
import './RecipePage.css'

export default function RecipePage() {
  const { slug, recipeId } = useParams<{ slug: string; recipeId: string }>()
  const modulos = getModulos()
  const modulo = modulos.find(m => m.slug === slug)
  const recipe = recipeId ? getRecipe(recipeId) : undefined
  const { session } = useAuth()

  const [activeTab, setActiveTab] = useState<'ingredientes' | 'pasos'>('ingredientes')
  const [showNotes, setShowNotes] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  const [porciones, setPorciones] = useState(recipe?.porciones ?? 1)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [showStepByStep, setShowStepByStep] = useState(false)

  useEffect(() => {
    if (!session || !recipeId) return

    async function fetchNote() {
      const { data } = await supabase
        .from('notes')
        .select('content')
        .eq('recipe_id', recipeId!)
        .maybeSingle()

      if (data) setSavedNote((data as Note).content)
    }

    fetchNote()
  }, [session, recipeId])

  if (!modulo || !recipe) return <Navigate to="/" replace />

  return (
    <div>
      {/* Hero */}
      <div className="recipe-page__hero" style={{ backgroundColor: modulo.color }}>
        <div className="recipe-page__back">
          <BackButton light />
        </div>
        <span className="recipe-page__hero-number">{modulo.number}</span>
        <div className="recipe-page__badge">
          <Badge label={`${modulo.number}.${recipe.orden}`} />
        </div>
        <div className="recipe-page__meta">
          {modulo.name} · Día {recipe.dia}
        </div>
        <h1 className="recipe-page__title">{recipe.title}</h1>
        {recipe.tags.length > 0 && (
          <div className="recipe-page__tags">
            {recipe.tags.map(tag => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Saved note (author only) */}
      {session && savedNote && (
        <div className="recipe-page__note">
          <div className="recipe-page__note-label">Nota</div>
          <div className="recipe-page__note-content">{savedNote}</div>
        </div>
      )}

      {/* Tab bar */}
      <div className="recipe-page__tabs">
        <button
          className={`recipe-page__tab${activeTab === 'ingredientes' ? ' recipe-page__tab--active' : ''}`}
          onClick={() => setActiveTab('ingredientes')}
        >
          Ingredientes
        </button>
        <button
          className={`recipe-page__tab${activeTab === 'pasos' ? ' recipe-page__tab--active' : ''}`}
          onClick={() => setActiveTab('pasos')}
        >
          Pasos
        </button>
      </div>

      {/* Content */}
      <div className="recipe-page__content">
        {activeTab === 'ingredientes' ? (
          <div>
            {/* Portion scaling controls */}
            <div className="recipe-page__portions-control">
              <span className="recipe-page__portions-label">Porciones</span>
              <button
                className="recipe-page__portions-btn"
                onClick={() => setPorciones(p => Math.max(1, p - 1))}
                disabled={porciones <= 1}
                aria-label="Reducir porciones"
              >−</button>
              <span className="recipe-page__portions-value">{porciones}</span>
              <button
                className="recipe-page__portions-btn"
                onClick={() => setPorciones(p => Math.min(20, p + 1))}
                disabled={porciones >= 20}
                aria-label="Aumentar porciones"
              >+</button>
            </div>

            {recipe.ingredient_groups.map((group, gi) => (
              <div key={gi}>
                {group.section && (
                  <div className="recipe-page__section-heading">{group.section}</div>
                )}
                <div className="recipe-page__ingredient-header">
                  <span></span>
                  <span className="recipe-page__ingredient-amount">Cant.</span>
                  <span>Unidad</span>
                  <span>Ingrediente</span>
                </div>
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`
                  const checked = checkedItems.has(key)
                  const ratio = porciones / (recipe.porciones || 1)
                  return (
                    <div
                      key={ii}
                      className={`recipe-page__ingredient-row${checked ? ' recipe-page__ingredient-row--checked' : ''}`}
                      onClick={() => {
                        setCheckedItems(prev => {
                          const next = new Set(prev)
                          if (next.has(key)) next.delete(key)
                          else next.add(key)
                          return next
                        })
                      }}
                    >
                      <span className="recipe-page__ingredient-checkbox">
                        <input type="checkbox" checked={checked} readOnly tabIndex={-1} />
                      </span>
                      <span className="recipe-page__ingredient-amount">{scaleAmount(item.amount, ratio)}</span>
                      <span className="recipe-page__ingredient-unit">{item.unit}</span>
                      <span>{item.description}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="recipe-page__steps">
            <button
              className="recipe-page__cooking-mode-btn"
              onClick={() => setShowStepByStep(true)}
            >
              Modo Cocina
            </button>
            {recipe.steps.map((step, i) => (
              <div key={i} className="recipe-page__step">
                <span className="recipe-page__step-number">{i + 1}</span>
                <span className="recipe-page__step-text">{step}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes FAB — only for authenticated author */}
      {session && (
        <button className="recipe-page__notes-fab" aria-label="Notas" onClick={() => setShowNotes(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      )}

      {/* Notes modal */}
      {showNotes && recipeId && (
        <NotesModal
          recipeId={recipeId}
          onClose={() => {
            setShowNotes(false)
            // Refresh the displayed note
            supabase
              .from('notes')
              .select('content')
              .eq('recipe_id', recipeId)
              .maybeSingle()
              .then(({ data }) => {
                setSavedNote(data ? (data as Note).content : null)
              })
          }}
        />
      )}

      {/* Step-by-step mode */}
      {showStepByStep && (
        <StepByStepModal steps={recipe.steps} onClose={() => setShowStepByStep(false)} />
      )}
    </div>
  )
}
