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
      className="fixed inset-0 z-50 flex items-end justify-center bg-wall-deep/85 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={movie?.Title ?? 'Detalle de la película o serie'}
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-cream text-wall-deep shadow-[0_10px_0_0_rgb(0_0_0/0.35)] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-wall-deep text-lg text-cream transition-colors hover:bg-sign"
        >
          ✕
        </button>

        {error ? (
          <div className="space-y-4 p-10 text-center">
            <p className="font-sign text-2xl">No se pudo cargar el detalle</p>
            <p className="text-wall-deep/70">{error}</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-full bg-wall-deep px-6 py-2.5 font-bold text-cream transition-colors hover:bg-sign"
            >
              Reintentar
            </button>
          </div>
        ) : !movie ? (
          <div className="grid animate-pulse gap-8 p-6 md:grid-cols-[260px_1fr] md:p-10" aria-busy="true">
            <div className="mx-auto aspect-[2/3] w-48 rounded-[3px] bg-wall-deep/10 md:mx-0 md:w-full" />
            <div className="space-y-4">
              <div className="h-10 w-2/3 rounded bg-wall-deep/10" />
              <div className="h-6 w-1/3 rounded bg-wall-deep/10" />
              <div className="h-24 rounded bg-wall-deep/10" />
              <div className="h-32 rounded bg-wall-deep/10" />
            </div>
          </div>
        ) : (
          <div className="grid gap-8 p-6 md:grid-cols-[260px_1fr] md:p-10">
            <div className="relative mx-auto w-48 md:mx-0 md:w-full md:-rotate-2">
              <div className="aspect-[2/3] overflow-hidden rounded-[3px] bg-wall-deep shadow-[6px_6px_0_0_rgb(0_0_0/0.25)]">
                <Poster src={movie.Poster} title={movie.Title} />
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="pr-12 font-sign text-3xl leading-[1.05] md:text-5xl">{movie.Title}</h2>

              <ul className="flex flex-wrap gap-2">
                {meta.map((item) => (
                  <li key={item} className="rounded-md border-2 border-wall-deep/30 px-2.5 py-0.5 text-sm font-semibold">
                    {item}
                  </li>
                ))}
                {hasValue(movie.Genre) &&
                  movie.Genre.split(', ').map((genre) => (
                    <li key={genre} className="rounded-md bg-wall-deep px-2.5 py-0.5 text-sm font-semibold text-cream">
                      {genre}
                    </li>
                  ))}
              </ul>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                {hasValue(movie.imdbRating) && (
                  <div className="flex items-center gap-3">
                    <span className="flex h-[4.5rem] w-[4.5rem] -rotate-6 items-center justify-center rounded-full bg-sticker font-sign text-xl shadow-[0_3px_0_0_rgb(0_0_0/0.25)]">
                      {movie.imdbRating}
                    </span>
                    <div className="text-sm">
                      <p className="font-bold">IMDb</p>
                      {hasValue(movie.imdbVotes) && <p className="text-wall-deep/70">{movie.imdbVotes} votos</p>}
                    </div>
                  </div>
                )}
                {otherRatings.map((rating) => (
                  <div key={rating.Source} className="flex items-center gap-3">
                    <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-4 border-wall-deep font-sign text-sm">
                      {rating.Value}
                    </span>
                    <p className="text-sm font-bold">{rating.Source}</p>
                  </div>
                ))}
              </div>

              {hasValue(movie.Plot) && <p className="max-w-prose text-lg leading-relaxed">{movie.Plot}</p>}

              <dl className="divide-y divide-wall-deep/15">
                {details.map(([label, value]) => (
                  <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[7rem_1fr] sm:gap-4">
                    <dt className="font-bold">{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={`https://www.imdb.com/title/${movie.imdbID}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-wall-deep px-6 py-3 font-bold text-cream transition-colors hover:bg-sign"
              >
                Ver en IMDb
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
