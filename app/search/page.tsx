import type { Metadata } from 'next'
import SiteHeader from '../components/SiteHeader'
import SearchGallery from './SearchGallery'

export const metadata: Metadata = {
  title: 'Buscar | CineGalería',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>
}) {
  // Las tarjetas de la página principal enlazan aquí con ?id= para abrir el detalle
  const { id } = await searchParams

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(60rem_28rem_at_50%_-8rem,rgba(16,185,129,0.18),transparent)] text-slate-100">
      <SiteHeader active="search" />
      <SearchGallery initialId={typeof id === 'string' ? id : undefined} />
    </div>
  )
}
