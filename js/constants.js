export const ASSETS_BASE = 'assets';

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

// Configuração do editor de brilho
// - enabledColors: cores específicas que podem ser afetadas pelo brightness
// - preserveColors: cores que devem ser preservadas (não alteradas)
export const BRIGHTNESS_EDIT_CONFIG = {
  enabledColors: [
    // cor 1 - matiz: 24, sat: 232, lum: 186
    { hex: '#FDD08F', tolerance: 24 },
    // cor 2 - matiz: 10, sat: 157, lum: 153
    { hex: '#DF8567', tolerance: 24 },
    // cor 3 - matiz: 19, sat: 217, lum: 172
    { hex: '#F8B275', tolerance: 24 },
  ],
  preserveColors: [
    // branco puro
    { hex: '#FFFFFF', tolerance: 24 },
    // preto puro
    { hex: '#000000', tolerance: 24 },
  ]
};