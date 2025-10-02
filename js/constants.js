export const ASSETS_BASE = 'assets'; // pasta com imagens

// Cada categoria possui prefixo e uma faixa de probeMax para definir quantas imagens deve carregar
export const CATEGORIES = [
  { key: 'base', label: 'Base', prefix: 'base', probeMax: 6 },
  { key: 'clothing', label: 'Roupas', prefix: 'clothing', probeMax: 14 },
  { key: 'eyes', label: 'Olhos', prefix: 'eyes', probeMax: 14 },
  { key: 'eyebrows', label: 'Sobrancelhas', prefix: 'eyebrows', probeMax: 9 },
  { key: 'nose', label: 'Nariz', prefix: 'nose', probeMax: 6 },
  { key: 'mouth', label: 'Boca', prefix: 'mouth', probeMax: 13 },
  { key: 'hair', label: 'Cabelo', prefix: 'hair', probeMax: 38 },
  { key: 'glasses', label: 'Óculos', prefix: 'glasses', probeMax: 13 },
];

// Ordem de desenho no canvas (de baixo para cima)
export const DRAW_ORDER_KEYS = [
  'base','clothing','eyes','eyebrows','nose','mouth','hair','glasses'
];

export const SKIN_TONES = [
  { label: "clara", rgb: [248,178,117] },
  { label: "escura", rgb: [106,57,42] },
  { label: "bronze", rgb: [149,81,42] },
  { label: "morena clara", rgb: [174,108,74] }
];

export const CATEGORY_TITLES = {
  base: "QUAL ROSTO TE REPRESENTA MELHOR?",
  clothing: "SUA ROUPA TAMBÉM DEMONSTRA SUA PERSONALIDADE!",
  eyes: "SEUS OLHOS SÃO A JANELA DO SEU CORAÇÃO!",
  eyebrows: "SUAS SOBRANCELHAS EXPRESSAM SEU OLHAR!",
  nose: "SEU NARIZ É A PONTA DE SEU SONHO!",
  mouth: "E ESSA BOCA HEIN... COMO FICARÁ?",
  hair: "SEU CABELO DECLARA QUEM VOCÊ É!",
  glasses: "VOCÊ VAI QUERER USAR ALGUM ACESSÓRIO?"
};