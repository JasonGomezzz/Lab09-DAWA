import Link from 'next/link'
import MovieCard from './components/MovieCard'
import SiteHeader from './components/SiteHeader'
import { OmdbError, getPopularMovies } from '@/lib/omdb'
import type { MovieDetail } from '@/types/omdb'

// La lista debe pedirse a OMDb en cada visita; sin esto `next build` la congelaría
export const dynamic = 'force-dynamic'

const LAB_PAGES = [
  { href: '/pokemon-csr', label: 'Pokémon CSR' },
  { href: '/pokemon-ssr', label: 'Pokémon SSR' },
  { href: '/weather', label: 'Dashboard del clima' },
]

export default async function Home() {
  let movies: MovieDetail[] = []
  let error: string | null = null

  try {
    movies = await getPopularMovies()
  } catch (err) {
    error = err instanceof OmdbError ? err.message : 'No se pudo cargar la lista de populares'
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(60rem_28rem_at_50%_-8rem,rgba(99,102,241,0.28),transparent)] text-slate-100">
      <SiteHeader active="home" />

      <main className="mx-auto max-w-7xl px-6 pb-20">
        <section className="py-14 text-center">
          <span className="inline-block rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1 text-xs font-semibold text-amber-300">
            ⚡ Renderizado en el servidor (SSR)
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Películas y series{' '}
            <span className="bg-linear-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">populares</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Esta lista llega ya armada desde el servidor, con sus datos dentro del HTML. Elige una tarjeta para ver
            su detalle o busca cualquier título.
          </p>
          <Link
            href="/search"
            className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 font-bold text-slate-950 transition hover:bg-amber-300"
          >
            Buscar películas y series →
          </Link>
        </section>

        {error ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-red-400/30 bg-red-400/10 p-6 text-center" role="alert">
            <p className="font-semibold text-red-200">No se pudo cargar la galería</p>
            <p className="mt-1 text-sm text-red-200/80">{error}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {movies.map((movie) => (
              <li key={movie.imdbID}>
                <Link
                  href={`/search?id=${movie.imdbID}`}
                  className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                >
                  <MovieCard movie={movie} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        Ejercicios del laboratorio:{' '}
        {LAB_PAGES.map((page, index) => (
          <span key={page.href}>
            {index > 0 && ' · '}
            <Link href={page.href} className="text-slate-400 underline-offset-4 hover:text-amber-400 hover:underline">
              {page.label}
            </Link>
          </span>
        ))}
      </footer>
    </div>
  )
}
