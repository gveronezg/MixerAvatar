import { initParts } from './parts.js';
import { fixCanvasDPI, redrawCanvas } from './canvas.js';
import './controls.js';

(async function(){
  await initParts();

  window.addEventListener('resize', ()=>{
    const area = document.querySelector('.canvas-area');
    const size = Math.max(1, Math.min(area.clientWidth, area.clientHeight));

    const canvas = document.getElementById('avatarCanvas');
    canvas.style.width = size+'px';
    canvas.style.height = size+'px';

    fixCanvasDPI();
    redrawCanvas();
  });

  window.dispatchEvent(new Event('resize'));
})();