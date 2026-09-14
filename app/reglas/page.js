import { REGLAS, CONDICIONES, VERSION } from '../../lib/reglas.js'
import { FUENTES } from '../../lib/ruta.js'
import { MODELO } from '../../lib/lector.js'
import { Sev } from '../ui'

export const metadata = { title: 'Reglas y fuentes — Aduana' }

export default function Reglas() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Reglas y fuentes <span className="text-base font-normal text-neutral-400">{VERSION}</span></h1>
        <p className="max-w-3xl text-neutral-300">Públicas y versionadas. El veredicto sale solo de estas reglas. Ningún patrocinador puede pagar para agregar, quitar o suavizar una regla. Si una fuente cambia, la regla cambia de versión.</p>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm">
        <h2 className="font-semibold">Las 6 condiciones del Blueprint T2 (semana 5)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-neutral-300">{Object.entries(CONDICIONES).map(([n, c]) => <li key={n}>{c}{n === '6' ? ': coordinar no puede reemplazar la atención ni volverse vigilancia' : ''}</li>)}</ol>
        <p className="mt-3 text-neutral-400">Severidad: <b>BLOQUEA</b> = no se firma así · <b>RIESGO</b> = se firma solo si se cura · <b>POR VERIFICAR</b> = falta evidencia antes de ampliar.</p>
      </section>

      <section className="space-y-3">
        {REGLAS.map(r => (
          <article key={r.id} className="rounded-xl border border-neutral-800 p-4 text-sm">
            <div className="flex flex-wrap items-center gap-2"><Sev s={r.sev} /><h2 className="font-semibold">{r.id} · {r.titulo}</h2></div>
            <p className="mt-1 text-xs text-neutral-500">Condición {r.cond}: {CONDICIONES[r.cond]}</p>
            <p className="mt-2 text-neutral-300">{r.porque}</p>
            <p className="mt-2"><span className="text-cyan-200">Qué lo cura:</span> {r.cura}</p>
            <p className="mt-2 text-xs text-neutral-500">Fuente: {r.fuente}</p>
          </article>
        ))}
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-xl font-semibold">La lectura por IA</h2>
        <ul className="list-disc space-y-1 pl-5 text-neutral-300">
          <li>Modelo: <code>{MODELO}</code> vía Vercel AI Gateway, sin llave en el código (token OIDC de Vercel).</li>
          <li>Antes de llamar al modelo se rechaza cualquier texto que parezca traer CURP, RFC, NSS, teléfono o correo.</li>
          <li>Cada cita que devuelve el modelo se busca palabra por palabra en el texto pegado; si no aparece, se descarta y se muestra como descartada.</li>
          <li>La IA no cambia el veredicto. Si el Gateway no está disponible, la página usa un buscador de palabras clave y lo etiqueta como SIMULADO.</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm">
        <h2 className="text-xl font-semibold">Fuentes del checklist de ruta</h2>
        <ul className="list-disc space-y-1 pl-5 text-neutral-300">
          {Object.values(FUENTES).map(f => <li key={f.txt}>{f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="underline">{f.txt}</a> : f.txt}</li>)}
        </ul>
        <p className="text-neutral-500">Todo costo y requisito se muestra "por verificar": Aduana no promete citas ni cobertura.</p>
      </section>
    </div>
  )
}
