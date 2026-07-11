const validarDocumento = (tipo, numero) => {
  if (tipo === 'DNI') return /^\d{8}$/.test(numero)
  if (tipo === 'RUC') return /^\d{11}$/.test(numero)
  return false
}

const validarRUC = (ruc) => /^\d{11}$/.test(ruc)

describe('validarDocumento - DNI', () => {

  test('DNI con 8 dígitos es válido', () => {
    expect(validarDocumento('DNI', '12345678')).toBe(true)
  })

  test('DNI con 7 dígitos es inválido', () => {
    expect(validarDocumento('DNI', '1234567')).toBe(false)
  })

  test('DNI con 9 dígitos es inválido', () => {
    expect(validarDocumento('DNI', '123456789')).toBe(false)
  })

  test('DNI con letras es inválido', () => {
    expect(validarDocumento('DNI', '1234567A')).toBe(false)
  })

  // ── CASO BORDE ──
  test('DNI vacío es inválido', () => {
    expect(validarDocumento('DNI', '')).toBe(false)
  })

})

describe('validarDocumento - RUC', () => {

  test('RUC con 11 dígitos es válido', () => {
    expect(validarDocumento('RUC', '20601234567')).toBe(true)
  })

  test('RUC con 10 dígitos es inválido', () => {
    expect(validarDocumento('RUC', '2060123456')).toBe(false)
  })

  test('RUC con letras es inválido', () => {
    expect(validarDocumento('RUC', '2060123456A')).toBe(false)
  })

  // ── CASO BORDE ──
  test('RUC vacío es inválido', () => {
    expect(validarDocumento('RUC', '')).toBe(false)
  })

})

describe('validarRUC - proveedor', () => {

  test('RUC de 11 dígitos numéricos es válido', () => {
    expect(validarRUC('20601234567')).toBe(true)
  })

  test('RUC de 10 dígitos es inválido', () => {
    expect(validarRUC('2060123456')).toBe(false)
  })

  test('RUC vacío es inválido', () => {
    expect(validarRUC('')).toBe(false)
  })

})