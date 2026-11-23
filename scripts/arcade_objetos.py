"""Objetos del Arcade (tocadiscos, recreativa y mesa) a partir de renders sobre fondo gris.

Uso: python3 scripts/arcade_objetos.py
Requisitos: pip install "rembg[cpu]" opencv-python-headless pillow numpy
(la primera vez rembg descarga su modelo, unos 180 MB)

Entrada: Imagenes/Arcade_vinilo.png, Arcade_recreativa.png, Arcade_mesa.png
Salida: public/arcade/<objeto>.webp y <objeto>_hover.webp, y su entrada en src/data/arcadeHit.json
(tamaño y contorno clicable). La sala no se toca: sale de scripts/arcade_room.py.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from rembg import new_session, remove

from cutout import disk, save_rgba, R_FRAC, E_FRAC

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "arcade"
DATA = ROOT / "src" / "data" / "arcadeHit.json"
SOURCES = {"vinilo": "Arcade_vinilo.png", "recreativa": "Arcade_recreativa.png", "mesa": "Arcade_mesa.png"}
PAD = 16


def build(rgba: np.ndarray, name: str) -> dict:
    alpha = rgba[..., 3].astype(np.float32) / 255
    # quitar restos sueltos del fondo: solo la pieza grande
    m = (alpha > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, connectivity=8)
    big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    keep = cv2.dilate((lab == big).astype(np.uint8), disk(6)).astype(bool)
    alpha = alpha * keep

    ys, xs = np.where(alpha > 0.02)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD + 1, alpha.shape[0])
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD + 1, alpha.shape[1])
    rgb = rgba[y0:y1, x0:x1, :3].astype(np.float32)
    alpha = alpha[y0:y1, x0:x1]
    h, w = alpha.shape
    save_rgba(np.dstack([rgb, alpha * 255]), str(OUT), name, None)

    # hover: silueta blanca + filo oscuro, como los edificios
    R = max(6, round(max(w, 380) * R_FRAC))
    E = max(2, round(max(w, 380) * E_FRAC))
    mask = (alpha > 0.5).astype(np.uint8)
    white = cv2.GaussianBlur(cv2.dilate(mask, disk(R)).astype(np.float32), (0, 0), 0.8)
    edge = cv2.GaussianBlur(cv2.dilate(mask, disk(R + E)).astype(np.float32), (0, 0), 0.8)
    lay = np.zeros((h, w, 4), np.float32)
    lay[..., :3] = (60, 55, 75)
    lay[..., 3] = edge * 0.9
    lay[..., :3] = 255 * white[..., None] + lay[..., :3] * (1 - white[..., None])
    lay[..., 3] = white + lay[..., 3] * (1 - white)
    na = alpha[..., None]
    comp_rgb = rgb * na + lay[..., :3] * lay[..., 3:4] * (1 - na)
    comp_a = alpha + lay[..., 3] * (1 - alpha)
    comp_rgb = np.where(comp_a[..., None] > 1e-4, comp_rgb / np.maximum(comp_a[..., None], 1e-4), 0)
    save_rgba(np.dstack([comp_rgb, comp_a * 255]), str(OUT), f"{name}_hover", None)

    hit = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, disk(4))
    contours, _ = cv2.findContours(hit, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    biggest = max(cv2.contourArea(c) for c in contours)
    polys = []
    for c in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(c) < biggest * 0.01:
            continue
        ap = cv2.approxPolyDP(c, 2.0, True)[:, 0, :]
        polys.append([[round(float(x) / w, 4), round(float(y) / h, 4)] for x, y in ap])
    print(f"{name}: {w}x{h}, {len(polys)} polígono(s)")
    return {"width": w, "height": h, "polygons": polys}


def main():
    session = new_session("isnet-general-use")
    hit = json.loads(DATA.read_text(encoding="utf-8"))
    for name, fname in SOURCES.items():
        im = Image.open(ROOT / "Imagenes" / fname).convert("RGB")
        rgba = np.array(remove(im, session=session))
        hit[name] = build(rgba, name)
    DATA.write_text(json.dumps(hit, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Escrito {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
