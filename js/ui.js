// Importa coisas de outros arquivos .js
// - parts: lista de todas as partes do avatar (pele, olhos, boca etc.)
// - activePart: índice que indica qual parte está ativa no momento
// - setActivePart: função que troca a parte ativa
import { parts, activePart, setActivePart } from './parts.js';

// - redrawCanvas: função que redesenha o avatar no canvas
import { redrawCanvas } from './canvas.js';

// - constantes como os nomes dos tons de pele e títulos das categorias
import { SKIN_TONES, CATEGORY_TITLES } from './constants.js';

// ==========================
// Controle do tom de pele
// ==========================

// Índice do tom de pele atual (0 = primeiro, 1 = segundo etc.)
export let skinToneIndex = 0;

// Pega o slider de matiz (range input do HTML)
const hueSlider = document.getElementById('hueRange');

// Toda vez que o usuário move o slider:
hueSlider.addEventListener('input', (e) => {
  // Converte o valor do slider (string) em número inteiro
  skinToneIndex = parseInt(e.target.value, 10);

  // Atualiza o texto do rótulo com o nome do tom de pele em letras maiúsculas
  skinLabel.textContent = SKIN_TONES[skinToneIndex].label.toUpperCase();

  // Redesenha o avatar no canvas, aplicando o novo tom
  redrawCanvas();
});


// ==========================
// Cabeçalho e lista de partes
// ==========================

// Pega o título principal <h1> do HTML
const headerTitle = document.querySelector('h1');

// Pega a "linha" onde ficarão os botões das partes (pele, olhos, cabelo etc.)
const partsRow = document.getElementById('partsRow');

// Função que desenha no header os botões correspondentes a cada parte
export function renderHeader(){
  const partsRow = document.getElementById('partsRow'); // pega de novo a linha
  partsRow.innerHTML = '';  // limpa tudo que tinha antes

  // Para cada parte do avatar (pele, olhos, boca, cabelo etc.):
  parts.forEach((p,i)=>{
    // Cria um botão para representar essa parte
    const div = document.createElement('button');
    div.className = 'part-thumb'; // adiciona classe CSS
    div.title = p.label;          // tooltip (quando passa o mouse)
    div.dataset.part = i;         // guarda o índice da parte no atributo data-part
    div.setAttribute('aria-pressed','false'); // acessibilidade

    // ==========================
    // Preview dentro do botão
    // ==========================
    const thumbUrl = p.options[p.currentIndex]; // pega a imagem da parte atual
    if(thumbUrl){
      // Se tem imagem, cria <img> dentro do botão
      const img = document.createElement('img');
      img.src = thumbUrl;       // link da imagem
      img.alt = p.label;        // texto alternativo (acessibilidade)
      img.style.width='100%';   // ocupa todo o botão
      img.style.height='100%';  
      img.style.objectFit='cover'; // preenche sem distorcer
      img.style.borderRadius='6px'; // cantos arredondados
      div.appendChild(img);
    } else {
      // Se não tem imagem, mostra só o texto da parte
      div.textContent = p.label;
      div.style.fontWeight='600';
      div.style.color='#333';
    }

    // ==========================
    // Clique no botão da parte
    // ==========================
    div.addEventListener('click',()=>{
      // Marca essa parte como ativa
      setActivePart(i);

      // Muda o título principal de acordo com a categoria
      const key = parts[i].key;
      headerTitle.textContent = CATEGORY_TITLES[key] || "Escolha uma opção";

      // Redesenha o avatar mostrando a mudança
      redrawCanvas();
    });

    // Insere o botão na linha de partes
    partsRow.appendChild(div);
  });

  // Marca visualmente qual botão está ativo
  highlightActiveThumb();

  // Inicializa o título do <h1> com o nome da primeira parte ("base")
  const initialKey = parts[0].key;  
  headerTitle.textContent = CATEGORY_TITLES[initialKey] || "Escolha uma opção";
}


// ==========================
// Destaque no botão ativo
// ==========================

// Função que destaca (ou não) os botões
export function highlightActiveThumb(){
  const thumbs = document.querySelectorAll('.part-thumb');
  thumbs.forEach((t, idx) => {
    // Se o índice é o ativo → adiciona classe "active"
    t.classList.toggle('active', idx === activePart);

    // Atributo de acessibilidade: botão "pressionado"
    t.setAttribute('aria-pressed', idx === activePart ? 'true' : 'false');
  });
}


// ==========================
// Atualização do preview (thumbnail) quando a parte muda
// ==========================
export function updateThumbForPart(i){
  const p = parts[i]; // pega a parte no índice i
  if(!p) return;      // se não existir, sai

  // Pega o botão correspondente a essa parte
  const el = partsRow.querySelector(`.part-thumb[data-part="${i}"]`);
  if(!el) return;

  // Pega a imagem atual da parte
  const thumbUrl = p.options[p.currentIndex];
  let img = el.querySelector('img'); // verifica se já tem <img> no botão

  // Caso especial: se for "glasses02.png", considera invisível
  if(thumbUrl && !thumbUrl.endsWith('glasses02.png')){
    if(!img){
      // Se ainda não existe <img>, cria um
      img = document.createElement('img');
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.style.borderRadius='6px';
      el.textContent=''; // limpa qualquer texto
      el.appendChild(img);
    }
    img.src = thumbUrl; // atualiza a imagem
  } else {
    // Se não tem imagem ou é "invisível":
    if(img) img.remove(); // remove a <img>
    el.textContent = '';  // deixa a caixinha vazia
  }
}