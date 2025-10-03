import { DRAW_ORDER_KEYS, BRIGHTNESS_EDIT_CONFIG } from './constants.js';
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
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'low';

  for (const key of DRAW_ORDER_KEYS) {
    const part = parts.find(p => p.key === key);
    if (!part || part.options.length === 0) continue;

    const url = part.options[part.currentIndex];
    if (url.endsWith('glasses02.png')) continue;

    try {
      const img = await loadImage(url);
      // Sempre desenha via pipeline com preservação de cores específicas
      await drawWithSelectiveBrightness(ctx, img, styleWidth, styleHeight);
    } catch (e) {
      console.warn('Erro carregando', url);
    }
  }
}

// ---------- Utilidades de cor ----------
function hexToRgb(hex){
  const s = hex.replace('#','');
  const num = parseInt(s, 16);
  if (s.length === 6) {
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  return { r: 255, g: 255, b: 255 };
}

function colorDistanceSq(r1,g1,b1,r2,g2,b2){
  const dr = r1 - r2; const dg = g1 - g2; const db = b1 - b2;
  return dr*dr + dg*dg + db*db;
}

function shouldPreserveColor(r,g,b){
  const preserveColors = BRIGHTNESS_EDIT_CONFIG.preserveColors || [];
  for (const rule of preserveColors){
    const { hex, tolerance = 16 } = rule;
    const { r:pr, g:pg, b:pb } = hexToRgb(hex);
    if (colorDistanceSq(r,g,b, pr,pg,pb) <= tolerance*tolerance){
      return true;
    }
  }
  return false;
}

function shouldApplyBrightness(r,g,b){
  const enabledColors = BRIGHTNESS_EDIT_CONFIG.enabledColors || [];
  for (const rule of enabledColors){
    const { hex, tolerance = 16 } = rule;
    const { r:pr, g:pg, b:pb } = hexToRgb(hex);
    if (colorDistanceSq(r,g,b, pr,pg,pb) <= tolerance*tolerance){
      return true;
    }
  }
  return false;
}

// Aplica ajuste de brilho (brightness) para simular tons de pele
function adjustBrightnessRgb(r, g, b, brightnessFactor) {
  // brightnessFactor: 0.0 = muito escuro, 1.0 = original, 2.0 = muito claro
  return {
    r: Math.max(0, Math.min(255, Math.round(r * brightnessFactor))),
    g: Math.max(0, Math.min(255, Math.round(g * brightnessFactor))),
    b: Math.max(0, Math.min(255, Math.round(b * brightnessFactor)))
  };
}

// Desenha a imagem ajustando o brilho por pixel, preservando cores configuradas
async function drawWithSelectiveBrightness(ctx, img, targetW, targetH){
  // Desenha em um canvas offscreen para pegar os pixels do destino já escalados
  const off = document.createElement('canvas');
  off.width = targetW; off.height = targetH;
  const offCtx = off.getContext('2d');
  offCtx.imageSmoothingEnabled = false;
  offCtx.imageSmoothingQuality = 'low';
  // Reusa a mesma lógica de posicionamento do drawSmoothImage
  const imgRatio = img.width / img.height;
  const canvasRatio = targetW / targetH;
  let drawWidth, drawHeight, offsetX, offsetY;
  if (canvasRatio > imgRatio) {
    drawHeight = targetH;
    drawWidth = drawHeight * imgRatio;
    offsetX = (targetW - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = targetW;
    drawHeight = drawWidth / imgRatio;
    offsetX = 0;
    offsetY = (targetH - drawHeight) / 2;
  }
  offCtx.clearRect(0,0,targetW,targetH);
  offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  const imageData = offCtx.getImageData(0,0,targetW,targetH);
  const data = imageData.data;

  // Define brilho com base no input range (0..100) convertido para fator de brilho
  // 0 = máximo escuro (0.30), 50 = original (1.0), 100 = máximo claro (1.20)
  const brightnessValue = window.avatarBrightness || 50; // padrão 50 (original)
  
  // Mapeia 0-100 para 0.30-1.20
  const minFactor = 0.30; // máximo escuro
  const maxFactor = 1.20; // máximo claro
  const brightnessFactor = minFactor + (brightnessValue / 100) * (maxFactor - minFactor);

  for (let i = 0; i < data.length; i += 4){
    const r = data[i], g = data[i+1], b = data[i+2];
    const a = data[i+3];
    if (a === 0) continue; // totalmente transparente

    // Preserva cores configuradas (branco, preto, etc.)
    if (shouldPreserveColor(r,g,b)) continue;

    // Aplica brilho apenas nas cores específicas habilitadas
    if (shouldApplyBrightness(r,g,b)) {
      const adjusted = adjustBrightnessRgb(r,g,b, brightnessFactor);
      data[i] = adjusted.r; data[i+1] = adjusted.g; data[i+2] = adjusted.b;
    }
  }

  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(off, 0, 0);
}