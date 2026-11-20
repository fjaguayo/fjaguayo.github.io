"""Quita el fondo blanco de los assets de FJAH City, recorta y genera la versión con silueta blanca.

Uso suelto: python3 cutout.py <entrada.jpg> <salida_dir> <nombre> [ancho_final]
Lo normal es no llamarlo a mano, sino con `npm run assets` (scripts/build_assets.py).

Genera <nombre>.webp (normal) y <nombre>_hover.webp (con silueta), más sus .png si se
pide una carpeta para ellos, todos del
mismo tamaño para que se puedan superponer sin moverse. Devuelve además el contorno del
edificio (sin sombra) como polígonos en coordenadas relativas 0–1, y el punto de apoyo
de la base.
"""
import sys
import cv2
import numpy as np
from PIL import Image

# Grosor de la silueta blanca del hover, en fracción del ancho final.
# Súbelo para una silueta más gruesa, bájalo para una más fina.
R_FRAC = 0.016
# Filo oscuro que rodea a la silueta blanca.
E_FRAC = 0.004
WEBP_QUALITY = 85


def connected_to_border(mask: np.ndarray) -> np.ndarray:
    n, lab = cv2.connectedComponents(mask.astype(np.uint8), connectivity=4)
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    border = border[border != 0]
    return np.isin(lab, border)


def disk(r):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))


def save_rgba(arr: np.ndarray, out_dir: str, name: str, png_dir: str | None):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA")
    img.save(f"{out_dir}/{name}.webp", quality=WEBP_QUALITY, method=6, alpha_quality=90)
    if png_dir:
        img.save(f"{png_dir}/{name}.png", optimize=True)


def trapped_background(rgb: np.ndarray, bg: np.ndarray, white_holes: bool, seeds) -> np.ndarray:
    """Fondo blanco encerrado dentro del dibujo (p. ej. el hueco entre el brazo robótico y el edificio).

    El relleno de huecos lo trataría como pared blanca, así que se marca aparte:
    - white_holes: todos los huecos de blanco puro (media de cada canal >= 250). Solo para assets
      sin zonas blancas puras dibujadas, porque el fuselaje de un avión, por ejemplo, también lo es.
    - seeds: puntos (x, y) en píxeles del original; el hueco blanco que contiene cada uno es fondo.
    """
    mn = rgb.min(axis=2)
    holes = (mn > 228) & ~bg
    n, lab, stats, _ = cv2.connectedComponentsWithStats(holes.astype(np.uint8), connectivity=4)
    out = np.zeros(bg.shape, bool)
    if white_holes:
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] >= 300 and rgb[lab == i].mean(axis=0).min() >= 250:
                out |= lab == i
    for x, y in seeds:
        if lab[y, x]:
            out |= lab == lab[y, x]
    # incluir el borde antialiasado claro que rodea al hueco, para que no quede halo
    lum = rgb.mean(axis=2)
    ring = cv2.dilate(out.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(bool)
    return out | (ring & (lum > 200))


def process(
    src: str,
    out_dir: str,
    name: str,
    final_w: int = 640,
    png_dir: str | None = None,
    white_holes: bool = False,
    seeds=(),
) -> dict:
    rgb = np.array(Image.open(src).convert("RGB")).astype(np.int16)
    h, w, _ = rgb.shape
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    lum = rgb.mean(axis=2)

    # 1) fondo: casi blanco y conectado al borde de la imagen
    bg = connected_to_border(mn > 228)
    # 1b) fondo atrapado dentro del dibujo
    trapped = trapped_background(rgb, bg, white_holes, seeds)

    # 2) sombra suave lavanda alrededor de la base: clara, poco saturada, pegada al fondo
    light = (lum > 150) & ((mx - mn) < 60) & ~bg
    shadow = connected_to_border(light | bg) & ~bg
    # la sombra solo puede ser zona clara que toca el fondo, no paredes blancas interiores
    shadow &= cv2.dilate(bg.astype(np.uint8), np.ones((3, 3)), iterations=60).astype(bool)

    building = ~(bg | shadow)
    # limpiar motas sueltas y quedarnos con la pieza principal
    building = cv2.morphologyEx(building.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(building, connectivity=8)
    keep = np.zeros_like(building, dtype=bool)
    if n > 1:
        big = stats[1:, cv2.CC_STAT_AREA].max()
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] > big * 0.01:
                keep |= lab == i
    building = keep
    # rellenar huecos interiores (ventanas blancas cerradas por contorno)
    filled = building.astype(np.uint8).copy()
    ff = np.zeros((h + 2, w + 2), np.uint8)
    inv = (1 - filled).astype(np.uint8)
    cv2.floodFill(inv, ff, (0, 0), 0)
    building = (filled | inv).astype(bool) & ~trapped

    # alpha del edificio con borde suavizado (quita el halo blanco del JPG)
    core = cv2.erode(building.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1)
    a_build = cv2.GaussianBlur(core.astype(np.float32), (0, 0), 0.9)

    # sombra: tinte oscuro semitransparente según lo oscura que era
    sh_alpha = np.clip((250 - lum) / 90.0, 0, 1) * 0.55 * shadow
    sh_alpha = cv2.GaussianBlur(sh_alpha.astype(np.float32), (0, 0), 2)

    out = np.zeros((h, w, 4), np.float32)
    shadow_col = np.array([40, 30, 70], np.float32)
    out[..., :3] = shadow_col
    out[..., 3] = sh_alpha
    # componer edificio encima
    ab = a_build[..., None]
    out[..., :3] = rgb * ab + out[..., :3] * (1 - ab)
    out[..., 3] = a_build + sh_alpha * (1 - a_build)

    # recorte al contenido con margen para la silueta
    ys, xs = np.where(out[..., 3] > 0.02)
    pad = int(w * 0.035)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, h)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, w)
    out = out[y0:y1, x0:x1]
    a_build = a_build[y0:y1, x0:x1]

    # escalar
    scale = final_w / out.shape[1]
    size = (final_w, round(out.shape[0] * scale))
    rgba = np.zeros_like(out)
    rgba[..., :3] = out[..., :3] * out[..., 3:4]  # premultiplicar para escalar sin halos
    rgba[..., 3] = out[..., 3]
    rgba = cv2.resize(rgba, size, interpolation=cv2.INTER_AREA)
    a_build = cv2.resize(a_build, size, interpolation=cv2.INTER_AREA)
    alpha = rgba[..., 3:4]
    color = np.where(alpha > 1e-4, rgba[..., :3] / np.maximum(alpha, 1e-4), 0)
    normal = np.dstack([color, alpha[..., 0]])

    save_rgba(np.dstack([normal[..., :3], normal[..., 3] * 255]), out_dir, name, png_dir)

    # versión hover: silueta blanca gruesa + filo oscuro fino, a partir del edificio (sin sombra)
    R = max(6, round(final_w * R_FRAC))  # grosor de la silueta blanca
    E = max(2, round(final_w * E_FRAC))  # filo oscuro
    mask = (a_build > 0.5).astype(np.uint8)

    white = cv2.GaussianBlur(cv2.dilate(mask, disk(R)).astype(np.float32), (0, 0), 0.8)
    edge = cv2.GaussianBlur(cv2.dilate(mask, disk(R + E)).astype(np.float32), (0, 0), 0.8)

    layer = np.zeros((*mask.shape, 4), np.float32)
    layer[..., :3] = np.array([60, 55, 75], np.float32)
    layer[..., 3] = edge * 0.9
    wcol = np.array([255, 255, 255], np.float32)
    layer[..., :3] = wcol * white[..., None] + layer[..., :3] * (1 - white[..., None])
    layer[..., 3] = white + layer[..., 3] * (1 - white)
    # edificio encima
    na = normal[..., 3:4]
    comp_rgb = normal[..., :3] * na + layer[..., :3] * layer[..., 3:4] * (1 - na)
    comp_a = na[..., 0] + layer[..., 3] * (1 - na[..., 0])
    comp_rgb = np.where(comp_a[..., None] > 1e-4, comp_rgb / np.maximum(comp_a[..., None], 1e-4), 0)
    save_rgba(np.dstack([comp_rgb, comp_a * 255]), out_dir, f"{name}_hover", png_dir)

    # contorno del edificio (sin sombra) para la zona clicable
    hit_mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, disk(3))
    # RETR_CCOMP también devuelve los huecos (fondo atrapado); la web los dibuja con evenodd,
    # así que un hueco dentro del contorno no responde al ratón.
    contours, _ = cv2.findContours(hit_mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    contours = [c for c in contours if cv2.contourArea(c) > 0]
    biggest = max(cv2.contourArea(c) for c in contours)
    polygons = []
    for c in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(c) < biggest * 0.002:
            continue
        approx = cv2.approxPolyDP(c, 2.0, True)[:, 0, :]
        polygons.append([[round(float(x) / size[0], 4), round(float(y) / size[1], 4)] for x, y in approx])

    # punto de apoyo: centro horizontal y punto más bajo del edificio (sin sombra)
    ys, xs = np.where(mask > 0)
    anchor = [round(float(xs.min() + xs.max()) / 2 / size[0], 4), round(float(ys.max()) / size[1], 4)]

    print(f"{name}: {size[0]}x{size[1]}, {len(polygons)} polígono(s), {sum(len(p) for p in polygons)} vértices")
    return {"width": size[0], "height": size[1], "anchor": anchor, "polygons": polygons}


if __name__ == "__main__":
    src, out_dir, name = sys.argv[1], sys.argv[2], sys.argv[3]
    final_w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
    process(src, out_dir, name, final_w, png_dir=out_dir)
