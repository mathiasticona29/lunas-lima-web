#!/usr/bin/env bash
# Saca de un maestro sin pérdida (scripts/hero-video-render.py) los archivos del hero:
# WebM (VP9) y MP4 (H.264) en 1080p y 720p, sin audio, y el póster (primer cuadro).
# Uso: scripts/hero-video-encode.sh <maestro.mkv> <carpeta> <nombre> <alto> <bitrate MP4> <CRF WebM> [...]
#   panel 3:2:      scripts/hero-video-encode.sh maestro.mkv public/hero auto 1080 4000k 31 720 2200k 32
#   hero a sangre:  scripts/hero-video-encode.sh maestro-wide.mkv public/hero auto-wide 1080 4000k 31
set -euo pipefail
MASTER=$1
OUT=$2
NAME=$3 # prefijo del archivo: auto (panel 3:2) o auto-wide (hero a sangre 16:9)
shift 3
mkdir -p "$OUT"

COLOR=(-pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709)

encode() { # alto, bitrate MP4, CRF WebM
	local h=$1 mp4=$2 crf=$3
	local vf="scale=-2:$h:flags=lanczos:out_color_matrix=bt709"
	ffmpeg -v error -y -i "$MASTER" -an -vf "$vf" "${COLOR[@]}" \
		-c:v libvpx-vp9 -b:v 0 -crf "$crf" -row-mt 1 -cpu-used 1 -g 105 "$OUT/$NAME-$h.webm"
	# Sin x264 en esta máquina: OpenH264 con bitrate fijo.
	ffmpeg -v error -y -i "$MASTER" -an -vf "$vf" "${COLOR[@]}" \
		-c:v libopenh264 -profile:v high -b:v "$mp4" -maxrate "$mp4" -g 60 \
		-movflags +faststart "$OUT/$NAME-$h.mp4"
	ffmpeg -v error -y -i "$MASTER" -frames:v 1 -vf "scale=-2:$h:flags=lanczos" \
		-c:v libwebp -quality 82 "$OUT/$NAME-$h.webp"
}

# Cada terna restante: alto, bitrate del MP4 y CRF del WebM.
while (($#)); do
	encode "$1" "$2" "$3"
	shift 3
done
ls -l "$OUT" | awk 'NR>1 {printf "%7.0f KB  %s\n", $5/1024, $9}'
