"""Genera el clip maestro del hero a partir del video original y del seguimiento de ruedas.

- Encuadre fijado al auto (las dos ruedas quedan siempre en el mismo sitio).
- Difumina los emblemas de los tapacubos y el frente (parrilla y placa).
- Funde el final con el inicio para que el bucle no salte.
Escribe un maestro sin pérdida (FFV1); scripts/hero-video-encode.sh saca de ahí los
archivos de public/.
Uso: python3 scripts/hero-video-render.py <video> <track.json> <maestro.mkv> [ANCHOxALTO zoom]
  panel 3:2 (por defecto):   1620x1080 1.75
  hero a sangre 16:9:        1920x1080 2.07
"""
import json
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC, TRACK, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
SW, SH = 3840, 2160
W, H = (int(v) for v in (sys.argv[4] if len(sys.argv) > 4 else '1620x1080').split('x'))
# Ancho del encuadre en distancias entre ejes: cuanto mayor, más pequeño el auto.
ZOOM = float(sys.argv[5]) if len(sys.argv) > 5 else 1.75
FADE = 15  # cuadros de fundido del bucle (0,5 s)

t = json.load(open(TRACK))
N, FPS, START = t['frames'], t['fps'], t['start']
idx = np.arange(N)


def smooth(values, sigma=2.0):
    """Suaviza el seguimiento (va de 4 en 4 px) sin perder el vaivén real de la cámara."""
    r = int(3 * sigma)
    kernel = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    padded = np.pad(np.asarray(values, float), r, mode='edge')
    return np.convolve(padded, kernel / kernel.sum(), mode='valid')


fx, fy = smooth([p[0] for p in t['front']]), smooth([p[1] for p in t['front']])
rx, ry = smooth([p[0] for p in t['rear']]), smooth([p[1] for p in t['rear']])
# Distancia entre ejes, en px del original. Marca el zoom, así que va más suavizada.
wb = np.polyval(np.polyfit(idx, np.hypot(rx - fx, ry - fy), 3), idx)
cw, ch = ZOOM * wb, ZOOM * wb * H / W
cx, hy = (fx + rx) / 2, (fy + ry) / 2

# Altura de la línea de ruedas dentro del encuadre: la que mantiene el recorte dentro
# del original en todos los cuadros.
lo, hi = ((hy + ch - SH) / ch).max(), (hy / ch).min()
if lo > hi:
    sys.exit(f'El encuadre no cabe en vertical (lo {lo:.3f} > hi {hi:.3f}); baja ZOOM.')
V = (lo + hi) / 2
# Posición horizontal del auto en el encuadre: lo más a la derecha que cabe en todos los
# cuadros (en el hero a sangre el texto va a la izquierda); centrado si hay holgura de sobra.
c_lo, c_hi = (1 - (SW - cx) / cw).max(), (cx / cw).min()
if c_lo > c_hi:
    sys.exit(f'El encuadre no cabe en horizontal (c {c_lo:.3f} > {c_hi:.3f}); baja ZOOM.')
C = 0.5 if W / H < 1.6 else c_hi
left, top = cx - C * cw, hy - V * ch
print(f'línea de ruedas a {V:.3f} del alto (margen {lo:.3f}–{hi:.3f}); centro del auto a {C:.3f} '
      f'del ancho (margen {c_lo:.3f}–{c_hi:.3f}); ancho de encuadre {cw.min():.0f}–{cw.max():.0f} px')


def soft_blur(im, cx, cy, rx_, ry_, radius):
    """Difumina una elipse con borde suave."""
    cx, cy, rx_, ry_, radius = (float(v) for v in (cx, cy, rx_, ry_, radius))
    pad = int(max(rx_, ry_) + 3 * radius)
    box = (int(cx) - pad, int(cy) - pad, int(cx) + pad, int(cy) + pad)
    region = im.crop(box)
    mask = Image.new('L', region.size, 0)
    ox, oy = cx - box[0], cy - box[1]
    ImageDraw.Draw(mask).ellipse([ox - rx_, oy - ry_, ox + rx_, oy + ry_], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius / 2))
    im.paste(region.filter(ImageFilter.GaussianBlur(radius)), box[:2], mask)


def process(i, im):
    box = (left[i], top[i], left[i] + cw[i], top[i] + ch[i])
    out = im.resize((W, H), Image.LANCZOS, box=box)
    u = W / cw[i]  # px del maestro por px del original
    unit = wb[i] * u  # distancia entre ejes en el maestro
    for x, y in ((fx[i], fy[i]), (rx[i], ry[i])):
        # Tapacubos: el emblema va en el centro de la rueda.
        soft_blur(out, (x - left[i]) * u, (y - top[i]) * u, 0.034 * unit, 0.034 * unit, 0.012 * unit)
    # Frente: parrilla y placa, que asoman de canto. El borde delantero se aleja de la
    # rueda a medida que el auto gira hacia tres cuartos (0,26 → 0,34 distancias entre ejes).
    nose = 0.262 + 0.00072 * i
    soft_blur(out, (fx[i] - left[i]) * u - nose * unit, (fy[i] - top[i]) * u - 0.06 * unit,
              0.02 * unit, 0.085 * unit, 0.006 * unit)
    return np.asarray(out)


reader = subprocess.Popen(
    ['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(N / FPS), '-i', SRC,
     '-vf', f'fps={FPS}', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
    stdout=subprocess.PIPE)
frames = []
for i in range(N):
    buf = reader.stdout.read(SW * SH * 3)
    frames.append(process(i, Image.frombuffer('RGB', (SW, SH), buf)))
reader.wait()

writer = subprocess.Popen(
    ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
     '-r', str(FPS), '-i', '-', '-c:v', 'ffv1', OUT],
    stdin=subprocess.PIPE)
L = N - FADE  # duración del bucle
for j in range(L):
    if j < L - FADE:
        frame = frames[FADE + j]
    else:
        # Cola: el final del tramo se funde con su inicio, que enlaza con el cuadro 0.
        k = j - (L - FADE)
        a = (k + 1) / (FADE + 1)
        frame = ((1 - a) * frames[L + k] + a * frames[k]).round().astype(np.uint8)
    writer.stdin.write(frame.tobytes())
writer.stdin.close()
writer.wait()
print(f'{L} cuadros ({L / FPS:.1f} s) → {OUT}')
