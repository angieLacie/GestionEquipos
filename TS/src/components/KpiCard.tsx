import type { CSSProperties, ReactNode } from 'react'
import { Card } from 'react-bootstrap'
import type { Variant } from 'react-bootstrap/types'
import clsx from 'clsx'
import { basePath } from '@/helpers'

export type KpiCardProps = {
  /** Etiqueta superior (uppercase, gris). */
  label: string
  /** Valor principal (número grande). */
  value: ReactNode
  /** Color de acento del valor (CSS var o hex). Por defecto hereda. */
  accent?: string
  /** Id de ícono del sprite (ej. "users", "layers"). Se tiñe con el accent. */
  icon?: string
  /** Badge bajo el valor (ej. "89% del total"). */
  badge?: { text: string; variant?: Variant }
  /** Texto auxiliar a la derecha del badge. */
  sub?: ReactNode
  className?: string
}

/**
 * Tarjeta KPI estilo SmartAdmin: label + número grande + badge/sub.
 * Reutilizable en todas las pantallas Nova.
 */
const KpiCard = ({ label, value, accent, icon, badge, sub, className }: KpiCardProps) => (
  <Card
    className={clsx('kpi-card mb-0 h-100', className)}
    style={accent ? ({ '--kpi-accent': accent } as CSSProperties) : undefined}
  >
    <Card.Body className="py-3 px-4 position-relative">
      {icon && (
        <span className="kpi-card-iconwrap">
          <svg className="sa-icon" aria-hidden="true">
            <use href={`${basePath}/icons/sprite.svg#${icon}`}></use>
          </svg>
        </span>
      )}
      <div className="text-muted text-uppercase fw-semibold fs-xs ls-1 mb-1 pe-5">{label}</div>
      <div className="d-flex align-items-baseline gap-2">
        <span className="fs-1 fw-bold lh-1" style={accent ? { color: accent } : undefined}>{value}</span>
      </div>
      {(badge || sub) && (
        <div className="d-flex align-items-center gap-2 mt-2">
          {badge && <span className={`badge bg-${badge.variant ?? 'secondary'}`}>{badge.text}</span>}
          {sub && <span className="text-muted fs-sm">{sub}</span>}
        </div>
      )}
    </Card.Body>
  </Card>
)

export default KpiCard
