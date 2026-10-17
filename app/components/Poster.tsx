'use client'

import { useState } from 'react'
import { hasValue } from '@/lib/format'

interface PosterProps {
  src: string
  title: string
}

// OMDb a veces devuelve enlaces de pósters que ya no existen (404): se muestra un marcador en su lugar
export default function Poster({ src, title }: PosterProps) {
  const [failed, setFailed] = useState(false)

  if (!hasValue(src) || failed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
        <span className="text-5xl" aria-hidden="true">🎞️</span>
        <span className="text-xs">Sin póster</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(image) => {
        // si la imagen falló antes de que React hidratara, onError ya no se dispara
        if (image?.complete && image.naturalWidth === 0) setFailed(true)
      }}
      src={src}
      alt={`Póster de ${title}`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  )
}
