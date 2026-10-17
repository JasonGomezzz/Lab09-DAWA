const TYPE_LABELS: Record<string, string> = {
  movie: 'Película',
  series: 'Serie',
  episode: 'Episodio',
}

// OMDb devuelve el texto "N/A" cuando un dato no existe
export function hasValue(value?: string): value is string {
  return !!value && value !== 'N/A'
}

export function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type
}
