const calcularEstado = (stockActual, stockMinimo) => {
  if (stockActual <= 0)          return 'SIN_STOCK'
  if (stockActual <= stockMinimo) return 'CRITICO'
  return 'NORMAL'
}

describe('calcularEstado - estado de stock', () => {

  test('Stock 0 devuelve SIN_STOCK', () => {
    expect(calcularEstado(0, 5)).toBe('SIN_STOCK')
  })

  test('Stock igual al mínimo devuelve CRITICO', () => {
    expect(calcularEstado(5, 5)).toBe('CRITICO')
  })

  test('Stock menor al mínimo devuelve CRITICO', () => {
    expect(calcularEstado(3, 5)).toBe('CRITICO')
  })

  test('Stock mayor al mínimo devuelve NORMAL', () => {
    expect(calcularEstado(10, 5)).toBe('NORMAL')
  })

  test('Stock 0 con mínimo 0 devuelve SIN_STOCK', () => {
    expect(calcularEstado(0, 0)).toBe('SIN_STOCK')
  })

  // ── CASO BORDE ──
  test('Stock con valor negativo devuelve SIN_STOCK', () => {
    expect(calcularEstado(-1, 5)).toBe('SIN_STOCK')
  })

})