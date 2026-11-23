"""Separa la sala del Arcade y sus objetos a partir de Imagenes/Arcade_sala.png.

Uso: python3 scripts/arcade_room.py
Requisitos: pip install opencv-contrib-python-headless pillow numpy

La imagen original trae la sala (paredes + suelo de ajedrez) y debajo los objetos sueltos:
el tocadiscos con su holograma, la máquina recreativa y la mesa de DnD. El holograma y el
techo de la recreativa tapan un trozo del suelo, así que se recortan con polígonos a mano y
el suelo que quedaba debajo se rellena copiando un trozo del propio suelo que encaja.

Salida:
  public/arcade/sala.webp
  public/arcade/<objeto>.webp y <objeto>_hover.webp (silueta blanca, igual que los edificios)
  src/data/arcadeHit.json (tamaño y contorno clicable de cada objeto, y tamaño de la sala)

El original de Imagenes/ no se toca.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

import cv2.xphoto  # noqa: F401  (opencv-contrib-python-headless)
from cutout import connected_to_border, disk, save_rgba, R_FRAC, E_FRAC

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Imagenes" / "Arcade_sala.png"
OUT = ROOT / "public" / "arcade"
DATA = ROOT / "src" / "data" / "arcadeHit.json"

# Todo se exporta al triple del original (la imagen es de 1024 px y la sala se ve grande).
# Los colores salen de la versión nítida (scripts/upscale_arcade.py) si existe; si no, de un reescalado normal.
SCALE = 3
HD = ROOT / "Imagenes" / "procesadas" / "Arcade_sala_x3.webp"

# Polígonos en píxeles del original. Lo que tapa el suelo de la sala.
HOLO = [(69, 366), (192, 307), (195, 308), (196, 372), (208, 380), (208, 400), (69, 460)]  # pantalla holográfica
BADGE = [(199, 319), (228, 312), (232, 315), (232, 343), (201, 351), (198, 349)]  # icono de Spotify
ARC_TOP = [(423, 400), (423, 365), (441, 358), (450, 353), (510, 326), (514, 325), (541, 331), (546, 336), (549, 400)]

# Letrero de la recreativa: las letras del dibujo salían deformadas ("MIS JUEϬOS"), así que se borran
# y el cartel queda liso, rellenado con los colores que lo rodean.
MARQUEE = [(477, 369), (537, 341), (538, 361), (477, 388)]  # interior del cartel, entre sus marcos oscuros

# Fundido del borde delantero del suelo, en píxeles del original: la parte de delante se pierde
# en la oscuridad (y de paso disimula el trozo de suelo reconstruido bajo el holograma).
FADE = 75

# Borde inferior del suelo (x, y): lo que queda por debajo ya no es sala.
FLOOR_EDGE = [(0, 318), (25, 330), (40, 333), (55, 340), (195, 387), (260, 393), (330, 402), (400, 382), (545, 328), (600, 309), (723, 262), (1024, 262)]


def clear_marquee(hd: np.ndarray) -> np.ndarray:
    """Borra las letras del cartel: cada columna se pinta con el color del propio cartel en esa columna
    (la mediana de lo que no es letra), suavizado, con el borde fundido para que no se note el corte."""
    mq = np.zeros(hd.shape[:2], np.uint8)
    cv2.fillPoly(mq, [np.array(MARQUEE, np.int32) * SCALE], 1)
    f = hd.astype(np.float32)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    # el fondo del cartel es azul: todo lo cálido (letras doradas y su contorno marrón) o muy oscuro/claro no cuenta
    letters = (r > b - 10) | (f.mean(axis=2) > 175) | (f.mean(axis=2) < 70)
    ys, xs = np.where(mq > 0)
    x0, x1 = xs.min(), xs.max()
    cols = np.zeros((x1 - x0 + 1, 3), np.float32)
    valid = np.zeros(x1 - x0 + 1, bool)
    for x in range(x0, x1 + 1):
        sel = (mq[:, x] > 0) & ~letters[:, x]
        if sel.sum() >= 3:
            cols[x - x0] = np.median(f[sel, x], axis=0)
            valid[x - x0] = True
    # degradado recto entre los colores de los dos extremos del cartel (el centro estaba lleno de letras)
    n = len(cols)
    ends = np.arange(n)
    left = valid & (ends < n * 0.2)
    right = valid & (ends > n * 0.8)
    c0 = np.median(cols[left], axis=0)
    c1 = np.median(cols[right], axis=0)
    t = (ends / max(n - 1, 1))[:, None]
    cols = c0 * (1 - t) + c1 * t
    fill = f.copy()
    fill[ys, xs] = cols[xs - x0]
    w = cv2.GaussianBlur(mq.astype(np.float32), (0, 0), 0.8 * SCALE)[..., None]
    w = np.clip(w * 1.6, 0, 1)
    return (fill * w + f * (1 - w)).astype(np.uint8)


def poly_mask(shape, pts, grow=2):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    if grow:
        m = cv2.dilate(m, disk(grow))
    return m.astype(bool)


def below_edge(shape):
    h, w = shape
    xs = np.arange(w)
    ex, ey = zip(*FLOOR_EDGE)
    yb = np.interp(xs, ex, ey)
    return np.arange(h)[:, None] >= yb[None, :]


def keep_big(mask, min_area=60):
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    out = np.zeros(mask.shape, bool)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= min_area:
            out |= lab == i
    return out


def fill_holes(rgb, known, hole):
    """Rellena el suelo tapado con inpainting de texturas (FSR, de opencv-contrib).

    Todo lo que no es suelo conocido alrededor del hueco también se marca como desconocido,
    para que no se cuele el blanco del fondo ni el color de los objetos.
    """
    unknown = ~known & cv2.dilate(hole.astype(np.uint8), disk(25)).astype(bool)
    ys, xs = np.where(cv2.dilate(unknown.astype(np.uint8), disk(40)).astype(bool))
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    src = np.ascontiguousarray(rgb[y0:y1, x0:x1].astype(np.uint8))
    mask = np.ascontiguousarray((~unknown[y0:y1, x0:x1]).astype(np.uint8) * 255)  # 255 = conocido
    dst = src.copy()
    cv2.xphoto.inpaint(src, mask, dst, cv2.xphoto.INPAINT_FSR_BEST)
    out = rgb.copy()
    out[y0:y1, x0:x1] = np.where(unknown[y0:y1, x0:x1, None], dst.astype(np.float32), out[y0:y1, x0:x1])
    return out


def fill_holes_shift(rgb, known, hole, search=110):
    """Alternativa: copia el trozo del suelo cuyo entorno encaja mejor (búsqueda por desplazamiento)."""
    out = rgb.copy()
    n, lab = cv2.connectedComponents(hole.astype(np.uint8), connectivity=8)
    h, w = hole.shape
    for i in range(1, n):
        H = lab == i
        ring = cv2.dilate(H.astype(np.uint8), disk(6)).astype(bool) & ~H & known
        ys, xs = np.where(H | ring)
        ry, rx = np.where(ring)
        hy, hx = np.where(H)
        best = None
        for dy in range(-search, 1, 1):
            for dx in range(-search * 2, search * 2 + 1, 1):
                if dy == 0 and dx == 0:
                    continue
                sy, sx = ys + dy, xs + dx
                if sy.min() < 0 or sx.min() < 0 or sy.max() >= h or sx.max() >= w:
                    continue
                if not known[sy, sx].all():
                    continue
                d = rgb[ry + dy, rx + dx] - rgb[ry, rx]
                cost = float((d * d).sum()) / len(ry)
                if best is None or cost < best[0]:
                    best = (cost, dx, dy)
        _, dx, dy = best
        out[hy, hx] = rgb[hy + dy, hx + dx]
        # costura suave: mezcla el anillo con lo copiado
        blend = ring & cv2.dilate(H.astype(np.uint8), disk(2)).astype(bool)
        by, bx = np.where(blend)
        out[by, bx] = (out[by, bx] + rgb[by + dy, bx + dx]) / 2
        print(f"  hueco {i}: copiado desde ({dx}, {dy}), coste {best[0]:.0f}")
    return out


def to_rgba(rgb, alpha):
    return np.dstack([rgb, alpha * 255])


def upscale(rgb, alpha, origin=None, hd=None):
    """Amplía a SCALE. El contorno (alpha) se amplía con suavidad; el color sale de `hd` si se da."""
    h, w = alpha.shape
    size = (w * SCALE, h * SCALE)
    a = np.clip(cv2.resize(alpha.astype(np.float32), size, interpolation=cv2.INTER_CUBIC), 0, 1)
    if hd is not None and origin is not None:
        x0, y0 = origin[0] * SCALE, origin[1] * SCALE
        col = np.zeros((size[1], size[0], 3), np.float32)
        sy1, sx1 = min(y0 + size[1], hd.shape[0]), min(x0 + size[0], hd.shape[1])
        col[: sy1 - y0, : sx1 - x0] = hd[y0:sy1, x0:sx1]
        # en el borde, el color de la versión nítida aún lleva el blanco del fondo: se rellena
        # con el color del interior más cercano (convolución normalizada) para que no quede halo
        inner = (a > 0.97).astype(np.float32)
        k = (0, 0)
        num = cv2.GaussianBlur(col * inner[..., None], k, 3)
        den = cv2.GaussianBlur(inner, k, 3)[..., None]
        # solo el contorno (unos píxeles junto a lo transparente), no el fundido largo del suelo
        near = cv2.distanceTransform((a > 0.02).astype(np.uint8), cv2.DIST_L2, 3) < 2.5 * SCALE
        edge = ((a <= 0.97) & near)[..., None] & (den > 1e-3)
        col = np.where(edge, num / np.maximum(den, 1e-3), col)
        return col, a
    pre = np.dstack([rgb * alpha[..., None], alpha]).astype(np.float32)
    pre = cv2.resize(pre, size, interpolation=cv2.INTER_CUBIC)
    col = np.where(a[..., None] > 1e-4, pre[..., :3] / np.maximum(pre[..., 3:4], 1e-4), 0)
    return np.clip(col, 0, 255), a


def soft_alpha(mask):
    core = cv2.erode(mask.astype(np.uint8), np.ones((3, 3), np.uint8), iterations=1)
    a = cv2.GaussianBlur(core.astype(np.float32), (0, 0), 0.7)
    return np.maximum(a, core.astype(np.float32) * 0)


def crop(rgb, alpha, pad=14):
    ys, xs = np.where(alpha > 0.02)
    y0, y1 = max(ys.min() - pad, 0), ys.max() + pad + 1
    x0, x1 = max(xs.min() - pad, 0), xs.max() + pad + 1
    h, w = alpha.shape
    # margen transparente aunque el objeto toque el borde
    R = np.zeros((y1 - y0, x1 - x0, 3), np.float32)
    A = np.zeros((y1 - y0, x1 - x0), np.float32)
    sy1, sx1 = min(y1, h), min(x1, w)
    R[: sy1 - y0, : sx1 - x0] = rgb[y0:sy1, x0:sx1]
    A[: sy1 - y0, : sx1 - x0] = alpha[y0:sy1, x0:sx1]
    return R, A, (int(x0), int(y0))


def sprite(rgb, mask, name, hd=None):
    alpha = soft_alpha(mask)
    rgb, alpha, origin = crop(rgb.astype(np.float32), alpha)
    rgb, alpha = upscale(rgb, alpha, origin, hd)
    size = (alpha.shape[1], alpha.shape[0])
    save_rgba(to_rgba(rgb, alpha), str(OUT), name, None)

    # hover: silueta blanca + filo oscuro, como los edificios
    fw = size[0]
    R = max(6, round(max(fw, 380) * R_FRAC))
    E = max(2, round(max(fw, 380) * E_FRAC))
    m = (alpha > 0.5).astype(np.uint8)
    white = cv2.GaussianBlur(cv2.dilate(m, disk(R)).astype(np.float32), (0, 0), 0.8)
    edge = cv2.GaussianBlur(cv2.dilate(m, disk(R + E)).astype(np.float32), (0, 0), 0.8)
    lay = np.zeros((*m.shape, 4), np.float32)
    lay[..., :3] = (60, 55, 75)
    lay[..., 3] = edge * 0.9
    lay[..., :3] = 255 * white[..., None] + lay[..., :3] * (1 - white[..., None])
    lay[..., 3] = white + lay[..., 3] * (1 - white)
    na = alpha[..., None]
    comp_rgb = rgb * na + lay[..., :3] * lay[..., 3:4] * (1 - na)
    comp_a = alpha + lay[..., 3] * (1 - alpha)
    comp_rgb = np.where(comp_a[..., None] > 1e-4, comp_rgb / np.maximum(comp_a[..., None], 1e-4), 0)
    save_rgba(to_rgba(comp_rgb, comp_a), str(OUT), f"{name}_hover", None)

    # contorno clicable
    hit = cv2.morphologyEx(m, cv2.MORPH_CLOSE, disk(4))
    contours, _ = cv2.findContours(hit, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    biggest = max(cv2.contourArea(c) for c in contours)
    polys = []
    for c in sorted(contours, key=cv2.contourArea, reverse=True):
        if cv2.contourArea(c) < biggest * 0.01:
            continue
        ap = cv2.approxPolyDP(c, 2.0, True)[:, 0, :]
        polys.append([[round(float(x) / size[0], 4), round(float(y) / size[1], 4)] for x, y in ap])
    print(f"{name}: {size[0]}x{size[1]}, {len(polys)} polígono(s)")
    return {"width": size[0], "height": size[1], "polygons": polys}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rgb = np.array(Image.open(SRC).convert("RGB")).astype(np.float32)
    shape = rgb.shape[:2]
    mn = rgb.min(axis=2)

    bg = connected_to_border(mn > 238)
    fg = ~bg
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8), connectivity=8)
    comps = sorted(range(1, n), key=lambda i: -st[i, cv2.CC_STAT_AREA])[:3]
    by_x = {i: st[i, cv2.CC_STAT_LEFT] for i in comps}
    room_comp = lab == comps[0]  # sala + tocadiscos + recreativa (se tocan por el suelo)
    others = sorted(comps[1:], key=lambda i: by_x[i])
    table = lab == others[0]  # mesa (x ≈ 645)
    cork = lab == others[1]  # corcho suelto (x ≈ 839)

    below = below_edge(shape)
    xs = np.arange(shape[1])[None, :]
    holo, badge, arctop = poly_mask(shape, HOLO, 1), poly_mask(shape, BADGE), poly_mask(shape, ARC_TOP)

    vinyl = keep_big(room_comp & (((xs < 300) & below) | holo | badge))
    arcade = keep_big(room_comp & (((xs >= 380) & (xs < 640) & below) | arctop))
    room = room_comp & ~vinyl & ~arcade

    # huecos del suelo: lo que tapaban los objetos por encima del borde del suelo
    hole = (vinyl | arcade) & ~below
    hole = cv2.dilate(hole.astype(np.uint8), disk(1)).astype(bool) & ~below
    known = room & ~hole & ~cv2.dilate((vinyl | arcade).astype(np.uint8), disk(3)).astype(bool)
    print("Rellenando el suelo...")
    filled = fill_holes(rgb, known, hole)
    room_mask = (room | hole) & ~below

    a = soft_alpha(room_mask)
    ex, ey = zip(*FLOOR_EDGE)
    dist = np.interp(np.arange(shape[1]), ex, ey)[None, :] - np.arange(shape[0])[:, None]
    t = np.clip(dist / FADE, 0, 1)
    a = a * (t * t * (3 - 2 * t))  # smoothstep
    hd = None
    if HD.exists():
        hd = np.array(Image.open(HD).convert("RGB"))
        hd = clear_marquee(hd)
        hd = hd.astype(np.float32)
        # en la sala, el suelo que tapaban los objetos sale del relleno, ampliado
        filled_up = cv2.resize(filled, (hd.shape[1], hd.shape[0]), interpolation=cv2.INTER_CUBIC)
        hole_up = cv2.resize(cv2.dilate(hole.astype(np.uint8), disk(2)), (hd.shape[1], hd.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
        hd_room = np.where(hole_up[..., None], filled_up, hd)
        print(f"Usando la versión nítida {HD.name}")
    else:
        hd_room = None
        print("Sin versión nítida: reescalado normal (ver scripts/upscale_arcade.py)")
    r, a, origin = crop(filled, a, pad=4)
    r, a = upscale(r, a, origin, hd_room)
    save_rgba(to_rgba(r, a), str(OUT), "sala", None)
    print(f"sala: {a.shape[1]}x{a.shape[0]}")

    hit = {"sala": {"width": int(a.shape[1]), "height": int(a.shape[0])}}
    hit["vinilo"] = sprite(rgb, vinyl, "vinilo", hd)
    hit["recreativa"] = sprite(rgb, arcade, "recreativa", hd)
    hit["mesa"] = sprite(rgb, table, "mesa", hd)
    hit["corcho"] = sprite(rgb, cork, "corcho", hd)

    DATA.write_text(json.dumps(hit, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Escrito {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
