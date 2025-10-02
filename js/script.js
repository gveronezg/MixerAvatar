import { avatarManager } from './parts.js';
import { fixCanvasDPI, redrawCanvas } from './canvas.js';
import { renderHeader, setupSkinToneControl } from './ui.js';
import { setupControls } from './controls.js';

async function initialize() {
  await avatarManager.initialize();
  
  renderHeader();
  setupControls();
  setupSkinToneControl();
  
  window.addEventListener('resize', handleResize);
  window.dispatchEvent(new Event('resize'));
}

function handleResize() {
  const area = document.querySelector('.canvas-area');
  if (!area) return;
  
  const size = Math.max(1, Math.min(area.clientWidth, area.clientHeight));

  const canvas = document.getElementById('avatarCanvas');
  if (!canvas) return;
  
  canvas.style.width = size + 'px';
  canvas.style.height = size + 'px';

  fixCanvasDPI();
  redrawCanvas(avatarManager.parts);
}

initialize();