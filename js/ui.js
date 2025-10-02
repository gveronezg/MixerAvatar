import { avatarManager } from './parts.js';
import { redrawCanvas } from './canvas.js';
import { SKIN_TONES, CATEGORY_TITLES } from './constants.js';

const headerTitle = document.querySelector('h1');
const partsRow = document.getElementById('partsRow');
const hueSlider = document.getElementById('hueRange');

export function renderHeader() {
  if (!partsRow) return;
  
  partsRow.innerHTML = '';

  avatarManager.parts.forEach((part, index) => {
    const button = document.createElement('button');
    button.className = 'part-thumb';
    button.title = part.label;
    button.dataset.part = index;
    button.setAttribute('aria-pressed', 'false');

    const thumbUrl = part.options[part.currentIndex];
    if (thumbUrl) {
      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = part.label;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      button.appendChild(img);
    } else {
      button.textContent = part.label;
      button.style.fontWeight = '600';
      button.style.color = '#333';
    }

    button.addEventListener('click', () => {
      avatarManager.setActivePart(index);
      updateTitle();
      highlightActiveThumb();
      redrawCanvas(avatarManager.parts);
    });

    partsRow.appendChild(button);
  });

  highlightActiveThumb();
  updateTitle();
}

export function highlightActiveThumb() {
  const thumbs = document.querySelectorAll('.part-thumb');
  thumbs.forEach((thumb, index) => {
    const isActive = index === avatarManager.activePartIndex;
    thumb.classList.toggle('active', isActive);
    thumb.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

export function updateThumbForPart(index) {
  const part = avatarManager.parts[index];
  if (!part) return;

  if (!partsRow) return;
  
  const element = partsRow.querySelector(`.part-thumb[data-part="${index}"]`);
  if (!element) return;

  const thumbUrl = part.options[part.currentIndex];
  let img = element.querySelector('img');

  if (thumbUrl && !thumbUrl.endsWith('glasses02.png')) {
    if (!img) {
      img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '6px';
      element.textContent = '';
      element.appendChild(img);
    }
    img.src = thumbUrl;
  } else {
    if (img) img.remove();
    element.textContent = '';
  }
}

function updateTitle() {
  if (!headerTitle) return;
  
  const activePart = avatarManager.getActivePart();
  if (activePart) {
    headerTitle.textContent = CATEGORY_TITLES[activePart.key] || "Escolha uma opção";
  }
}

// Variável para armazenar o timeout do debounce
let redrawTimeout = null;

export function setupSkinToneControl() {
  if (hueSlider) {
    hueSlider.addEventListener('input', (e) => {
      const index = parseInt(e.target.value, 10);
      avatarManager.setSkinTone(index);
      // Usa o slider para controlar brilho (0-100): 0=escuro, 50=original, 100=claro
      window.avatarBrightness = Number.isFinite(index) ? index : 50;
      
      // Cancela o redraw anterior se ainda não executou
      if (redrawTimeout) {
        clearTimeout(redrawTimeout);
      }
      
      // Agenda o redraw para 500ms após parar de mover o slider
      redrawTimeout = setTimeout(() => {
        redrawCanvas(avatarManager.parts);
        redrawTimeout = null;
      }, 500);
    });
  }
}