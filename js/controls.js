import { avatarManager } from './parts.js';
import { redrawCanvas } from './canvas.js';
import { updateThumbForPart } from './ui.js';

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const concludeBtn = document.getElementById('concludeBtn');

export function setupControls() {
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      avatarManager.previousOption();
      updateThumbForPart(avatarManager.activePartIndex);
      redrawCanvas(avatarManager.parts);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      avatarManager.nextOption();
      updateThumbForPart(avatarManager.activePartIndex);
      redrawCanvas(avatarManager.parts);
    });
  }

  if (concludeBtn) {
    concludeBtn.addEventListener('click', () => {
      const canvas = document.getElementById('avatarCanvas');
      const data = canvas.toDataURL('image/png');
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<img src="${data}" alt="Avatar exportado" style="max-width:100%"/>`);
      } else {
        alert('Popup bloqueado. Habilite popups para exportar.');
      }
    });
  }
}