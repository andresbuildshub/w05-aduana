// Piezas visuales compartidas (sin estado: sirven en server y client components).
export const SEV_CLASE = {
  BLOQUEA: 'border-red-500/50 bg-red-500/15 text-red-300',
  RIESGO: 'border-amber-400/50 bg-amber-400/15 text-amber-200',
  VERIFICAR: 'border-sky-400/50 bg-sky-400/15 text-sky-200',
}
export const SEV_TEXTO = { BLOQUEA: 'BLOQUEA', RIESGO: 'RIESGO', VERIFICAR: 'POR VERIFICAR' }

export function Sev({ s }) {
  return <span className={`inline-block whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${SEV_CLASE[s]}`}>{SEV_TEXTO[s]}</span>
}

export const TONO = {
  rojo: 'border-red-500 bg-red-500/10',
  ambar: 'border-amber-400 bg-amber-400/10',
  gris: 'border-neutral-500 bg-neutral-500/10',
  verde: 'border-emerald-400 bg-emerald-400/10',
}

export const VEREDICTO_TONO = { 'NO CRUZA': TONO.rojo, 'CRUZA CON CONDICIONES': TONO.ambar, CRUZA: TONO.verde }

export function Ficticio({ children }) {
  return <span className="inline-block rounded-md border border-amber-300/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-200">{children}</span>
}

export const CELDA = {
  si: ['sí', 'text-emerald-300'],
  no: ['—', 'text-neutral-500'],
  condicional: ['si ella autoriza', 'text-sky-200'],
  riesgo: ['⚠ riesgo', 'text-amber-300'],
  violacion: ['✕ no debe', 'text-red-400 font-semibold'],
}
