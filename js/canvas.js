import { DRAW_ORDER_KEYS } from './constants.js';
import { loadImage, drawSmoothImage } from './imageLoader.js';

const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

export function fixCanvasDPI() {
  const area = document.querySelector('.canvas-area');
  if (!area) return;
  
  const size = Math.min(area.clientWidth, area.clientHeight);
  const ratio = window.devicePixelRatio || 1;

  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(ratio, ratio);
}

export async function redrawCanvas(parts) {
  if (!parts) return;
  
  const styleWidth = parseInt(getComputedStyle(canvas).width, 10);
  const styleHeight = parseInt(getComputedStyle(canvas).height, 10);

  ctx.clearRect(0, 0, styleWidth, styleHeight);
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';

  for (const key of DRAW_ORDER_KEYS) {
    const part = parts.find(p => p.key === key);
    if (!part || part.options.length === 0) continue;

    const url = part.options[part.currentIndex];
    if (url.endsWith('glasses02.png')) continue;

    try {
      const img = await loadImage(url);
      drawSmoothImage(ctx, img, styleWidth, styleHeight);
    } catch (e) {
      console.warn('Erro carregando', url);
    }
  }
}