# FJAH City

Portfolio de Francisco Javier Aguayo Hernández, presentado como una ciudad ilustrada.
Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion, publicado en GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev
```

Modo de colocación (solo en desarrollo): abre `http://localhost:5173/?edit`.
Arrastra los edificios, cambia su tamaño con la rueda o con +/−, afina con las flechas
y pulsa "Copiar coordenadas" para pegar el resultado en `src/data/buildings.ts`.

## Assets

Los originales están en `Imagenes/` y no se tocan. Para regenerar los procesados:

```bash
pip install opencv-python-headless pillow numpy
npm run assets
```

Genera `public/assets/*.webp` (lo que usa la web), una copia en PNG en `assets-png/` y
`src/data/hitAreas.json` con el contorno clicable de cada edificio. El grosor de la silueta
del hover se cambia con `R_FRAC` en `scripts/cutout.py`.

## Publicación

El workflow `.github/workflows/deploy.yml` compila y publica al hacer push a `main`.
En Settings → Pages, la fuente tiene que ser "GitHub Actions".
