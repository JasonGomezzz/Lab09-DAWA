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

const TYPE_OPTIONS: { value: MovieType | ''; label: string }[] = [
  { value: '', label: 'Todo' },
  { value: 'movie', label: 'Películas' },
  { value: 'series', label: 'Series' },
]

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
      <section className="py-10 md:py-14">
        <p className="mb-4 inline-block -rotate-2 rounded-full bg-cream px-3 py-1 text-sm font-semibold text-wall-deep">
          Esta búsqueda corre en tu navegador (CSR)
        </p>
        <h1 className="font-sign text-4xl leading-tight md:text-6xl">¿Qué quieres ver hoy?</h1>
        <p className="mt-3 text-lg text-cream/80">Escribe y los resultados aparecen solos, sin recargar la página.</p>

        <div className="mt-8 max-w-3xl">
          <label className="sr-only" htmlFor="search-input">Título a buscar</label>
          <input
            id="search-input"
            type="search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Un título, por ejemplo Marvel"
            className="w-full rounded-xl border-4 border-cream bg-wall-deep px-5 py-4 text-xl font-semibold text-cream placeholder:text-cream/40 focus:border-sticker focus:outline-none md:text-2xl"
          />

          <div role="group" aria-label="Tipo" className="mt-4 flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={type === option.value}
                onClick={() => setType(option.value)}
                className="cursor-pointer rounded-full border-2 border-cream/40 px-4 py-2 font-semibold motion-safe:transition-colors hover:border-cream aria-pressed:border-sticker aria-pressed:bg-sticker aria-pressed:text-wall-deep focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!ready && (
        <div>
          <div className="max-w-2xl pb-6">
            <p className="text-lg text-cream/80">
              El estante está vacío. Escribe al menos {MIN_CHARS} letras o prueba con:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className="cursor-pointer rounded-full border-2 border-cream/40 px-4 py-1.5 motion-safe:transition-colors hover:border-sticker hover:text-sticker focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <Shelf />
        </div>
      )}

      {ready && status === 'error' && (
        <div className="max-w-xl rounded-xl border-4 border-sign bg-wall-deep p-6" role="alert">
          <p className="text-lg font-bold">No se pudo completar la búsqueda</p>
          <p className="mt-1 text-cream/80">{message}</p>
        </div>
      )}

      {ready && status === 'done' && movies.length === 0 && (
        <div>
          <p className="max-w-2xl pb-6 text-lg text-cream/80">
            No hay nada con &ldquo;{term}&rdquo; en el estante. Prueba con otro título o cambia el tipo.
          </p>
          <Shelf />
        </div>
      )}

      {searching && movies.length === 0 && (
        <>
          <p className="sr-only" role="status">Buscando...</p>
          <ul className="grid grid-cols-2 gap-x-0 gap-y-12 sm:grid-cols-3 lg:grid-cols-5" aria-busy="true">
            {Array.from({ length: 10 }, (_, index) => (
              <li key={index}>
                <div className="px-3">
                  <div className="aspect-[2/3] rounded-[3px] bg-wall-deep motion-safe:animate-pulse" />
                </div>
                <Shelf />
              </li>
            ))}
          </ul>
        </>
      )}

      {ready && movies.length > 0 && status !== 'error' && (
        <>
          <p className="mb-6 text-sm text-cream/70" aria-live="polite">
            {searching ? 'Buscando...' : `Mostrando ${movies.length} de ${total} resultados`}
          </p>
          <ul
            className={`grid grid-cols-2 gap-x-0 gap-y-12 motion-safe:transition-opacity sm:grid-cols-3 lg:grid-cols-5 ${
              searching ? 'opacity-50' : ''
            }`}
          >
            {movies.map((movie) => (
              <li key={movie.imdbID}>
                <button
                  type="button"
                  onClick={() => setSelectedId(movie.imdbID)}
                  className="block w-full cursor-pointer rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
                >
                  <MovieCard movie={movie} />
                </button>
              </li>
            ))}
          </ul>

          {hasMore && !searching && (
            <div className="mt-14 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="cursor-pointer rounded-full bg-sticker px-8 py-3 font-bold text-wall-deep motion-safe:transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker disabled:cursor-default disabled:opacity-60"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
              {moreError && (
                <p className="mx-auto mt-4 max-w-md rounded-xl border-2 border-sign bg-wall-deep px-4 py-2 text-sm" role="alert">
                  {moreError}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {selectedId && <MovieModal key={selectedId} imdbID={selectedId} onClose={closeModal} />}
    </main>
  )
}

// Barra de madera decorativa; en la grilla la dibuja cada tarjeta, aquí sirve para los estados sin pósters
function Shelf() {
  return (
    <div aria-hidden="true" className="h-3.5 border-t-4 border-wood-light bg-wood shadow-[0_5px_0_0_var(--color-wood-dark)]" />
  )
}
