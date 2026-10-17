import axios from 'axios'

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) return error.response?.data?.error ?? 'No se pudo conectar con el servidor'
  return 'Ocurrió un error inesperado'
}
