/**
 * Calendario de aplicación del RIA (Reglamento (UE) 2024/1689, modificado por el Reglamento (UE) 2026/1744).
 * Fuentes cotejadas en docs/auditoria/registro-fuentes.md. La clasificación de un sistema no depende de
 * estas fechas: solo la exigibilidad de sus obligaciones.
 */

export interface CalendarEntry {
  id: string;
  descripcion: string;
  fecha: string; // ISO
  fuente: string;
}

export const REGULATORY_CALENDAR = {
  art5: {
    id: 'art5',
    descripcion: 'Prácticas prohibidas (Art. 5) y alfabetización en IA (Art. 4)',
    fecha: '2025-02-02',
    fuente: 'Art. 113 RIA, modificado por el Reglamento (UE) 2026/1744',
  },
  art50: {
    id: 'art50',
    descripcion: 'Obligaciones de transparencia (Art. 50) y fecha general de aplicación',
    fecha: '2026-08-02',
    fuente: 'Art. 113 RIA',
  },
  art5NuevasProhibiciones: {
    id: 'art5NuevasProhibiciones',
    descripcion: 'Art. 5.1, letras b bis) y b ter)',
    fecha: '2026-12-02',
    fuente: 'Art. 113 RIA, modificado por el Reglamento (UE) 2026/1744',
  },
  altoRiesgoAnexoIII: {
    id: 'altoRiesgoAnexoIII',
    descripcion: 'Capítulo III, secciones 1 a 3, para los sistemas del Anexo III',
    fecha: '2027-12-02',
    fuente: 'Art. 113 RIA, modificado por el Reglamento (UE) 2026/1744',
  },
  altoRiesgoAnexoI: {
    id: 'altoRiesgoAnexoI',
    descripcion: 'Capítulo III, secciones 1 a 3, para los sistemas del Anexo I',
    fecha: '2028-08-02',
    fuente: 'Art. 113 RIA, modificado por el Reglamento (UE) 2026/1744',
  },
} satisfies Record<string, CalendarEntry>;

/** Fecha de referencia para valorar la exigibilidad (por defecto, hoy). */
export function referenceDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Texto sobre la exigibilidad de una obligación en la fecha de referencia. */
export function applicabilityNote(fechaExigible: string, today: string = referenceDate()): string {
  const fecha = new Date(fechaExigible).toLocaleDateString('es-ES');
  return fechaExigible <= today
    ? `Exigible desde el ${fecha}.`
    : `Aún no exigible: lo será desde el ${fecha}. Conviene prepararla antes de la puesta en servicio.`;
}
