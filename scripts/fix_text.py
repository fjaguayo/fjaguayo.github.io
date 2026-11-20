"""Pre-espeja los letreros de los edificios que en el mapa se muestran espejados (flip en buildings.ts).

El mapa espeja el edificio entero con CSS, y con él las letras ("CINE" se leía "ENIC").
Aquí se espeja antes solo el interior del letrero, dentro de su propio plano: se endereza el
cuadrilátero a un rectángulo, se le da la vuelta y se vuelve a colocar. Al espejar el mapa el
edificio, el letrero queda del derecho y sigue pegado a la fachada con su inclinación.

Los cuadriláteros van en píxeles del JPG original (2048×2048): esquina superior izquierda,
superior derecha, inferior derecha e inferior izquierda de la zona del letrero.
"""
import cv2
import numpy as np
from PIL import Image

SIGNS = {
    # fondo crema del letrero luminoso, dentro del marco de bombillas
    "cine": [[(630, 900), (980, 1072), (980, 1238), (634, 1058)]],
    # cara frontal gris del cartel
    "gimnasio": [[(712, 960), (950, 1075), (950, 1200), (710, 1082)]],
}


def mirror_quad(img: np.ndarray, quad) -> np.ndarray:
    q = np.float32(quad)
    w = int(max(np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[3])))
    h = int(max(np.linalg.norm(q[3] - q[0]), np.linalg.norm(q[2] - q[1])))
    rect = np.float32([(0, 0), (w, 0), (w, h), (0, h)])
    to_rect = cv2.getPerspectiveTransform(q, rect)
    flat = cv2.warpPerspective(img, to_rect, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    flat = flat[:, ::-1].copy()
    back = cv2.warpPerspective(
        flat, np.linalg.inv(to_rect), (img.shape[1], img.shape[0]), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_TRANSPARENT
    )
    mask = np.zeros(img.shape[:2], np.uint8)
    cv2.fillConvexPoly(mask, q.astype(np.int32), 255)
    mask = cv2.GaussianBlur(mask, (0, 0), 1.2).astype(np.float32)[..., None] / 255
    return (back * mask + img * (1 - mask)).astype(np.uint8)


def fixed_source(src: str, bid: str, out: str) -> str:
    """Devuelve la ruta de la imagen a procesar: la original o una copia con los letreros pre-espejados."""
    if bid not in SIGNS:
        return src
    img = np.array(Image.open(src).convert("RGB"))
    for quad in SIGNS[bid]:
        img = mirror_quad(img, quad)
    Image.fromarray(img).save(out, quality=97)
    return out
