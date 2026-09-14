// node --test test/  — pruebas mecánicas del plan (docs/PACKET.md)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRESETS, evaluar, decisionSimple } from '../lib/reglas.js'
import { evaluarRuta, CASO_EJEMPLO } from '../lib/ruta.js'
import { detectarPII } from '../lib/pii.js'
import { leerSimulado, verificarCitas } from '../lib/lector.js'

const P = Object.fromEntries(PRESETS.map(p => [p.id, p]))
const ids = r => r.hallazgos.map(h => h.id).sort()

test('a) farmacia con comisión → NO CRUZA con R01', () => {
  const r = evaluar(P['farmacia-comision'].terminos)
  assert.equal(r.veredicto, 'NO CRUZA')
  assert.ok(ids(r).includes('R01'))
})

test('b) farmacia tarifa fija (Blueprint) → CRUZA CON CONDICIONES, solo VERIFICAR', () => {
  const r = evaluar(P['farmacia-fija'].terminos)
  assert.equal(r.veredicto, 'CRUZA CON CONDICIONES')
  assert.deepEqual(ids(r), ['R19', 'R20'])
  assert.ok(r.hallazgos.every(h => h.sev === 'VERIFICAR'))
})

test('c) remesadora como la ofrecen → NO CRUZA por datos a seguros/crédito (R08) y estado del caso (R04)', () => {
  const r = evaluar(P['remesa-ofrecida'].terminos)
  assert.equal(r.veredicto, 'NO CRUZA')
  for (const id of ['R04', 'R08', 'R11']) assert.ok(ids(r).includes(id), id)
})

test('remesadora con cortafuegos → CRUZA CON CONDICIONES (R20, R23)', () => {
  const r = evaluar(P['remesa-cortafuegos'].terminos)
  assert.equal(r.veredicto, 'CRUZA CON CONDICIONES')
  assert.deepEqual(ids(r), ['R20', 'R23'])
})

test('d) hijo migrante que quiere saber → NO CRUZA; el familiar ve lo que no debe', () => {
  const r = evaluar(P['hijo-migrante'].terminos)
  assert.equal(r.veredicto, 'NO CRUZA')
  for (const id of ['R04', 'R11', 'R12']) assert.ok(ids(r).includes(id), id)
  assert.equal(r.matriz.resultado.Pagador, 'violacion')
  assert.equal(r.matriz.resultado.Familiar, 'violacion')
})

test('e) guardia de datos personales', () => {
  assert.ok(detectarPII('La paciente GOMA560712MCSRRN08 firmó').includes('CURP'))
  assert.ok(detectarPII('llamar al 961 123 4567').includes('teléfono'))
  // bug encontrado en producción: el punto final escondía el teléfono
  assert.ok(detectarPII('Contacto de la paciente: 961 123 4567.').includes('teléfono'))
  assert.ok(detectarPII('Tel. 9611234567, gracias').includes('teléfono'))
  assert.ok(detectarPII('escribir a rosa.perez@correo.mx').includes('correo'))
  for (const p of PRESETS) assert.deepEqual(detectarPII(p.texto), [], p.id)
})

test('g) guardia de citas: una cita inventada se descarta', () => {
  const texto = P['farmacia-fija'].texto
  const r = verificarCitas({
    hallazgos: [
      { condicion: 6, cita: 'el Programa enviará a la Farmacia el listado de pacientes atendidos con su número telefónico', problema: 'x', pregunta: 'y' },
      { condicion: 5, cita: 'La Farmacia recibirá el 5% de cada receta surtida', problema: 'inventado', pregunta: 'y' },
    ],
    contradicciones: [{ campo: 'noExiste', declarado: 'a', cita: 'SEXTA. Este documento expresa interés', explicacion: 'b' }],
  }, texto)
  assert.equal(r.hallazgos.length, 1)
  assert.equal(r.descartados.length, 2)
})

test('lector simulado encuentra las dos contradicciones de Farmacia B', () => {
  const p = P['farmacia-fija']
  const r = verificarCitas(leerSimulado(p.texto, p.terminos), p.texto)
  assert.deepEqual(r.contradicciones.map(c => c.campo).sort(), ['datosPagador', 'dirigeRuta'])
  assert.equal(r.descartados.length, 0)
  assert.ok(!r.hallazgos.some(h => /no usará/.test(h.cita)), 'una prohibición no es hallazgo')
  assert.deepEqual(r.contradicciones.map(c => c.valor).sort(), ['nombre_contacto', 'sugiere'])
})

test('fix de la prueba con persona: al usar lo que dice el contrato, Farmacia B pasa a "NO LO FIRMES ASÍ"', () => {
  const t = P['farmacia-fija'].terminos
  assert.equal(decisionSimple(evaluar(t)).titulo, 'SE PUEDE FIRMAR, DESPUÉS DE VERIFICAR')
  const corregido = evaluar({ ...t, datosPagador: [...t.datosPagador, 'nombre_contacto'], dirigeRuta: 'sugiere' })
  assert.ok(['R05', 'R25'].every(id => ids(corregido).includes(id)))
  assert.equal(decisionSimple(corregido).titulo, 'NO LO FIRMES ASÍ')
})

const HOY = new Date('2026-09-13T12:00:00')

test('i) caso ejemplo en Chiapas → IMSS-Bienestar, Seguro Familia no es ruta, barrera por resolver', () => {
  const r = evaluarRuta(CASO_EJEMPLO, HOY)
  assert.equal(r.rutas[0].id, 'imssb')
  assert.equal(r.rutas.find(x => x.id === 'ssfam').estatus, 'NO PARA ESTA ACCIÓN')
  assert.match(r.rutas.find(x => x.id === 'ssfam').costo, /14,850/)
  assert.equal(r.estado, 'ABIERTO — BARRERA POR RESOLVER')
  assert.equal(r.tarjeta.fechaLimite, '2026-09-27')
  assert.deepEqual(r.faltantes, [])
})

test('bug encontrado en producción: de noche en CDMX la fecha límite no se corre un día (UTC)', () => {
  const r = evaluarRuta(CASO_EJEMPLO, new Date('2026-09-13T23:30:00'))
  assert.equal(r.tarjeta.fechaLimite, '2026-09-27')
  assert.doesNotMatch(r.tarjeta.siguienteAccion, /\d{4}-\d{2}-\d{2}/)
})

test('i) sin seguridad social en Jalisco → servicios estatales, no IMSS-Bienestar', () => {
  assert.equal(evaluarRuta({ ...CASO_EJEMPLO, entidad: 'JAL' }, HOY).rutas[0].id, 'estatal')
})

test('i) dos intentos → revisión humana; costo → barrera financiera; sin dueña → no se abre; sin consentimiento → opt-out', () => {
  assert.equal(evaluarRuta({ ...CASO_EJEMPLO, intentos: '2' }, HOY).estado, 'REVISIÓN HUMANA OBLIGATORIA')
  assert.equal(evaluarRuta({ ...CASO_EJEMPLO, barrera: 'costo' }, HOY).estado, 'NO RESUELTO — BARRERA FINANCIERA')
  assert.equal(evaluarRuta({ ...CASO_EJEMPLO, navegadora: '  ' }, HOY).estado, 'SIN DUEÑA — NO SE PUEDE ABRIR')
  const opt = evaluarRuta({ ...CASO_EJEMPLO, consentimiento: 'no' }, HOY)
  assert.equal(opt.abierto, false)
  assert.match(opt.estado, /OPT-OUT/)
})

test('i) plazo clínico de 7 días manda; faltan documentos se reportan; sin CURP la primera acción es conseguirla', () => {
  const r7 = evaluarRuta({ ...CASO_EJEMPLO, plazoClinico: '7' }, HOY)
  assert.equal(r7.tarjeta.fechaLimite, '2026-09-20')
  assert.ok(r7.avisos.some(a => /7 días/.test(a)))
  const imss = evaluarRuta({ ...CASO_EJEMPLO, derechohabiencia: 'imss', docs: ['curp'] }, HOY)
  assert.deepEqual(imss.faltantes.sort(), ['Identificación oficial', 'Número de Seguridad Social', 'Orden o resultado del proveedor'].sort())
  assert.match(evaluarRuta({ ...CASO_EJEMPLO, docs: ['orden'] }, HOY).tarjeta.siguienteAccion, /^Conseguir e imprimir su CURP/)
})
