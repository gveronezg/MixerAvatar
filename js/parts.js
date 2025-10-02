import { CATEGORIES } from './constants.js';
import { imageExists } from './imageLoader.js';
import { renderHeader, highlightActiveThumb } from './ui.js';
import { redrawCanvas } from './canvas.js';

export const parts = [];
export let activePart = 0;
export let hue = 0;

export async function initParts() {
  parts.length = 0;

  for (const cat of CATEGORIES) {
    const options = [];
    const maxProbe = Math.max(1, cat.probeMax || 40);
    for (let i = 1; i <= maxProbe; i++) {
      const url = `assets/${cat.prefix}${String(i).padStart(2,'0')}.png`;
      try {
        await imageExists(url);
        options.push(url);
      } catch {}
    }
    parts.push({ key: cat.key, label: cat.label, options, currentIndex: 0 });
  }

  renderHeader();
  setActivePart(0);
  await redrawCanvas();
}

export function setActivePart(i) {
  activePart = i;
  highlightActiveThumb();
}