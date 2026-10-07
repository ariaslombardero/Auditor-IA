import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Módulo de Auditoría y Trazabilidad Criptográfica
 * Conforme a la Guía CCN-STIC 884D (Medida IA-08) y ENS RD 311/2022
 */
export interface AuditRecord {
  timestamp: string;
  requestId: string;
  userId: string;
  action: string;
  model: string;
  promptHash: string;
  responseHash: string;
  verifiedHuman: boolean;
}

const LOG_FILE = path.resolve('audit_ai_events.log');

export function logAiEvent(
  userId: string,
  action: string,
  model: string,
  promptText: string,
  responseText: string,
  verifiedHuman = true
): void {
  const promptHash = crypto.createHash('sha256').update(promptText).digest('hex');
  const responseHash = crypto.createHash('sha256').update(responseText).digest('hex');

  const record: AuditRecord = {
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID(),
    userId,
    action,
    model,
    promptHash,
    responseHash,
    verifiedHuman,
  };

  const line = JSON.stringify(record) + '\n';
  fs.appendFileSync(LOG_FILE, line, { encoding: 'utf8' });
}
