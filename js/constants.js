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

// Configuração do editor de matiz (hue)
// - enabledParts: quais partes podem ser afetadas pelo hueRange
// - preserveColors: lista global de cores a preservar (ex.: branco dos olhos)
// - perPartPreserve: lista de cores preservadas por parte, com prioridade sobre a global
// - tolerance: tolerância (0-255) para considerar "igual" a uma cor
export const HUE_EDIT_CONFIG = {
  enabledParts: ['base','eyes','nose','mouth'], // partes que podem ser afetadas pelo hue
  preserveColors: [
    // branco puro
    { hex: '#FFFFFF', tolerance: 24 },
    // preto puro
    { hex: '#000000', tolerance: 24 },
  ],
  perPartPreserve: {
    eyes: [
      { hex: '#FFFFFF', tolerance: 28 }, // preserva "branco do olho"
      { hex: '#F9F9F9', tolerance: 24 }
    ],
    base: [
      // adicione tons específicos que deseja congelar na pele
    ],
    hair: [
      // geralmente cabelo pode ser todo alterado; deixe vazio ou ajuste conforme necessário
    ]
  }
};