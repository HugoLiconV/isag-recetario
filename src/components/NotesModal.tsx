import { useState, useEffect, useRef } from 'react'
import { supabase, type Note } from '../lib/supabase'
import './NotesModal.css'

type Props = {
  recipeId: string
  onClose: () => void
}

export default function NotesModal({ recipeId, onClose }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const originalContent = useRef('')

  useEffect(() => {
    async function fetchNote() {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('content')
        .eq('recipe_id', recipeId)
        .maybeSingle()

      if (fetchError) {
        setError('No se pudo cargar la nota.')
        setLoading(false)
        return
      }

      const text = (data as Note | null)?.content ?? ''
      setContent(text)
      originalContent.current = text
      setLoading(false)
    }

    fetchNote()
  }, [recipeId])

  useEffect(() => {
    if (!loading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [loading])

  async function handleSave() {
    if (content === originalContent.current) {
      onClose()
      return
    }

    setSaving(true)
    setError(null)

    const { error: upsertError } = await supabase
      .from('notes')
      .upsert(
        { recipe_id: recipeId, content, updated_at: new Date().toISOString() },
        { onConflict: 'recipe_id' }
      )

    if (upsertError) {
      setError('No se pudo guardar la nota.')
      setSaving(false)
      return
    }

    originalContent.current = content
    setSaving(false)
    onClose()
  }

  return (
    <div className="notes-modal__backdrop" onClick={onClose}>
      <div className="notes-modal" onClick={e => e.stopPropagation()}>
        <div className="notes-modal__header">
          <h2 className="notes-modal__title">Notas</h2>
          <button className="notes-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="notes-modal__error">{error}</div>}

        {loading ? (
          <div className="notes-modal__loading">Cargando nota...</div>
        ) : (
          <textarea
            ref={textareaRef}
            className="notes-modal__textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe tus notas sobre esta receta..."
          />
        )}

        <div className="notes-modal__footer">
          <button
            className="notes-modal__save"
            onClick={handleSave}
            disabled={loading || saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
