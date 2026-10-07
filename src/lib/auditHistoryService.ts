import type { FullAuditState, RiskClassification, StoredAuditRecord } from '../types';
import { normalizeDiagnostic } from './assessmentModel';
import { normalizeAnswers } from './answersModel';

/**
 * Historial local de diagnósticos. Es una copia de trabajo en este navegador, no un sistema
 * de custodia: la conservación oficial corresponde al gestor de expedientes de la entidad.
 * Política de conservación: docs/custodia-historial.md.
 */

const STORAGE_KEY = 'auditor_ia_history';
const SCHEMA_VERSION = 3;

/** Máximo de registros (revisiones) que se conservan en el navegador. */
export const HISTORY_LIMIT = 50;
/** Tamaño máximo de un fichero de importación. */
export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;

const RISK_CLASSIFICATIONS: RiskClassification[] = [
  'prohibited',
  'high_risk',
  'transparency_risk',
  'minimal_risk',
  'not_ai_system',
  'requires_review',
];
const ENS_CATEGORIES = ['BASICA', 'MEDIA', 'ALTA'];

/** Error de custodia: el registro no se ha podido guardar y la interfaz debe decirlo. */
export class ErrorCustodia extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorCustodia';
  }
}

export interface SaveOutcome {
  record: StoredAuditRecord;
  /** Registros más antiguos retirados para respetar el límite (se informa, nunca en silencio). */
  retirados: StoredAuditRecord[];
}

export interface ImportOutcome {
  success: boolean;
  importedCount: number;
  duplicates: number;
  rejected: Array<{ index: number; motivo: string }>;
  retirados: number;
  error?: string;
}

const porFecha = (a: StoredAuditRecord, b: StoredAuditRecord) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Completa los campos de versiones anteriores sin recalcular nada. */
function normalizeRecord(r: StoredAuditRecord): StoredAuditRecord {
  return {
    ...r,
    auditId: r.auditId || r.id,
    revision: r.revision || 1,
    state: {
      ...r.state,
      answers: normalizeAnswers(r.state.answers),
      diagnostic: normalizeDiagnostic(r.state.diagnostic),
    },
  };
}

function readRaw(): StoredAuditRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function write(audits: StoredAuditRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  } catch (err) {
    const cuota = (err as { name?: string })?.name === 'QuotaExceededError';
    throw new ErrorCustodia(
      cuota
        ? 'No se ha podido guardar: el almacenamiento del navegador está lleno. Exporte una copia JSON y elimine registros antiguos.'
        : 'No se ha podido guardar: el almacenamiento del navegador no está disponible (modo privado o bloqueado).'
    );
  }
}

/** Mantiene los registros más recientes dentro del límite y devuelve los retirados. */
function applyLimit(audits: StoredAuditRecord[]): { kept: StoredAuditRecord[]; retirados: StoredAuditRecord[] } {
  const sorted = [...audits].sort(porFecha);
  return { kept: sorted.slice(0, HISTORY_LIMIT), retirados: sorted.slice(HISTORY_LIMIT) };
}

/**
 * Lista de registros guardados, de más reciente a más antiguo.
 */
export function getStoredAudits(): StoredAuditRecord[] {
  try {
    return readRaw()
      .filter((r) => validateRecord(r) === null)
      .map(normalizeRecord)
      .sort(porFecha);
  } catch (err) {
    console.error('Error al leer el historial de auditorías:', err);
    return [];
  }
}

/**
 * Guarda una revisión. Con `auditId` se añade como nueva revisión de ese expediente;
 * sin él se abre un expediente nuevo. Nunca sobrescribe revisiones anteriores.
 * Lanza ErrorCustodia si el navegador no permite guardar.
 */
export function saveAuditRecord(
  state: FullAuditState,
  llmCritique?: string,
  options: { auditId?: string } = {}
): SaveOutcome {
  if (!state.diagnostic) {
    throw new ErrorCustodia('No se puede guardar una auditoría sin diagnóstico.');
  }

  let audits: StoredAuditRecord[];
  try {
    audits = readRaw();
  } catch {
    throw new ErrorCustodia('El historial guardado está dañado y no se puede leer. Exporte lo que necesite y vacíelo.');
  }

  const now = new Date();
  const id = `audit-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
  const auditId = options.auditId || id;
  const previous = audits.filter((a) => (a.auditId || a.id) === auditId).map((a) => a.revision || 1);

  const record: StoredAuditRecord = {
    id,
    schemaVersion: SCHEMA_VERSION,
    auditId,
    revision: previous.length ? Math.max(...previous) + 1 : 1,
    origen: 'local',
    createdAt: now.toISOString(),
    appName: state.ingest.appName || 'Aplicación sin nombre',
    entityName: state.metadata.entityName || 'Administración Pública',
    serviceDepartment: state.metadata.serviceDepartment || '',
    riskClassification: state.diagnostic.riskClassification,
    riskLabel: state.diagnostic.riskLabel,
    ensCategory: state.diagnostic.ensCategory,
    isArticle63Derogation: Boolean(state.diagnostic.isArticle63Derogation),
    state: JSON.parse(JSON.stringify(state)),
    llmCritique,
  };

  const { kept, retirados } = applyLimit([record, ...audits]);
  write(kept);
  return { record, retirados };
}

/**
 * Elimina un registro (una revisión) por su identificador.
 */
export function deleteAuditRecord(id: string): StoredAuditRecord[] {
  write(readRaw().filter((a) => a.id !== id));
  return getStoredAudits();
}

/**
 * Borra todo el historial local.
 */
export function clearAuditHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    throw new ErrorCustodia('No se ha podido vaciar el historial: el almacenamiento del navegador no está disponible.');
  }
}

/**
 * Copia JSON del historial. Es un respaldo de trabajo: su contenido puede modificarse
 * fuera de la aplicación y no prueba la integridad de lo que contiene.
 */
export function exportHistoryJson(): string {
  const audits = getStoredAudits();
  return JSON.stringify(
    {
      format: 'auditor-ia-historial',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      count: audits.length,
      audits,
    },
    null,
    2
  );
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Comprueba la estructura y los valores de un registro. Devuelve el motivo del rechazo o null.
 */
export function validateRecord(item: unknown): string | null {
  if (!isObject(item)) return 'no es un objeto';
  if (typeof item.id !== 'string' || !item.id.trim() || item.id.length > 200) return 'identificador ausente o no válido';
  if (typeof item.createdAt !== 'string' || Number.isNaN(Date.parse(item.createdAt))) return 'fecha de creación no válida';
  if (typeof item.appName !== 'string' || !item.appName.trim()) return 'nombre de la aplicación ausente';
  if (typeof item.entityName !== 'string') return 'entidad ausente';
  if (!RISK_CLASSIFICATIONS.includes(item.riskClassification as RiskClassification)) {
    return `clasificación de riesgo inexistente («${String(item.riskClassification)}»)`;
  }
  if (!ENS_CATEGORIES.includes(item.ensCategory as string)) return 'categoría ENS no válida';
  if (item.auditId !== undefined && typeof item.auditId !== 'string') return 'expediente no válido';
  if (item.revision !== undefined && (!Number.isInteger(item.revision) || (item.revision as number) < 1)) return 'número de revisión no válido';
  if (item.llmCritique !== undefined && typeof item.llmCritique !== 'string') return 'comentario de IA no válido';

  const state = item.state;
  if (!isObject(state)) return 'estado de la auditoría ausente';
  if (!isObject(state.ingest) || typeof state.ingest.appName !== 'string') return 'datos de ingesta ausentes o no válidos';
  if (!isObject(state.answers)) return 'respuestas de la entrevista ausentes';
  if (!isObject(state.metadata)) return 'metadatos del expediente ausentes';
  if (!isObject(state.diagnostic)) return 'diagnóstico ausente';
  if (state.diagnostic.riskClassification !== item.riskClassification) {
    return 'la clasificación del registro no coincide con la de su diagnóstico';
  }
  return null;
}

/**
 * Importa registros desde una copia JSON. Valida tamaño, formato y cada registro;
 * informa de los rechazados, los duplicados y los retirados por el límite.
 */
export function importHistoryJson(jsonStr: string): ImportOutcome {
  const fail = (error: string): ImportOutcome => ({ success: false, importedCount: 0, duplicates: 0, rejected: [], retirados: 0, error });

  if (jsonStr.length > MAX_IMPORT_BYTES) {
    return fail(`El archivo supera el tamaño máximo admitido (${MAX_IMPORT_BYTES / (1024 * 1024)} MB).`);
  }
  let data: unknown;
  try {
    data = JSON.parse(jsonStr);
  } catch {
    return fail('El archivo no es un JSON válido.');
  }
  const incoming: unknown[] = Array.isArray(data) ? data : isObject(data) && Array.isArray(data.audits) ? data.audits : [];
  if (!incoming.length) return fail('El archivo no contiene auditorías.');

  let current: StoredAuditRecord[];
  try {
    current = readRaw();
  } catch {
    return fail('El historial guardado está dañado y no se puede leer.');
  }
  const currentIds = new Set(current.map((c) => c.id));
  const rejected: ImportOutcome['rejected'] = [];
  let duplicates = 0;
  const added: StoredAuditRecord[] = [];

  incoming.forEach((item, index) => {
    const motivo = validateRecord(item);
    if (motivo) {
      rejected.push({ index, motivo });
      return;
    }
    const record = item as StoredAuditRecord;
    if (currentIds.has(record.id)) {
      duplicates++;
      return;
    }
    currentIds.add(record.id);
    added.push({ ...record, auditId: record.auditId || record.id, revision: record.revision || 1, origen: 'importado' });
  });

  if (added.length === 0) {
    return { success: rejected.length === 0, importedCount: 0, duplicates, rejected, retirados: 0, ...(rejected.length ? { error: 'Ningún registro válido para importar.' } : {}) };
  }

  const { kept, retirados } = applyLimit([...current, ...added]);
  try {
    write(kept);
  } catch (err) {
    return fail((err as Error).message);
  }
  const importedCount = added.filter((a) => kept.some((k) => k.id === a.id)).length;
  return { success: true, importedCount, duplicates, rejected, retirados: retirados.length };
}

/** Registros guardados que no superan la validación y no se muestran (se informa en la interfaz). */
export function countUnreadableRecords(): number {
  try {
    return readRaw().filter((r) => validateRecord(r) !== null).length;
  } catch {
    return 0;
  }
}
