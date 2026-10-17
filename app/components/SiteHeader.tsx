import Link from 'next/link'

const links = [
  { key: 'home', href: '/', label: 'Populares' },
  { key: 'search', href: '/search', label: 'Buscar' },
] as const

export default function SiteHeader({ active }: { active: (typeof links)[number]['key'] }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white">
          <span aria-hidden="true">🎬</span>
          <span>
            Cine<span className="text-amber-400">Galería</span>
          </span>
        </Link>

        <nav className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={link.key === active ? 'page' : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                link.key === active
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
