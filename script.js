// Ajuste o caminho das imagens em ASSETS_BASE se necessário.

const ASSETS_BASE = 'assets'; // pasta com imagens
const NUM_PARTS = 8;

// Para cada parte definimos quantas opções existem (se não souber, o script tentará carregar até um limite)
const MAX_OPTIONS_TO_PROBE = 8; // tenta carregar opt1..opt8 por parte (ajuste se precisar)

const parts = []; // cada item: { index, options: [url,...], currentIndex }
const partsRow = document.getElementById('partsRow');
const canvas = document.getElementById('avatarCanvas');
const ctx = canvas.getContext('2d', { alpha: true });

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const hueRange = document.getElementById('hueRange');
const currentPartEl = document.getElementById('currentPart');
const currentOptionEl = document.getElementById('currentOption');
const indexInfo = document.getElementById('indexInfo');
const concludeBtn = document.getElementById('concludeBtn');

let activePart = 0;
let hue = 0; // 0..360

// Cria estrutura das partes e tenta detectar opções
async function initParts() {
  for (let p = 1; p <= NUM_PARTS; p++) {
    const options = [];
    for (let o = 1; o <= MAX_OPTIONS_TO_PROBE; o++) {
      const url = `${ASSETS_BASE}/part${p}_opt${o}.png`;
      // verifica existência — carregando imagem (promise)
      try {
        await imageExists(url);
        options.push(url);
      } catch (err) {
        // Falha; assume que não há mais opções (se for opt1 falhar, tenta thumb fallback)
        // continue tentando: se opt1 não existir, isso significa que parte tem zero opções.
      }
    }
    // fallback: se não houver options, tente uma imagem padrão (ex: part{p}.png) — útil para integrar
    if (options.length === 0) {
      const fallback = `${ASSETS_BASE}/part${p}.png`;
      try {
        await imageExists(fallback);
        options.push(fallback);
      } catch (e) {
        // sem imagem para essa parte — ainda adicionamos uma lista vazia
      }
    }
    parts.push({
      index: p - 1,
      options,
      currentIndex: 0
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

// Renderiza o cabeçalho com 8 quadrantes
function renderHeader(){
  partsRow.innerHTML = '';
  for (let i = 0; i < NUM_PARTS; i++){
    const p = parts[i];
    const div = document.createElement('button');
    div.className = 'part-thumb';
    div.title = `Parte ${i+1}`;
    div.dataset.part = i;
    div.setAttribute('aria-pressed','false');

    // usa thumb se existir ou a primeira opção como preview
    const thumbUrl = (p.options && p.options.length>0) ? p.options[0] : null;
    if (thumbUrl){
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = `Thumb parte ${i+1}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      div.appendChild(img);
    } else {
      div.textContent = `${i+1}`;
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
  updateIndexInfo();
}

// Atualiza texto de info
function updateIndexInfo(){
  currentPartEl.textContent = activePart + 1;
  const p = parts[activePart];
  currentOptionEl.textContent = (p && p.options.length>0) ? (p.currentIndex + 1) : 0;
}

// Botões de navegação para a parte ativa (loop)
prevBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if (!p || p.options.length === 0) return;
  p.currentIndex = (p.currentIndex - 1 + p.options.length) % p.options.length;
  updateIndexInfo();
  redrawCanvas();
});
nextBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if (!p || p.options.length === 0) return;
  p.currentIndex = (p.currentIndex + 1) % p.options.length;
  updateIndexInfo();
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

// Redesenha: carrega todas as camadas e desenha em ordem de partes 1..8
async function redrawCanvas(){
  // Limpa
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Ajuste de DPI para canvas (opcional) — mantém boa qualidade em telas retina
  fixCanvasDPI();

  // Define filtro de cor: hue-rotate em deg
  ctx.filter = `hue-rotate(${hue}deg) saturate(1.08)`;

  // Desenha camadas na ordem de partes (você pode mudar a ordem conforme seu layout)
  for (let i = 0; i < parts.length; i++){
    const p = parts[i];
    if (!p || p.options.length === 0) continue;
    const url = p.options[p.currentIndex];
    try {
      const img = await loadImage(url);
      // Centraliza a imagem no canvas. Você pode alterar sizing/posicionamento conforme precisar.
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
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

function fixCanvasDPI(){
  const ratio = window.devicePixelRatio || 1;
  const w = canvas.width;
  const h = canvas.height;
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// Inicialização
(async function(){
  // tenta inicializar e depois desenhar
  await initParts();

  // redimensiona canvas responsivamente se quiser (manter proporção)
  window.addEventListener('resize', () => {
    // redimensiona físico mantendo a largura máxima
    const parentWidth = canvas.parentElement.clientWidth - 20;
    canvas.width = Math.min(520, parentWidth);
    canvas.height = Math.round(canvas.width * 0.75);
    redrawCanvas();
  });

  // força resize inicial
  const ev = new Event('resize');
  window.dispatchEvent(ev);
})();