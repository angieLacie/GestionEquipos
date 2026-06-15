import { useState } from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import PageBreadcrumb from '@/components/PageBreadcrumb.tsx'
import KpiCard from '@/components/KpiCard.tsx'
import { basePath } from '@/helpers'
import {
  REPORTES, COMP_PROGRAMADAS, COMP_PENDIENTES, COBERTURA, HORAS_EXTRAS,
} from '@/lib/reportes'

// % o número con color: verde ≥100, rojo <100 (para celdas de cobertura).
const pctColor = (v: string) => {
  const n = parseFloat(v)
  if (Number.isNaN(n) || !v.includes('%')) return undefined
  return n >= 100 ? '#16a34a' : '#dc2626'
}

const Volver = ({ onClick }: { onClick: () => void }) => (
  <button className="btn btn-sm btn-outline-secondary mb-3" onClick={onClick}>
    <svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#arrow-left`}></use></svg>Volver a reportes
  </button>
)

// ── Reporte 1: Compensaciones Programadas ────────────────────
const RepProgramadas = ({ onBack }: { onBack: () => void }) => (
  <Card><Card.Body>
    <Volver onClick={onBack} />
    <div className="text-center mb-4">
      <h4 className="fw-bold">REPORTE DE COMPENSACIONES PROGRAMADAS</h4>
      <div className="fw-semibold">Período: {COMP_PROGRAMADAS.periodo}</div>
      <div className="text-muted small">Generado: {COMP_PROGRAMADAS.generado}</div>
    </div>
    <Row className="g-3 mb-4">
      {COMP_PROGRAMADAS.kpis.map((k) => (
        <Col key={k.label}><div className="rounded-3 text-center py-3" style={{ background: k.color + '18' }}>
          <div className="fs-3 fw-bold" style={{ color: k.color }}>{k.value}</div>
          <div className="small text-muted">{k.label}</div>
        </div></Col>
      ))}
    </Row>
    <div className="table-responsive">
      <table className="table table-bordered align-middle text-center">
        <thead className="table-light"><tr><th>#</th><th>Empleado</th><th>Zona</th><th>Tienda</th><th>Tipo</th><th>Fecha prog.</th><th>Fecha fin</th><th>Estado</th><th>Notas</th></tr></thead>
        <tbody>
          {COMP_PROGRAMADAS.filas.map((f) => (
            <tr key={f.n}>
              <td>{f.n}</td><td className="text-start fw-semibold">{f.empleado}</td><td>{f.zona}</td><td>{f.tienda}</td>
              <td><span className="badge" style={{ background: f.tipoColor + '22', color: f.tipoColor }}>{f.tipo}</span></td>
              <td>{f.inicio}</td><td>{f.fin}</td><td className="text-warning fw-semibold">{f.estado}</td><td className="small text-muted">{f.notas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="text-end text-muted small mt-2">Sistema de Administración de Personal | {COMP_PROGRAMADAS.generado}</div>
  </Card.Body></Card>
)

// ── Reporte 2: Compensaciones Pendientes ─────────────────────
const RepPendientes = ({ onBack }: { onBack: () => void }) => (
  <Card><Card.Body>
    <Volver onClick={onBack} />
    <div className="text-center mb-4">
      <h4 className="fw-bold">REPORTE DE COMPENSACIONES PENDIENTES</h4>
      <div className="fw-semibold">Período: {COMP_PENDIENTES.periodo}</div>
      <div className="text-muted small">Zona: Todas | Gerente: Todos</div>
    </div>
    <div className="table-responsive">
      <table className="table table-bordered align-middle text-center">
        <thead className="table-light"><tr><th>ID</th><th>Zona</th><th>Tienda</th><th>DNI</th><th>Personal</th><th>Puesto</th><th>Cant. Días</th><th>Cant. Horas</th><th>Referencia</th><th>Estado</th></tr></thead>
        <tbody>
          {COMP_PENDIENTES.filas.map((f) => (
            <tr key={f.id}>
              <td>{f.id}</td><td>{f.zona}</td><td>{f.tienda}</td><td>{f.dni}</td><td className="fw-semibold">{f.personal}</td>
              <td>{f.puesto}</td><td>{f.dias}</td><td>{f.horas}</td><td>{f.ref}</td><td className="text-danger fw-semibold">Pendiente</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="text-muted small mt-2">
      Total compensaciones pendientes: <strong>{COMP_PENDIENTES.total.colaboradores} colaboradores</strong> | <strong>{COMP_PENDIENTES.total.dias} días</strong> | <strong>{COMP_PENDIENTES.total.horas} horas</strong>
    </div>
  </Card.Body></Card>
)

// ── Reporte 3: Índice de Cobertura ───────────────────────────
const TablaCobertura = ({ headers, filas, total }: { headers: string[]; filas: string[][]; total: string[] }) => (
  <div className="table-responsive mb-4">
    <table className="table table-bordered align-middle text-center small" style={{ minWidth: 1100 }}>
      <thead className="table-dark"><tr>{headers.map((h, i) => <th key={i} className={i < 2 ? 'text-start' : ''}>{h}</th>)}</tr></thead>
      <tbody>
        {filas.map((fila, ri) => (
          <tr key={ri}>{fila.map((c, ci) => (
            <td key={ci} className={ci < 2 ? 'text-start' : ''} style={{ color: ci >= 2 ? pctColor(c) : undefined, fontWeight: ci >= 2 && c.includes('%') ? 600 : undefined }}>{c}</td>
          ))}</tr>
        ))}
        <tr style={{ background: '#fef9c3', fontWeight: 700 }}>{total.map((c, ci) => <td key={ci} className={ci < 2 ? 'text-start' : ''}>{c}</td>)}</tr>
      </tbody>
    </table>
  </div>
)

const RepCobertura = ({ onBack }: { onBack: () => void }) => (
  <Card><Card.Body>
    <Volver onClick={onBack} />
    <h4 className="fw-bold text-center mb-4">{COBERTURA.titulo}</h4>
    <div className="badge bg-primary mb-2">PARTE 1 — ASESORES</div>
    <TablaCobertura headers={COBERTURA.parte1Headers} filas={COBERTURA.parte1} total={COBERTURA.parte1Total} />
    <div className="badge bg-primary mb-2">PARTE 2 — TOTAL PERSONAL</div>
    <TablaCobertura headers={COBERTURA.parte2Headers} filas={COBERTURA.parte2} total={COBERTURA.parte2Total} />
  </Card.Body></Card>
)

// ── Reporte 4: Horas Extras ──────────────────────────────────
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const RepHorasExtras = ({ onBack }: { onBack: () => void }) => {
  const maxDif = Math.max(...HORAS_EXTRAS.resumenZona.map((z) => z.dif))
  return (
    <Card><Card.Body>
      <Volver onClick={onBack} />
      <div className="text-center mb-4">
        <h4 className="fw-bold">REPORTE DE HORAS EXTRAS</h4>
        <div className="small">Período: {HORAS_EXTRAS.periodo}</div>
        <div className="fw-semibold mt-2">Resumen por Zona</div>
      </div>
      <div className="table-responsive mb-4">
        <table className="table table-bordered align-middle text-center" style={{ maxWidth: 700, margin: '0 auto' }}>
          <thead className="table-light"><tr><th>Zona</th><th>H. Laboradas</th><th>H. Ley</th><th>Diferencia</th></tr></thead>
          <tbody>
            {HORAS_EXTRAS.resumenZona.map((z) => (
              <tr key={z.zona}><td className="text-primary">{z.zona}</td><td>{z.lab.toLocaleString()}</td><td>{z.ley.toLocaleString()}</td>
                <td className={z.dif > 0 ? 'text-danger fw-semibold' : ''}>{z.dif > 0 ? `+${z.dif}` : z.dif}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fw-semibold text-center mb-2">Detalle por Colaborador</div>
      <div className="table-responsive mb-4">
        <table className="table table-bordered align-middle text-center small">
          <thead className="table-light"><tr><th>Personal</th><th>Zona / Tienda</th>{DIAS.map((d) => <th key={d}>{d}</th>)}<th>H. Laboradas</th><th>H. Ley</th><th>Diferencia</th></tr></thead>
          <tbody>
            {HORAS_EXTRAS.detalle.map((r) => (
              <tr key={r.personal}>
                <td className="text-start fw-semibold">{r.personal}</td><td className="text-primary">{r.zona}</td>
                {r.d.map((v, i) => <td key={i} style={{ background: i === 6 && v !== '—' ? '#fed7aa' : undefined }}>{v}</td>)}
                <td>{r.lab}</td><td>{r.ley}</td><td className={r.dif > 0 ? 'text-danger fw-semibold' : ''}>{r.dif > 0 ? `+${r.dif}` : r.dif}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fw-semibold text-center mb-3">Total Horas Laboradas de Más — por Zona</div>
      <div className="d-flex align-items-end justify-content-center gap-3" style={{ height: 160 }}>
        {[...HORAS_EXTRAS.resumenZona].sort((a, b) => b.dif - a.dif).map((z) => (
          <div key={z.zona} className="text-center" style={{ width: 70 }}>
            <div className="small fw-semibold text-danger">+{z.dif}</div>
            <div className="mx-auto rounded-top" style={{ width: 28, height: maxDif ? Math.max(4, (z.dif / maxDif) * 110) : 4, background: '#f59e0b' }} />
            <div className="small text-muted mt-1" style={{ fontSize: 10 }}>{z.zona}</div>
          </div>
        ))}
      </div>
    </Card.Body></Card>
  )
}

// ── Hub ──────────────────────────────────────────────────────
const Reportes = () => {
  const [sel, setSel] = useState<string | null>(null)
  const back = () => setSel(null)

  if (sel === 'comp_programadas') return <Detalle><RepProgramadas onBack={back} /></Detalle>
  if (sel === 'comp_pendientes') return <Detalle><RepPendientes onBack={back} /></Detalle>
  if (sel === 'indice_cobertura') return <Detalle><RepCobertura onBack={back} /></Detalle>
  if (sel === 'horas_extras') return <Detalle><RepHorasExtras onBack={back} /></Detalle>

  return (
    <div className="content-wrapper">
      <div className="d-flex align-items-end flex-wrap gap-2 mb-4">
        <PageBreadcrumb title={'Reportes'} subTitle1={'Gestión'} subText={'Generación y descarga de reportes operativos'} />
        <Button variant="outline-secondary" className="ms-auto align-self-start"><svg className="sa-icon me-1"><use href={`${basePath}/icons/sprite.svg#download`}></use></svg>Exportar</Button>
      </div>

      <Row className="g-3 mb-4">
        <Col sm={6} xl><KpiCard label="Reportes disponibles" value={8} accent="var(--primary-600, #4f46e5)" icon="file-text" sub="tipos de reporte" /></Col>
        <Col sm={6} xl><KpiCard label="Generados este mes" value={24} accent="#16a34a" icon="download" sub="descargas en Abr 2026" /></Col>
        <Col sm={6} xl><KpiCard label="Período activo" value={'Abr 2026'} accent="#0ea5e9" icon="calendar" sub="01/04 — 30/04" /></Col>
        <Col sm={6} xl><KpiCard label="Nuevos reportes" value={2} accent="#f59e0b" icon="zap" sub="Comp. + Horas extras" /></Col>
        <Col sm={6} xl><KpiCard label="Último generado" value={'14/04/2026'} accent="#ef4444" icon="clock" sub="Asistencia y Marc." /></Col>
      </Row>

      <Card className="mb-3"><Card.Body className="py-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <span className="text-muted small fw-semibold me-1">FILTROS</span>
          <select className="form-select" style={{ maxWidth: 160 }}><option>Todos los tipos</option></select>
          <select className="form-select" style={{ maxWidth: 160 }}><option>Todas las zonas</option></select>
          <select className="form-select" style={{ maxWidth: 150 }}><option>Abril 2026</option></select>
          <select className="form-select" style={{ maxWidth: 180 }}><option>Todos los gerentes</option></select>
        </div>
      </Card.Body></Card>

      <Row className="g-3">
        {REPORTES.map((r) => (
          <Col md={6} xl={4} key={r.key}>
            <Card className="h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: 44, height: 44, background: r.iconColor + '22' }}>
                  <svg className="sa-icon" style={{ color: r.iconColor, width: 22, height: 22 }}><use href={`${basePath}/icons/sprite.svg#${r.icon}`}></use></svg>
                </div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h6 className="fw-bold mb-0">{r.titulo}</h6>
                  <span className="badge" style={{ background: r.badge.color, color: '#fff', fontSize: 10 }}>{r.badge.texto}</span>
                </div>
                <p className="text-muted small flex-grow-1">{r.descripcion}</p>
                <div className="d-flex align-items-center justify-content-between border-top pt-2">
                  <span className="text-muted small">{r.meta}</span>
                  <button className="btn btn-link btn-sm p-0 text-decoration-none" onClick={() => setSel(r.key)}>Ver reporte →</button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}

const Detalle = ({ children }: { children: React.ReactNode }) => <div className="content-wrapper">{children}</div>

export default Reportes
