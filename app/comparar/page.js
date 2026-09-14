import Link from 'next/link'
import { PRESETS, REGLAS, CONDICIONES, evaluar } from '../../lib/reglas.js'
import { Sev, VEREDICTO_TONO } from '../ui'

export const metadata = { title: 'Farmacia contra remesa — Aduana' }

const CORTO = {
  'farmacia-comision': 'Farmacia A · comisión',
  'farmacia-fija': 'Farmacia B · tarifa fija',
  'remesa-ofrecida': 'Remesadora · como la ofrecen',
  'remesa-cortafuegos': 'Remesadora · con cortafuegos',
  'hijo-migrante': 'Hijo migrante',
}

export default function Comparar() {
  const res = PRESETS.map(p => ({ p, r: evaluar(p.terminos) }))
  const activas = new Set(res.flatMap(x => x.r.hallazgos.map(h => h.id)))
  const filas = REGLAS.filter(r => activas.has(r.id))

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Farmacia contra remesa, con las mismas reglas</h1>
        <p className="max-w-3xl text-neutral-300">
          En el equipo, el pagador propuesto fue una organización de farmacias con tarifa fija. Yo defendí la remesa. Aquí están los dos, como suelen ofrecerse y con las cláusulas que los curan, más el hijo migrante que paga desde fuera. Todos son ficticios.
        </p>
      </section>

      <section className="rounded-2xl border border-cyan-300/30 bg-cyan-300/5 p-5 text-neutral-200">
        <h2 className="font-semibold text-cyan-200">Lo que muestra la comparación</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li><b>Ni la farmacia ni la remesa cruzan como suelen ofrecerse, y las dos cruzan con las mismas cláusulas:</b> pago fijo, solo cifras agregadas con grupos de 11 o más, uso futuro de datos prohibido y consentimiento expreso.</li>
          <li><b>Lo que cambia es dónde vive el conflicto.</b> La farmacia vende lo que la navegación termina recetando: el conflicto está en la ruta (R19). La remesadora es de un grupo que vende la póliza y el crédito para los que un tamizaje anormal es información valiosa: el conflicto está en los datos (R08, R23).</li>
          <li><b>El hijo migrante no vende nada y aun así no cruza:</b> quiere ver. Es la sombra del capítulo, alguien suscrito al expediente de su madre (R04, R11, R12).</li>
          <li><b>Farmacia B se ve limpia en sus términos, pero su texto no lo está.</b> <Link href="/canal" className="underline">Pégalo en la revisión</Link> y mira las contradicciones.</li>
        </ul>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {res.map(({ p, r }) => (
          <div key={p.id} className={`rounded-xl border p-3 ${VEREDICTO_TONO[r.veredicto]}`}>
            <p className="text-sm font-semibold">{CORTO[p.id]}</p>
            <p className="mt-1 text-lg font-extrabold">{r.veredicto}</p>
            <p className="text-xs text-neutral-400">{r.hallazgos.filter(h => h.sev === 'BLOQUEA').length} bloquean · {r.hallazgos.length} en total</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Regla por regla</h2>
        <p className="text-sm text-neutral-400 sm:hidden">Desliza la tabla hacia los lados →</p>
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
        <p className="text-xs text-neutral-500">C = condición del Blueprint: {Object.entries(CONDICIONES).map(([n, c]) => `${n} ${c}`).join(' · ')}.</p>
      </section>
    </div>
  )
}
