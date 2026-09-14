'use client'
import { useMemo, useState } from 'react'
import { CAMPOS_RUTA, CASO_EJEMPLO, evaluarRuta } from '../../lib/ruta.js'
import { Ficticio, TONO } from '../ui'

const ESTATUS_CLASE = {
  'PRINCIPAL — POR VERIFICAR': 'border-amber-400/50 bg-amber-400/15 text-amber-200',
  'NO PARA ESTA ACCIÓN': 'border-red-500/50 bg-red-500/15 text-red-300',
  'POSIBLE A FUTURO — VERIFICAR': 'border-sky-400/50 bg-sky-400/15 text-sky-200',
  'SOLO SI ELLA LO ELIGE': 'border-neutral-500/50 bg-neutral-500/15 text-neutral-300',
}

const fecha = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

export default function Ruta() {
  const [c, setC] = useState(CASO_EJEMPLO)
  const r = useMemo(() => evaluarRuta(c), [c])
  const cambiar = (k, v) => setC(prev => ({ ...prev, [k]: v }))
  const alternarDoc = v => cambiar('docs', c.docs.includes(v) ? c.docs.filter(x => x !== v) : [...c.docs, v])

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Revisar la ruta de un caso</h1>
        <p className="text-neutral-300">Antes de mandarla a una ventanilla. El resultado ya lo dio el clínico del proveedor: aquí no se interpreta, solo se revisa a dónde puede ir, qué papeles lleva, cuánto cuesta y quién es la dueña del siguiente paso.</p>
        <p className="text-sm text-neutral-400"><Ficticio>Caso ficticio</Ficticio> Orden del clínico: consulta y prueba confirmatoria de diabetes tipo 2. No escribas datos de una persona real.</p>
      </section>

      <section className={`rounded-2xl border p-5 ${TONO[r.tono]}`}>
        <p className="text-xs uppercase tracking-widest text-neutral-400">Estado del caso</p>
        <p className="mt-1 text-2xl font-extrabold">{r.estado}</p>
        {r.avisos.map((a, i) => <p key={i} className="mt-2 text-sm text-amber-100">⚠ {a}</p>)}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Tarjeta de traspaso</h2>
        <dl className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900 text-sm">
          {[
            ['Siguiente acción', r.tarjeta.siguienteAccion],
            ['Dueña', r.tarjeta.duena],
            ['Fecha límite', fecha(r.tarjeta.fechaLimite)],
            ['Barrera', r.tarjeta.causa && r.tarjeta.causa !== '—' ? `${r.tarjeta.barrera} (${r.tarjeta.causa})` : r.tarjeta.barrera],
            ['Escalamiento', r.tarjeta.escalamiento],
            ['Cómo contactarla', r.tarjeta.canal],
            ['Familia', r.tarjeta.familia],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 p-3 sm:grid-cols-[170px_1fr]"><dt className="text-neutral-400">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <p className="text-xs text-neutral-500">El caso solo se cierra con: acción confirmada, redirección del clínico, opt-out informado, o aceptación humana explícita (y en ese caso queda NO RESUELTO, no exitoso). Registrar: ¿acción completada?, minutos de navegadora y causa si falla.</p>
      </section>

      {r.faltantes.length > 0 && (
        <section className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-sm">
          <h2 className="font-semibold text-amber-200">Papeles que faltan para la ventanilla principal</h2>
          <ul className="mt-1 list-disc pl-5">{r.faltantes.map(f => <li key={f}>{f}</li>)}</ul>
        </section>
      )}

      {r.rutas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Ventanillas posibles (todas por verificar)</h2>
          {r.rutas.map(ruta => (
            <article key={ruta.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${ESTATUS_CLASE[ruta.estatus]}`}>{ruta.estatus}</span>
                <h3 className="font-semibold">{ruta.nombre}</h3>
              </div>
              <p className="mt-2"><span className="text-neutral-400">Costo:</span> {ruta.costo}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-neutral-300">{ruta.notas.map((n, i) => <li key={i}>{n}</li>)}</ul>
              {ruta.fuente && <p className="mt-2 text-xs text-neutral-500">Fuente: {ruta.fuente.url ? <a href={ruta.fuente.url} target="_blank" rel="noreferrer" className="underline">{ruta.fuente.txt}</a> : ruta.fuente.txt}</p>}
            </article>
          ))}
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Datos del caso</h2>
          <button onClick={() => setC(CASO_EJEMPLO)} className="rounded-lg border border-neutral-700 px-3 py-1 text-sm text-neutral-300 hover:border-neutral-500">Volver al ejemplo</button>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Navegadora dueña del caso (nombre ficticio)</span>
          <input value={c.navegadora} maxLength={60} onChange={e => cambiar('navegadora', e.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm" />
        </label>
        {Object.entries(CAMPOS_RUTA).map(([k, campo]) => campo.multi ? (
          <div key={k}>
            <p className="text-sm font-medium">{campo.label}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {Object.entries(campo.opciones).map(([v, txt]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-sm ${c.docs.includes(v) ? 'border-cyan-300 text-cyan-100' : 'border-neutral-700 text-neutral-400'}`}>
                  <input type="checkbox" checked={c.docs.includes(v)} onChange={() => alternarDoc(v)} className="accent-cyan-300" />{txt}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <label key={k} className="block">
            <span className="text-sm font-medium">{campo.label}</span>
            <select value={c[k]} onChange={e => cambiar(k, e.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm">
              {Object.entries(campo.opciones).map(([v, txt]) => <option key={v} value={v}>{txt}</option>)}
            </select>
          </label>
        ))}
      </section>
    </div>
  )
}
