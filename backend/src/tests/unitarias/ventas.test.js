const calcularTotalesVenta = (items, porcentajeDesc) => {
  const subtotal       = items.reduce((acc, i) => acc + i.subtotal, 0)
  const descuento      = parseFloat(porcentajeDesc) || 0
  const montoDescuento = parseFloat((subtotal * descuento / 100).toFixed(2))
  const total          = parseFloat((subtotal - montoDescuento).toFixed(2))
  return { subtotal, montoDescuento, total }
}

describe('calcularTotalesVenta - cálculo de montos', () => {

  const items = [
    { subtotal: 56.00 },
    { subtotal: 20.00 }
  ]

  test('El subtotal es la suma de todos los ítems', () => {
    const { subtotal } = calcularTotalesVenta(items, 0)
    expect(subtotal).toBe(76.00)
  })

  test('Sin descuento el total es igual al subtotal', () => {
    const { total } = calcularTotalesVenta(items, 0)
    expect(total).toBe(76.00)
  })

  test('Con 5% de descuento el monto descontado es correcto', () => {
    const { montoDescuento } = calcularTotalesVenta(items, 5)
    expect(montoDescuento).toBe(3.80)
  })

  test('Con 5% de descuento el total final es correcto', () => {
    const { total } = calcularTotalesVenta(items, 5)
    expect(total).toBe(72.20)
  })

  test('Con 100% de descuento el total es 0', () => {
    const { total } = calcularTotalesVenta(items, 100)
    expect(total).toBe(0)
  })

  // ── CASO BORDE ──
  test('Carrito vacío devuelve subtotal y total en 0', () => {
    const { subtotal, total } = calcularTotalesVenta([], 0)
    expect(subtotal).toBe(0)
    expect(total).toBe(0)
  })

})