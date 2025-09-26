import { parts, activePart, hue } from './parts.js';
import { redrawCanvas } from './canvas.js';
import { updateThumbForPart } from './ui.js';

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const hueRange = document.getElementById('hueRange');
const concludeBtn = document.getElementById('concludeBtn');

prevBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if(!p || !p.options.length) return;
  p.currentIndex = (p.currentIndex-1+p.options.length)%p.options.length;
  updateThumbForPart(activePart);
  redrawCanvas();
});

nextBtn.addEventListener('click', () => {
  const p = parts[activePart];
  if(!p || !p.options.length) return;
  p.currentIndex = (p.currentIndex+1)%p.options.length;
  updateThumbForPart(activePart);
  redrawCanvas();
});

hueRange.addEventListener('input',(e)=>{
  hue = parseInt(e.target.value,10);
  redrawCanvas();
});

concludeBtn.addEventListener('click', ()=>{
  const canvas = document.getElementById('avatarCanvas');
  const data = canvas.toDataURL('image/png');
  const w = window.open('', '_blank');
  if(w) w.document.write(`<img src="${data}" alt="Avatar exportado" style="max-width:100%"/>`);
  else alert('Popup bloqueado. Habilite popups para exportar.');
});