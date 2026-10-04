import React from 'react';
import {
  X,
  Scale,
  ShieldCheck,
  Lock,
  Building,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Bot,
  HelpCircle,
} from 'lucide-react';
import type { AppIdioma } from '../types';

interface ExecutivePurposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  idioma: AppIdioma;
}

export const ExecutivePurposeModal: React.FC<ExecutivePurposeModalProps> = ({
  isOpen,
  onClose,
  idioma,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 120,
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '56rem',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-md)',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <HelpCircle style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: 'white' }}>
                ¿Por qué es obligatoria esta auditoría?
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                Guía ejecutiva para directivos, responsables de servicio, DPDs y CISOs sobre la gobernanza de la IA.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'white',
              cursor: 'pointer',
              padding: '0.4rem',
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* El Escenario Real (Storytelling sencillo) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-md)',
            padding: '1.125rem 1.25rem',
          }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot style={{ width: 18, height: 18, color: '#0284c7' }} />
              El Escenario: Quieres poner en marcha un asistente o herramienta con IA
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              Imagina que en tu organismo o empresa quieres implantar un <strong>chatbot de atención al ciudadano</strong>, un <strong>asistente para resumir expedientes</strong> o una <strong>herramienta para clasificar solicitudes de subvenciones</strong>.
              <br /><br />
              No basta con conectar una API o instalar un modelo: <strong>el marco regulatorio europeo y español prohíbe poner en producción sistemas de IA sin un expediente administrativo formal</strong> que acredite que no vulnera derechos, que no toma decisiones a ciegas y que sus datos están blindados.
            </p>
          </div>

          {/* El Cuarteto Normativo Explicado de Forma Sencilla */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Las 4 Leyes que tu IA debe cumplir obligatoriamente:
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
              
              {/* Ley 1: RIA */}
              <div style={{ border: '1px solid #bae6fd', background: '#f0f9ff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <Scale style={{ width: 18, height: 18, color: '#0284c7' }} />
                  <strong style={{ fontSize: '0.875rem', color: '#0369a1' }}>1. AI Act (Reglamento UE 2024/1689)</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#0c4a6e', lineHeight: 1.5, margin: 0 }}>
                  Exige clasificar el nivel de riesgo del sistema. Si interactúa con personas físicas, debes avisarles de que hablan con una máquina (Art. 50) y garantizar la <strong>supervisión humana efectiva</strong> (Art. 14).
                </p>
              </div>

              {/* Ley 2: RGPD */}
              <div style={{ border: '1px solid #bbf7d0', background: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <ShieldCheck style={{ width: 18, height: 18, color: '#16a34a' }} />
                  <strong style={{ fontSize: '0.875rem', color: '#15803d' }}>2. RGPD y LOPDGDD 3/2018</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#14532d', lineHeight: 1.5, margin: 0 }}>
                  El Artículo 22 prohíbe adoptar actos administrativos o resoluciones que afecten a derechos basándose <em>únicamente</em> en algoritmos. Debe inscribirse en el Registro de Tratamientos (RAT) y realizarse una EIPD.
                </p>
              </div>

              {/* Ley 3: Ley 40/2015 */}
              <div style={{ border: '1px solid #fed7aa', background: '#fff7ed', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <Building style={{ width: 18, height: 18, color: '#ea580c' }} />
                  <strong style={{ fontSize: '0.875rem', color: '#c2410c' }}>3. Ley 40/2015 (Régimen Jurídico)</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#7c2d12', lineHeight: 1.5, margin: 0 }}>
                  El Artículo 41 exige delimitar si la IA es una <strong>"actuación automatizada"</strong> (que requiere decreto de programación) o mero <strong>"auxilio técnico instrumental"</strong> para el funcionario tramitador.
                </p>
              </div>

              {/* Ley 4: ENS RD 311/2022 */}
              <div style={{ border: '1px solid #ddd6fe', background: '#faf5ff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <Lock style={{ width: 18, height: 18, color: '#7c3aed' }} />
                  <strong style={{ fontSize: '0.875rem', color: '#6d28d9' }}>4. Esquema Nacional de Seguridad (ENS)</strong>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#4c1d95', lineHeight: 1.5, margin: 0 }}>
                  El <strong>ENS (RD 311/2022)</strong> exige proteger las credenciales ([op.acc.5]), registrar la actividad ([op.exp.8]) y proteger los servicios en la nube ([op.nub.1]): las claves de API no deben exponerse en el navegador.
                </p>
              </div>

            </div>
          </div>

          {/* ¿Qué hace exactamente esta aplicación? */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #0284c7',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0369a1', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck style={{ width: 20, height: 20, color: '#0284c7' }} />
              ¿Qué hace esta aplicación por ti? (El resultado en 5 minutos)
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: '0 0 0.875rem 0' }}>
              En lugar de contratar una consultoría externa de semanas, esta aplicación automatiza todo el proceso de auditoría y te entrega:
            </p>

            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#1e293b' }}>
              <li>
                <strong>1. El Expediente Oficial de Conformidad en Word (.docx)</strong>: Formateado con membrete corporativo, articulado legal contrastado con el BOE/DOUE y casillas para las 3 firmas obligatorias: <em>Responsable Funcional, CISO y Delegado de Protección de Datos</em>.
              </li>
              <li>
                <strong>2. Kit de Código de Blindaje</strong>: Banners de transparencia según el Art. 50 RIA y módulos de logs listos para copiar y pegar en tu proyecto.
              </li>
              <li>
                <strong>3. Evaluación de Impacto de la AEPD (EIPD)</strong>: Documento pericial de mitigación de riesgos para salvaguarda de tu organismo.
              </li>
              <li>
                <strong>4. Simulador de Ataques y Blindaje (Red Teaming)</strong>: Pruebas de inyección de prompts y jailbreak para comprobar que tu IA es resistente.
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--brand-paper)',
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
          >
            Entendido, empezar auditoría
          </button>
        </div>
      </div>
    </div>
  );
};
