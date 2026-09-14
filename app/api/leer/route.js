import { generateText, Output } from 'ai'
import { z } from 'zod'
import { CAMPOS } from '../../../lib/reglas.js'
import { detectarPII } from '../../../lib/pii.js'
import { MODELO, SISTEMA, armarPrompt, leerSimulado, verificarCitas } from '../../../lib/lector.js'

export const maxDuration = 60

const hoja = Object.fromEntries(Object.entries(CAMPOS).map(([k, c]) => {
  const opcion = z.enum(Object.keys(c.opciones))
  return [k, c.multi ? z.array(opcion).max(Object.keys(c.opciones).length) : opcion]
}))
const Entrada = z.object({ terminos: z.object(hoja).strict(), texto: z.string().trim().min(40).max(4000) }).strict()

// Sin límites numéricos en el esquema del modelo: se validan y recortan después, en verificarCitas.
const Lectura = z.object({
  hallazgos: z.array(z.object({ condicion: z.number(), cita: z.string(), problema: z.string(), pregunta: z.string() })),
  contradicciones: z.array(z.object({ campo: z.string(), declarado: z.string(), cita: z.string(), explicacion: z.string() })),
})

const golpes = new Map()
function excedido(ip) {
  const ahora = Date.now()
  const recientes = (golpes.get(ip) || []).filter(t => ahora - t < 10 * 60 * 1000)
  recientes.push(ahora)
  golpes.set(ip, recientes)
  return recientes.length > 8
}

export async function POST(req) {
  let body
  try { body = await req.json() } catch { return Response.json({ error: 'Solicitud inválida.' }, { status: 400 }) }

  const parsed = Entrada.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Revisa los términos y que el texto tenga entre 40 y 4,000 caracteres.' }, { status: 400 })
  const { terminos, texto } = parsed.data

  const pii = detectarPII(texto)
  if (pii.length) return Response.json({ error: `El texto parece contener datos personales (${pii.join(', ')}). Quítalos: Aduana no manda datos personales al modelo.` }, { status: 400 })

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local'
  if (excedido(ip)) return Response.json({ error: 'Demasiadas lecturas seguidas. Espera unos minutos.' }, { status: 429 })

  let modo = 'real'
  let razon = null
  let crudo
  try {
    const { output } = await generateText({
      model: MODELO,
      system: SISTEMA,
      prompt: armarPrompt(terminos, texto),
      output: Output.object({ schema: Lectura }),
      maxOutputTokens: 2500,
    })
    crudo = output
  } catch (e) {
    const msg = String(e?.message || '') + ' ' + String(e?.cause?.message || '') + ' ' + String(e?.responseBody || '')
    console.error('gateway:', e?.name, msg.slice(0, 200))
    modo = 'simulado'
    razon = /credit card|customer_verification/i.test(msg) ? 'El equipo de Vercel todavía no tiene tarjeta registrada, así que AI Gateway no atiende solicitudes.'
      : /insufficient|quota|budget/i.test(msg) ? 'AI Gateway se quedó sin crédito.'
      : 'AI Gateway no respondió.'
    crudo = leerSimulado(texto, terminos)
  }

  return Response.json({ modo, razon, modelo: modo === 'real' ? MODELO : null, ...verificarCitas(crudo, texto) })
}
