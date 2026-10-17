import type { NextRequest } from 'next/server'
import { OmdbError, getMovieById, searchMovies } from '@/lib/omdb'
import type { MovieType } from '@/types/omdb'

const IMDB_ID = /^tt\d{7,10}$/
const MOVIE_TYPES: MovieType[] = ['movie', 'series']

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const id = params.get('i')
  const query = params.get('s')?.trim()

  try {
    if (id) {
      if (!IMDB_ID.test(id)) {
        return Response.json({ error: 'El id de IMDb no es válido' }, { status: 400 })
      }
      return Response.json(await getMovieById(id))
    }

    if (query) {
      const page = Number(params.get('page') ?? '1')
      const type = params.get('type') as MovieType | null

      if (!Number.isInteger(page) || page < 1 || page > 100) {
        return Response.json({ error: 'La página debe ser un número entre 1 y 100' }, { status: 400 })
      }
      if (type && !MOVIE_TYPES.includes(type)) {
        return Response.json({ error: 'El tipo debe ser movie o series' }, { status: 400 })
      }
      return Response.json(await searchMovies(query, page, type ?? undefined))
    }

    return Response.json({ error: 'Falta el parámetro s (búsqueda) o i (id de IMDb)' }, { status: 400 })
  } catch (error) {
    if (error instanceof OmdbError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    return Response.json({ error: 'Error inesperado en el servidor' }, { status: 500 })
  }
}
