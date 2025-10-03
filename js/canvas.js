import { DRAW_ORDER_KEYS, BRIGHTNESS_EDIT_CONFIG } from './constants.js';
import { loadImage, drawSmoothImage } from './imageLoader.js';

const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

// Controle de suavização (toggle por clique)
let smoothingEnabled = false;
let lastParts = null;

if (canvas) {
  canvas.addEventListener('click', () => {
    smoothingEnabled = !smoothingEnabled;
    if (lastParts) {
      redrawCanvas(lastParts);
    }
  });
}

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
  lastParts = parts;
  
  const styleWidth = parseInt(getComputedStyle(canvas).width, 10);
  const styleHeight = parseInt(getComputedStyle(canvas).height, 10);

  ctx.clearRect(0, 0, styleWidth, styleHeight);
  // Smoothing desligado para manter nitidez (pode ligar via clique no canvas)
  ctx.imageSmoothingEnabled = !!smoothingEnabled;
  ctx.imageSmoothingQuality = smoothingEnabled ? 'midium' : 'low';

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
  // PROCESSA NO TAMANHO NATIVO DA IMAGEM (evita blur de reamostragem)
  const off = document.createElement('canvas');
  off.width = img.naturalWidth || img.width;
  off.height = img.naturalHeight || img.height;
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.imageSmoothingEnabled = false;
  offCtx.clearRect(0,0,off.width,off.height);
  // Desenha 1:1 sem reescalar
  offCtx.drawImage(img, 0, 0);

  const imageData = offCtx.getImageData(0,0,off.width,off.height);
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

  // CALCULA DESTINO mantendo proporção e alinhando a pixels inteiros
  const imgRatio = off.width / off.height;
  const canvasRatio = targetW / targetH;
  let dw, dh, dx, dy;
  if (canvasRatio > imgRatio) {
    dh = Math.round(targetH);
    dw = Math.round(dh * imgRatio);
    dx = Math.round((targetW - dw) / 2);
    dy = 0;
  } else {
    dw = Math.round(targetW);
    dh = Math.round(dw / imgRatio);
    dx = 0;
    dy = Math.round((targetH - dh) / 2);
  }

  // define smoothing conforme toggle para o reescalonamento final
  const prevSmooth = ctx.imageSmoothingEnabled;
  const prevQual = ctx.imageSmoothingQuality;
  ctx.imageSmoothingEnabled = !!smoothingEnabled;
  ctx.imageSmoothingQuality = smoothingEnabled ? 'high' : 'low';
  ctx.drawImage(off, 0, 0, off.width, off.height, dx, dy, dw, dh);
  ctx.imageSmoothingEnabled = prevSmooth;
  ctx.imageSmoothingQuality = prevQual;
}