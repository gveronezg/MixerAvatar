import { parts } from './parts.js';
import { setActivePart } from './parts.js';
import { redrawCanvas } from './canvas.js';

const partsRow = document.getElementById('partsRow');

export function renderHeader(){
  partsRow.innerHTML = '';
  parts.forEach((p,i)=>{
    const div = document.createElement('button');
    div.className = 'part-thumb';
    div.title = p.label;
    div.dataset.part = i;
    div.setAttribute('aria-pressed','false');

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

    div.addEventListener('click',()=>{ setActivePart(i); redrawCanvas(); });
    partsRow.appendChild(div);
  });

  highlightActiveThumb();
}

export function highlightActiveThumb(){
  const thumbs = partsRow.querySelectorAll('.part-thumb');
  thumbs.forEach((t,idx)=>{
    t.classList.toggle('active', idx===parts.activePart);
    t.setAttribute('aria-pressed', idx===parts.activePart?'true':'false');
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