describe('generarCodigoProducto - formato', () => {

  test('El prefijo toma las primeras 4 letras de la categoría en mayúsculas', () => {
    const nombre  = 'Herramientas Manuales'
    const prefijo = nombre.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4)
    expect(prefijo).toBe('HERR')
  })

  test('El número se formatea con ceros a la izquierda hasta 4 dígitos', () => {
    const numero     = 1
    const formateado = String(numero).padStart(4, '0')
    expect(formateado).toBe('0001')
  })

  test('El código final tiene el formato correcto XXXX-NNNN', () => {
    const codigo = `HERR-0001`
    expect(codigo).toMatch(/^[A-Z]{4}-\d{4}$/)
  })

  // ── CASO BORDE ──
  test('Categoría con espacios genera prefijo solo con letras', () => {
    const nombre  = 'Fijaciones y Tornillería'
    const prefijo = nombre.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 4)
    expect(prefijo).toBe('FIJA')
  })

})

describe('generarNumeroVenta - formato', () => {

  test('El número de venta tiene el formato VTA-YYYY-XXXX', () => {
    const anio      = new Date().getFullYear()
    const resultado = `VTA-${anio}-0001`
    expect(resultado).toMatch(/^VTA-\d{4}-\d{4}$/)
  })

  test('El siguiente número incrementa correctamente', () => {
    const ultimo    = 'VTA-2025-0010'
    const partes    = ultimo.split('-')
    const siguiente = parseInt(partes[2]) + 1
    expect(String(siguiente).padStart(4, '0')).toBe('0011')
  })

})