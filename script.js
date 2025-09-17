const ASSETS_BASE = 'assets'; // pasta com imagens

// Configuração das categorias reais existentes em /assets
// Cada categoria possui prefixo e uma faixa de probe para descobrir índices disponíveis
const CATEGORIES = [
  { key: 'base',      label: 'Base',      prefix: 'base',      probeMax: 40 },
  { key: 'clothing',  label: 'Roupas',    prefix: 'clothing',  probeMax: 60 },
  { key: 'eyes',      label: 'Olhos',     prefix: 'eyes',      probeMax: 40 },
  { key: 'eyebrows',  label: 'Sobrancelhas', prefix: 'eyebrows', probeMax: 30 },
  { key: 'nose',      label: 'Nariz',     prefix: 'nose',      probeMax: 20 },
  { key: 'mouth',     label: 'Boca',      prefix: 'mouth',     probeMax: 30 },
  { key: 'hair',      label: 'Cabelo',    prefix: 'hair',      probeMax: 100 },
  { key: 'glasses',   label: 'Óculos',    prefix: 'glasses',   probeMax: 40 },
];

// Ordem de desenho no canvas (de baixo para cima)
const DRAW_ORDER_KEYS = [
  'base',
  'clothing',
  'eyes',
  'eyebrows',
  'nose',
  'mouth',
  'hair',
  'glasses',
];

const parts = [];
const partsRow = document.getElementById('partsRow');
const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const hueRange = document.getElementById('hueRange');
// Elementos removidos - não precisamos mais dos textos de info
const concludeBtn = document.getElementById('concludeBtn');

let activePart = 0;
let hue = 0; // 0..360

// Cria estrutura das partes a partir das categorias reais
async function initParts() {
  parts.length = 0;
  for (const cat of CATEGORIES) {
    const options = [];
    const maxProbe = Math.max(1, cat.probeMax || 40);
    for (let i = 1; i <= maxProbe; i++) {
      const url = `${ASSETS_BASE}/${cat.prefix}${String(i).padStart(2,'0')}.png`;
      try {
        await imageExists(url);
        options.push(url);
      } catch (err) {
        // simplesmente ignore índices inexistentes (permite buracos como glasses01 ausente)
      }
    }
    parts.push({
      key: cat.key,
      label: cat.label,
      options,
      currentIndex: 0,
    });
  }

  renderHeader();
  setActivePart(0);
  await redrawCanvas();
}

// Checa se imagem existe (tentativa de carregar)
function imageExists(url){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => reject(false);
    img.src = url;
  });
}

// Renderiza o cabeçalho com um quadrante por categoria
function renderHeader(){
  partsRow.innerHTML = '';
  for (let i = 0; i < parts.length; i++){
    const p = parts[i];
    const div = document.createElement('button');
    div.className = 'part-thumb';
    div.title = `${p?.label || 'Parte'} ${i+1}`;
    div.dataset.part = i;
    div.setAttribute('aria-pressed','false');

    // usa a opção atual como preview (thumb)
    const thumbUrl = (p.options && p.options.length>0) ? p.options[p.currentIndex] : null;
    if (thumbUrl){
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = `Thumb ${p?.label || 'Parte'} ${i+1}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      div.appendChild(img);
    } else {
      div.textContent = `${p?.label || (i+1)}`;
      div.style.fontWeight = '600';
      div.style.color = '#333';
    }

    div.addEventListener('click', () => {
      setActivePart(i);
    });

    partsRow.appendChild(div);
  }
  highlightActiveThumb();
}

function highlightActiveThumb(){
  const thumbs = partsRow.querySelectorAll('.part-thumb');
  thumbs.forEach((t, idx) => {
    if (idx === activePart){
      t.classList.add('active');
      t.setAttribute('aria-pressed','true');
    } else {
      t.classList.remove('active');
      t.setAttribute('aria-pressed','false');
    }
  });
}

function setActivePart(i){
  activePart = i;
  highlightActiveThumb();
}

// Função removida - não precisamos mais atualizar textos de info

// Botões de navegação para a parte ativa (loop)
prevBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if (!p || p.options.length === 0) return;
  p.currentIndex = (p.currentIndex - 1 + p.options.length) % p.options.length;
  updateThumbForPart(activePart);
  redrawCanvas();
});
nextBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if (!p || p.options.length === 0) return;
  p.currentIndex = (p.currentIndex + 1) % p.options.length;
  updateThumbForPart(activePart);
  redrawCanvas();
});

// Range hue
hueRange.addEventListener('input', (e) => {
  hue = parseInt(e.target.value,10);
  redrawCanvas();
});

// Concluir
concludeBtn.addEventListener('click', () => {
  // Exemplo: exporta o canvas como imagem e abre em nova aba (você pode trocar)
  const data = canvas.toDataURL('image/png');
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(`<img src="${data}" alt="Avatar exportado" style="max-width:100%"/>`);
  } else {
    alert('Popup bloqueado. Habilite popups para exportar.');
  }
});

// Redesenha: carrega todas as camadas e desenha na ordem definida em DRAW_ORDER_KEYS
async function redrawCanvas(){
  // Limpa
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Ajuste de DPI para canvas (opcional) — mantém boa qualidade em telas retina
  fixCanvasDPI();

  // Define filtro de cor: hue-rotate em deg
  ctx.filter = `hue-rotate(${hue}deg) saturate(1.08)`;

  // Desenha camadas na ordem especificada
  for (const key of DRAW_ORDER_KEYS){
    const p = parts.find(pt => pt.key === key);
    if (!p || p.options.length === 0) continue;
    const url = p.options[p.currentIndex];
    try {
      const img = await loadImage(url);
      // Centraliza a imagem no canvas usando as dimensões CSS
      const styleWidth = parseInt(getComputedStyle(canvas).width, 10);
      const styleHeight = parseInt(getComputedStyle(canvas).height, 10);
      const scale = Math.min(styleWidth / img.width, styleHeight / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (styleWidth - w) / 2;
      const y = (styleHeight - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    } catch (e) {
      // erro carregando imagem — ignora
      console.warn('Erro carregando', url);
    }
  }
  // reset filters depois de desenhar
  ctx.filter = 'none';
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Erro carregando ' + src));
    img.src = src;
  });
}

function updateThumbForPart(i){
  const p = parts[i];
  if (!p) return;
  const el = partsRow.querySelector(`.part-thumb[data-part="${i}"]`);
  if (!el) return;
  const thumbUrl = (p.options && p.options.length>0) ? p.options[p.currentIndex] : null;
  let img = el.querySelector('img');
  if (thumbUrl){
    if (!img){
      img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      el.textContent = '';
      el.appendChild(img);
    }
    img.src = thumbUrl;
    img.alt = `Thumb ${p?.label || 'Parte'} ${i+1}`;
  } else {
    if (img) img.remove();
    el.textContent = `${p?.label || (i+1)}`;
    el.style.fontWeight = '600';
    el.style.color = '#333';
  }
}

function fixCanvasDPI(){
  const ratio = window.devicePixelRatio || 1;
  // Usa as dimensões do CSS como base, não as internas do canvas
  const styleWidth = parseInt(getComputedStyle(canvas).width, 10);
  const styleHeight = parseInt(getComputedStyle(canvas).height, 10);
  
  // Define as dimensões internas do canvas baseadas no CSS
  canvas.width = Math.round(styleWidth * ratio);
  canvas.height = Math.round(styleHeight * ratio);
  
  // Mantém as dimensões CSS inalteradas
  canvas.style.width = styleWidth + 'px';
  canvas.style.height = styleHeight + 'px';
  
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  
  // Melhora a nitidez e antialiasing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

// Inicialização
(async function(){
  // tenta inicializar e depois desenhar
  await initParts();

  // redimensiona canvas responsivamente se quiser (manter proporção)
  window.addEventListener('resize', () => {
    // redimensiona físico mantendo a largura máxima
    const parentWidth = canvas.parentElement.clientWidth - 20;
    const newWidth = Math.min(520, parentWidth);
    const newHeight = Math.round(newWidth * 0.75);
    
    // Define as dimensões CSS primeiro
    canvas.style.width = newWidth + 'px';
    canvas.style.height = newHeight + 'px';
    
    // Depois ajusta as dimensões internas baseadas no CSS
    fixCanvasDPI();
    redrawCanvas();
  });

  // força resize inicial
  const ev = new Event('resize');
  window.dispatchEvent(ev);
})();