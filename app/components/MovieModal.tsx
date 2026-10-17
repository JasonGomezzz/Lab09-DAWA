'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { getErrorMessage } from '@/lib/api-error'
import { hasValue, typeLabel } from '@/lib/format'
import type { MovieDetail } from '@/types/omdb'
import Poster from './Poster'

interface MovieModalProps {
  imdbID: string
  onClose: () => void
}

export default function MovieModal({ imdbID, onClose }: MovieModalProps) {
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const controller = new AbortController()

    const fetchMovie = async () => {
      try {
        const { data } = await axios.get<MovieDetail>('/api/omdb', {
          params: { i: imdbID },
          signal: controller.signal,
        })
        setMovie(data)
      } catch (err) {
        if (!axios.isCancel(err)) setError(getErrorMessage(err))
      }
    }
    fetchMovie()

    return () => controller.abort()
  }, [imdbID, attempt])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const retry = () => {
    setError(null)
    setAttempt((current) => current + 1)
  }

  const meta = movie
    ? [
        typeLabel(movie.Type),
        movie.Year,
        movie.Rated,
        movie.Runtime,
        movie.totalSeasons ? `${movie.totalSeasons} temporadas` : undefined,
      ].filter(hasValue)
    : []

  const details = movie
    ? [
        ['Director', movie.Director],
        ['Guion', movie.Writer],
        ['Reparto', movie.Actors],
        ['Estreno', movie.Released],
        ['Idioma', movie.Language],
        ['País', movie.Country],
        ['Premios', movie.Awards],
        ['Taquilla', movie.BoxOffice],
      ].filter(([, value]) => hasValue(value))
    : []

  const otherRatings = movie?.Ratings.filter((rating) => rating.Source !== 'Internet Movie Database') ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={movie?.Title ?? 'Detalle de la película o serie'}
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-slate-900 text-slate-100 shadow-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-lg text-white transition hover:bg-amber-400 hover:text-slate-950"
        >
          ✕
        </button>

        {error ? (
          <div className="space-y-4 p-10 text-center">
            <p className="text-4xl" aria-hidden="true">⚠️</p>
            <p className="font-semibold text-white">No se pudo cargar el detalle</p>
            <p className="text-sm text-slate-400">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              Reintentar
            </button>
          </div>
        ) : !movie ? (
          <div className="grid animate-pulse gap-6 p-6 md:grid-cols-[280px_1fr] md:p-8" aria-busy="true">
            <div className="aspect-[2/3] rounded-2xl bg-slate-800" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded bg-slate-800" />
              <div className="h-4 w-1/3 rounded bg-slate-800" />
              <div className="h-24 rounded bg-slate-800" />
              <div className="h-32 rounded bg-slate-800" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr] md:p-8">
            <div className="mx-auto aspect-[2/3] w-48 overflow-hidden rounded-2xl bg-slate-800 md:mx-0 md:w-full">
              <Poster src={movie.Poster} title={movie.Title} />
            </div>

            <div className="space-y-5">
              <div>
                <h2 className="pr-10 text-3xl font-extrabold leading-tight text-white">{movie.Title}</h2>
                <p className="mt-1 text-sm text-slate-400">{meta.join(' · ')}</p>
              </div>

              {hasValue(movie.Genre) && (
                <div className="flex flex-wrap gap-2">
                  {movie.Genre.split(', ').map((genre) => (
                    <span key={genre} className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {hasValue(movie.imdbRating) && (
                  <div className="rounded-xl bg-amber-400/15 px-4 py-2">
                    <p className="text-xl font-extrabold text-amber-400">★ {movie.imdbRating}<span className="text-sm font-semibold text-amber-400/70">/10</span></p>
                    {hasValue(movie.imdbVotes) && <p className="text-xs text-slate-400">{movie.imdbVotes} votos en IMDb</p>}
                  </div>
                )}
                {otherRatings.map((rating) => (
                  <div key={rating.Source} className="rounded-xl bg-white/5 px-4 py-2">
                    <p className="text-lg font-bold text-white">{rating.Value}</p>
                    <p className="text-xs text-slate-400">{rating.Source}</p>
                  </div>
                ))}
              </div>

              {hasValue(movie.Plot) && <p className="leading-relaxed text-slate-300">{movie.Plot}</p>}

              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label} className={label === 'Reparto' || label === 'Premios' ? 'sm:col-span-2' : undefined}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                    <dd className="text-slate-200">{value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={`https://www.imdb.com/title/${movie.imdbID}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                Ver en IMDb ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
