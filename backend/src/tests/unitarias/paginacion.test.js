const calcularPaginacion = (page = 1, limit = 10) => {
  const pagina    = parseInt(page)  || 1
  const porPagina = parseInt(limit) || 10
  const offset    = (pagina - 1) * porPagina
  return { pagina, porPagina, offset }
}

const metadataPaginacion = (total, pagina, porPagina) => ({
  total,
  pagina_actual: pagina,
  total_paginas: Math.ceil(total / porPagina),
  por_pagina:    porPagina
})

describe('calcularPaginacion - offset correcto', () => {

  test('Página 1 tiene offset 0', () => {
    expect(calcularPaginacion(1, 10).offset).toBe(0)
  })

  test('Página 2 tiene offset 10', () => {
    expect(calcularPaginacion(2, 10).offset).toBe(10)
  })

  test('Página 3 tiene offset 20', () => {
    expect(calcularPaginacion(3, 10).offset).toBe(20)
  })

  test('Sin parámetros usa valores por defecto', () => {
    const { pagina, porPagina, offset } = calcularPaginacion()
    expect(pagina).toBe(1)
    expect(porPagina).toBe(10)
    expect(offset).toBe(0)
  })

})

describe('metadataPaginacion - cálculo de páginas', () => {

  test('85 registros con 10 por página = 9 páginas', () => {
    expect(metadataPaginacion(85, 1, 10).total_paginas).toBe(9)
  })

  test('100 registros con 10 por página = 10 páginas', () => {
    expect(metadataPaginacion(100, 1, 10).total_paginas).toBe(10)
  })

  test('0 registros = 0 páginas', () => {
    expect(metadataPaginacion(0, 1, 10).total_paginas).toBe(0)
  })

  // ── CASO BORDE ──
  test('1 solo registro = 1 página', () => {
    expect(metadataPaginacion(1, 1, 10).total_paginas).toBe(1)
  })

})