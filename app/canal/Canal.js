'use client'
import { Fragment, useMemo, useState } from 'react'
import Link from 'next/link'
import { CAMPOS, CONDICIONES, PRESETS, ACTORES, DATOS, evaluar, decisionSimple } from '../../lib/reglas.js'
import { Sev, Ficticio, CELDA, TONO } from '../ui'

const GRUPOS = [
  ['El dinero', ['tipoPagador', 'basePago', 'vende', 'pacientePaga', 'compromiso', 'metricas']],
  ['Los datos', ['datosPagador', 'celdaMinima', 'usoFuturo', 'consentimiento']],
  ['La paciente y su familia', ['dirigeRuta', 'sinSmartphone', 'familia', 'tareasFamiliar']],
]

// ¿Los términos ya dicen lo mismo que el contrato en este punto?
const yaCorregido = (t, c) => c.valor && (CAMPOS[c.campo].multi ? (t[c.campo] || []).includes(c.valor) : t[c.campo] === c.valor)

export default function Canal() {
  const inicial = PRESETS[1]
  const [presetId, setPresetId] = useState(inicial.id)
  const [t, setT] = useState(inicial.terminos)
  const [texto, setTexto] = useState(inicial.texto)
  const [lectura, setLectura] = useState(null)
  const [revisadas, setRevisadas] = useState([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(false)
  const [formAbierto, setFormAbierto] = useState(false)

  const r = useMemo(() => evaluar(t), [t])
  const d = decisionSimple(r)
  const cuenta = s => r.hallazgos.filter(h => h.sev === s).length
  const preset = PRESETS.find(p => p.id === presetId)
  const pendientes = (lectura?.contradicciones || []).filter((c, i) => !yaCorregido(t, c) && !revisadas.includes(i))
  const cambios = r.hallazgos.filter(h => h.sev !== 'VERIFICAR')
  const porVerificar = r.hallazgos.filter(h => h.sev === 'VERIFICAR')

  function reiniciarLectura() { setLectura(null); setRevisadas([]); setError(null); setCopiado(false) }
  function cargar(p) { setPresetId(p.id); setT(p.terminos); setTexto(p.texto); reiniciarLectura() }
  function cambiar(k, v) { setPresetId(null); setT(prev => ({ ...prev, [k]: v })); setCopiado(false) }
  function alternar(k, v) {
    const actual = t[k] || []
    let nuevo = actual.includes(v) ? actual.filter(x => x !== v) : [...actual, v]
    if (k === 'vende') nuevo = v === 'nada' ? (actual.includes('nada') ? [] : ['nada']) : nuevo.filter(x => x !== 'nada')
    cambiar(k, nuevo)
  }
  // La IA propone; la coordinadora confirma con un toque; las reglas recalculan.
  function usarContrato(c, i) {
    if (!c.valor) { setRevisadas(prev => [...prev, i]); setFormAbierto(true); return }
    cambiar(c.campo, CAMPOS[c.campo].multi ? [...(t[c.campo] || []).filter(x => x !== 'nada'), c.valor] : c.valor)
  }

  async function revisar() {
    setCargando(true); reiniciarLectura()
    try {
      const res = await fetch('/api/leer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ terminos: t, texto }) })
      const data = await res.json()
      if (res.ok) setLectura(data)
      else setError(data.error || 'No se pudo revisar el contrato.')
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    }
    setCargando(false)
  }

  async function copiar() {
    const lineas = [`Revisión del acuerdo (Aduana, reglas ${r.version})`, '', d.titulo]
    if (cambios.length) { lineas.push('', 'Cambios que pedimos antes de firmar:'); cambios.forEach((h, i) => lineas.push(`${i + 1}. ${h.cura}`)) }
    if (porVerificar.length) { lineas.push('', 'Lo que vamos a verificar:'); porVerificar.forEach(h => lineas.push(`- ${h.cura}`)) }
    try { await navigator.clipboard.writeText(lineas.join('\n')); setCopiado(true) } catch { setCopiado(false) }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Revisar a un pagador</h1>
        <p className="text-neutral-300">Antes de aceptar dinero para el programa: pega el contrato que te mandaron y toca <b>Revisar el contrato</b>. Si solo quieres ver cómo funciona, usa un ejemplo.</p>
        <p className="text-sm text-neutral-400">Ejemplos inventados:</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => cargar(p)} className={`rounded-full border px-3 py-1.5 text-left text-sm ${presetId === p.id ? 'border-cyan-300 text-cyan-200' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}>{p.nombre}</button>
          ))}
        </div>
        {preset && <p className="text-sm text-neutral-400"><Ficticio>Ejemplo ficticio</Ficticio> {preset.nota}</p>}
      </section>

      <section className="space-y-3 rounded-2xl border border-cyan-300/40 p-5">
        <h2 className="text-xl font-semibold">1 · El contrato</h2>
        <p className="text-sm text-neutral-400">Copia el texto del borrador (hasta 4,000 letras). No pegues nombres, teléfonos ni CURP de pacientes: Aduana los rechaza.</p>
        <textarea value={texto} onChange={e => { setTexto(e.target.value.slice(0, 4000)); setPresetId(null); reiniciarLectura() }} rows={8} maxLength={4000}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200" placeholder="Pega aquí el texto del contrato" />
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={revisar} disabled={cargando || texto.trim().length < 40} className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-neutral-950 disabled:opacity-40">{cargando ? 'Revisando… (hasta 30 s)' : 'Revisar el contrato'}</button>
          <button onClick={() => { setTexto(''); setPresetId(null); reiniciarLectura() }} className="rounded-xl border border-neutral-700 px-3 py-2 text-sm text-neutral-300">Borrar ejemplo</button>
          <span className="text-xs text-neutral-500">{texto.length} de 4,000 letras</span>
        </div>
        {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
      </section>

      <section className={`rounded-2xl border p-5 ${!lectura ? TONO.gris : pendientes.length ? TONO.rojo : TONO[d.tono]}`}>
        <p className="text-xs uppercase tracking-widest text-neutral-400">2 · ¿Lo firmo?</p>
        {!lectura ? (
          <>
            <p className="mt-1 text-2xl font-extrabold">{cargando ? 'Revisando el contrato…' : 'Todavía no revisas el contrato'}</p>
            <p className="mt-2 text-sm text-neutral-300">Con solo lo que te dijeron, las reglas dirían «{d.titulo.toLowerCase()}». Pero lo que se firma es el texto: revísalo antes de decidir.</p>
          </>
        ) : pendientes.length ? (
          <>
            <p className="mt-1 text-3xl font-extrabold">NO FIRMES TODAVÍA</p>
            <p className="mt-2 text-sm text-neutral-200">El contrato no dice lo mismo que te dijeron: {pendientes.length} diferencia(s). Abajo, en cada una, toca <b>Usar lo que dice el contrato</b> y la respuesta se vuelve a calcular.</p>
          </>
        ) : (
          <>
            <p className="mt-1 text-3xl font-extrabold">{d.titulo}</p>
            <p className="mt-2 text-sm text-neutral-200">{d.sub}</p>
            <p className="mt-2 text-xs text-neutral-400">Reglas {r.version}: {cuenta('BLOQUEA')} bloquean · {cuenta('RIESGO')} de riesgo · {cuenta('VERIFICAR')} por verificar. La IA no decide esta respuesta: la deciden las reglas.</p>
          </>
        )}
      </section>

      {lectura && pendientes.length === 0 && (cambios.length > 0 || porVerificar.length > 0) && (
        <section className="space-y-3 rounded-2xl border border-neutral-700 bg-neutral-900 p-5">
          <h2 className="text-xl font-semibold">3 · Qué pedirles</h2>
          {cambios.length > 0 && (
            <>
              <p className="text-sm text-neutral-400">Cambios antes de firmar:</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">{cambios.map(h => <li key={h.id}>{h.cura}</li>)}</ol>
            </>
          )}
          {porVerificar.length > 0 && (
            <>
              <p className="text-sm text-neutral-400">Lo que falta verificar:</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-300">{porVerificar.map(h => <li key={h.id}>{h.cura}</li>)}</ul>
            </>
          )}
          <button onClick={copiar} className="rounded-xl bg-emerald-400 px-4 py-2 font-semibold text-neutral-950">{copiado ? 'Copiado ✓ pégalo en WhatsApp' : 'Copiar lista para WhatsApp'}</button>
        </section>
      )}

      {lectura && <Lectura l={lectura} t={t} revisadas={revisadas} onUsar={usarContrato} />}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Por qué dicen eso las reglas</h2>
        {r.hallazgos.length === 0 && <p className="text-neutral-400">Ninguna regla se activó.</p>}
        {r.hallazgos.map(h => (
          <article key={h.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex flex-wrap items-center gap-2"><Sev s={h.sev} /><h3 className="font-semibold">{h.titulo}</h3></div>
            <p className="mt-2 text-sm text-neutral-300">{h.porque}</p>
            <p className="mt-2 text-sm"><span className="font-semibold text-cyan-200">Qué pedir:</span> {h.cura}</p>
            <details className="mt-2 text-xs text-neutral-500"><summary className="cursor-pointer">Regla y fuente</summary><p className="mt-1">{h.id} · Condición {h.cond}: {CONDICIONES[h.cond]}</p><p>Fuente: {h.fuente}</p></details>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quién ve qué dato</h2>
        <p className="text-sm text-neutral-400">El pagador solo debe ver números totales sin nombres, y la familia solo lo que la paciente autorice.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DATOS.map(([k, nombre]) => (
            <div key={k} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm">
              <p className="font-medium">{nombre}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                {ACTORES.map(a => { const [txt, cls] = CELDA[r.matriz[k][a]]; return <Fragment key={a}><dt className="text-neutral-400">{a}</dt><dd className={cls}>{txt}</dd></Fragment> })}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <details open={formAbierto} onToggle={e => setFormAbierto(e.currentTarget.open)} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <summary className="cursor-pointer text-lg font-semibold">Lo que te prometieron (14 puntos): ver o cambiar</summary>
        <p className="mt-2 text-sm text-neutral-400">Llénalo con lo que el pagador te dijo de palabra. La respuesta de arriba se recalcula sola.</p>
        <div className="mt-4 space-y-6">
          {GRUPOS.map(([titulo, claves]) => (
            <fieldset key={titulo} className="space-y-4">
              <legend className="mb-2 text-sm uppercase tracking-widest text-cyan-300">{titulo}</legend>
              {claves.map(k => {
                const c = CAMPOS[k]
                return c.multi ? (
                  <div key={k}>
                    <p className="text-sm font-medium">{c.label}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(c.opciones).map(([v, txt]) => (
                        <label key={v} className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-sm ${(t[k] || []).includes(v) ? 'border-cyan-300 text-cyan-100' : 'border-neutral-700 text-neutral-400'}`}>
                          <input type="checkbox" checked={(t[k] || []).includes(v)} onChange={() => alternar(k, v)} className="accent-cyan-300" />{txt}
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <label key={k} className="block">
                    <span className="text-sm font-medium">{c.label}</span>
                    <select value={t[k]} onChange={e => cambiar(k, e.target.value)} className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-950 p-2 text-sm">
                      {Object.entries(c.opciones).map(([v, txt]) => <option key={v} value={v}>{txt}</option>)}
                    </select>
                  </label>
                )
              })}
            </fieldset>
          ))}
        </div>
      </details>

      <p className="text-sm text-neutral-400">¿Farmacia o remesadora? <Link href="/comparar" className="underline">Compáralas</Link>. ¿De dónde sale cada regla? <Link href="/reglas" className="underline">Reglas y fuentes</Link>.</p>
    </div>
  )
}

function Lectura({ l, t, revisadas, onUsar }) {
  const citasContradiccion = new Set(l.contradicciones.map(c => c.cita))
  const hallazgos = l.hallazgos.filter(h => !citasContradiccion.has(h.cita))
  return (
    <section className="space-y-4">
      {l.modo === 'real'
        ? <p className="rounded-lg bg-cyan-300/10 p-2 text-sm text-cyan-100">🤖 Revisión con IA ({l.modelo}). Cada frase citada se comprobó palabra por palabra en tu contrato.</p>
        : <p className="rounded-lg bg-amber-400/15 p-2 text-sm text-amber-100">🧪 Revisión <b>SIMULADA</b> (sin IA por ahora): busca palabras clave en el contrato. Las frases citadas sí están comprobadas palabra por palabra.</p>}

      {l.contradicciones.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-amber-200">El contrato no dice lo mismo que te dijeron ({l.contradicciones.length})</h2>
          {l.contradicciones.map((c, i) => (
            <article key={i} className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-3 text-sm">
              <p className="text-neutral-400">{CAMPOS[c.campo]?.label}. Te dijeron: <span className="text-neutral-100">{c.declarado}</span></p>
              <p className="mt-2 text-neutral-400">El contrato dice:</p>
              <blockquote className="my-1 border-l-2 border-cyan-300 pl-3 italic text-neutral-200">“{c.cita}”</blockquote>
              <p>{c.explicacion}</p>
              {yaCorregido(t, c) ? <p className="mt-2 text-emerald-300">✓ La respuesta de arriba ya usa lo que dice el contrato.</p>
                : revisadas.includes(i) ? <p className="mt-2 text-emerald-300">✓ Marcada para corregir a mano (abajo, en "Lo que te prometieron").</p>
                : <button onClick={() => onUsar(c, i)} className="mt-2 rounded-lg bg-amber-300 px-3 py-1.5 font-semibold text-neutral-950">{c.valor ? `Usar lo que dice el contrato: ${CAMPOS[c.campo].opciones[c.valor]}` : 'Lo corrijo yo'}</button>}
            </article>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Frases del contrato para pelear ({hallazgos.length})</h2>
        {hallazgos.length === 0 && <p className="text-sm text-neutral-400">Nada más con frase comprobable.</p>}
        {hallazgos.map((h, i) => (
          <article key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm">
            <blockquote className="border-l-2 border-cyan-300 pl-3 italic text-neutral-200">“{h.cita}”</blockquote>
            <p className="mt-2">{h.problema}</p>
            <p className="mt-1 text-cyan-200">Pregúntales: {h.pregunta}</p>
            <p className="mt-1 text-xs text-neutral-500">{CONDICIONES[h.condicion]}</p>
          </article>
        ))}
      </div>

      {l.descartados.length > 0 && (
        <details className="text-sm text-neutral-400">
          <summary className="cursor-pointer">{l.descartados.length} frase(s) descartada(s) porque no aparecen tal cual en el contrato</summary>
          <ul className="mt-2 list-disc pl-5">{l.descartados.map((x, i) => <li key={i}>“{x.cita}”</li>)}</ul>
        </details>
      )}
    </section>
  )
}
