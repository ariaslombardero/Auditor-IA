import type { FullAuditState, StoredAuditRecord } from '../types';

const STORAGE_KEY = 'auditor_ia_history';
const MAX_HISTORY_ITEMS = 50;

/**
 * Obtiene la lista completa de auditorías guardadas en el navegador,
 * ordenadas de más reciente a más antigua.
 */
export function getStoredAudits(): StoredAuditRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return [];
  } catch (err) {
    console.error('Error al leer historial de auditorías de localStorage:', err);
    return [];
  }
}

/**
 * Guarda o actualiza un expediente de auditoría en el historial local.
 */
export function saveAuditRecord(state: FullAuditState, llmCritique?: string): StoredAuditRecord | null {
  if (!state.diagnostic) {
    console.warn('No se puede guardar una auditoría sin diagnóstico previo');
    return null;
  }

  const audits = getStoredAudits();
  const now = new Date();
  const appName = state.ingest.appName || 'Aplicación sin nombre';
  const entityName = state.metadata.entityName || 'Administración Pública';

  // Buscar si ya existe una auditoría con el mismo nombre y entidad creada recientemente (últimos 30 minutos)
  const existingIdx = audits.findIndex((a) => {
    if (a.appName.toLowerCase() === appName.toLowerCase() && a.entityName.toLowerCase() === entityName.toLowerCase()) {
      const diffMs = now.getTime() - new Date(a.createdAt).getTime();
      return diffMs < 30 * 60 * 1000;
    }
    return false;
  });

  const record: StoredAuditRecord = {
    id: existingIdx >= 0 ? audits[existingIdx].id : `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: now.toISOString(),
    appName,
    entityName,
    serviceDepartment: state.metadata.serviceDepartment || '',
    riskClassification: state.diagnostic.riskClassification,
    riskLabel: state.diagnostic.riskLabel,
    ensCategory: state.diagnostic.ensCategory,
    isArticle63Derogation: Boolean(state.diagnostic.isArticle63Derogation),
    state: JSON.parse(JSON.stringify(state)),
    llmCritique,
  };

  if (existingIdx >= 0) {
    audits[existingIdx] = record;
  } else {
    audits.unshift(record);
  }

  // Limitar al máximo configurado
  const trimmed = audits.slice(0, MAX_HISTORY_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Error al guardar en localStorage (posible cuota excedida):', err);
  }

  return record;
}

/**
 * Elimina un registro por su ID único.
 */
export function deleteAuditRecord(id: string): StoredAuditRecord[] {
  const audits = getStoredAudits().filter((a) => a.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  } catch (err) {
    console.error('Error al eliminar registro de localStorage:', err);
  }
  return audits;
}

/**
 * Borra todo el historial local.
 */
export function clearAuditHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error al vaciar historial de auditorías:', err);
  }
}

/**
 * Exporta el historial completo como una cadena JSON formateada para descarga de respaldo.
 */
export function exportHistoryJson(): string {
  const audits = getStoredAudits();
  return JSON.stringify(
    {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      count: audits.length,
      audits,
    },
    null,
    2
  );
}

/**
 * Importa auditorías desde un archivo JSON de respaldo.
 */
export function importHistoryJson(jsonStr: string): { success: boolean; importedCount: number; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const incoming: StoredAuditRecord[] = Array.isArray(data) ? data : Array.isArray(data?.audits) ? data.audits : [];
    if (!incoming.length) {
      return { success: false, importedCount: 0, error: 'El archivo JSON no contiene auditorías válidas.' };
    }

    const current = getStoredAudits();
    const currentIds = new Set(current.map((c) => c.id));
    let added = 0;

    for (const item of incoming) {
      if (item && item.appName && item.state) {
        if (!currentIds.has(item.id)) {
          current.push(item);
          currentIds.add(item.id);
          added++;
        }
      }
    }

    current.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, MAX_HISTORY_ITEMS)));

    return { success: true, importedCount: added };
  } catch (err: any) {
    return { success: false, importedCount: 0, error: err?.message || 'Error al procesar el archivo JSON.' };
  }
}
