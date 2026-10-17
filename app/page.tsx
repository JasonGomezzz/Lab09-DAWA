import Link from 'next/link'
import MovieCard from './components/MovieCard'
import Poster from './components/Poster'
import Shell from './components/Shell'
import { OmdbError, getPopularMovies } from '@/lib/omdb'
import type { MovieDetail } from '@/types/omdb'

// La lista debe pedirse a OMDb en cada visita; sin esto `next build` la congelaría
export const dynamic = 'force-dynamic'

const rating = (movie: MovieDetail) => Number(movie.imdbRating) || 0

function Shelf({ title, movies }: { title: string; movies: MovieDetail[] }) {
  if (movies.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <h2 className="inline-block -rotate-1 rounded-lg bg-sticker px-4 py-2 font-sign text-2xl leading-none text-wall-deep shadow-[0_4px_0_0_rgb(0_0_0/0.25)]">
        {title}
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-x-0 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
        {movies.map((movie) => (
          <li key={movie.imdbID}>
            <Link
              href={`/search?id=${movie.imdbID}`}
              className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
            >
              <MovieCard movie={movie} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function Home() {
  let movies: MovieDetail[] = []
  let error: string | null = null

  try {
    movies = await getPopularMovies()
  } catch (err) {
    error = err instanceof OmdbError ? err.message : 'No se pudo cargar la lista de populares'
  }

  const sorted = [...movies].sort((a, b) => rating(b) - rating(a))
  const fan = sorted.slice(0, 3)
  const fanPosition = ['left-0 -rotate-6 w-32 sm:w-36', 'left-1/2 z-10 w-40 -translate-x-1/2 sm:w-48', 'right-0 rotate-6 w-32 sm:w-36']

  return (
    <Shell active="home">
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
          <div>
            <p className="inline-block -rotate-2 rounded-full bg-cream px-3 py-1 text-sm font-semibold text-wall-deep">
              Esta página la armó el servidor (SSR)
            </p>
            <h1 className="mt-5 text-balance font-sign text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Elige algo para ver esta noche
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cream/80">
              Doce películas y series ordenadas por su nota en IMDb. Los datos llegan dentro del HTML, sin pantalla de carga.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="rounded-full bg-sticker px-7 py-3 font-bold text-wall-deep transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
              >
                Buscar un título
              </Link>
              <a
                href="#estantes"
                className="rounded-full border-2 border-cream/40 px-7 py-3 font-bold transition-colors hover:border-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sticker"
              >
                Ver los estantes
              </a>
            </div>
          </div>

          {fan.length === 3 && (
            <div aria-hidden="true" className="relative mx-auto h-[19rem] w-full max-w-md sm:h-[23rem]">
              {fan.map((movie, index) => (
                <div key={movie.imdbID} className={`absolute bottom-3.5 origin-bottom ${fanPosition[index]}`}>
                  <div className="aspect-[2/3] overflow-hidden rounded-[3px] bg-wall-deep shadow-[4px_4px_0_0_rgb(0_0_0/0.25)]">
                    <Poster src={movie.Poster} title={movie.Title} />
                  </div>
                </div>
              ))}
              <div className="absolute inset-x-[-1rem] bottom-0 h-3.5 border-t-4 border-wood-light bg-wood shadow-[0_5px_0_0_var(--color-wood-dark)]" />
            </div>
          )}
        </section>

        <div id="estantes" className="scroll-mt-4 pt-6">
          {error ? (
            <div className="mx-auto max-w-lg px-6 pb-16">
              <div className="rounded-xl border-4 border-sign bg-wall-deep p-6 text-center" role="alert">
                <p className="font-sign text-xl">No se pudo cargar la galería</p>
                <p className="mt-2 text-cream/80">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <Shelf title="Las mejor valoradas" movies={sorted.slice(0, 6)} />
              <Shelf title="Más para elegir" movies={sorted.slice(6)} />
            </>
          )}
        </div>
      </main>
    </Shell>
  )
}
