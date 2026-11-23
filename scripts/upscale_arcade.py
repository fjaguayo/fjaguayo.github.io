"""Versión nítida de Imagenes/Arcade_sala.png para que la sala y sus objetos no se vean borrosos.

La imagen original mide 1024 px de ancho y la web la muestra a más del doble. En vez de ampliarla
con un reescalado normal (que suaviza), se amplía x4 con EDSR (una red de superresolución) y se
deja a x3 con un enfoque suave. El dibujo no cambia: solo se recuperan los bordes.

Uso (una vez; el resultado se guarda en el repo y lo usa scripts/arcade_room.py):
  pip install --target /tmp/cv4 "opencv-contrib-python-headless==4.10.0.84"
  curl -L -o /tmp/EDSR_x4.pb https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb
  PYTHONPATH=/tmp/cv4 python3 scripts/upscale_arcade.py /tmp/EDSR_x4.pb
(OpenCV 5 ya no carga modelos de TensorFlow, por eso la versión 4 aparte. Tarda unos 10 minutos.)

Salida: Imagenes/procesadas/Arcade_sala_x3.webp
"""
import sys
from pathlib import Path

import cv2
from cv2 import dnn_superres
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Imagenes" / "Arcade_sala.png"
OUT = ROOT / "Imagenes" / "procesadas" / "Arcade_sala_x3.webp"


def main(model: str):
    img = cv2.imread(str(SRC))
    sr = dnn_superres.DnnSuperResImpl_create()
    sr.readModel(model)
    sr.setModel("edsr", 4)
    up = cv2.cvtColor(sr.upsample(img), cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]
    im = Image.fromarray(up).resize((w * 3, h * 3), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, quality=95, method=6)
    print(f"Escrito {OUT.relative_to(ROOT)}: {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "EDSR_x4.pb")
