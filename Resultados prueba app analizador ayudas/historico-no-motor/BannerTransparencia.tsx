import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

/**
 * Cartel de Transparencia Activa Preceptivo (Art. 50 Reglamento UE 2024/1689)
 * Para "Analizador de convocatorias de ayudas y subvenciones"
 */
export const BannerTransparencia: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Aviso de Asistencia por Inteligencia Artificial"
      style={{
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '0.5rem',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.875rem',
      }}
    >
      <ShieldCheck style={{ width: 22, height: 22, color: '#1d4ed8', flexShrink: 0, marginTop: 2 }} />
      <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5 }}>
        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
          Sistema de Auxilio Técnico Instrumental con Inteligencia Artificial (Art. 50 RIA)
        </strong>
        Este software genera borradores técnicos, fichas resumen y puntuaciones estimadas de encaje de subvenciones mediante IA generativa.
        Conforme al <strong>Art. 41 de la Ley 40/2015</strong> y el <strong>Art. 14 del Reglamento (UE) 2024/1689</strong>, los resultados tienen carácter orientativo y no constituyen actos administrativos. La verificación de plazos, requisitos y resoluciones definitivas corresponde preceptivamente al funcionario instructor responsable.
      </div>
    </div>
  );
};

export default BannerTransparencia;
