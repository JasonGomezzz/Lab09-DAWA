import type { Metadata } from 'next'
import Shell from '../components/Shell'
import SearchGallery from './SearchGallery'

export const metadata: Metadata = {
  title: 'Buscar | Videoclub 09',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>
}) {
  // Las tarjetas de la página principal enlazan aquí con ?id= para abrir el detalle
  const { id } = await searchParams

  return (
    <Shell active="search">
      <SearchGallery initialId={typeof id === 'string' ? id : undefined} />
    </Shell>
  )
}
