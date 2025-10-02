import { parts, activePart, setActivePart } from './parts.js';
import { redrawCanvas } from './canvas.js';
import { CATEGORY_TITLES } from './texts.js';
import { SKIN_TONES } from './constants.js';

export let skinToneIndex = 0;

const hueSlider = document.getElementById('hueRange');
const skinLabel = document.getElementById('skinLabel');

hueSlider.addEventListener('input', (e) => {
  skinToneIndex = parseInt(e.target.value, 10);
  skinLabel.textContent = SKIN_TONES[skinToneIndex].label.toUpperCase();
  redrawCanvas();
});

const headerTitle = document.querySelector('h1'); // pega o h1
const partsRow = document.getElementById('partsRow');

export function renderHeader(){
  const partsRow = document.getElementById('partsRow');
  partsRow.innerHTML = '';

  parts.forEach((p,i)=>{
    const div = document.createElement('button');
    div.className = 'part-thumb';
    div.title = p.label;
    div.dataset.part = i;
    div.setAttribute('aria-pressed','false');

    // preview
    const thumbUrl = p.options[p.currentIndex];
    if(thumbUrl){
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = p.label;
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.style.borderRadius='6px';
      div.appendChild(img);
    } else {
      div.textContent = p.label;
      div.style.fontWeight='600';
      div.style.color='#333';
    }

    // clique
    div.addEventListener('click',()=>{
      setActivePart(i);

      // muda o h1 de acordo com a categoria
      const key = parts[i].key;
      headerTitle.textContent = CATEGORY_TITLES[key] || "Escolha uma opção";

      redrawCanvas();
    });

    partsRow.appendChild(div);
  });

  highlightActiveThumb();

  // <<< inicializa o h1 com o primeiro thumb ("base")
  const initialKey = parts[0].key;  
  headerTitle.textContent = CATEGORY_TITLES[initialKey] || "Escolha uma opção";
}

export function highlightActiveThumb(){
  const thumbs = document.querySelectorAll('.part-thumb');
  thumbs.forEach((t, idx) => {
    t.classList.toggle('active', idx === activePart);
    t.setAttribute('aria-pressed', idx === activePart ? 'true' : 'false');
  });
}

export function updateThumbForPart(i){
  const p = parts[i];
  if(!p) return;
  const el = partsRow.querySelector(`.part-thumb[data-part="${i}"]`);
  if(!el) return;
  const thumbUrl = p.options[p.currentIndex];
  let img = el.querySelector('img');

  // Se for "glasses01.png", considera invisível
  if(thumbUrl && !thumbUrl.endsWith('glasses02.png')){
    if(!img){
      img = document.createElement('img');
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.style.borderRadius='6px';
      el.textContent='';
      el.appendChild(img);
    }
    img.src = thumbUrl;
  } else {
    // imagem invisível ou inexistente: remove <img> e mantém o espaço
    if(img) img.remove();
    el.textContent = ''; // deixa a caixinha vazia
  }
}