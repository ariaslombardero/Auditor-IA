import { beforeEach } from 'vitest';
import { installMemoryStorage } from './memoryStorage';

// Cada prueba arranca con un localStorage vacío en memoria (entorno Node sin navegador).
beforeEach(() => {
  installMemoryStorage();
});
