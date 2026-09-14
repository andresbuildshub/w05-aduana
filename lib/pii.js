// Guardia de datos personales: nada con cara de dato real llega al modelo (Condición 6 + piso de seguridad).
const PATRONES = [
  ['CURP', /\b[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX][A-Z]{2}[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d\b/i],
  ['RFC', /\b[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}\b/i],
  ['NSS', /(?<!\d)\d{11}(?!\d)/],
  ['teléfono', /(?<![\d$])(?:\+?52[\s-]?)?(?:\d[\s-]?){9}\d(?!\d)/],
  ['correo', /[\w.+-]+@[\w-]+\.[\w.-]+/],
]

export function detectarPII(texto) {
  return PATRONES.filter(([, re]) => re.test(texto)).map(([nombre]) => nombre)
}
