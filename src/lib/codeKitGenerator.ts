import type { AppIngestData, LegalEnrichmentAnswers, DiagnosticResult, CodeKit } from '../types';

export function generateCodeKit(
  ingest: AppIngestData,
  answers: LegalEnrichmentAnswers,
  diagnostic: DiagnosticResult
): CodeKit {
  const appTitle = ingest.appName || 'Aplicación';
  const role = answers.supervisionRole || 'personal público competente';

  const disclaimerEs = `Aviso Art. 50 AI Act (Reglamento UE 2024/1689): Este documento o contenido ha sido generado con auxilio de Inteligencia Artificial. Requiere la lectura crítica, verificación de fuentes y validación humana preceptiva por parte de ${role} antes de su uso oficial o efectos jurídicos.`;

  const disclaimerGl = `Aviso Art. 50 AI Act (Regulamento UE 2024/1689): Este documento ou contido foi xerado con auxilio de Intelixencia Artificial. Requírese a lectura crítica, cotexo de fontes e validación humana preceptiva por parte de ${role} antes do seu uso oficial ou efectos xurídicos.`;

  const reactBannerCode = `// Componente de Transparencia Obligatoria (Art. 50 RIA / Sector Público)
// Pégalo en tu aplicación React (${appTitle})

import React from 'react';

interface AiTransparencyBannerProps {
  idioma?: 'castellano' | 'galego';
  className?: string;
}

export const AiTransparencyBanner: React.FC<AiTransparencyBannerProps> = ({
  idioma = 'castellano',
  className = '',
}) => {
  return (
    <aside
      role="note"
      aria-label="Aviso de Inteligencia Artificial"
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        margin: '0.75rem 0',
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderLeft: '4px solid #2563eb',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        color: '#334155',
        lineHeight: 1.45,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1 }} aria-hidden="true">🤖</span>
      <div>
        <strong style={{ color: '#0f172a', fontWeight: 600 }}>
          {idioma === 'galego'
            ? 'Aviso Art. 50 AI Act (Regulamento UE 2024/1689):'
            : 'Aviso Art. 50 AI Act (Reglamento UE 2024/1689):'}
        </strong>{' '}
        {idioma === 'galego'
          ? '${disclaimerGl.replace(/'/g, "\\'")}'
          : '${disclaimerEs.replace(/'/g, "\\'")}'}
      </div>
    </aside>
  );
};
`;

  const htmlBannerCode = `<!-- Banner HTML de Transparencia (Art. 50 AI Act - Reglamento UE 2024/1689) -->
<div class="ai-transparency-banner" role="note" style="display:flex;align-items:flex-start;gap:12px;padding:12px 16px;margin:12px 0;background:#f8fafc;border:1px solid #cbd5e1;border-left:4px solid #2563eb;border-radius:6px;font-size:12px;color:#334155;line-height:1.45;font-family:sans-serif;">
  <span style="font-size:20px;line-height:1;">🤖</span>
  <div>
    <strong style="color:#0f172a;">Aviso Art. 50 AI Act (Reglamento UE 2024/1689):</strong>
    ${disclaimerEs}
  </div>
</div>
`;

  const docxFooterSnippet = `// Snippet para generación de documentos Word (.docx) con librería 'docx'
// Añade este pie de página a las secciones del documento:

import { Footer, Paragraph, TextRun, AlignmentType } from 'docx';

export function makeAiTransparencyFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Elaborado con auxilio de IA · Art. 50 Regulamento (UE) 2024/1689 · Validación humana preceptiva',
            size: 16, // 8pt
            color: '64748B',
            font: 'Times New Roman',
            italics: true,
          }),
        ],
      }),
    ],
  });
}

// Uso en Document():
// sections: [{
//   headers: { ... },
//   footers: { default: makeAiTransparencyFooter() },
//   children: [ ... ]
// }]
`;

  const envSecurityGuide = `# GUÍA DE SEGURIDAD Y VARIABLES DE ENTORNO (ENS RD 311/2022)
# Aplicación auditada: ${appTitle}
# Categoría ENS aplicable: ${diagnostic.ensCategory}

## 1. Regla de oro: credenciales fuera del cliente (ENS, [op.acc.5])
NUNCA expongas claves de API (como GEMINI_API_KEY u OPENROUTER_API_KEY) en el cliente o navegador.
En aplicaciones frontend (como Vite o React), las variables con prefijo 'VITE_' son visibles en el código compilado para cualquier usuario.

## 2. Configuración recomendada (.env.local)
Si el software requiere claves, asegúrate de añadir '.env.local' y '.env' a tu '.gitignore':

\`\`\`bash
# .gitignore
.env
.env.local
.env.*.local
\`\`\`

## 3. Despliegue Soberano On-Premise (Ollama / vLLM)
Para cumplir con la directriz de soberanía de datos del sector público español:
- Servidor local intranet: http://127.0.0.1:11434 (o IP de la red corporativa).
- Sin necesidad de API keys externas.
- Si el modelo se ejecuta realmente en servidores propios, los datos no salen de la red de la Administración.

\`\`\`bash
# Ejemplo de configuración para backend seguro:
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_MODEL=llama3.3
AI_TEMPERATURE=0.1
AI_AUDIT_LOG_PATH=/var/log/ai-audit/${appTitle.toLowerCase().replace(/\\s+/g, '-')}.log
\`\`\`

## 4. Registro de la actividad (ENS, [op.exp.8])
Registra en base de datos o archivo protegido:
- Timestamp (ISO 8601 UTC)
- Usuario / DNI / Certificado electrónico del funcionario que solicita la generación
- Hash SHA-256 del prompt y de la respuesta
- Versión exacta del modelo empleado
`;

  return {
    reactBannerCode,
    htmlBannerCode,
    docxFooterSnippet,
    envSecurityGuide,
    transparencyDisclaimerEs: disclaimerEs,
    transparencyDisclaimerGl: disclaimerGl,
  };
}
