// Aduana — reglas v0.1. Deterministas y públicas (/reglas). El LLM nunca cambia un veredicto.
export const VERSION = 'v0.1.1 · 13-sep-2026'

export const CONDICIONES = {
  1: 'Las decisiones clínicas son del clínico',
  2: 'Cada caso tiene dueña',
  3: 'Una persona interviene a tiempo',
  4: 'Acceso honesto',
  5: 'Dinero sin conflicto, y medible',
  6: 'Privacidad y familia (cláusula sombra)',
}

// La señal estructurada: la hoja de términos del pagador, 14 campos cerrados.
export const CAMPOS = {
  tipoPagador: { label: 'Quién paga la navegación', opciones: { farmacia_cadena: 'Cadena de farmacias con consultorio', remesadora: 'Remesadora o grupo financiero', tienda_abono: 'Tienda con venta en abonos', aseguradora: 'Aseguradora', hijo_migrante: 'Familiar que envía dinero (hijo migrante)', gobierno_ong: 'Gobierno u ONG', empleador: 'Empleador' } },
  basePago: { label: 'Cómo se calcula el pago', opciones: { tarifa_fija: 'Tarifa fija por periodo', por_accion_completada: 'Por caso cerrado', por_paciente_inscrito: 'Por paciente inscrito', comision_medicamento: 'Comisión por medicamento surtido', comision_prueba: 'Comisión por prueba de laboratorio vendida', por_poliza: 'Por póliza de seguro vendida', por_remesa: 'Cuota por cada remesa enviada' } },
  vende: { multi: true, label: 'Qué le vende el pagador (o su grupo) a esta misma paciente', opciones: { medicamentos: 'Medicamentos', pruebas: 'Pruebas de laboratorio', seguros: 'Seguros', credito: 'Crédito', nada: 'Nada' } },
  datosPagador: { multi: true, label: 'Qué datos recibe el pagador', opciones: { agregados: 'Solo números totales, sin nombres', nombre_contacto: 'Nombre y teléfono de cada paciente', estado_caso: 'Estado del caso de cada paciente', resultado: 'Resultado del tamizaje de cada paciente', barreras: 'Barreras de cada paciente (costo, transporte…)' } },
  celdaMinima: { label: 'Tamaño mínimo de grupo en esos números totales', opciones: { '0': 'No se define', '5': '5 personas', '11': '11 personas o más' } },
  dirigeRuta: { label: '¿El pagador influye a dónde se manda a la paciente?', opciones: { no: 'No: la navegadora refiere a cualquier opción, la gratuita primero', sugiere: 'Sugiere sus propias sucursales o laboratorios', exclusiva: 'Solo a sus sucursales o laboratorios' } },
  pacientePaga: { label: '¿La paciente paga por la navegación?', opciones: { no: 'No', si: 'Sí' } },
  sinSmartphone: { label: '¿Hay ruta para quien no tiene smartphone?', opciones: { si: 'Sí: llamada, SMS o en persona', no: 'No: solo app o WhatsApp' } },
  consentimiento: { label: 'Consentimiento para datos de salud', opciones: { expreso: 'Expreso, por escrito y revocable', aviso_general: 'Aviso de privacidad general', ninguno: 'No se pide' } },
  familia: { label: 'Participación de familiares', opciones: { con_consentimiento: 'Solo lo que la paciente autorice', automatica: 'Un familiar o el pagador recibe avisos automáticamente', no_aplica: 'No participan' } },
  tareasFamiliar: { label: '¿El programa le asigna tareas a un familiar?', opciones: { no: 'No', si: 'Sí' } },
  compromiso: { label: 'Nivel de compromiso del pagador', opciones: { interes: 'Interés verbal', carta: 'Carta de intención', contrato: 'Contrato pagado' } },
  metricas: { multi: true, label: 'Con qué mide el éxito el pagador', opciones: { acciones_completadas: 'Acciones completadas', minutos_navegadora: 'Minutos de navegadora', alertas_enviadas: 'Alertas o recordatorios enviados', inscripciones: 'Inscripciones', ventas: 'Ventas' } },
  usoFuturo: { label: 'Uso futuro de los datos por el pagador o su grupo', opciones: { prohibido: 'Prohibido por contrato: mercadotecnia, crédito y seguros', no_dice: 'El acuerdo no dice nada', permitido: 'Permitido' } },
}

const tiene = (lista, ...valores) => valores.some(v => (lista || []).includes(v))
const PERSONALES = ['nombre_contacto', 'estado_caso', 'resultado', 'barreras']

export const REGLAS = [
  { id: 'R01', cond: 5, sev: 'BLOQUEA', titulo: 'La navegación se paga con lo que la paciente compra',
    test: t => tiene([t.basePago], 'comision_medicamento', 'comision_prueba'),
    porque: 'Si cada receta surtida o prueba vendida paga la navegación, cada traspaso es una venta. Es el conflicto del consultorio adyacente a farmacia (sobreprescripción en 64% de usuarios) metido dentro del piloto.',
    fuente: 'Blueprint T2, Condición 5 · ENSANUT 2012 sobre consultorios adyacentes a farmacia · OIG 42 CFR 1001.952(hh): el safe harbor de apoyo al paciente excluye a fabricantes y distribuidores de medicamentos',
    cura: 'Tarifa fija por periodo, escrita como independiente del volumen de medicamentos o pruebas vendidos.' },
  { id: 'R02', cond: 5, sev: 'BLOQUEA', titulo: 'La navegación se paga vendiendo seguros',
    test: t => t.basePago === 'por_poliza',
    porque: 'Una póliza vendida después de un tamizaje anormal nace con la preexistencia documentada. CONDUSEF cuenta como preexistente hasta los "gastos comprobables para diagnosticar". El programa cobraría por fabricar clientas inasegurables.',
    fuente: 'CONDUSEF, definición de preexistencia · Ley sobre el Contrato de Seguro, art. 8 (declarar lo que se "debía saber")',
    cura: 'Ningún pago ligado a pólizas. Si el grupo vende seguros, aplica el cortafuegos de R08.' },
  { id: 'R03', cond: 5, sev: 'BLOQUEA', titulo: 'La paciente paga por la navegación',
    test: t => t.pacientePaga === 'si',
    porque: 'El Blueprint decidió que la paciente no paga navegar: quien más necesita el traspaso es quien menos puede pagarlo.',
    fuente: 'Blueprint T2, apuesta de pagador',
    cura: 'La navegación la paga 100% el patrocinador.' },
  { id: 'R04', cond: 6, sev: 'BLOQUEA', titulo: 'El pagador ve señales de salud de cada paciente',
    test: t => tiene(t.datosPagador, 'estado_caso', 'resultado', 'barreras'),
    porque: 'Cláusula sombra: los patrocinadores reciben métricas agregadas des-identificadas, nunca señales personales. Si quien paga ve quién está atorada y por qué, está suscrito al expediente de alguien, como en el capítulo.',
    fuente: 'Blueprint T2, Condición 6 · LFPDPPP (DOF 20-mar-2025): estado de salud = dato sensible',
    cura: 'El pagador recibe solo un reporte mensual con números totales, sin nombres (acciones completadas, minutos de navegadora, barreras por tipo), y ningún número de menos de 11 personas.' },
  { id: 'R05', cond: 6, sev: 'RIESGO', titulo: 'El pagador recibe la lista de nombres',
    test: t => tiene(t.datosPagador, 'nombre_contacto'),
    porque: 'Aunque no traiga resultados, una lista de "pacientes del piloto de diabetes" revela salud por inferencia. Es un dato sensible con otro nombre.',
    fuente: 'LFPDPPP 2025, art. 2: datos sensibles incluyen estado de salud presente y futuro',
    cura: 'Eliminar la lista. La conciliación de pagos se hace con conteos.' },
  { id: 'R06', cond: 6, sev: 'RIESGO', titulo: 'Cifras agregadas con grupos demasiado pequeños',
    test: t => tiene(t.datosPagador, 'agregados') && t.celdaMinima !== '11',
    porque: 'Con 100 pacientes en una localidad, "barrera de costo: 3" identifica a tres vecinas. CMS no publica ninguna celda de 1 a 10.',
    fuente: 'CMS Cell Size Suppression Policy (ResDAC)',
    cura: 'Suprimir o agrupar cualquier cifra de 1 a 10 personas.' },
  { id: 'R07', cond: 4, sev: 'BLOQUEA', titulo: 'Solo se puede referir a las sucursales del pagador',
    test: t => t.dirigeRuta === 'exclusiva',
    porque: 'Acceso honesto: si existe una opción gratuita a la que ella tiene derecho (IMSS, IMSS-Bienestar o servicios estatales), la navegadora debe poder usarla. Una ruta exclusiva convierte la navegación en captación de clientes.',
    fuente: 'Blueprint T2, Condición 4',
    cura: 'Cláusula de libre referencia: primero la opción gratuita a la que la paciente tenga derecho.' },
  { id: 'R25', cond: 4, sev: 'RIESGO', titulo: 'El pagador sugiere sus propias sucursales o laboratorios',
    test: t => t.dirigeRuta === 'sugiere',
    porque: 'Una sugerencia que viene de la farmacia pesa: la paciente hace lo que le dicen en el mostrador. Si existe una opción gratuita a la que tiene derecho, tiene que ofrecerse primero y por escrito.',
    fuente: 'Blueprint T2, Condición 4 · regla agregada después de la prueba con persona (v0.1.1)',
    cura: 'Cláusula: la navegadora ofrece primero la opción gratuita; la del pagador solo si la paciente la elige.' },
  { id: 'R08', cond: 6, sev: 'BLOQUEA', titulo: 'Los datos pueden cruzar a la aseguradora o al crédito del grupo',
    test: t => tiene(t.vende, 'seguros', 'credito') && (tiene(t.datosPagador, ...PERSONALES) || t.usoFuturo !== 'prohibido'),
    porque: 'El pagador cobra en la misma ventanilla donde su grupo vende pólizas y préstamos. Un tamizaje anormal es información gratis para suscribir seguros y medir riesgo de crédito. La aseguradora ni siquiera necesita la base: le pregunta a ella bajo protesta de decir verdad, pero con la base ya no tiene que preguntar.',
    fuente: 'CONDUSEF (preexistencia) · LCS art. 8 · Mi brief sem. 5: pólizas de MX$300/año que pagan MX$50 mil al diagnóstico de cáncer se venden en esas mismas ventanillas',
    cura: 'Solo agregados + prohibición contractual, auditable, de usar datos del programa para mercadotecnia, crédito o suscripción de seguros en todo el grupo.' },
  { id: 'R09', cond: 6, sev: 'BLOQUEA', titulo: 'No hay ruta para quien no tiene smartphone',
    test: t => t.sinSmartphone === 'no',
    porque: 'El Blueprint exige una ruta por teléfono o sin smartphone. La paciente de 55 años del brief no puede quedar fuera por su aparato.',
    fuente: 'Blueprint T2, Condición 6',
    cura: 'Llamada, SMS o visita en la farmacia como ruta completa, no de segunda.' },
  { id: 'R10', cond: 6, sev: 'BLOQUEA', titulo: 'El consentimiento no es expreso ni por escrito',
    test: t => t.consentimiento !== 'expreso',
    porque: 'Los datos de salud son datos sensibles. La LFPDPPP 2025 exige consentimiento expreso y por escrito; un aviso de privacidad general no alcanza.',
    fuente: 'LFPDPPP (DOF 20-mar-2025)',
    cura: 'Consentimiento expreso, por escrito, por finalidad y revocable con una llamada.' },
  { id: 'R11', cond: 6, sev: 'BLOQUEA', titulo: 'Un familiar recibe avisos sin que la paciente lo decida',
    test: t => t.familia === 'automatica',
    porque: 'Involucrar a la familia requiere el consentimiento de la paciente. Si el hijo que paga recibe "su mamá no fue a la cita", el programa la vigila para él.',
    fuente: 'Blueprint T2, Condición 6',
    cura: 'El familiar solo recibe lo que la paciente autorice, caso por caso y revocable.' },
  { id: 'R12', cond: 6, sev: 'BLOQUEA', titulo: 'El programa le asigna trabajo a un familiar',
    test: t => t.tareasFamiliar === 'si',
    porque: 'Nada de asignar trabajo automáticamente a una hija. En México 24 millones de mujeres ya cuidan 37.9 horas a la semana; un piloto que le delega recordatorios le suma horas no pagadas.',
    fuente: 'Blueprint T2, Condición 6 · ENASIC 2022 (INEGI)',
    cura: 'Las tareas son de la navegadora pagada. La familia acompaña si la paciente quiere, sin tareas.' },
  { id: 'R13', cond: 5, sev: 'BLOQUEA', titulo: 'El éxito se mide en ventas',
    test: t => tiene(t.metricas, 'ventas'),
    porque: 'Si el patrocinador mide ventas, la navegación trabaja para la caja aunque el pago sea fijo.',
    fuente: 'Blueprint T2, Condición 5',
    cura: 'Medir acciones completadas y minutos de navegadora. Las ventas no son una métrica del programa.' },
  { id: 'R14', cond: 5, sev: 'RIESGO', titulo: 'El éxito se mide en alertas o inscripciones',
    test: t => tiene(t.metricas, 'alertas_enviadas', 'inscripciones'),
    porque: 'Hay que medir acciones completadas y trabajo humano, no alertas enviadas. Mil recordatorios no son una consulta, e inscribir no es atender.',
    fuente: 'Blueprint T2, Condición 5',
    cura: 'Métrica principal: acciones completadas en 14 días; secundaria: minutos de navegadora por traspaso.' },
  { id: 'R15', cond: 5, sev: 'VERIFICAR', titulo: 'Faltan las métricas del Blueprint',
    test: t => !tiene(t.metricas, 'acciones_completadas') || !tiene(t.metricas, 'minutos_navegadora'),
    porque: 'Sin acciones completadas y minutos de navegadora no se puede aplicar el umbral para matar el piloto (menos de 20% de fallas con causa de coordinación) ni saber si la carga humana es segura.',
    fuente: 'Blueprint T2, apuesta de prueba y umbral de Santiago',
    cura: 'Agregar ambas métricas al acuerdo.' },
  { id: 'R16', cond: 2, sev: 'RIESGO', titulo: 'Se paga por caso cerrado',
    test: t => t.basePago === 'por_accion_completada',
    porque: 'Pagar por cierre premia cerrar como éxito lo que quedó sin resolver. El Blueprint dice que un caso aceptado sin resolver sigue NO RESUELTO.',
    fuente: 'Blueprint T2, Condición 2',
    cura: 'Tarifa fija + auditoría mensual de estados.' },
  { id: 'R17', cond: 3, sev: 'RIESGO', titulo: 'Se paga por paciente inscrita',
    test: t => t.basePago === 'por_paciente_inscrito',
    porque: 'Premia inscribir más allá de lo que las navegadoras pueden atender. El Blueprint pide verificar personal y capacidad antes de ampliar.',
    fuente: 'Blueprint T2, Condición 3',
    cura: 'Tope de inscripción atado al número de navegadoras disponibles.' },
  { id: 'R18', cond: 5, sev: 'RIESGO', titulo: 'El pago depende de cuántas remesas se envían',
    test: t => t.basePago === 'por_remesa',
    porque: 'No es margen de medicamento, pero ata la navegación a retener al remitente: si él deja de enviar dinero, ella pierde a su navegadora.',
    fuente: 'Blueprint T2, disidencia de Andrés (patrocinio por remesa)',
    cura: 'Tarifa fija por hogar inscrito durante el periodo, sin depender de cada envío.' },
  { id: 'R19', cond: 5, sev: 'VERIFICAR', titulo: 'El pagador vende lo que la navegación puede terminar recetando',
    test: t => tiene(t.vende, 'medicamentos', 'pruebas') && t.dirigeRuta !== 'exclusiva',
    porque: 'Con tarifa fija y libre referencia el conflicto baja, pero no desaparece: la sucursal está a un paso y la opción pública a un camión.',
    fuente: 'Blueprint T2, Condiciones 4 y 5',
    cura: 'Un reporte mensual de a dónde fueron las pacientes (cuántas a la sucursal del pagador y cuántas a la opción gratuita, solo números totales); revisar el acuerdo si la mayoría termina con el pagador.' },
  { id: 'R20', cond: 5, sev: 'VERIFICAR', titulo: 'Interés no es compromiso pagado',
    test: t => t.compromiso !== 'contrato',
    porque: 'Hay que distinguir un pagador interesado de un compromiso pagado. No contratar navegadoras ni abrir inscripción con una carta de intención.',
    fuente: 'Blueprint T2, Condición 5',
    cura: 'Contrato firmado y primer pago recibido antes de abrir la inscripción.' },
  { id: 'R21', cond: 6, sev: 'BLOQUEA', titulo: 'El acuerdo permite usar los datos después',
    test: t => t.usoFuturo === 'permitido',
    porque: 'Un permiso abierto convierte la base del piloto en un activo del pagador.',
    fuente: 'Blueprint T2, Condición 6',
    cura: 'Prohibición expresa de uso para mercadotecnia, crédito o seguros.' },
  { id: 'R22', cond: 6, sev: 'RIESGO', titulo: 'El acuerdo no prohíbe usos futuros de los datos',
    test: t => t.usoFuturo === 'no_dice',
    porque: 'Lo que el contrato no prohíbe, el grupo lo puede usar después.',
    fuente: 'Blueprint T2, Condición 6',
    cura: 'Prohibición expresa de uso para mercadotecnia, crédito o seguros.' },
  { id: 'R23', cond: 6, sev: 'VERIFICAR', titulo: 'Cortafuegos prometido: ¿quién lo audita?',
    test: t => tiene(t.vende, 'seguros', 'credito') && t.usoFuturo === 'prohibido' && !tiene(t.datosPagador, ...PERSONALES),
    porque: 'La prohibición está escrita, pero el grupo que vende seguros y crédito sigue siendo el que paga. Sin auditoría, la cláusula es una promesa.',
    fuente: 'Blueprint T2, Condición 6',
    cura: 'Derecho de auditoría del programa y terminación del acuerdo si se detecta un uso prohibido.' },
  { id: 'R24', cond: 6, sev: 'VERIFICAR', titulo: 'Paga la familia: ¿por qué seguiría pagando sin ver nada?',
    test: t => t.tipoPagador === 'hijo_migrante',
    porque: 'Pregunta abierta de mi brief. Si el hijo migrante nunca ve la señal (cláusula sombra), ¿qué compra? Hipótesis por probar: un recibo de "servicio activo" y las cifras agregadas del programa, nunca citas, resultados ni barreras de su madre.',
    fuente: 'Brief de Andrés, sem. 5 (pregunta pendiente)',
    cura: 'Definir por escrito qué recibe el familiar que paga y qué nunca recibe.' },
]

const ORDEN = { BLOQUEA: 0, RIESGO: 1, VERIFICAR: 2 }

export const ACTORES = ['Paciente', 'Navegadora', 'Clínico', 'Pagador', 'Familiar']
export const DATOS = [
  ['resultado', 'Resultado del tamizaje'],
  ['estado_caso', 'Estado del caso y siguiente acción'],
  ['barreras', 'Barreras (costo, transporte, horario)'],
  ['nombre_contacto', 'Nombre y teléfono'],
  ['agregados', 'Números totales del programa (sin nombres)'],
]

// La respuesta en palabras de la coordinadora. Sale de las mismas reglas: RIESGO = "se firma solo si se cura".
export function decisionSimple(r) {
  const n = s => r.hallazgos.filter(h => h.sev === s).length
  if (n('BLOQUEA') || n('RIESGO')) return { titulo: 'NO LO FIRMES ASÍ', sub: 'Primero pide los cambios de la lista.', tono: 'rojo' }
  if (n('VERIFICAR')) return { titulo: 'SE PUEDE FIRMAR, DESPUÉS DE VERIFICAR', sub: 'Nada lo bloquea, pero falta confirmar lo de la lista.', tono: 'ambar' }
  return { titulo: 'SE PUEDE FIRMAR', sub: 'Ninguna regla se activó.', tono: 'verde' }
}

// Matriz de exposición: 'si' | 'no' | 'condicional' | 'riesgo' | 'violacion'
export function matriz(t) {
  const fila = {}
  for (const [dato] of DATOS) {
    const pagador = !tiene(t.datosPagador, dato) ? 'no'
      : dato === 'agregados' ? (t.celdaMinima === '11' ? 'si' : 'riesgo')
      : dato === 'nombre_contacto' ? 'riesgo' : 'violacion'
    let familiar = 'no'
    if (t.familia === 'con_consentimiento' && dato !== 'agregados' && dato !== 'nombre_contacto') familiar = 'condicional'
    if (t.familia === 'automatica' && dato === 'estado_caso') familiar = 'violacion'
    if (t.tipoPagador === 'hijo_migrante' && pagador !== 'no') familiar = pagador
    fila[dato] = {
      Paciente: 'si',
      Navegadora: dato === 'agregados' ? 'si' : 'si',
      Clínico: dato === 'agregados' ? 'no' : 'si',
      Pagador: pagador,
      Familiar: familiar,
    }
  }
  return fila
}

export function evaluar(t) {
  const hallazgos = REGLAS.filter(r => r.test(t))
    .map(({ test, ...r }) => r)
    .sort((a, b) => ORDEN[a.sev] - ORDEN[b.sev])
  const veredicto = hallazgos.some(h => h.sev === 'BLOQUEA') ? 'NO CRUZA'
    : hallazgos.length ? 'CRUZA CON CONDICIONES' : 'CRUZA'
  return { veredicto, hallazgos, matriz: matriz(t), version: VERSION }
}

// Ejemplos: arquetipos INVENTADOS, no empresas reales.
export const PRESETS = [
  {
    id: 'farmacia-comision', nombre: 'Cadena farmacéutica A: comisión por receta',
    nota: 'Cómo suele llegar el dinero de una farmacia.',
    terminos: { tipoPagador: 'farmacia_cadena', basePago: 'comision_medicamento', vende: ['medicamentos', 'pruebas'], datosPagador: ['nombre_contacto', 'estado_caso'], celdaMinima: '0', dirigeRuta: 'sugiere', pacientePaga: 'no', sinSmartphone: 'si', consentimiento: 'aviso_general', familia: 'no_aplica', tareasFamiliar: 'no', compromiso: 'carta', metricas: ['ventas', 'alertas_enviadas'], usoFuturo: 'no_dice' },
    texto: 'ACUERDO DE COLABORACIÓN (borrador ficticio). PRIMERA. La Cadena aportará al Programa de Acompañamiento un monto equivalente al 8% del valor de los medicamentos surtidos en sus sucursales a pacientes referidos por el Programa. SEGUNDA. Las navegadoras recomendarán preferentemente los consultorios y laboratorios de la Cadena por su cercanía y precio. TERCERA. El Programa compartirá semanalmente con la Cadena el nombre, teléfono y estado de seguimiento de cada paciente, para coordinar recordatorios de surtido. CUARTA. La participación del paciente implica la aceptación del aviso de privacidad publicado en sucursales. QUINTA. El éxito del Programa se medirá por el número de recordatorios enviados y el incremento en el surtido de tratamientos.',
  },
  {
    id: 'farmacia-fija', nombre: 'Cadena farmacéutica B: tarifa fija (el pagador del Blueprint)',
    nota: 'La propuesta del equipo. Los términos declarados se ven limpios; lee el texto.',
    terminos: { tipoPagador: 'farmacia_cadena', basePago: 'tarifa_fija', vende: ['medicamentos', 'pruebas'], datosPagador: ['agregados'], celdaMinima: '11', dirigeRuta: 'no', pacientePaga: 'no', sinSmartphone: 'si', consentimiento: 'expreso', familia: 'con_consentimiento', tareasFamiliar: 'no', compromiso: 'interes', metricas: ['acciones_completadas', 'minutos_navegadora'], usoFuturo: 'prohibido' },
    texto: 'CONVENIO DE PATROCINIO (borrador ficticio). PRIMERA. La Farmacia cubrirá una tarifa fija mensual de dieciocho mil pesos durante los 30 días del piloto, independiente de las ventas de sus sucursales. SEGUNDA. El Programa entregará a la Farmacia un reporte mensual con cifras agregadas: acciones completadas, minutos de navegadora y barreras por tipo, sin ninguna cifra menor a 11 personas. TERCERA. Para fines de conciliación administrativa, el Programa enviará a la Farmacia el listado de pacientes atendidos con su número telefónico. CUARTA. La navegadora referirá a la opción a la que la paciente tenga derecho; en caso de requerir laboratorio, se sugerirá el de la Farmacia por convenio de precio. QUINTA. La Farmacia no usará información del Programa para mercadotecnia. SEXTA. Este documento expresa interés y no obliga a las partes hasta la firma del contrato definitivo.',
  },
  {
    id: 'remesa-ofrecida', nombre: 'Remesadora de grupo financiero: como la ofrecen',
    nota: 'El pagador que yo defendí en el Blueprint, tal como suele venir.',
    terminos: { tipoPagador: 'remesadora', basePago: 'por_remesa', vende: ['seguros', 'credito'], datosPagador: ['nombre_contacto', 'estado_caso'], celdaMinima: '0', dirigeRuta: 'no', pacientePaga: 'no', sinSmartphone: 'si', consentimiento: 'aviso_general', familia: 'automatica', tareasFamiliar: 'no', compromiso: 'interes', metricas: ['inscripciones', 'alertas_enviadas'], usoFuturo: 'no_dice' },
    texto: 'PROPUESTA COMERCIAL (borrador ficticio). 1. Por cada envío de dinero cobrado en ventanilla por un hogar inscrito, la Remesadora destinará doce pesos al Programa de Acompañamiento en Salud. 2. El remitente recibirá un mensaje cuando su familiar tenga una cita pendiente o no acuda a ella, para que pueda motivarla. 3. El Programa compartirá con la Remesadora el nombre, teléfono y estado de seguimiento de los beneficiarios, a fin de ofrecerles productos de protección de su grupo empresarial. 4. La inscripción se realiza al cobrar la remesa, aceptando el aviso de privacidad del grupo. 5. Indicadores: hogares inscritos y avisos enviados.',
  },
  {
    id: 'remesa-cortafuegos', nombre: 'Remesadora de grupo financiero: con cortafuegos',
    nota: 'La misma remesadora con las cláusulas que curan.',
    terminos: { tipoPagador: 'remesadora', basePago: 'tarifa_fija', vende: ['seguros', 'credito'], datosPagador: ['agregados'], celdaMinima: '11', dirigeRuta: 'no', pacientePaga: 'no', sinSmartphone: 'si', consentimiento: 'expreso', familia: 'con_consentimiento', tareasFamiliar: 'no', compromiso: 'carta', metricas: ['acciones_completadas', 'minutos_navegadora'], usoFuturo: 'prohibido' },
    texto: 'CARTA DE INTENCIÓN (borrador ficticio). 1. La Remesadora cubrirá una tarifa fija por hogar inscrito durante el periodo del piloto, sin depender de la frecuencia de los envíos. 2. La Remesadora recibirá únicamente un reporte mensual agregado (acciones completadas, minutos de navegadora, barreras por tipo), suprimiendo toda cifra de 1 a 10 personas. 3. Queda prohibido a la Remesadora y a cualquier empresa de su grupo usar información del Programa para mercadotecnia, otorgamiento de crédito o suscripción de seguros; el Programa podrá auditar este compromiso. 4. El remitente recibe solo un recibo de servicio activo; cualquier otra información requiere autorización expresa de la paciente, revocable por llamada. 5. La inscripción se hace por llamada o en ventanilla, con consentimiento expreso y por escrito para datos de salud.',
  },
  {
    id: 'hijo-migrante', nombre: 'Hijo migrante: paga y quiere saber',
    nota: 'La pregunta que mi brief dejó abierta.',
    terminos: { tipoPagador: 'hijo_migrante', basePago: 'tarifa_fija', vende: ['nada'], datosPagador: ['estado_caso', 'resultado'], celdaMinima: '0', dirigeRuta: 'no', pacientePaga: 'no', sinSmartphone: 'si', consentimiento: 'expreso', familia: 'automatica', tareasFamiliar: 'si', compromiso: 'contrato', metricas: ['acciones_completadas'], usoFuturo: 'prohibido' },
    texto: 'SUSCRIPCIÓN FAMILIAR (borrador ficticio). 1. El suscriptor, hijo de la paciente y residente en Houston, paga quince dólares mensuales por el acompañamiento de su madre. 2. El suscriptor recibirá en su aplicación el resultado de los estudios de su madre y el estado de cada cita, para su tranquilidad. 3. Si la madre no confirma una cita, el sistema enviará recordatorios a su hermana, quien quedará registrada como cuidadora responsable. 4. La madre firmó el consentimiento expreso para el tratamiento de sus datos. 5. La información no se usará para fines comerciales.',
  },
]
