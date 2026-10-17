import axios from 'axios'
import type { MovieDetail, MovieType, SearchResponse } from '@/types/omdb'

const OMDB_URL = process.env.OMDB_BASE_URL ?? 'https://www.omdbapi.com/'

// Películas y series reconocidas: OMDb no ofrece un endpoint de "populares"
export const POPULAR_IDS = [
  'tt0111161', // The Shawshank Redemption
  'tt0468569', // The Dark Knight
  'tt1375666', // Inception
  'tt0133093', // The Matrix
  'tt0816692', // Interstellar
  'tt4154796', // Avengers: Endgame
  'tt0068646', // The Godfather
  'tt0110912', // Pulp Fiction
  'tt0076759', // Star Wars
  'tt0903747', // Breaking Bad
  'tt4574334', // Stranger Things
  'tt0944947', // Game of Thrones
]

export class OmdbError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'OmdbError'
  }
}

const OMDB_ERRORS: Record<string, [string, number]> = {
  'Movie not found!': ['No se encontraron resultados', 404],
  'Incorrect IMDb ID.': ['No se encontró esa película o serie', 404],
  'Too many results.': ['Demasiados resultados: escribe un título más específico', 422],
  'Invalid API key!': ['La clave OMDB_API_KEY configurada no es válida', 500],
  'No API key provided.': ['Falta la clave OMDB_API_KEY en .env.local', 500],
  'Request limit reached!': ['Se alcanzó el límite diario de peticiones de OMDb', 429],
}

function toOmdbError(message: string | undefined) {
  const [text, status] = (message && OMDB_ERRORS[message]) || ['OMDb respondió con un error', 502]
  return new OmdbError(text, status)
}

async function omdbRequest<T>(params: Record<string, string>): Promise<T> {
  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) throw toOmdbError('No API key provided.')

  try {
    const response = await axios.get(OMDB_URL, {
      params: { apikey: apiKey, ...params },
      timeout: 8000,
    })
    if (response.data.Response === 'False') throw toOmdbError(response.data.Error)
    return response.data as T
  } catch (error) {
    if (error instanceof OmdbError) throw error
    if (axios.isAxiosError(error)) {
      if (!error.response) throw new OmdbError('No se pudo conectar con OMDb', 502)
      throw toOmdbError(error.response.data?.Error)
    }
    throw error
  }
}

export async function getMovieById(imdbID: string) {
  return omdbRequest<MovieDetail>({ i: imdbID, plot: 'full' })
}

export async function searchMovies(query: string, page = 1, type?: MovieType): Promise<SearchResponse> {
  const params: Record<string, string> = { s: query, page: String(page) }
  if (type) params.type = type

  try {
    const data = await omdbRequest<{ Search: SearchResponse['movies']; totalResults: string }>(params)
    return { movies: data.Search, total: Number(data.totalResults) }
  } catch (error) {
    if (error instanceof OmdbError && error.status === 404) return { movies: [], total: 0 }
    throw error
  }
}

// La lista casi no cambia y cada visita a la home cuesta 12 peticiones: se guarda una hora para cuidar el límite diario de OMDb
const POPULAR_TTL_MS = 60 * 60 * 1000
let popularCache: { movies: MovieDetail[]; expiresAt: number } | null = null

export async function getPopularMovies() {
  if (popularCache && popularCache.expiresAt > Date.now()) return popularCache.movies

  const results = await Promise.allSettled(POPULAR_IDS.map((id) => getMovieById(id)))
  const movies = results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))

  if (movies.length === 0) {
    const failure = results.find((result) => result.status === 'rejected')
    throw failure?.status === 'rejected' ? failure.reason : new OmdbError('Sin resultados', 502)
  }
  // una lista incompleta no se guarda, para reintentar en la siguiente visita
  if (movies.length === POPULAR_IDS.length) popularCache = { movies, expiresAt: Date.now() + POPULAR_TTL_MS }
  return movies
}
