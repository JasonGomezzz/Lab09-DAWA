import Link from 'next/link'

const links = [
  { key: 'home', href: '/', label: 'Estantes' },
  { key: 'search', href: '/search', label: 'Buscar' },
] as const

export default function SiteHeader({ active }: { active: (typeof links)[number]['key'] }) {
  return (
    <header className="bg-wall-deep">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="-rotate-2 rounded-lg bg-sign px-4 py-2 font-sign text-xl leading-none text-white shadow-[0_4px_0_0_var(--color-sign-deep)] motion-safe:transition-transform motion-safe:hover:rotate-0"
        >
          Videoclub 09
        </Link>

        <nav className="flex gap-1 font-semibold">
          {links.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              aria-current={link.key === active ? 'page' : undefined}
              className={`border-b-4 px-3 py-1.5 transition-colors ${
                link.key === active
                  ? 'border-sticker text-sticker'
                  : 'border-transparent text-cream/80 hover:text-cream'
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
