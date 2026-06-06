import { useState, useRef } from 'react'
import './StepByStepModal.css'

interface StepByStepModalProps {
  steps: string[]
  onClose: () => void
}

export default function StepByStepModal({ steps, onClose }: StepByStepModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const goNext = () => setCurrentStep(i => Math.min(steps.length - 1, i + 1))
  const goPrev = () => setCurrentStep(i => Math.max(0, i - 1))

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 60) {
      if (diff < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  return (
    <div
      className="step-modal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className="step-modal__close" onClick={onClose} aria-label="Cerrar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="step-modal__progress">
        Paso {currentStep + 1} de {steps.length}
      </div>

      <div className="step-modal__body">
        <span className="step-modal__number">{currentStep + 1}</span>
        <p className="step-modal__text">{steps[currentStep]}</p>
      </div>

      <div className="step-modal__nav">
        <button
          className="step-modal__nav-btn"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          Anterior
        </button>
        <button
          className="step-modal__nav-btn step-modal__nav-btn--primary"
          onClick={goNext}
          disabled={currentStep === steps.length - 1}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
