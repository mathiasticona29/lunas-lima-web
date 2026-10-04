"""Sigue los dos cubos de rueda del auto en el tramo elegido del video del hero.

Escribe un JSON con el centro de cada rueda por cuadro (en píxeles del original);
hero-video-render.py lo usa para fijar el encuadre y colocar los difuminados.
Uso: python3 scripts/hero-video-track.py <video> <salida.json> [hoja-debug.jpg]
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

SRC, OUT = sys.argv[1], sys.argv[2]
DEBUG = sys.argv[3] if len(sys.argv) > 3 else None
START, DUR, FPS = 2.0, 4.0, 30
W, H, K = 960, 540, 4  # escala de seguimiento (1/4 del original)
HALF = 44  # media plantilla: cubre la rueda entera
SEARCH = 7
# Centros de rueda en el cuadro de referencia (t = 2.5 s), a escala de seguimiento
REF = 15
SEEDS = {'front': (288, 416), 'rear': (715, 412)}

raw = subprocess.run(
    ['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(DUR), '-i', SRC,
     '-vf', f'fps={FPS},scale={W}:{H}:flags=area,format=gray', '-f', 'rawvideo', '-'],
    check=True, capture_output=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
N = len(frames)


def patch(img, cx, cy):
    return img[cy - HALF:cy + HALF, cx - HALF:cx + HALF]


def ncc(a, b):
    a = a - a.mean()
    b = b - b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6))


def track(seed):
    pos = [None] * N
    pos[REF] = seed
    for order in (range(REF + 1, N), range(REF - 1, -1, -1)):
        tmpl = patch(frames[REF], *seed).copy()
        cx, cy = seed
        for i in order:
            best = (-2.0, cx, cy)
            for dy in range(-SEARCH, SEARCH + 1):
                for dx in range(-SEARCH, SEARCH + 1):
                    score = ncc(tmpl, patch(frames[i], cx + dx, cy + dy))
                    if score > best[0]:
                        best = (score, cx + dx, cy + dy)
            _, cx, cy = best
            pos[i] = (cx, cy)
            # La plantilla se adapta despacio: el auto va girando hacia tres cuartos.
            tmpl = 0.85 * tmpl + 0.15 * patch(frames[i], cx, cy)
    return pos


tracks = {name: track(seed) for name, seed in SEEDS.items()}
json.dump({'start': START, 'fps': FPS, 'frames': N,
           **{name: [[x * K, y * K] for x, y in pos] for name, pos in tracks.items()}},
          open(OUT, 'w'))
print('cuadros', N, {n: (p[0], p[REF], p[-1]) for n, p in tracks.items()})

if DEBUG:
    picks = [0, 15, 40, 65, 90, N - 1]
    sheet = Image.new('RGB', (W * 3, H * 2))
    for n, i in enumerate(picks):
        im = Image.fromarray(frames[i].astype(np.uint8)).convert('RGB')
        d = ImageDraw.Draw(im)
        for pos in tracks.values():
            x, y = pos[i]
            d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 0, 0), width=2)
            d.rectangle([x - HALF, y - HALF, x + HALF, y + HALF], outline=(0, 255, 0))
        sheet.paste(im, ((n % 3) * W, (n // 3) * H))
    sheet.resize((W * 3 // 2, H)).save(DEBUG, quality=85)
