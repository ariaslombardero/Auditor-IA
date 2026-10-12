import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { appliesCodeKit, appliesEipd, appliesModelTests } from '../stepAvailability';
import { bulkAcceptable, classifySuggestion } from '../interviewSuggestions';
import { questionById } from '../interviewCatalog';
import { buildAepdCriteria, buildEipdCriteria } from '../eipdCriteria';
import { answeredAnswers, makeAnswers, makeIngest, makeState } from '../../test/fixtures';
import { REFERENCE_CASES } from '../../test/referenceCases';
import { aiUsageHint } from '../documentHints';

/**
 * Fase 6 · Prueba con Oasis-Madrid (aplicación sin IA): la herramienta debe adaptarse al caso,
 * no convertir una cita en una conclusión jurídica y no prometer lo que no hace.
 */

describe('Adaptación al caso (UX-03, EIPD-08)', () => {
  it('UX-03 · si se declara que no es IA, no se ofrecen el kit de código ni las pruebas del modelo', () => {
    expect(appliesCodeKit(answeredAnswers({ infersOutputs: 'no' }))).toBe(false);
    expect(appliesModelTests(answeredAnswers({ infersOutputs: 'no' }))).toBe(false);
    expect(appliesCodeKit(answeredAnswers({ infersOutputs: 'si' }))).toBe(true);
    expect(appliesModelTests(answeredAnswers({ infersOutputs: 'si' }))).toBe(true);
    // Sin contestar, se muestra todo: «no lo sé» nunca equivale a «no»
    expect(appliesCodeKit(makeAnswers())).toBe(true);
    expect(appliesModelTests(makeAnswers())).toBe(true);
  });

  it('EIPD-08 · sin datos personales no procede la EIPD; con «no lo sé», sí se muestra', () => {
    expect(appliesEipd(answeredAnswers({ processesPersonalData: 'no' }))).toBe(false);
    expect(appliesEipd(answeredAnswers({ processesPersonalData: 'si' }))).toBe(true);
    expect(appliesEipd(makeAnswers())).toBe(true);
  });
});

describe('Sugerencias sobre calificaciones decisivas (SUG-04)', () => {
  const ingest = makeIngest('Navegador de rutas frescas', {
    readmeContent: 'Interpolación IDW como técnica de aprendizaje automático no paramétrico aplicada a las lecturas de estaciones meteorológicas municipales. El sistema no realiza actuaciones administrativas automatizadas.',
  });

  it('una sugerencia sobre el Art. 3.1 es siempre «inferida», aunque la cita exista', () => {
    for (const valor of ['si', 'no']) {
      const s = classifySuggestion(
        questionById('infersOutputs')!,
        valor,
        'Interpolación IDW como técnica de aprendizaje automático no paramétrico',
        'La documentación lo describe como aprendizaje automático',
        ingest
      )!;
      expect(s.tipo, valor).toBe('inferida');
      expect(bulkAcceptable([s])).toHaveLength(0);
    }
  });

  it('también lo son las que deciden si hay actuación administrativa (Art. 41)', () => {
    for (const id of ['producesAdministrativeActs', 'directHumanIntervention']) {
      const s = classifySuggestion(questionById(id)!, 'no', 'El sistema no realiza actuaciones administrativas automatizadas', 'x', ingest)!;
      expect(s.tipo, id).toBe('inferida');
    }
  });

  it('la ayuda del Art. 3.1 aclara que una fórmula fija (por ejemplo, una interpolación) no es IA', () => {
    const ayuda = questionById('infersOutputs')!.ayuda!;
    expect(`${ayuda.queSignifica} ${ayuda.ejemploNo}`).toMatch(/interpolaci/i);
  });
});

describe('Aplicaciones que no producen actos administrativos (ADM-01)', () => {
  const informativa = (over: Parameters<typeof answeredAnswers>[0] = {}) =>
    makeState(
      'Navegador de confort térmico con datos abiertos',
      answeredAnswers({ infersOutputs: 'no', producesAdministrativeActs: 'no', directHumanIntervention: 'no', humanOversightLevel: 'fully_automated', ...over }),
      { isAiSystem: false }
    );

  it('el Art. 41 de la Ley 40/2015 no aplica y no se exige la resolución del Art. 41.2', () => {
    const d = informativa().diagnostic!;
    const art41 = d.requirements.find((r) => r.id === 'LEY-40-2015-ART-41')!;
    expect(art41.aplicabilidad).toBe('no_aplica');
    expect(art41.resultado).toBe('no_evaluado');
    expect(art41.accionRequerida).not.toMatch(/Aprobar la resolución/);
    expect(d.redFlags.some((f) => f.includes('Ausencia de Control Humano'))).toBe(false);
    expect(d.riskClassification).toBe('not_ai_system');
  });

  it('la pregunta sobre la intervención de un empleado público se oculta y no genera contradicciones', () => {
    const state = informativa({ humanOversightLevel: 'pre_execution' });
    expect(questionById('directHumanIntervention')!.visible(state.answers)).toBe(false);
    expect(state.diagnostic!.riskClassification).toBe('not_ai_system');
  });

  it('sin actos administrativos no hay decisión automatizada con efectos jurídicos en los criterios de EIPD', () => {
    const state = informativa({ processesPersonalData: 'si' });
    expect(buildEipdCriteria(state).find((c) => c.id === 'C2')!.estado).toBe('no');
    expect(buildAepdCriteria(state).find((c) => c.id === 'AEPD-2')!.estado).toBe('no');
  });

  it('si produce actos y no interviene un empleado público, sigue siendo actuación automatizada', () => {
    const d = makeState('Emisión automática de certificados', answeredAnswers({ producesAdministrativeActs: 'si', directHumanIntervention: 'no', humanOversightLevel: 'fully_automated' })).diagnostic!;
    const art41 = d.requirements.find((r) => r.id === 'LEY-40-2015-ART-41')!;
    expect(art41.aplicabilidad).not.toBe('no_aplica');
    expect(art41.accionRequerida).toMatch(/Aprobar la resolución/);
  });
});

describe('Caso real Oasis-Madrid', () => {
  it('la documentación dice «aprendizaje automático», pero con la respuesta de la persona queda fuera del RIA y sin Art. 41', () => {
    const state = REFERENCE_CASES.find((c) => c.id === 'oasis-madrid')!.state();
    const d = state.diagnostic!;
    expect(aiUsageHint(state.ingest)?.evidence).toMatch(/aprendizaje automatico/);
    expect(d.riskClassification).toBe('not_ai_system');
    expect(d.requirements.find((r) => r.id === 'LEY-40-2015-ART-41')!.aplicabilidad).toBe('no_aplica');
    expect(appliesCodeKit(state.answers)).toBe(false);
    expect(appliesModelTests(state.answers)).toBe(false);
    // Los datos personales siguen por valorar: la EIPD no se descarta
    expect(appliesEipd(state.answers)).toBe(true);
  });
});

describe('La interfaz no promete lo que no hace (DOC-16)', () => {
  const fuentes: string[] = [];
  const recorrer = (dir: string) => {
    for (const nombre of readdirSync(dir)) {
      const ruta = join(dir, nombre);
      if (statSync(ruta).isDirectory()) {
        if (nombre !== '__tests__' && nombre !== 'test') recorrer(ruta);
      } else if (/\.(ts|tsx)$/.test(nombre)) {
        fuentes.push(ruta);
      }
    }
  };
  recorrer(resolve(process.cwd(), 'src'));

  it.each([
    ['«Conforme a la Guía Oficial» de la AEPD', /Conforme a la Gu[ií]a Oficial/i],
    ['un generador de «Código Seguro de Verificación»', /Generar Huella Digital|C[óo]digo Seguro de Verificaci[óo]n \(CSV\)/i],
    ['«red teaming en vivo» o «sellado criptográfico»', /red teaming en vivo|sellado criptogr[áa]fico/i],
    ['ejemplos con versiones de modelo que envejecen', /Gemini 2\.5|gemini-2\.5|GPT-4o|Llama 3\.3/],
  ])('ningún texto de la aplicación contiene %s', (_, patron) => {
    const encontrados = fuentes.filter((f) => patron.test(readFileSync(f, 'utf8')));
    expect(encontrados).toEqual([]);
  });
});
