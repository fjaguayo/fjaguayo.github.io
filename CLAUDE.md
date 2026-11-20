# FJAH City · Instrucciones para Claude Code

Este archivo va en la raíz del repo `fjaguayo/fjaguayo.github.io`. Resume lo decidido en la sesión de planificación y define el trabajo de la **fase 1**. Las especificaciones originales completas están en `Reglas/especificaciones_del_proyecto_fjah_city.md`. Si algo de ese documento contradice este archivo, manda este archivo.

## Qué es el proyecto

FJAH City es el **portfolio web personal** de Francisco Javier Aguayo Hernández (Javier), estudiante de Ingeniería Electrónica Industrial en la Universidad de Málaga. Se presenta como una ciudad ilustrada estilo videojuego, inspirada en la estética de *Walk of Life*. Cada edificio es un botón que lleva a una faceta de su vida.

**No es un videojuego real.** Es una web estática con botones:

- Sin backend, sin base de datos, sin cuentas y sin guardar estado entre visitas (nada de localStorage).
- Sin físicas, personajes que se mueven, puntuaciones ni lógica de juego.
- Pensada primero para **ordenador**. La versión para móvil se hace al final del proyecto, no en esta fase.

## Fases

1. **Fase 1 (ahora): la ciudad.** El mapa montado estéticamente, con los 12 edificios colocados como assets y funcionando como botones con su efecto al pasar el ratón.
2. **Fase 2 (después):** al entrar en cada edificio se abre un frontend con un asset tematizado sobre una etapa o faceta de la vida de Javier. No hay que empezar nada de la fase 2 hasta que Javier dé por cerrada la fase 1.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (con `@tailwindcss/vite`)
- Framer Motion para las animaciones
- Despliegue en GitHub Pages mediante GitHub Actions. Es un repo de usuario, así que `base: '/'` en `vite.config.ts`. En Settings → Pages, la fuente tiene que ser "GitHub Actions"; avisa a Javier para que lo cambie él.

## Estado del repo

- **`main`** solo tiene los assets originales en `Imagenes/` (JPG de 2048×2048 con fondo blanco, y el mapa de 2752×1536) y `Reglas/`. El portfolio antiguo se retiró a propósito, así que ahora mismo la web publicada no muestra nada.
- **`fjah-city`** es un prototipo anterior con un mapa SVG de relleno, bloques de colores en lugar de edificios, pan/zoom, HUD y modales. Se hizo antes de cerrar el plan. Úsalo solo como referencia; la fase 1 parte de `main` en una rama nueva, `fase-1`.
- **Los assets los sube Javier.** No toques ni borres los originales de `Imagenes/`: los procesados se generan a partir de ellos en otra carpeta.

## Inventario de assets

| Archivo original | id | Nombre en la etiqueta |
|---|---|---|
| `Imagenes/mapa_mejorado.jpg` | `mapa_base` | (fondo; sustituye a `Mapa.jpg`) |
| `Imagenes/Universidad.jpg` | `universidad` | UNIVERSIDAD |
| `Imagenes/project.jpg` | `empresa` | LA EMPRESA |
| `Imagenes/Taller.jpg` | `taller` | EL TALLER |
| `Imagenes/RRSS.jpg` | `centro_civico` | CENTRO CÍVICO |
| `Imagenes/Correo.jpg` | `oficina_correos` | CORREOS |
| `Imagenes/Avion.jpg` | `aeropuerto` | AEROPUERTO |
| `Imagenes/Gym.jpg` | `gimnasio` | GIMNASIO |
| `Imagenes/cine.jpg` | `cine` | CINE |
| `Imagenes/arcade.jpg` | `arcade` | ARCADE |
| `Imagenes/Recreativo.jpg` | `parque` | EL PARQUE |
| `Imagenes/Cartel.jpg` | `cartel_bienvenida` | BIENVENIDA |
| `Imagenes/Metro.jpg` | `estacion_metro` | METRO |

`Recreativo.jpg` es el **parque** (árboles, estanque, banco y hormigas), no la sala recreativa. La sala recreativa es `arcade.jpg`.

## Fase 1 paso a paso

### 1. Procesar los assets

Script en `scripts/cutout.py` (ya se ha probado con la Universidad y el Cine, con buen resultado). Para cada edificio:

- Quita el fondo blanco, conservando las zonas blancas interiores que cierra el contorno.
- Convierte la sombra lavanda de la base en una sombra oscura semitransparente.
- Recorta al contenido con margen y escala a 640 px de ancho.
- Genera dos imágenes del **mismo tamaño**: `<id>.png` (normal) y `<id>_hover.png` (con silueta blanca gruesa y un filo oscuro fino, al estilo de una pegatina).

Ampliaciones que faltan:

- Exportar a **WebP** (calidad ~85) además de PNG y usar WebP en la web. El mapa también va en WebP, al tamaño original.
- Exportar el **contorno del edificio** (sin sombra) como polígono simplificado, en coordenadas relativas (0–1) de la imagen. Sale de `cv2.findContours` + `cv2.approxPolyDP` sobre la máscara del edificio. Va todo a `src/data/hitAreas.json`. Sirve para que solo responda al ratón el dibujo y no el rectángulo transparente.
- Salida en `public/assets/` y un comando `npm run assets` (o un README) para regenerar todo.

Javier ya validó el aspecto del ejemplo. Puede pedir más o menos grosor de silueta: el parámetro es `R` en el script.

### 2. Montar la ciudad

- El mapa ocupa la ventana a pantalla completa y mantiene su proporción. Las posiciones de los edificios van en **porcentaje del mapa**, así que se mantienen al cambiar el tamaño de la ventana.
- **Sin pan ni zoom en la fase 1**: en un ordenador el mapa cabe entero. Si hiciera falta, se añade más adelante.
- Toda la configuración en un solo archivo, `src/data/buildings.ts`: id, nombre de la etiqueta, imagen, `x` e `y` (punto de apoyo de la base, en % del mapa) y `width` (en % del ancho del mapa).
- El orden de dibujo va por la `y` de la base: lo que está más abajo en pantalla queda delante.
- Escala coherente entre edificios. El aeropuerto es el más grande; el metro y el cartel, los más pequeños.
- **Cartel de bienvenida** ("Welcome to FJAH") en la zona de abajo a la derecha.
- **No hay cartel en el centro superior**: se descarta el cartel dinámico de las especificaciones. El nombre sale bajo cada edificio.

### 3. Decidir las parcelas con Javier (hecho)

El fondo es ahora `Imagenes/mapa_mejorado.jpg`: mismas carreteras que el mapa original, pero con las manzanas limpias de césped, sin parcelas de tierra ni parque dibujado.

Javier colocó los edificios con el editor publicado como Artifact (mover, escalar, girar y espejar) y aprobó el resultado el 20/11/2026. Las posiciones están en `src/data/buildings.ts`, que admite `rotate` y `flip` por edificio. Los edificios se espejan para que la fachada mire a la carretera.

El modo de colocación para desarrollo sigue disponible con `npm run dev` y `?edit`, y nunca llega a producción.

### 4. Edificios como botones

- Cada edificio es un `<button>` accesible (`aria-label` con su nombre, navegable con el teclado). La zona clicable es el polígono de `hitAreas.json`.
- **Hover y foco de teclado**, según la captura de referencia que mandó Javier (estilo "JOB OFFICE" de *Walk of Life*):
  - Crece un ~8 % y sube unos 6 px con un muelle suave de Framer Motion, anclado en la base.
  - Cambia a la imagen `_hover` (silueta blanca). Las dos imágenes se superponen y solo se cambia la opacidad, para que no parpadee.
  - Aparece **debajo del edificio una etiqueta** con el nombre en mayúsculas: fondo blanco, borde de 4 px en `#1b1b2f`, esquinas redondeadas (~12 px), sombra dura de 4 px y tipografía **Luckiest Guy** (Google Fonts). Entra con una animación corta.
  - `cursor: pointer`.
- **Clic:** de momento llama a una función `enterBuilding(id)` que no abre nada (o muestra un aviso discreto de "Próximamente"). Los interiores son de la fase 2.

### 5. Publicar

- Workflow de GitHub Actions que compile y publique en Pages al hacer push a `main`.
- No se mezcla en `main` hasta que Javier dé el visto bueno a la ciudad.

## Fuera de la fase 1

Interiores y modales (fase 2), HUD (ficha de personaje, botón de CV, plano de metro), pan y zoom, versión para móvil, formulario de contacto y minijuegos.

## La fase 1 está terminada cuando

- Los 12 edificios están recortados, sin halo blanco, en WebP con su versión `_hover`.
- El mapa se ve a pantalla completa en un ordenador (de 1366×768 a 2560×1440) y los edificios no se mueven de su parcela al cambiar el tamaño de la ventana.
- Cada edificio responde solo sobre su dibujo, con su efecto de hover y su etiqueta, también con el teclado.
- La carga inicial pesa menos de ~3 MB en total.
- Javier ha aprobado la colocación de los edificios. (Hecho.)
- La web está publicada en fjaguayo.github.io.

## Cómo trabajar con Javier

- Habla en español, en tono cercano, sin emojis y sin frases de relleno.
- Cuando le enseñes código, dale el archivo completo, no solo el fragmento cambiado.
- Avanza paso a paso. Al terminar cada punto, enséñale una captura y espera su opinión antes de seguir con lo siguiente si hay una decisión estética de por medio.
- Trabaja en ramas. No hagas push a `main` sin preguntar.
- Paleta de apoyo para la interfaz: tinta `#1b1b2f`, crema `#fff6e3`, amarillo `#ffd23f`, rojo `#ee4266`, menta `#3bceac`, azul `#4d9de0`. Bordes gruesos y sombras duras, a juego con el contorno negro de los assets.

## Anexo: `scripts/cutout.py`

El script vive en `scripts/cutout.py` y lo lanza `scripts/build_assets.py` (`npm run assets`). Ya incluye las ampliaciones del paso 1: WebP, contorno clicable y punto de apoyo. El grosor de la silueta es `R_FRAC` (antes `R`).
