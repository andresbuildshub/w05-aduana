'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CAMPOS, CONDICIONES, PRESETS, ACTORES, DATOS, evaluar } from '../../lib/reglas.js'
import { Sev, Ficticio, CELDA, VEREDICTO_TONO } from '../ui'

const GRUPOS = [
  ['El dinero', ['tipoPagador', 'basePago', 'vende', 'pacientePaga', 'compromiso', 'metricas']],
  ['Los datos', ['datosPagador', 'celdaMinima', 'usoFuturo', 'consentimiento']],
  ['La paciente y su familia', ['dirigeRuta', 'sinSmartphone', 'familia', 'tareasFamiliar']],
]

export default function Canal() {
  const inicial = PRESETS[1]
  const [presetId, setPresetId] = useState(inicial.id)
  const [t, setT] = useState(inicial.terminos)
  const [texto, setTexto] = useState(inicial.texto)
  const [lectura, setLectura] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const r = useMemo(() => evaluar(t), [t])
  const cuenta = s => r.hallazgos.filter(h => h.sev === s).length
  const preset = PRESETS.find(p => p.id === presetId)

  function cargar(p) { setPresetId(p.id); setT(p.terminos); setTexto(p.texto); setLectura(null); setError(null) }
  function cambiar(k, v) { setPresetId(null); setT(prev => ({ ...prev, [k]: v })); setLectura(null) }
  function alternar(k, v) {
    const actual = t[k] || []
    let nuevo = actual.includes(v) ? actual.filter(x => x !== v) : [...actual, v]
    if (k === 'vende') nuevo = v === 'nada' ? (actual.includes('nada') ? [] : ['nada']) : nuevo.filter(x => x !== 'nada')
    cambiar(k, nuevo)
  }

  async function leer() {
    setCargando(true); setError(null); setLectura(null)
    try {
      const res = await fetch('/api/leer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ terminos: t, texto }) })
      const data = await res.json()
      if (res.ok) setLectura(data)
      else setError(data.error || 'No se pudo leer el texto.')
    } catch {
      setError('Sin conexión. Intenta de nuevo.')
    }
    setCargando(false)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Revisar a un pagador</h1>
        <p className="text-neutral-300">Antes de aceptar dinero para el programa. Elige un ejemplo o cambia los términos: el veredicto se recalcula solo.</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => cargar(p)} className={`rounded-full border px-3 py-1.5 text-left text-sm ${presetId === p.id ? 'border-cyan-300 text-cyan-200' : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'}`}>{p.nombre}</button>
          ))}
        </div>
        {preset ? <p className="text-sm text-neutral-400"><Ficticio>Ejemplo ficticio</Ficticio> {preset.nota}</p> : <p className="text-sm text-neutral-400"><Ficticio>Términos editados</Ficticio> Ya no coinciden con ningún ejemplo.</p>}
      </section>

      <section className={`rounded-2xl border p-5 ${VEREDICTO_TONO[r.veredicto]}`}>
        <p className="text-xs uppercase tracking-widest text-neutral-400">Veredicto de las reglas · {r.version}</p>
        <p className="mt-1 text-3xl font-extrabold">{r.veredicto}</p>
        <p className="mt-1 text-sm text-neutral-300">{cuenta('BLOQUEA')} bloquean · {cuenta('RIESGO')} de riesgo · {cuenta('VERIFICAR')} por verificar</p>
        {lectura?.contradicciones?.length > 0 && (
          <p className="mt-3 rounded-lg bg-amber-400/15 p-2 text-sm text-amber-100">⚠ El texto del acuerdo contradice lo que se declaró. Este veredicto no es confiable hasta corregir los términos (ver la lectura abajo).</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Por qué</h2>
        {r.hallazgos.length === 0 && <p className="text-neutral-400">Ninguna regla se activó.</p>}
        {r.hallazgos.map(h => (
          <article key={h.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex flex-wrap items-center gap-2"><Sev s={h.sev} /><h3 className="font-semibold">{h.titulo}</h3></div>
            <p className="mt-1 text-xs text-neutral-500">{h.id} · Condición {h.cond}: {CONDICIONES[h.cond]}</p>
            <p className="mt-2 text-sm text-neutral-300">{h.porque}</p>
            <p className="mt-2 text-sm"><span className="font-semibold text-cyan-200">Qué lo cura:</span> {h.cura}</p>
            <p className="mt-2 text-xs text-neutral-500">Fuente: {h.fuente}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Quién ve qué dato</h2>
        <p className="text-sm text-neutral-400">Calculado con los términos. La cláusula sombra: el pagador ve solo cifras agregadas, y la familia solo lo que ella autorice.</p>
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="bg-neutral-900 text-neutral-400"><th className="p-2 text-left font-medium">Dato</th>{ACTORES.map(a => <th key={a} className="p-2 font-medium">{a}</th>)}</tr></thead>
            <tbody>
              {DATOS.map(([k, nombre]) => (
                <tr key={k} className="border-t border-neutral-800">
                  <td className="p-2 text-neutral-300">{nombre}</td>
                  {ACTORES.map(a => { const [txt, cls] = CELDA[r.matriz[k][a]]; return <td key={a} className={`p-2 text-center ${cls}`}>{txt}</td> })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-dashed border-cyan-300/40 p-5">
        <h2 className="text-xl font-semibold">Leer el texto del acuerdo como adversario</h2>
        <p className="text-sm text-neutral-400">Los términos de arriba son lo que te dijeron. El texto es lo que vas a firmar. La IA busca cláusulas que violen las condiciones y lugares donde el texto contradice lo declarado. <b>No decide el veredicto</b>, y solo se muestran citas que aparecen palabra por palabra en el texto. No pegues nombres, teléfonos ni CURP.</p>
        <textarea value={texto} onChange={e => { setTexto(e.target.value.slice(0, 4000)); setLectura(null) }} rows={9} maxLength={4000}
          className="w-full rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200" placeholder="Pega aquí el borrador del acuerdo (40 a 4,000 caracteres)" />
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={leer} disabled={cargando || texto.trim().length < 40} className="rounded-xl bg-cyan-300 px-4 py-2 font-semibold text-neutral-950 disabled:opacity-40">{cargando ? 'Leyendo… (hasta 30 s)' : 'Leer el texto'}</button>
          <span className="text-xs text-neutral-500">{texto.length}/4000</span>
        </div>
        {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{error}</p>}
        {lectura && <Lectura l={lectura} />}
      </section>

      <details className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <summary className="cursor-pointer text-lg font-semibold">Ver o cambiar los 14 términos declarados</summary>
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

      <p className="text-sm text-neutral-400">¿Y los otros pagadores? <Link href="/comparar" className="underline">Compáralos lado a lado</Link>. ¿De dónde sale cada regla? <Link href="/reglas" className="underline">Reglas y fuentes</Link>.</p>
    </div>
  )
}

function Lectura({ l }) {
  return (
    <div className="space-y-4">
      {l.modo === 'real'
        ? <p className="rounded-lg bg-cyan-300/10 p-2 text-sm text-cyan-100">🤖 IA real: <b>{l.modelo}</b> vía Vercel AI Gateway.</p>
        : <p className="rounded-lg bg-amber-400/15 p-2 text-sm text-amber-100">🧪 <b>SIMULADO</b>: esta lectura la hizo un buscador de palabras clave, no una IA. {l.razon}</p>}

      {l.contradicciones.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-amber-200">⚠ Lo declarado no coincide con el texto ({l.contradicciones.length})</h3>
          {l.contradicciones.map((c, i) => (
            <article key={i} className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-3 text-sm">
              <p className="text-neutral-400">{CAMPOS[c.campo]?.label}: declaraste <span className="text-neutral-100">{c.declarado}</span></p>
              <blockquote className="my-2 border-l-2 border-cyan-300 pl-3 italic text-neutral-200">“{c.cita}”</blockquote>
              <p>{c.explicacion}</p>
            </article>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-semibold">Cláusulas a pelear ({l.hallazgos.length})</h3>
        {l.hallazgos.length === 0 && <p className="text-sm text-neutral-400">Sin hallazgos con cita comprobable.</p>}
        {l.hallazgos.map((h, i) => (
          <article key={i} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm">
            <p className="text-xs text-neutral-500">Condición {h.condicion}: {CONDICIONES[h.condicion]} · cita comprobada ✓</p>
            <blockquote className="my-2 border-l-2 border-cyan-300 pl-3 italic text-neutral-200">“{h.cita}”</blockquote>
            <p>{h.problema}</p>
            <p className="mt-1 text-cyan-200">Pregúntale al pagador: {h.pregunta}</p>
          </article>
        ))}
      </div>

      {l.descartados.length > 0 && (
        <details className="text-sm text-neutral-400">
          <summary className="cursor-pointer">{l.descartados.length} cita(s) descartada(s): no aparecen palabra por palabra en el texto</summary>
          <ul className="mt-2 list-disc pl-5">{l.descartados.map((d, i) => <li key={i}>{d.tipo}: “{d.cita}”</li>)}</ul>
        </details>
      )}
    </div>
  )
}
