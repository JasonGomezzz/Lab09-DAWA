# Lab09-DAWA — Introducción a Next.js

Laboratorio 09 de Desarrollo de Aplicaciones Web Avanzado. Aplicación Next.js (App Router, TypeScript y Tailwind CSS) que compara el renderizado del lado del cliente (CSR) con el del servidor (SSR).

Repositorio: https://github.com/JasonGomezzz/Lab09-DAWA

## Requisitos

- Node.js superior a 18.18
- npm

## Instalación y ejecución

```bash
npm install
npm run dev
```

La aplicación queda en http://localhost:3000. Otros scripts: `npm run build`, `npm start` y `npm run lint`.

No necesita variables de entorno: PokeAPI y Open-Meteo son APIs públicas sin clave.

## Estructura

```
app/
├── pokemon-csr/page.tsx            # Ejercicio 1.1 — Pokémon con CSR
├── pokemon-ssr/page.tsx            # Ejercicio 1.1 — Pokémon con SSR
└── weather/
    ├── page.tsx                    # Ejercicio 2.1 — dashboard híbrido (SSR)
    └── ClientWeatherWidget.tsx     # Ejercicio 2.1 — widget interactivo (CSR)
```

## Páginas

| Ruta | Renderizado | Qué hace |
| --- | --- | --- |
| `/pokemon-csr` | Cliente (`'use client'` + `useEffect`) | Pide un Pokémon aleatorio a PokeAPI desde el navegador y muestra un indicador de carga mientras llega. |
| `/pokemon-ssr` | Servidor (componente `async`) | Pide el Pokémon en el servidor y envía el HTML ya con los datos. |
| `/weather` | Híbrido | Tarjeta de Lima en el servidor (SSR) y tarjeta "Mundo" en el cliente (CSR) con selector de ciudad, más una tabla comparativa. |

## Cómo probar

1. Ejecutar `npm run dev` y abrir las tres rutas.
2. En DevTools → Network, recargar `/pokemon-csr`: la petición a `pokeapi.co` sale del navegador. En `/pokemon-ssr` no aparece, porque la hace el servidor.
3. Ver el código fuente de `/pokemon-ssr`: el nombre y los tipos del Pokémon ya vienen en el HTML. En `/pokemon-csr` solo viene el texto "Cargando Pokémon...".
4. En `/weather`, cambiar la ciudad del selector: solo el widget CSR se actualiza, sin recargar la página.

En modo desarrollo, React Strict Mode ejecuta dos veces el `useEffect`, por lo que el CSR muestra 2 peticiones iguales; en producción es una.

## Desviaciones respecto al enunciado

- **`cacheComponents` desactivado.** `create-next-app` 16 genera `next.config.ts` con `cacheComponents: true` y `partialPrefetching: true`. Con ese modelo la página SSR del enunciado no compila (`Math.random()` y `axios` fuera de `<Suspense>`). Se quitaron ambos flags para usar el SSR clásico que describe el laboratorio; `partialPrefetching` depende de `cacheComponents`.
- **`export const dynamic = 'force-dynamic'`** en `pokemon-ssr` y `weather`. Sin él, `next build` prerenderiza la página una sola vez (el mismo Pokémon y el mismo clima para todos), porque `axios` no avisa a Next.js de que los datos cambian.
- **`ClientWeatherWidget`:** la respuesta se tipa con `WeatherData` en lugar de `any` (el ESLint del proyecto marca `any` como error) y `cities` se declara fuera del componente para no disparar `react-hooks/exhaustive-deps`.
- **`<img>`:** se mantiene como en el enunciado; ESLint muestra la advertencia `@next/next/no-img-element` (no bloquea el build).
- **Entorno:** el enunciado habla de Windows 10; el laboratorio se desarrolló en macOS.
