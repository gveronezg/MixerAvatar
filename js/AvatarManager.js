import { CATEGORIES } from './constants.js';
import { imageExists } from './imageLoader.js';

export class AvatarManager {
  constructor() {
    this.parts = [];
    this.activePartIndex = 0;
    this.skinToneIndex = 0;
  }

  async initialize() {
    this.parts = [];

    for (const category of CATEGORIES) {
      const options = [];
      const maxProbe = Math.max(1, category.probeMax || 38);
      
      for (let i = 1; i <= maxProbe; i++) {
        const url = `assets/${category.prefix}${String(i).padStart(2, '0')}.png`;
        try {
          await imageExists(url);
          options.push(url);
        } catch {
          // Image doesn't exist, continue
        }
      }
      
      this.parts.push({
        key: category.key,
        label: category.label,
        options,
        currentIndex: 0
      });
    }
  }

  getActivePart() {
    return this.parts[this.activePartIndex];
  }

  setActivePart(index) {
    if (index >= 0 && index < this.parts.length) {
      this.activePartIndex = index;
    }
  }

  getCurrentOption() {
    const part = this.getActivePart();
    return part ? part.options[part.currentIndex] : null;
  }

  nextOption() {
    const part = this.getActivePart();
    if (part && part.options.length > 0) {
      part.currentIndex = (part.currentIndex + 1) % part.options.length;
    }
  }

  previousOption() {
    const part = this.getActivePart();
    if (part && part.options.length > 0) {
      part.currentIndex = (part.currentIndex - 1 + part.options.length) % part.options.length;
    }
  }

  setSkinTone(index) {
    if (index >= 0 && index < 4) {
      this.skinToneIndex = index;
    }
  }

  getSkinTone() {
    return this.skinToneIndex;
  }
}
