import { CATEGORIES } from './constants.js';
import { imageExists } from './imageLoader.js';
import { renderHeader, highlightActiveThumb } from './ui.js';
import { redrawCanvas } from './canvas.js';

export const parts = []; // array de partes
export let activePart = 0; // índice da parte ativa
export let hue = 0; // valor de matiz (hue)

// inicializa as partes
export async function initParts() {
  parts.length = 0; // limpa o array de partes

  for (const cat of CATEGORIES) { // para cada categoria
    const options = []; // array de opções
    const maxProbe = Math.max(1, cat.probeMax || 38); // valor máximo de probe
    for (let i = 1; i <= maxProbe; i++) { // para cada probe
      const url = `assets/${cat.prefix}${String(i).padStart(2,'0')}.png`; // URL da imagem
      try { // tenta carregar a imagem
        await imageExists(url); // verifica se a imagem existe
        options.push(url); // adiciona a URL à array de opções
      } catch {} // se não conseguir carregar a imagem, continua
    }
    parts.push({ key: cat.key, label: cat.label, options, currentIndex: 0 }); // adiciona a categoria ao array de partes
  }

  renderHeader(); // renderiza o header
  setActivePart(0); // define a parte ativa como a primeira
  await redrawCanvas(); // redesenha o canvas
}

// define a parte ativa
export function setActivePart(i) {
  activePart = i; // define a parte ativa como a parte passada como parâmetro
  highlightActiveThumb(); // destaca a parte ativa
}