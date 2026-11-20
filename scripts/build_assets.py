"""Regenera todos los assets procesados de FJAH City a partir de los originales de Imagenes/.

Uso: npm run assets   (o: python3 scripts/build_assets.py)
Requisitos: pip install opencv-python-headless pillow numpy

Salida:
  public/assets/<id>.webp, <id>_hover.webp (lo que usa la web)
  assets-png/<id>.png, <id>_hover.png (copia en PNG, fuera de public para no publicarla)
  public/assets/mapa_base.webp (a partir de Imagenes/mapa_mejorado.jpg, tamaño original)
  src/data/hitAreas.json (tamaño, punto de apoyo y contorno de cada edificio)

Los originales de Imagenes/ no se tocan nunca.
"""
import json
from pathlib import Path

from PIL import Image

from cutout import process

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Imagenes"
OUT = ROOT / "public" / "assets"
PNG = ROOT / "assets-png"
DATA = ROOT / "src" / "data" / "hitAreas.json"

BUILDINGS = {
    "universidad": "Universidad.jpg",
    "empresa": "project.jpg",
    "taller": "Taller.jpg",
    "centro_civico": "RRSS.jpg",
    "oficina_correos": "Correo.jpg",
    "aeropuerto": "Avion.jpg",
    "gimnasio": "Gym.jpg",
    "cine": "cine.jpg",
    "arcade": "arcade.jpg",
    "parque": "Recreativo.jpg",
    "cartel_bienvenida": "Cartel.jpg",
    "estacion_metro": "Metro.jpg",
}

# Fondo blanco que queda encerrado dentro del dibujo y debe ser transparente.
# "white_holes": todos los huecos de blanco puro (assets sin blancos puros dibujados).
# "seeds": puntos (x, y) en píxeles del JPG original, uno dentro de cada hueco.
TRAPPED = {
    "empresa": {"white_holes": True},  # entre el brazo robótico y el edificio
    "cine": {"white_holes": True},  # dentro de los cordones de la alfombra roja
    "cartel_bienvenida": {"white_holes": True},  # bajo el cartel, entre los postes
    "estacion_metro": {"white_holes": True},  # entre los barrotes de la barandilla
    "taller": {"seeds": [(1044, 351), (940, 359), (384, 799)]},  # llave/engranaje y tubería
    "centro_civico": {"seeds": [(1444, 672), (1480, 715)]},  # dentro del muelle de la antena
    "aeropuerto": {"seeds": [(463, 1461)]},  # dentro del carro de equipajes
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PNG.mkdir(parents=True, exist_ok=True)
    DATA.parent.mkdir(parents=True, exist_ok=True)

    mapa = Image.open(SRC / "mapa_mejorado.jpg").convert("RGB")
    mapa.save(OUT / "mapa_base.webp", quality=80, method=6)  # 80 para no pasar de ~3 MB de carga inicial
    print(f"mapa_base: {mapa.size[0]}x{mapa.size[1]}")

    hit = {}
    for bid, fname in BUILDINGS.items():
        hit[bid] = process(str(SRC / fname), str(OUT), bid, png_dir=str(PNG), **TRAPPED.get(bid, {}))

    DATA.write_text(json.dumps(hit, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Escrito {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
