export const respuestaExito = (res, data, mensaje = 'Operación exitosa', codigo = 200) => {
  return res.status(codigo).json({ success: true, message: mensaje, data })
}

export const respuestaPaginada = (res, data, paginacion, mensaje = 'Lista obtenida', extra = {}) => {
  return res.status(200).json({
    success: true,
    message: mensaje,
    data,
    pagination: paginacion,
    ...extra
  })
}

export const respuestaError = (res, mensaje, codigo = 400, codigoError = null) => {
  return res.status(codigo).json({
    success: false,
    message: mensaje,
    error:   codigoError
  })
}