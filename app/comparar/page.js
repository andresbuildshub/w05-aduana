import Link from 'next/link'
import { PRESETS, REGLAS, CONDICIONES, evaluar, decisionSimple } from '../../lib/reglas.js'
import { Sev, VEREDICTO_TONO } from '../ui'

export const metadata = { title: 'Farmacia contra remesa — Aduana' }

const CORTO = {
  'farmacia-comision': 'Farmacia A · cobra comisión',
  'farmacia-fija': 'Farmacia B · pago fijo',
  'remesa-ofrecida': 'Remesadora · como suele ofrecerse',
  'remesa-cortafuegos': 'Remesadora · con los cambios',
  'hijo-migrante': 'Hijo migrante',
}

export default function Comparar() {
  const res = PRESETS.map(p => ({ p, r: evaluar(p.terminos) }))
  const activas = new Set(res.flatMap(x => x.r.hallazgos.map(h => h.id)))
  const filas = REGLAS.filter(r => activas.has(r.id))

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">¿Farmacia o remesadora?</h1>
        <p className="max-w-3xl text-neutral-300">Dos formas de pagar el programa, pasadas por las mismas reglas: como suelen ofrecerse y con los cambios que las arreglan. Todos los ejemplos son inventados.</p>
      </section>

      <section className="rounded-2xl border border-emerald-400/50 bg-emerald-400/5 p-5 text-neutral-200">
        <h2 className="text-lg font-semibold text-emerald-200">Respuesta corta</h2>
        <p className="mt-2">Si aceptan <b>las mismas cuatro condiciones</b>, cualquiera de las dos sirve: pago fijo (no por ventas), solo números totales sin nombres, prohibido usar los datos para vender, y permiso por escrito de cada paciente. Así como suelen ofrecerse, <b>ninguna</b>.</p>
        <p className="mt-3 font-semibold">Lo que tienes que vigilar con cada una:</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
          <li><b>Farmacia:</b> a dónde mandan a la paciente. Vende las medicinas y los análisis, así que va a querer que vaya a su sucursal y no a la opción gratuita.</li>
          <li><b>Remesadora:</b> quién más ve los datos. Es de un grupo que vende seguros y préstamos, y a una aseguradora le sirve saber quién salió con un resultado anormal.</li>
          <li><b>Hijo que paga desde fuera:</b> no vende nada, pero quiere ver los resultados de su mamá. Eso no se permite sin que ella lo decida.</li>
        </ul>
        <p className="mt-3 text-sm text-neutral-400">Ojo: "Farmacia B" se ve bien en lo que promete, pero su contrato dice otra cosa. <Link href="/canal" className="underline">Revísalo aquí</Link>.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {res.map(({ p, r }) => (
          <div key={p.id} className={`rounded-xl border p-3 ${VEREDICTO_TONO[r.veredicto]}`}>
            <p className="text-sm font-semibold">{CORTO[p.id]}</p>
            <p className="mt-1 text-lg font-extrabold">{decisionSimple(r).titulo}</p>
            <p className="text-xs text-neutral-400">según lo que promete · {r.hallazgos.filter(h => h.sev === 'BLOQUEA').length} reglas bloquean</p>
          </div>
        ))}
      </section>

      <details className="space-y-2">
        <summary className="cursor-pointer text-xl font-semibold">Ver regla por regla</summary>
        <p className="text-sm text-neutral-400">"—" = esa regla no se activa con ese pagador. Desliza la tabla hacia los lados →</p>
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="bg-neutral-900 text-neutral-400">
                <th className="p-2 text-left font-medium">Regla</th>
                {res.map(({ p }) => <th key={p.id} className="p-2 font-medium">{CORTO[p.id]}</th>)}
              </tr>
            </thead>
            <tbody>
              {filas.map(regla => (
                <tr key={regla.id} className="border-t border-neutral-800">
                  <td className="p-2"><span className="text-neutral-500">{regla.id} · C{regla.cond}</span><br />{regla.titulo}</td>
                  {res.map(({ p, r }) => {
                    const h = r.hallazgos.find(x => x.id === regla.id)
                    return <td key={p.id} className="p-2 text-center">{h ? <Sev s={h.sev} /> : <span className="text-neutral-600">—</span>}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-neutral-500">R = número de regla (ver /reglas). C = condición del Blueprint del equipo: {Object.entries(CONDICIONES).map(([n, c]) => `${n} ${c}`).join(' · ')}.</p>
      </details>
    </div>
  )
}
