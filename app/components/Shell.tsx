import type { ReactNode } from 'react'
import Link from 'next/link'
import { Bowlby_One, Figtree } from 'next/font/google'
import SiteHeader from './SiteHeader'

const bowlby = Bowlby_One({ variable: '--font-bowlby', subsets: ['latin'], weight: '400' })
const figtree = Figtree({ variable: '--font-figtree', subsets: ['latin'] })

const LAB_PAGES = [
  { href: '/pokemon-csr', label: 'Pokémon CSR' },
  { href: '/pokemon-ssr', label: 'Pokémon SSR' },
  { href: '/weather', label: 'Dashboard del clima' },
]

// Marco común de la galería; las fuentes se cargan aquí para no afectar a los ejercicios 1.1 y 2.1
export default function Shell({ active, children }: { active: 'home' | 'search'; children: ReactNode }) {
  return (
    <div className={`${bowlby.variable} ${figtree.variable} flex min-h-screen flex-col bg-wall font-shop text-cream`}>
      <SiteHeader active={active} />
      <div className="flex-1">{children}</div>
      <footer className="bg-wall-deep px-6 py-6 text-center text-sm text-cream/70">
        Ejercicios del laboratorio:{' '}
        {LAB_PAGES.map((page, index) => (
          <span key={page.href}>
            {index > 0 && ', '}
            <Link href={page.href} className="underline underline-offset-4 hover:text-sticker">
              {page.label}
            </Link>
          </span>
        ))}
      </footer>
    </div>
  )
}
