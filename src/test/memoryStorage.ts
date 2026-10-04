/**
 * Sustituto en memoria de localStorage para las pruebas en Node.
 * `failWrites` simula una cuota excedida o un almacenamiento bloqueado.
 */
export class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  failWrites = false;

  get length(): number {
    return this.data.size;
  }

  clear(): void {
    this.data.clear();
  }

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) {
      throw new DOMException('QuotaExceededError (simulado)', 'QuotaExceededError');
    }
    this.data.set(key, String(value));
  }
}

export function installMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: new MemoryStorage(), configurable: true, writable: true });
  return storage;
}
