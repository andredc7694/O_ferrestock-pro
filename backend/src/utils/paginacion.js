// Calcula el offset y devuelve metadata de paginación
export const calcularPaginacion = (page = 1, limit = 10) => {
  const pagina = parseInt(page) || 1
  const porPagina = parseInt(limit) || 10
  const offset = (pagina - 1) * porPagina

  return { pagina, porPagina, offset }
}

export const metadataPaginacion = (total, pagina, porPagina) => {
  return {
    total,
    pagina_actual: pagina,
    total_paginas: Math.ceil(total / porPagina),
    por_pagina: porPagina
  }
}