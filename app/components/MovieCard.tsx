import { hasValue, typeLabel } from '@/lib/format'
import type { MovieSummary } from '@/types/omdb'
import Poster from './Poster'

interface MovieCardProps {
  movie: MovieSummary & { imdbRating?: string; Genre?: string }
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-amber-400/10">
      <div className="relative aspect-[2/3] bg-slate-800">
        <Poster src={movie.Poster} title={movie.Title} />

        {hasValue(movie.imdbRating) && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur">
            ★ {movie.imdbRating}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {typeLabel(movie.Type)}
        </span>
      </div>

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] font-bold leading-snug text-white">{movie.Title}</h3>
        <p className="text-sm text-slate-400">{movie.Year}</p>
        {hasValue(movie.Genre) && <p className="line-clamp-1 text-xs text-slate-500">{movie.Genre}</p>}
      </div>
    </article>
  )
}
