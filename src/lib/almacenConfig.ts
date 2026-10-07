import type { ApiConfig } from '../types';
import { migrarConfig } from './migracionConfig';

/**
 * Custodia de la configuración del proveedor (y de su clave) en el navegador.
 * Por defecto solo dura lo que la pestaña (sessionStorage); se guarda en el equipo
 * (localStorage) únicamente si la persona marca «Recordar». Ver docs/adr/001-credenciales-inferencia.md.
 */

export const STORAGE_KEY = 'auditor_ia_api_config_v2';

/** Clave usada por versiones anteriores, que guardaban la configuración en claro en localStorage. */
export const LEGACY_STORAGE_KEY = 'auditor_ia_api_config';

function leer(almacen: Storage, clave: string): ApiConfig | null {
  try {
    const guardado = almacen.getItem(clave);
    return guardado ? migrarConfig(JSON.parse(guardado)) : null;
  } catch {
    return null;
  }
}

export function guardarConfig(config: ApiConfig | null, recordar: boolean): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (config) {
      (recordar ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(config));
    }
  } catch {
    // Almacenamiento no disponible: la configuración queda solo en memoria.
  }
}

export function cargarConfigInicial(): { config: ApiConfig | null; recordar: boolean } {
  const recordada = leer(localStorage, STORAGE_KEY);
  if (recordada) return { config: recordada, recordar: true };

  const deSesion = leer(sessionStorage, STORAGE_KEY);
  if (deSesion) return { config: deSesion, recordar: false };

  // La versión anterior guardaba la clave en el equipo sin consentimiento expreso:
  // se conserva solo durante esta sesión y se borra del equipo.
  const antigua = leer(localStorage, LEGACY_STORAGE_KEY);
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Sin acceso al almacenamiento
  }
  if (antigua) {
    guardarConfig(antigua, false);
    return { config: antigua, recordar: false };
  }
  return { config: null, recordar: false };
}
