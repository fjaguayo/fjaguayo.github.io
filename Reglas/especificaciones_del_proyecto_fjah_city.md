# Especificaciones del Proyecto: Portfolio Web Interactivo "FJAH City"

## 1. Visión General del Proyecto
* **Nombre del proyecto:** FJAH City (antes referido como Medieste; basado en las iniciales `F J A H`).
* **Objetivo:** Transformar un portfolio web tradicional en un **mapa interactivo isométrico estilo videojuego 2D** donde cada edificio o elemento urbano representa una faceta profesional, académica, social o personal del creador.
* **Plazo de desarrollo:** 1 mes (enfoque *vibe-coding* asistido por IA).
* **Filosofía de diseño:** Estética cómic/cartoon isométrica ilustrada a mano con bordes gruesos y colores vibrantes, manteniendo un **tono serio y profesional** (sin caras ni rasgos infantiles en los objetos/edificios).

---

## 2. Arquitectura UI/UX y Mecánicas Principales

### A. El Mapa Principal (Canvas / Contenedor Interactivo)
* **Fondo base:** Una ilustración panorámica costera isométrica (`mapa_base.png`) con carreteras, playa, montañas y parcelas vacías.
* **Capas de Assets:** Sobre las parcelas del mapa base se posicionan de forma absoluta (mediante porcentajes o coordenadas relativas para mantener el *responsive*) los 12 *assets* individuales en formato PNG con fondo transparente.
* **Interactividad en el mapa:**
  * **Pan & Zoom:** Capacidad de arrastrar el mapa y hacer zoom suave (o ajuste automático a pantalla completa en escritorio y scroll táctil en móvil).
  * **Hover (Pasar el ratón):** Al pasar sobre un edificio, este realiza una micro-animación (ligero aumento de escala, brillo o sombra resaltada) y actualiza dinámicamente el cartel superior central del HUD con el nombre de la sección.
  * **Click:** Abre una **Sub-UI modal inmersiva** con estética de videojuego (no una página blanca ni una descarga directa).

### B. Interfaz de Usuario (HUD - Heads-Up Display)
Elementos fijos alrededor de los bordes de la pantalla:
1. **Ficha de Personaje (Esquina Superior Izquierda):**
   * Avatar ilustrado estilo cómic.
   * Nombre / Iniciales (`FJAH`) y Nivel (edad).
   * Contadores rápidos con iconos (ej. `13 Países`, `X Proyectos`).
   * Botón de acceso rápido a descarga de CV en PDF (para reclutadores con prisa).
2. **Cartel Indicador Dinámico (Centro Superior):**
   * Muestra el nombre del edificio o zona sobre la que se encuentra el cursor (ej. *"Universidad - Formación y CV"*). Por defecto muestra *"FJAH City"*.
3. **Acceso Rápido / Mapa de Metro (Esquina Inferior o Lateral):**
   * Botón conectado a la mecánica de la Estación de Metro para navegar directamente a cualquier sección sin buscar en el mapa (especialmente útil en dispositivos móviles).

---

## 3. Inventario de Assets y Diseño de Sub-UIs Interiores

Cada clic en un elemento abre una ventana modal (`Sub-UI`) tematizada con bordes gruesos estilo cómic, tipografía legible de juego (ej. *Fredoka*, *Space Grotesk* o *Comic Neue*) y sombras duras:

### Distrito Profesional y Académico
1. **La Universidad (`universidad.png`)**
   * *Visual en mapa:* Edificio clásico de ladrillo con columnas y un búho graduado con birrete y diploma en el tejado.
   * *Contenido Sub-UI (Despacho / Aula Magna):* Estantería interactiva con títulos y diplomas clicables, pizarra de *skills* con barras de nivel estilo RPG, proyectos universitarios destacados y un archivador con botón para descargar el CV tradicional en PDF.
2. **La Empresa / Startup (`empresa.png`)**
   * *Visual en mapa:* Edificio moderno de cristal con un brazo robótico industrial en la azotea manipulando un dispositivo (sin elementos caricaturescos).
   * *Contenido Sub-UI (Sala de Operaciones / War Room):* Pantalla central con el *pitch* de la empresa actual, problema que resuelve, métricas/estado del proyecto, equipo y enlace directo a la web oficial del negocio.
3. **El Taller (`taller.png`)**
   * *Visual en mapa:* Nave industrial/garaje de ladrillo con una llave inglesa gigante y engranajes en el techo.
   * *Contenido Sub-UI (Mesa de Trabajo):* Planos y cajas de herramientas clicables que representan *side-projects*, experimentos de código, prototipos y enlaces a repositorios de GitHub.

### Zona Social y Contacto
4. **El Centro Cívico (`centro_civico.png`)**
   * *Visual en mapa:* Edificio comunitario con tablón de anuncios en la puerta, megáfono gigante y antena de radio en el tejado.
   * *Contenido Sub-UI (Tablón Comunitario):* Tarjetas estilo *trading card* o notas adhesivas para cada red social (LinkedIn, X/Twitter, Instagram, etc.) con enlaces directos y publicaciones destacadas.
5. **La Oficina de Correos (`oficina_correos.png`)**
   * *Visual en mapa:* Edificio azul y amarillo con un buzón metálico serio y un sobre con alas en el tejado (sin cara).
   * *Contenido Sub-UI (Mostrador Postal):* Formulario de contacto interactivo diseñado como una postal o carta. Permite elegir un sello, escribir el mensaje y al enviar muestra una animación de matasellos de *"Enviado"* (integrado con Formspree, EmailJS o Resend).

### Zona de Estilo de Vida, Viajes y Ocio
6. **El Aeropuerto (`aeropuerto.png`)**
   * *Visual en mapa:* Terminal con torre de control, globo terráqueo con flecha roja y un avión comercial realista en el tejado (sin cara).
   * *Contenido Sub-UI (Control de Vuelos y Pasaporte):* Mapamundi interactivo y pasaporte abierto con los **13 países visitados**. Al clicar cada país se estampa su sello y se despliegan postales con fotografías y anécdotas de viaje.
7. **El Gimnasio (`gimnasio.png`)**
   * *Visual en mapa:* Edificio industrial con un brazo musculoso levantando una pesa gigante en el tejado.
   * *Contenido Sub-UI (Vestuario y Tablón de Récords):* Ficha de estadísticas físicas, rutina semanal dividida por días de entrenamiento, récords personales (PRs) y enlace a la app de seguimiento deportivo.
8. **El Cine (`cine.png`)**
   * *Visual en mapa:* Fachada art déco con alfombra roja, letrero luminoso, bobina de película y cubo de palomitas en el tejado (sin cara).
   * *Contenido Sub-UI (Cartelera y Sala):* Exposición de películas y series favoritas con reseñas cortas o contenido audiovisual propio.
9. **El Salón Recreativo / Arcade (`arcade.png`)**
   * *Visual en mapa:* Edificio con luces de neón, máquina recreativa gigante y mando retro en la azotea.
   * *Contenido Sub-UI (Sala Arcade):* Lista de videojuegos favoritos y 1 o 2 minijuegos jugables integrados en el navegador (ej. *Snake*, *Flappy* personalizado o un trivial sobre el autor).
10. **El Parque (`parque.png`)**
    * *Visual en mapa:* Parcela verde con árboles, estanque, banco de madera y un caminito de hormigas avanzando por el sendero.
    * *Contenido Sub-UI (Cuaderno de Campo / Desconexión):* Espacio relajado con fotografías personales, hobbies al aire libre y filosofía de equilibrio vida-trabajo.

### Elementos de Navegación y UX
11. **El Cartel de Bienvenida (`cartel_bienvenida.png`)**
    * *Visual en mapa:* Valla de madera y metal estilo costero con gaviota y palmeras donde se lee *"WELCOME TO FJAH"*.
    * *Función:* Ubicado en la esquina inferior derecha. Puede mostrar un breve modal de bienvenida la primera vez que entra el usuario y al clicarlo despliega un resumen ejecutivo de *"Quién soy"* en 3 líneas.
12. **La Estación de Metro (`estacion_metro.png`)**
    * *Visual en mapa:* Boca de metro clásica con barandillas de hierro y poste con la letra "M".
    * *Función:* Abre un **plano esquemático de líneas de metro** donde cada parada corresponde a uno de los edificios del mapa. Permite viajar (abrir directamente la Sub-UI) a cualquier sección con un solo clic.

---

## 4. Stack Tecnológico Sugerido
* **Framework:** React (Next.js o Vite) + TypeScript.
* **Estilos:** Tailwind CSS (ideal para bordes gruesos `border-4 border-black`, sombras duras estilo cómic `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` y diseño responsive).
* **Animaciones:** Framer Motion (para transiciones de apertura de las Sub-UIs, efecto de flotación/salto en hover de los edificios y estampado de sellos).
* **Iconografía HUD:** Lucide React o iconos SVG personalizados estilo cómic.
* **Envío de formularios:** EmailJS o Formspree (para la Oficina de Correos sin necesidad de backend complejo).

---

## 5. Instrucciones Iniciales para Claude (Prompt de Arranque)
> *"Actúa como un desarrollador Frontend Senior y diseñador UI/UX especializado en experiencias web interactivas estilo videojuego. Vamos a construir 'FJAH City' siguiendo las especificaciones de este documento. Empecemos creando la estructura base del proyecto en React + Tailwind CSS + Framer Motion: un contenedor de mapa interactivo que cargue `mapa_base.png`, permita posicionar los 12 assets PNG de forma responsiva sobre las parcelas, incluya el HUD fijo (ficha de personaje arriba a la izquierda y cartel dinámico arriba al centro) y un sistema de modales reutilizable con estética cómic para las Sub-UIs interiores."*