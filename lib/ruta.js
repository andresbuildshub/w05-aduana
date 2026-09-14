// Aduana — checklist de ruta y elegibilidad v0.1. Casos FICTICIOS. No promete citas ni cobertura (Condición 4).

export const FUENTES = {
  imssb: { txt: 'Registro IMSS-Bienestar: requisitos (consulta 13-sep-2026)', url: 'https://registro.imssbienestar.gob.mx/' },
  adheridos: { txt: 'El Financiero, 20-ene-2026: estados no adheridos a IMSS-Bienestar (consulta 13-sep-2026)', url: 'https://www.elfinanciero.com.mx/nacional/2026/01/20/claudia-sheinbaum-mananera-temas-hoy-20-de-enero-de-2026-en-vivo/' },
  ssfam: { txt: 'IMSS, Seguro de Salud para la Familia: cuotas vigentes desde 1-mar-2026', url: 'http://www.imss.gob.mx/faq/seguro-familia' },
  ssfamExcl: { txt: 'El Siglo de Torreón 2026, "Modalidad 33": no admite preexistencias; excluye tratamientos crónicos de control permanente (verificar redacción oficial)', url: 'https://www.elsiglodetorreon.com.mx/noticia/2026/modalidad-33-del-imss-como-funciona-para-quienes-se-recomienda-y-cuanto-cuesta-en-2026.html' },
  indep: { txt: 'El Imparcial, 15-abr-2026: incorporación voluntaria de independientes, MX$20,538.59 al año', url: 'https://www.elimparcial.com/dinero/2026/04/15/incorporacion-voluntaria-al-imss-cuesta-20538-pesos-al-ano-pero-no-habra-devoluciones-ni-acceso-con-ciertas-enfermedades/' },
  curp: { txt: 'CURP: consulta e impresión gratuita', url: 'https://www.gob.mx/curp/' },
  bolsillo: { txt: 'Brief de Andrés, sem. 5: HbA1c MX$145–280 en cadena de diagnóstico de bajo costo (verificar precio local)', url: null },
}

export const ENTIDADES = [['AGS', 'Aguascalientes'], ['BC', 'Baja California'], ['BCS', 'Baja California Sur'], ['CAMP', 'Campeche'], ['CHIS', 'Chiapas'], ['CHIH', 'Chihuahua'], ['CDMX', 'Ciudad de México'], ['COAH', 'Coahuila'], ['COL', 'Colima'], ['DGO', 'Durango'], ['GTO', 'Guanajuato'], ['GRO', 'Guerrero'], ['HGO', 'Hidalgo'], ['JAL', 'Jalisco'], ['MEX', 'Estado de México'], ['MICH', 'Michoacán'], ['MOR', 'Morelos'], ['NAY', 'Nayarit'], ['NL', 'Nuevo León'], ['OAX', 'Oaxaca'], ['PUE', 'Puebla'], ['QRO', 'Querétaro'], ['QROO', 'Quintana Roo'], ['SLP', 'San Luis Potosí'], ['SIN', 'Sinaloa'], ['SON', 'Sonora'], ['TAB', 'Tabasco'], ['TAMPS', 'Tamaulipas'], ['TLAX', 'Tlaxcala'], ['VER', 'Veracruz'], ['YUC', 'Yucatán'], ['ZAC', 'Zacatecas']]
export const NO_ADHERIDOS = ['AGS', 'CHIH', 'COAH', 'DGO', 'GTO', 'JAL', 'NL', 'QRO']

export const CUOTAS_SSFAM = { '40-49': 14350, '50-59': 14850, '60-69': 20600, '70-79': 21500, '80+': 22150 }

export const CAMPOS_RUTA = {
  entidad: { label: 'Estado donde vive', opciones: Object.fromEntries(ENTIDADES) },
  derechohabiencia: { label: 'Seguridad social', opciones: { imss: 'IMSS vigente', issste: 'ISSSTE vigente', otra: 'Otra institución (Pemex, Sedena…)', ninguna: 'Ninguna', no_sabe: 'No sabe' } },
  trabajo: { label: 'Trabajo', opciones: { formal: 'Asalariada con patrón', independiente: 'Independiente con ingresos propios', informal: 'Informal', hogar: 'Trabajo del hogar no pagado' } },
  edad: { label: 'Edad', opciones: { '40-49': '40 a 49', '50-59': '50 a 59', '60-69': '60 a 69', '70-79': '70 a 79', '80+': '80 o más' } },
  docs: { multi: true, label: 'Documentos que tiene a la mano', opciones: { curp: 'CURP', identificacion: 'Identificación oficial', comprobante: 'Comprobante de domicilio', nss: 'Número de Seguridad Social', orden: 'Orden o resultado del proveedor (impreso o foto)' } },
  telefono: { label: 'Teléfono', opciones: { smartphone: 'Smartphone', basico: 'Celular básico', sin_telefono: 'Sin teléfono propio' } },
  plazoClinico: { label: 'Plazo que fijó el clínico', opciones: { '7': '7 días', '14': '14 días', '30': '30 días' } },
  intentos: { label: 'Intentos automáticos fallidos sobre esta misma acción', opciones: { '0': 'Ninguno', '1': 'Uno', '2': 'Dos o más' } },
  barrera: { label: 'Barrera que ella reporta', opciones: { ninguna: 'Ninguna por ahora', costo: 'Costo', transporte: 'Transporte', horario: 'Horario de trabajo', sin_cita: 'No hay cita o no hay insumos', documentos: 'Documentos' } },
  consentimiento: { label: '¿Dio consentimiento expreso?', opciones: { si: 'Sí, por escrito', no: 'No' } },
  familiar: { label: '¿Quiere que un familiar acompañe?', opciones: { no: 'No', si: 'Sí, ella lo autoriza' } },
}

export const CASO_EJEMPLO = {
  navegadora: 'Rosa (navegadora ficticia)', entidad: 'CHIS', derechohabiencia: 'ninguna', trabajo: 'informal', edad: '50-59',
  docs: ['curp', 'orden'], telefono: 'basico', plazoClinico: '14', intentos: '0', barrera: 'transporte', consentimiento: 'si', familiar: 'no',
}

const pesos = n => 'MX$' + n.toLocaleString('es-MX')
const REQ = {
  imss: ['nss', 'identificacion'],
  institucion: ['identificacion'],
  imssb: ['curp'],
  estatal: ['curp', 'identificacion'],
}
const NOMBRE_DOC = { curp: 'CURP', identificacion: 'Identificación oficial', comprobante: 'Comprobante de domicilio', nss: 'Número de Seguridad Social', orden: 'Orden o resultado del proveedor' }

// Fecha LOCAL (no UTC): después de las 18:00 en CDMX, toISOString ya es "mañana".
function sumarDias(fecha, dias) {
  const d = new Date(fecha); d.setDate(d.getDate() + dias)
  const dos = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}
const legible = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

export function evaluarRuta(c, hoy = new Date()) {
  const plazo = Math.min(Number(c.plazoClinico) || 14, 14)
  const fechaLimite = sumarDias(hoy, plazo)
  const navegadora = (c.navegadora || '').trim()
  const canal = { smartphone: 'Llamada o WhatsApp, lo que ella prefiera', basico: 'Llamada y SMS', sin_telefono: 'Visita en la farmacia o llamada a un número que ELLA autorice' }[c.telefono]
  const avisos = []

  if (c.consentimiento !== 'si') {
    return {
      abierto: false, estado: 'OPT-OUT INFORMADO — SIN CONSENTIMIENTO', tono: 'gris', rutas: [], faltantes: [], avisos,
      tarjeta: {
        siguienteAccion: 'Explicar por llamada o en persona qué es el acompañamiento y registrar su decisión. No se abre el caso y no se contacta a familiares.',
        duena: navegadora || '— asignar una navegadora con nombre', fechaLimite, barrera: '—', causa: '—',
        escalamiento: 'No aplica: sin consentimiento no hay automatización.', canal, familia: 'No se contacta a familiares.',
      },
    }
  }

  const rutas = []
  let principal = null
  const adherido = !NO_ADHERIDOS.includes(c.entidad)
  const nombreEntidad = CAMPOS_RUTA.entidad.opciones[c.entidad] || c.entidad

  if (c.derechohabiencia === 'imss') {
    principal = { id: 'imss', nombre: 'IMSS: su Unidad de Medicina Familiar', estatus: 'PRINCIPAL — POR VERIFICAR', costo: 'MX$0 (derechohabiente)', requisitos: REQ.imss, notas: ['Verificar vigencia de derechos antes de ir (constancia de vigencia en IMSS Digital o en la UMF).'], fuente: null }
  } else if (c.derechohabiencia === 'issste' || c.derechohabiencia === 'otra') {
    principal = { id: 'institucion', nombre: 'Su institución de seguridad social', estatus: 'PRINCIPAL — POR VERIFICAR', costo: 'MX$0 (derechohabiente)', requisitos: REQ.institucion, notas: ['Aduana v0.1 no detalla esta institución: verificar requisitos directamente con ella.'], fuente: null }
  } else {
    if (c.derechohabiencia === 'no_sabe') avisos.push('Primero verificar con su CURP si tiene IMSS o ISSSTE vigente: cambia la ventanilla y el costo.')
    principal = adherido
      ? { id: 'imssb', nombre: 'IMSS-Bienestar', estatus: 'PRINCIPAL — POR VERIFICAR', costo: 'MX$0 para personas sin seguridad social', requisitos: REQ.imssb, notas: ['Para el registro en línea piden CURP, identificación, comprobante de domicilio, foto y un teléfono o correo; verificar en la unidad si atienden solo con CURP.', 'Verificar que la prueba y el medicamento estén disponibles. Si no hay, el estado es BARRERA DE CAPACIDAD, no "incumplimiento".'], fuente: FUENTES.imssb }
      : { id: 'estatal', nombre: `Servicios de salud del estado (${nombreEntidad} no está adherido a IMSS-Bienestar)`, estatus: 'PRINCIPAL — POR VERIFICAR', costo: 'Gratuito para personas sin seguridad social según el acuerdo estatal (verificar)', requisitos: REQ.estatal, notas: ['No mandarla a una unidad IMSS-Bienestar sin verificar antes.'], fuente: FUENTES.adheridos }

    rutas.push({ id: 'ssfam', nombre: 'Seguro de Salud para la Familia (IMSS)', estatus: 'NO PARA ESTA ACCIÓN', costo: `${pesos(CUOTAS_SSFAM[c.edad] || 14850)} al año por persona (${CAMPOS_RUTA.edad.opciones[c.edad] || c.edad} años), pago anticipado, sin devoluciones`, requisitos: [], notas: ['No admite enfermedades preexistentes y excluye tratamientos crónicos que requieren control permanente (verificar redacción oficial).', 'Con un tamizaje anormal ya conocido no es ruta para esta acción. Nunca se oculta un resultado para entrar (Condición 4).'], fuente: FUENTES.ssfamExcl })

    if (c.trabajo === 'independiente' || c.trabajo === 'informal') {
      rutas.push({ id: 'indep', nombre: 'Incorporación voluntaria al IMSS (trabajadoras independientes)', estatus: 'POSIBLE A FUTURO — VERIFICAR', costo: 'MX$20,538.59 al año (2026), bimestral o anual', requisitos: [], notas: [`El servicio empieza el primer día del mes siguiente: no resuelve una acción con plazo de ${plazo} días.`, 'La lista publicada de padecimientos que impiden entrar (tumores malignos, insuficiencia renal crónica, cardiopatías graves, VIH, trastornos mentales severos, adicciones) no menciona diabetes. Confirmar con el IMSS antes de pagar. El cuestionario médico se contesta con la verdad.'], fuente: FUENTES.indep })
    }
  }

  rutas.push({ id: 'bolsillo', nombre: 'De su bolsillo: laboratorio de bajo costo', estatus: 'SOLO SI ELLA LO ELIGE', costo: 'HbA1c ≈ MX$145–280 (sep-2026, verificar precio local)', requisitos: [], notas: ['Nunca a través de un canal que le pague comisión al programa (regla R01).', 'Si el costo la detiene, el estado es NO RESUELTO — BARRERA FINANCIERA, no "no quiso".'], fuente: FUENTES.bolsillo })
  rutas.unshift(principal)

  const docs = c.docs || []
  const faltantes = [...new Set([...principal.requisitos, 'orden'])].filter(d => !docs.includes(d)).map(d => NOMBRE_DOC[d])

  let siguienteAccion = `Acudir a: ${principal.nombre}, con la orden del clínico (consulta y prueba confirmatoria), antes del ${legible(fechaLimite)}.`
  if (c.derechohabiencia === 'no_sabe') siguienteAccion = 'Verificar con su CURP si tiene seguridad social vigente. Después: ' + siguienteAccion
  if (!docs.includes('curp') && principal.requisitos.includes('curp')) {
    siguienteAccion = 'Conseguir e imprimir su CURP (gratis en gob.mx/curp). Después: ' + siguienteAccion
  }

  const BARRERAS = {
    ninguna: ['Ninguna reportada', '—', 'ABIERTO — POR VERIFICAR', 'ambar'],
    costo: ['Costo', 'estructural', 'NO RESUELTO — BARRERA FINANCIERA', 'rojo'],
    sin_cita: ['No hay cita o insumos', 'estructural', 'NO RESUELTO — BARRERA DE CAPACIDAD', 'rojo'],
    transporte: ['Transporte', 'modificable por coordinación', 'ABIERTO — BARRERA POR RESOLVER', 'ambar'],
    horario: ['Horario de trabajo', 'modificable por coordinación', 'ABIERTO — BARRERA POR RESOLVER', 'ambar'],
    documentos: ['Documentos', 'modificable por coordinación', 'ABIERTO — FALTAN DOCUMENTOS', 'ambar'],
  }
  let [barrera, causa, estado, tono] = BARRERAS[c.barrera] || BARRERAS.ninguna
  if (faltantes.length && c.barrera === 'ninguna') { estado = 'ABIERTO — FALTAN DOCUMENTOS'; barrera = 'Documentos'; causa = 'modificable por coordinación' }

  let escalamiento = 'Después de 2 intentos automáticos fallidos sobre esta acción se detiene la automatización y la navegadora revisa el caso (Condición 3).'
  if (c.intentos === '2') {
    estado = 'REVISIÓN HUMANA OBLIGATORIA'; tono = 'rojo'
    escalamiento = `Automatización detenida tras 2 intentos fallidos. La navegadora llama o la ve en persona antes del ${legible(fechaLimite)}. No más recordatorios automáticos.`
  }
  if (!navegadora) { estado = 'SIN DUEÑA — NO SE PUEDE ABRIR'; tono = 'rojo' }
  if (Number(c.plazoClinico) < 14) avisos.push(`El plazo del clínico (${c.plazoClinico} días) manda sobre la ventana de 14 días del piloto.`)

  return {
    abierto: !!navegadora, estado, tono, rutas, faltantes, avisos,
    tarjeta: {
      siguienteAccion, duena: navegadora || '— asignar una navegadora con nombre', fechaLimite, barrera, causa, escalamiento, canal,
      familia: c.familiar === 'si' ? 'Puede acompañar si ella lo autoriza. No se le asigna ninguna tarea.' : 'No se contacta a familiares.',
    },
  }
}
