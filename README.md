# Lab09-DAWA — Introducción a Next.js

Laboratorio 09 de Desarrollo de Aplicaciones Web Avanzado. Aplicación Next.js (App Router, TypeScript y Tailwind CSS) que compara el renderizado del lado del cliente (CSR) con el del servidor (SSR). Incluye los ejercicios 1.1 (Pokémon) y 2.1 (dashboard del clima) y la actividad integradora: una galería de películas y series con la API de OMDb.

Repositorio: https://github.com/JasonGomezzz/Lab09-DAWA

## Requisitos

- Node.js superior a 18.18
- npm
- Una clave gratuita de OMDb (1000 peticiones por día): https://www.omdbapi.com/apikey.aspx

## Instalación y ejecución

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y pega tu clave en `OMDB_API_KEY`. Luego:

```bash
npm run dev
```

La aplicación queda en http://localhost:3000. Otros scripts: `npm run build`, `npm start` y `npm run lint`.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `OMDB_API_KEY` | Sí, para la galería | Clave de OMDb. Solo la lee el servidor; nunca llega al navegador. |
| `OMDB_BASE_URL` | No | URL base de OMDb (por defecto `https://www.omdbapi.com/`). |

Los ejercicios 1.1 y 2.1 usan PokeAPI y Open-Meteo, que son públicas y no necesitan clave.

## Estructura

```
app/
├── page.tsx                        # Galería: populares (SSR)
├── search/
│   ├── page.tsx                    # Búsqueda (Server Component que lee ?id=)
│   └── SearchGallery.tsx           # Búsqueda en tiempo real y modal (CSR)
├── components/
│   ├── MovieCard.tsx               # Tarjeta de película o serie
│   ├── MovieModal.tsx              # Detalle completo (CSR)
│   ├── Poster.tsx                  # Póster con marcador si el enlace de OMDb ya no existe
│   └── SiteHeader.tsx              # Encabezado y navegación
├── api/omdb/route.ts               # Endpoint que reenvía a OMDb sin exponer la clave
├── pokemon-csr/page.tsx            # Ejercicio 1.1 — Pokémon con CSR
├── pokemon-ssr/page.tsx            # Ejercicio 1.1 — Pokémon con SSR
└── weather/
    ├── page.tsx                    # Ejercicio 2.1 — dashboard híbrido (SSR)
    └── ClientWeatherWidget.tsx     # Ejercicio 2.1 — widget interactivo (CSR)
lib/
├── omdb.ts                         # Cliente de OMDb (solo servidor)
├── api-error.ts                    # Mensaje de error de las peticiones del cliente
└── format.ts                       # Utilidades de formato
types/omdb.ts                       # Tipos de las respuestas de OMDb
```

## Páginas

| Ruta | Renderizado | Qué hace |
| --- | --- | --- |
| `/` | Servidor (componente `async`) | Galería de 12 películas y series populares. Cada tarjeta enlaza a `/search?id=<imdbID>`. |
| `/search` | Cliente (`'use client'` + `useState` y `useEffect`) | Búsqueda en tiempo real con filtro por tipo, "Cargar más" y detalle completo en un modal. |
| `/api/omdb` | Servidor (Route Handler) | `GET ?s=<texto>&type=movie\|series&page=<n>` busca; `GET ?i=<imdbID>` devuelve el detalle completo. |
| `/pokemon-csr` | Cliente | Pokémon aleatorio pedido desde el navegador, con indicador de carga. |
| `/pokemon-ssr` | Servidor | Pokémon aleatorio pedido en el servidor; el HTML ya lo trae. |
| `/weather` | Híbrido | Tarjeta de Lima en el servidor y tarjeta "Mundo" en el cliente con selector de ciudad. |

Respuestas de `/api/omdb`: `200` con datos, `400` por parámetros inválidos, `404` si el id no existe, `422` si OMDb responde "Too many results", `429` si se agotó el límite diario, `502` si OMDb no responde y `500` si falta o es inválida la clave. Una búsqueda sin coincidencias devuelve `200` con `{ "movies": [], "total": 0 }`.

## Decisiones de renderizado

| Parte | Estrategia | Por qué |
| --- | --- | --- |
| Lista de populares (`/`) | SSR | Es contenido igual para todos y lo primero que se ve: llega en el HTML sin esperas ni pantalla de carga, lo leen los buscadores y la clave de OMDb se queda en el servidor. |
| Búsqueda (`/search`) | CSR | Depende de lo que escribe el usuario: necesita `useState` para el texto y `useEffect` para consultar con debounce. Un SSR obligaría a recargar la página en cada búsqueda. |
| Detalle (modal) | CSR | Se abre por interacción y se pide solo cuando se elige una tarjeta, sin cargar el detalle de 12 títulos por adelantado. |
| `/api/omdb` | Servidor | El navegador consulta este endpoint en vez de OMDb, así `OMDB_API_KEY` no viaja en el código del cliente. |

## Cómo probar

1. Ejecutar `npm run dev` y abrir `/`, `/search`, `/pokemon-csr`, `/pokemon-ssr` y `/weather`.
2. En DevTools → Network, recargar `/pokemon-csr`: la petición a `pokeapi.co` sale del navegador. En `/pokemon-ssr` no aparece, porque la hace el servidor.
3. Ver el código fuente de `/` y de `/pokemon-ssr`: los datos ya vienen en el HTML. En `/pokemon-csr` solo viene el texto "Cargando Pokémon...".
4. En `/search`, escribir un título: aparecen peticiones a `/api/omdb?s=...` (una sola cada vez que se deja de escribir) y la página no se recarga. Elegir una tarjeta pide `/api/omdb?i=...` y abre el modal; se cierra con Escape, con la X o haciendo clic fuera.
5. En `/weather`, cambiar la ciudad del selector: solo el widget CSR se actualiza.

En modo desarrollo, React Strict Mode ejecuta dos veces cada `useEffect`, por lo que las peticiones del cliente aparecen duplicadas; en producción es una.

## Desviaciones respecto al enunciado

- **`cacheComponents` desactivado.** `create-next-app` 16 genera `next.config.ts` con `cacheComponents: true` y `partialPrefetching: true`. Con ese modelo la página SSR del enunciado no compila (`Math.random()` y `axios` fuera de `<Suspense>`). Se quitaron ambos flags para usar el SSR clásico que describe el laboratorio; `partialPrefetching` depende de `cacheComponents`.
- **`export const dynamic = 'force-dynamic'`** en `/`, `/pokemon-ssr` y `/weather`. Sin él, `next build` prerenderiza la página una sola vez (los mismos datos para todos), porque `axios` no avisa a Next.js de que cambian.
- **Clave de OMDb propia.** El enunciado trae una clave de ejemplo en las URLs; este proyecto no la usa. Cada quien genera la suya y la guarda en `.env.local`, que git ignora.
- **Proxy `/api/omdb`.** En lugar de llamar a OMDb desde el navegador (lo que expondría la clave con `NEXT_PUBLIC_`), el cliente llama a este endpoint. En Network se ven peticiones a `/api/omdb` y no a `omdbapi.com`.
- **"Populares".** OMDb no tiene un endpoint de populares; se muestran 12 títulos reconocidos (9 películas y 3 series) fijados por su id de IMDb en `lib/omdb.ts`.
- **`ClientWeatherWidget`:** la respuesta se tipa con `WeatherData` en lugar de `any` (el ESLint del proyecto marca `any` como error) y `cities` se declara fuera del componente para no disparar `react-hooks/exhaustive-deps`.
- **`<img>`:** en los ejercicios 1.1 se mantiene como en el enunciado; ESLint muestra la advertencia `@next/next/no-img-element` (no bloquea el build). En la galería los pósters también usan `<img>`, porque vienen de un CDN externo.
- **Entorno:** el enunciado habla de Windows 10; el laboratorio se desarrolló en macOS.
