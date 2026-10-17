'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModal'
import { getErrorMessage } from '@/lib/api-error'
import type { MovieSummary, MovieType, SearchResponse } from '@/types/omdb'

const MIN_CHARS = 2
const DEBOUNCE_MS = 400
const SUGGESTIONS = ['Marvel', 'Batman', 'Star Wars', 'Suits']

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function SearchGallery({ initialId }: { initialId?: string }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<MovieType | ''>('')
  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? null)
  const activeSearch = useRef('')

  const term = query.trim()
  const ready = term.length >= MIN_CHARS

  useEffect(() => {
    if (term.length < MIN_CHARS) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setStatus('loading')
      try {
        const { data } = await axios.get<SearchResponse>('/api/omdb', {
          params: { s: term, type: type || undefined, page: 1 },
          signal: controller.signal,
        })
        activeSearch.current = `${term}|${type}`
        setMovies(data.movies)
        setTotal(data.total)
        setPage(1)
        setMoreError('')
        setStatus('done')
      } catch (err) {
        if (axios.isCancel(err)) return
        setMessage(getErrorMessage(err))
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term, type])

  const loadMore = async () => {
    const key = activeSearch.current
    setLoadingMore(true)
    setMoreError('')
    try {
      const { data } = await axios.get<SearchResponse>('/api/omdb', {
        params: { s: term, type: type || undefined, page: page + 1 },
      })
      if (key !== activeSearch.current) return
      setMovies((current) => [
        ...current,
        ...data.movies.filter((movie) => !current.some((item) => item.imdbID === movie.imdbID)),
      ])
      setPage((current) => current + 1)
    } catch (err) {
      setMoreError(getErrorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  const closeModal = useCallback(() => setSelectedId(null), [])

  const searching = ready && (status === 'idle' || status === 'loading')
  const hasMore = movies.length < total

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20">
      <section className="py-12 text-center">
        <span className="inline-block rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-xs font-semibold text-emerald-300">
          🔄 Búsqueda en el cliente (CSR)
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl">Busca películas y series</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Los resultados aparecen mientras escribes, sin recargar la página. Haz clic en una tarjeta para ver su detalle.
        </p>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="search-input">Título a buscar</label>
          <input
            id="search-input"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Escribe un título... (ej. Marvel)"
            className="w-full rounded-full border border-white/15 bg-slate-900 px-6 py-3 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <label className="sr-only" htmlFor="type-select">Tipo</label>
          <select
            id="type-select"
            value={type}
            onChange={(event) => setType(event.target.value as MovieType | '')}
            className="rounded-full border border-white/15 bg-slate-900 px-5 py-3 font-semibold text-slate-200 focus:border-amber-400 focus:outline-none"
          >
            <option value="">Todos</option>
            <option value="movie">Películas</option>
            <option value="series">Series</option>
          </select>
        </div>
      </section>

      {!ready && (
        <div className="py-10 text-center">
          <p className="text-5xl" aria-hidden="true">🍿</p>
          <p className="mt-3 text-slate-400">Escribe al menos {MIN_CHARS} letras para empezar. Prueba con:</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setQuery(suggestion)}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-400"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {ready && status === 'error' && (
        <div className="mx-auto max-w-lg rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center" role="alert">
          <p className="font-semibold text-red-200">No se pudo completar la búsqueda</p>
          <p className="mt-1 text-sm text-red-200/80">{message}</p>
        </div>
      )}

      {ready && status === 'done' && movies.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-5xl" aria-hidden="true">🔍</p>
          <p className="mt-3 font-semibold text-white">Sin resultados para &ldquo;{term}&rdquo;</p>
          <p className="text-sm text-slate-400">Prueba con otro título o cambia el filtro de tipo.</p>
        </div>
      )}

      {searching && movies.length === 0 && (
        <ul className="grid animate-pulse grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-busy="true">
          {Array.from({ length: 10 }, (_, index) => (
            <li key={index} className="aspect-[2/3] rounded-2xl bg-slate-900" />
          ))}
        </ul>
      )}

      {ready && movies.length > 0 && status !== 'error' && (
        <>
          <p className="mb-5 text-sm text-slate-400" aria-live="polite">
            {searching ? 'Buscando...' : `Mostrando ${movies.length} de ${total} resultados`}
          </p>
          <ul
            className={`grid grid-cols-2 gap-5 transition-opacity sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
              searching ? 'opacity-50' : ''
            }`}
          >
            {movies.map((movie) => (
              <li key={movie.imdbID}>
                <button
                  type="button"
                  onClick={() => setSelectedId(movie.imdbID)}
                  className="block w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                >
                  <MovieCard movie={movie} />
                </button>
              </li>
            ))}
          </ul>

          {hasMore && !searching && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full bg-amber-400 px-8 py-3 font-bold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
              {moreError && <p className="mt-3 text-sm text-red-300">{moreError}</p>}
            </div>
          )}
        </>
      )}

      {selectedId && <MovieModal key={selectedId} imdbID={selectedId} onClose={closeModal} />}
    </main>
  )
}
