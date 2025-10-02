import { DRAW_ORDER_KEYS, HUE_EDIT_CONFIG } from './constants.js';
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
      // Se a parte estiver habilitada para hue, desenha via pipeline com preservação
      if (HUE_EDIT_CONFIG.enabledParts.includes(key)) {
        await drawWithSelectiveHue(ctx, img, styleWidth, styleHeight, key);
      } else {
        drawSmoothImage(ctx, img, styleWidth, styleHeight);
      }
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

function shouldPreserveColor(partKey, r,g,b){
  const perPart = HUE_EDIT_CONFIG.perPartPreserve && HUE_EDIT_CONFIG.perPartPreserve[partKey] || [];
  const global = HUE_EDIT_CONFIG.preserveColors || [];
  // Prioridade: regras por parte, depois globais
  const candidates = [...perPart, ...global];
  for (const rule of candidates){
    const { hex, tolerance = 16 } = rule;
    const { r:pr, g:pg, b:pb } = hexToRgb(hex);
    if (colorDistanceSq(r,g,b, pr,pg,pb) <= tolerance*tolerance){
      return true;
    }
  }
  return false;
}

// Aplica rotação de matiz rápida em RGB via conversão HSL aproximada
function rgbToHsl(r, g, b){
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h, s, l = (max+min)/2;
  if (max === min){
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l){
  let r, g, b;
  if (s === 0){
    r = g = b = l; // achromático
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255)))
  };
}

function rotateHueRgb(r,g,b, degrees){
  const { h, s, l } = rgbToHsl(r,g,b);
  let newH = (h + (degrees/360)) % 1;
  if (newH < 0) newH += 1;
  const { r:rr, g:gg, b:bb } = hslToRgb(newH, s, l);
  return { r: rr, g: gg, b: bb };
}

// Desenha a imagem ajustando a matiz por pixel, preservando cores configuradas
async function drawWithSelectiveHue(ctx, img, targetW, targetH, partKey){
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

  // Define matiz com base no input range (0..360) se existir atributo data-hue no body
  // Aqui, para simplicidade, usamos um atributo opcional em window.avatarHue
  const hueDegrees = window.avatarHue || 0;

  for (let i = 0; i < data.length; i += 4){
    const r = data[i], g = data[i+1], b = data[i+2];
    const a = data[i+3];
    if (a === 0) continue; // totalmente transparente

    // Preserva cores configuradas
    if (shouldPreserveColor(partKey, r,g,b)) continue;

    const rotated = rotateHueRgb(r,g,b, hueDegrees);
    data[i] = rotated.r; data[i+1] = rotated.g; data[i+2] = rotated.b;
  }

  offCtx.putImageData(imageData, 0, 0);
  ctx.drawImage(off, 0, 0);
}