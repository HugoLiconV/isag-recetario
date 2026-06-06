import './Badge.css'

interface BadgeProps {
  label: string
}

export default function Badge({ label }: BadgeProps) {
  return <span className="badge">{label}</span>
}
