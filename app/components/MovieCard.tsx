import { hasValue } from '@/lib/format'
import type { MovieSummary } from '@/types/omdb'
import Poster from './Poster'

interface MovieCardProps {
  movie: MovieSummary & { imdbRating?: string; Genre?: string }
}

// Un póster parado sobre su tramo de estante; al ponerlos en una grilla sin separación horizontal los tramos forman un solo estante
export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="group">
      <div className="px-3">
        <div className="relative motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-1">
          <div className="aspect-[2/3] overflow-hidden rounded-[3px] bg-wall-deep shadow-[4px_4px_0_0_rgb(0_0_0/0.25)]">
            <Poster src={movie.Poster} title={movie.Title} />
          </div>

          {hasValue(movie.imdbRating) && (
            <span className="absolute -left-3 -top-3 flex h-12 w-12 -rotate-12 items-center justify-center rounded-full bg-sticker font-sign text-sm text-wall-deep shadow-[0_3px_0_0_rgb(0_0_0/0.3)]">
              <span className="sr-only">Nota en IMDb: </span>
              {movie.imdbRating}
            </span>
          )}
          {movie.Type === 'series' && (
            <span className="absolute -right-2 top-5 rotate-6 rounded-sm bg-sign px-2 py-0.5 text-xs font-bold text-white shadow-[0_2px_0_0_var(--color-sign-deep)]">
              Serie
            </span>
          )}
        </div>
      </div>

      <div aria-hidden="true" className="h-3.5 border-t-4 border-wood-light bg-wood shadow-[0_5px_0_0_var(--color-wood-dark)]" />

      <div className="px-3 pt-4">
        <h3 className="line-clamp-2 font-bold leading-snug text-cream">{movie.Title}</h3>
        <p className="mt-0.5 text-sm text-cream/70">{movie.Year}</p>
        {hasValue(movie.Genre) && <p className="line-clamp-1 text-sm text-cream/50">{movie.Genre}</p>}
      </div>
    </article>
  )
}
