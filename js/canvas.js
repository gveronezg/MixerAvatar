import { parts } from './parts.js';
import { skinToneIndex } from './ui.js';
import { DRAW_ORDER_KEYS, SKIN_TONES } from './constants.js';
import { loadImage, drawSmoothImage } from './imageLoader.js';

const canvas = document.getElementById('avatarCanvas'); // elemento canvas
const ctx = canvas.getContext('2d', { alpha: true }); // contexto 2D do canvas

// Ajusta o tamanho do canvas para o DPI do dispositivo
export function fixCanvasDPI() {
  const area = document.querySelector('.canvas-area');  // área que contém o canvas
  const size = Math.min(area.clientWidth, area.clientHeight); // tamanho baseado na menor dimensão da área
  const ratio = window.devicePixelRatio || 1; // fator de escala baseado no DPI do dispositivo

  canvas.width = size * ratio; // largura do canvas em pixels
  canvas.height = size * ratio; // altura do canvas em pixels

  canvas.style.width = size + 'px'; // largura do canvas em CSS
  canvas.style.height = size + 'px'; // altura do canvas em CSS

  ctx.setTransform(1,0,0,1,0,0); // reseta transformações anteriores
  ctx.scale(ratio, ratio); // aplica escala baseada no DPI
}

// redesenha o canvas com as partes selecionadas
export async function redrawCanvas() {
  const styleWidth = parseInt(getComputedStyle(canvas).width, 10); // largura em CSS
  const styleHeight = parseInt(getComputedStyle(canvas).height, 10); // altura em CSS

  ctx.clearRect(0, 0, styleWidth, styleHeight);

  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'low';

  for (const key of DRAW_ORDER_KEYS) {
    const p = parts.find(pt => pt.key === key);
    if (!p || p.options.length === 0) continue;

    const url = p.options[p.currentIndex];

    if (url.endsWith('glasses02.png')) continue; // Se for a segunda opção de óculos, deixa o avatar sem óculos

    try {
      const img = await loadImage(url);
      await drawSmoothImage(ctx, img, styleWidth, styleHeight);
    } catch(e) {
      console.warn('Erro carregando', url);
    }
  }
}