import type { QuestionHelp } from './interviewCatalog';

/**
 * Ayuda en lenguaje sencillo para cada pregunta de la entrevista: qué significa,
 * un ejemplo de «sí», un ejemplo de «no» y la norma. Los ejemplos orientan; no sustituyen
 * la valoración de la asesoría jurídica, del Responsable de Seguridad ni del DPD.
 */

const RIA = 'Reglamento (UE) 2024/1689 de Inteligencia Artificial (RIA)';

const ENS_NIVELES = 'Bajo: el daño sería limitado. Medio: sería grave. Alto: sería muy grave. La categoría del sistema es la del nivel más alto de las cinco dimensiones.';

export const INTERVIEW_HELP: Record<string, QuestionHelp> = {
  infersOutputs: {
    queSignifica: 'Pregunta si el sistema «aprende» o «razona» a partir de los datos para producir sus resultados, en lugar de seguir solo reglas que alguien programó paso a paso. Es lo que distingue un sistema de IA de un programa informático tradicional.',
    ejemploSi: 'Un asistente que redacta resúmenes con un modelo de lenguaje (Gemini, Llama, GPT…), o un clasificador entrenado con ejemplos.',
    ejemploNo: 'Una aplicación que calcula plazos o valida formularios con reglas fijas («si falta el DNI, mostrar un aviso»).',
    norma: `${RIA}, Art. 3.1`,
  },

  'prohibitedPractices.subliminal_manipulation': {
    queSignifica: 'Técnicas que actúan por debajo de la conciencia de la persona, o deliberadamente manipuladoras o engañosas, que alteran de forma importante su comportamiento y le causan, o pueden causarle, un perjuicio considerable.',
    ejemploSi: 'Un asistente diseñado para presionar con mensajes engañosos a la ciudadanía para que renuncie a una ayuda.',
    ejemploNo: 'Un asistente que informa de forma clara y neutral sobre un trámite.',
    norma: `${RIA}, Art. 5.1.a`,
  },
  'prohibitedPractices.vulnerability_exploitation': {
    queSignifica: 'Aprovechar la edad, la discapacidad o la situación social o económica de las personas para alterar su comportamiento de forma que les cause un perjuicio considerable.',
    ejemploSi: 'Un sistema que detecta a personas mayores con dificultades y les dirige mensajes para que acepten condiciones desfavorables.',
    ejemploNo: 'Un sistema que ofrece la información en lectura fácil para personas con discapacidad intelectual.',
    norma: `${RIA}, Art. 5.1.b`,
  },
  'prohibitedPractices.intimate_imagery_generation': {
    queSignifica: 'Generar o manipular imágenes, vídeos o audios íntimos realistas de personas identificables sin su consentimiento. Prohibición añadida por el Reglamento (UE) 2026/1744, aplicable desde el 2/12/2026.',
    ejemploSi: 'Una herramienta capaz de crear desnudos falsos a partir de fotos de personas reales.',
    ejemploNo: 'Un asistente que solo genera textos administrativos, o imágenes sin personas reales identificables.',
    norma: `${RIA}, Art. 5.1.b bis (Reglamento (UE) 2026/1744)`,
  },
  'prohibitedPractices.child_sexual_abuse_material': {
    queSignifica: 'Generar o manipular material de abuso sexual infantil. Prohibición añadida por el Reglamento (UE) 2026/1744, aplicable desde el 2/12/2026.',
    ejemploSi: 'Cualquier sistema capaz de producir ese material.',
    ejemploNo: 'Un asistente de redacción, un clasificador documental o un chatbot informativo con salvaguardas que lo impiden.',
    norma: `${RIA}, Art. 5.1.b ter (Reglamento (UE) 2026/1744)`,
  },
  'prohibitedPractices.social_scoring': {
    queSignifica: 'Puntuar o clasificar a las personas según su comportamiento social o sus características personales, cuando esa puntuación lleva a tratarlas peor en ámbitos que no tienen relación con los datos de origen, o de forma desproporcionada.',
    ejemploSi: 'Puntuar a los vecinos por su «civismo» y usar esa puntuación para retrasar sus trámites o negarles ayudas.',
    ejemploNo: 'Comprobar si una solicitud cumple los requisitos objetivos de una convocatoria.',
    norma: `${RIA}, Art. 5.1.c`,
  },
  'prohibitedPractices.predictive_policing_individual': {
    queSignifica: 'Evaluar el riesgo de que una persona concreta cometa un delito basándose únicamente en su perfil o en sus rasgos de personalidad, sin hechos objetivos y verificables.',
    ejemploSi: 'Un sistema que asigna a cada persona un «riesgo de delinquir» según su barrio, edad y nacionalidad.',
    ejemploNo: 'Un sistema que ayuda a analizar hechos ya denunciados y documentados.',
    norma: `${RIA}, Art. 5.1.d`,
  },
  'prohibitedPractices.untargeted_facial_scraping': {
    queSignifica: 'Crear o ampliar bases de datos de reconocimiento facial recopilando de forma indiscriminada imágenes de rostros de internet o de cámaras de videovigilancia.',
    ejemploSi: 'Descargar fotos de redes sociales para entrenar un sistema de reconocimiento facial.',
    ejemploNo: 'Un sistema que no trata imágenes de rostros.',
    norma: `${RIA}, Art. 5.1.e`,
  },
  'prohibitedPractices.emotion_recognition_workplace_education': {
    queSignifica: 'Deducir las emociones de las personas en el trabajo o en centros educativos, salvo por motivos médicos o de seguridad.',
    ejemploSi: 'Analizar la voz o la cara de los empleados para medir su estrés o su satisfacción.',
    ejemploNo: 'Un asistente que responde preguntas sin analizar el estado emocional de quien lo usa.',
    norma: `${RIA}, Art. 5.1.f`,
  },
  'prohibitedPractices.biometric_categorization_sensitive': {
    queSignifica: 'Usar datos biométricos (cara, voz, huellas…) para clasificar a las personas deduciendo su raza, opiniones políticas, afiliación sindical, creencias religiosas o filosóficas, o su vida u orientación sexual.',
    ejemploSi: 'Deducir el origen étnico de una persona a partir de su fotografía.',
    ejemploNo: 'Un sistema que no usa datos biométricos.',
    norma: `${RIA}, Art. 5.1.g`,
  },
  'prohibitedPractices.realtime_remote_biometric_identification': {
    queSignifica: 'Identificar a distancia y en tiempo real a personas en espacios públicos (por ejemplo, con cámaras y reconocimiento facial) con fines policiales, salvo las excepciones tasadas del Reglamento.',
    ejemploSi: 'Cámaras en la calle que reconocen a los transeúntes y los comparan con una lista policial.',
    ejemploNo: 'Un sistema documental o un chatbot, que no identifican a nadie a distancia.',
    norma: `${RIA}, Art. 5.1.h`,
  },

  annexIIIArea: {
    queSignifica: 'El Anexo III enumera los usos de alto riesgo. Los más habituales en la Administración son: empleo (selección de personal, evaluación de empleados), educación (admisión o evaluación de alumnos), prestaciones esenciales (valorar si una persona tiene derecho a una ayuda social), justicia, migración y biometría. Si el sistema no se usa en ninguno, elija «Ninguno».',
    ejemploSi: 'Una herramienta que ayuda a baremar los méritos de los aspirantes de una oposición: ámbito «Empleo».',
    ejemploNo: 'Un asistente que resume convocatorias de subvenciones para el personal técnico: «Ninguno».',
    norma: `${RIA}, Art. 6.2 y Anexo III`,
  },
  essentialPublicAssistance: {
    queSignifica: 'El punto 5.a) del Anexo III solo cubre los sistemas que valoran si una persona física tiene derecho a prestaciones y servicios esenciales de asistencia pública (o que los conceden, reducen, retiran o reclaman). No toda ayuda o subvención lo es.',
    ejemploSi: 'Valorar si una familia cumple los requisitos de una renta mínima o de una ayuda de emergencia social.',
    ejemploNo: 'Subvenciones a ayuntamientos, empresas o asociaciones; un buscador de convocatorias.',
    norma: `${RIA}, Anexo III, punto 5.a)`,
  },
  performsProfiling: {
    queSignifica: 'Perfilar es usar datos personales para evaluar aspectos de una persona: su rendimiento, su situación económica, su fiabilidad, su comportamiento… En los ámbitos del Anexo III, si hay perfilado el sistema es siempre de alto riesgo.',
    ejemploSi: 'Puntuar a los candidatos según sus méritos y experiencia, o predecir qué solicitantes incumplirán sus obligaciones.',
    ejemploNo: 'Comprobar si una solicitud incluye el DNI y el certificado exigidos, o resumir el texto de una convocatoria.',
    norma: `${RIA}, Art. 6.3 (último párrafo) y Art. 3.52, que remite al Art. 4.4 del RGPD`,
  },
  article63Condition: {
    queSignifica: 'Un sistema del Anexo III puede no ser de alto riesgo si solo hace una tarea auxiliar que no influye de forma importante en la decisión. Basta con que se dé una de estas condiciones: a) una tarea de procedimiento limitada; b) mejorar el resultado de un trabajo humano ya hecho; c) detectar patrones o desviaciones sin sustituir la valoración humana; d) una tarea preparatoria de la evaluación.',
    ejemploSi: 'a) Clasificar los documentos de cada solicitud por tipo. b) Corregir la redacción de un informe ya hecho. c) Señalar para revisión las notas atípicas de un tribunal. d) Ordenar la documentación antes de que la evalúe el tribunal.',
    ejemploNo: '«No concurre ninguna»: el sistema propone directamente la puntuación de cada aspirante.',
    norma: `${RIA}, Art. 6.3 y 6.4`,
  },
  article63Facts: {
    queSignifica: 'Describa con hechos concretos qué hace el sistema y por qué encaja en la condición elegida. El texto se incorpora literalmente a la justificación, que el proveedor debe documentar antes de la puesta en servicio.',
    ejemploSi: '«Solo comprueba si cada solicitud incluye los documentos exigidos en las bases y lo señala al personal; no puntúa ni ordena a los aspirantes».',
    norma: `${RIA}, Art. 6.4`,
  },
  materialInfluence: {
    queSignifica: 'Pregunta si el resultado del sistema determina en la práctica la decisión final, aunque la firme una persona.',
    ejemploSi: 'El tribunal suele aceptar la puntuación que propone el sistema sin rehacerla.',
    ejemploNo: 'El sistema solo prepara un listado de documentos que el personal revisa, y la decisión no depende de él.',
    norma: `${RIA}, Art. 6.3`,
  },

  interactsWithPersons: {
    queSignifica: 'Pregunta si las personas conversan o se comunican directamente con el sistema. Si es así, hay que informarles de que hablan con una IA.',
    ejemploSi: 'Un chatbot en la sede electrónica, o un asistente que responde a las preguntas del personal.',
    ejemploNo: 'Un proceso interno que trabaja «por detrás», sin conversación con nadie.',
    norma: `${RIA}, Art. 50.1`,
  },
  publishesPublicInterestText: {
    queSignifica: 'Si la entidad publica los textos que genera el sistema para informar a la ciudadanía sobre asuntos de interés público, el Reglamento de IA exige, en principio, decir que el texto se ha generado con IA.',
    ejemploSi: 'Borradores de notas de prensa que, tras revisarlos, se publican en la web institucional.',
    ejemploNo: 'Resúmenes internos de convocatorias para el personal técnico, que no se publican.',
    norma: 'Reglamento de IA, Art. 50.4, párrafo segundo',
  },
  editorialReview: {
    queSignifica: 'No hace falta avisar de que el texto lo ha generado una IA si pasa por revisión humana o control editorial y una persona física o jurídica tiene la responsabilidad editorial de lo que se publica. Conviene poder demostrar ese control: quién revisa y quién aprueba.',
    ejemploSi: 'El gabinete de comunicación revisa, corrige y aprueba cada nota antes de publicarla, y la entidad la publica como propia.',
    ejemploNo: 'Los textos se publican tal como los genera el sistema, sin que nadie los revise.',
    norma: 'Reglamento de IA, Art. 50.4, párrafo segundo',
  },
  generatesSyntheticContent: {
    queSignifica: 'Pregunta si el sistema crea contenido nuevo: textos, resúmenes, imágenes, audio o vídeo. Ese contenido debe poder identificarse como generado por IA.',
    ejemploSi: 'Redacta borradores de informes, resume convocatorias o genera imágenes.',
    ejemploNo: 'Solo clasifica documentos o extrae datos sin redactar contenido nuevo.',
    norma: `${RIA}, Art. 50`,
  },

  institutionalRole: {
    queSignifica: 'Proveedora es quien desarrolla el sistema (o lo encarga) y lo pone en servicio con su propio nombre. Responsable del despliegue es quien lo usa bajo su autoridad. De este papel dependen las obligaciones. Es una decisión de la entidad: la documentación técnica no lo dice.',
    ejemploSi: 'Una aplicación desarrollada por la propia Diputación y usada por su personal: «Ambas».',
    ejemploNo: 'Un servicio de IA contratado a una empresa y usado por el personal: «Responsable del despliegue».',
    norma: `${RIA}, Art. 3, puntos 3 y 4`,
  },

  humanOversightLevel: {
    queSignifica: 'Pregunta en qué momento revisa una persona lo que produce el sistema: antes de que tenga efectos, después o nunca.',
    ejemploSi: '«Antes»: el técnico revisa y corrige cada borrador antes de incorporarlo al expediente.',
    ejemploNo: '«Nunca»: el sistema envía las respuestas o los documentos sin que nadie los revise.',
    norma: `${RIA}, Art. 14 (para los sistemas de alto riesgo)`,
  },
  directHumanIntervention: {
    queSignifica: 'Si un acto administrativo se produce sin que intervenga directamente un empleado público, es una actuación administrativa automatizada. Exige establecer antes los órganos responsables y quién responde a efectos de recurso.',
    ejemploSi: 'Un funcionario revisa y firma cada resolución que prepara el sistema.',
    ejemploNo: 'El sistema emite y notifica certificados automáticamente.',
    norma: 'Ley 40/2015, Art. 41',
  },

  processesPersonalData: {
    queSignifica: 'Datos personales son los que se refieren a una persona identificada o identificable: nombre, DNI, dirección, expedientes de personas…',
    ejemploSi: 'El sistema analiza solicitudes con datos de los solicitantes.',
    ejemploNo: 'Solo analiza convocatorias públicas, normativa o datos agregados y anónimos.',
    norma: 'Reglamento (UE) 2016/679 (RGPD), Art. 4.1',
  },
  legalBasis: {
    queSignifica: 'Todo tratamiento de datos personales necesita una base jurídica. En la Administración suele ser el cumplimiento de una misión de interés público o del ejercicio de poderes públicos (letra e) o de una obligación legal (letra c). Debe confirmarlo el Delegado de Protección de Datos.',
    ejemploSi: 'Tramitar una convocatoria prevista en una ordenanza: letra e).',
    norma: 'RGPD, Art. 6.1',
  },
  processesSpecialCategoryData: {
    queSignifica: 'Son datos especialmente protegidos: salud, origen étnico o racial, opiniones políticas, convicciones religiosas, afiliación sindical, datos genéticos o biométricos para identificar, y vida u orientación sexual.',
    ejemploSi: 'Informes médicos o certificados de discapacidad de los solicitantes.',
    ejemploNo: 'Datos de contacto, titulaciones o méritos profesionales.',
    norma: 'RGPD, Art. 9',
  },
  processesCriminalData: {
    queSignifica: 'Datos sobre condenas e infracciones penales o medidas de seguridad conexas.',
    ejemploSi: 'Certificados de antecedentes penales o de delitos sexuales.',
    ejemploNo: 'Datos que no se refieren a condenas ni infracciones penales.',
    norma: 'RGPD, Art. 10',
  },
  breachProcedure: {
    queSignifica: 'Una brecha es cualquier fallo de seguridad que destruye, pierde o altera datos personales, o permite que alguien no autorizado acceda a ellos. Si ocurre, la entidad debe documentarla siempre y notificarla a la AEPD sin dilación y, si es posible, en 72 horas, salvo que sea improbable que suponga un riesgo. Si el riesgo es alto, también debe informar a las personas afectadas. La pregunta es si la entidad tiene previsto cómo hacerlo para este sistema.',
    ejemploSi: 'La entidad tiene un procedimiento de gestión de incidentes que incluye avisar al DPD, registrar la brecha y notificarla a la AEPD.',
    ejemploNo: 'Nadie sabe a quién avisar si se envían por error los datos de los solicitantes a un servicio externo.',
    norma: 'RGPD, Arts. 4.12, 33 y 34',
  },
  processesSolvencyData: {
    queSignifica: 'Datos que muestran si una persona física puede pagar sus deudas: concursos de acreedores, embargos, impagos o ficheros de morosidad. Que procedan de una fuente pública, como los edictos del BOE, no los saca del RGPD. Los datos de empresas (personas jurídicas) no son datos personales, pero los de empresarios individuales y autónomos sí.',
    ejemploSi: 'Extraer de los edictos concursales del BOE el nombre y el DNI de los deudores que son personas físicas.',
    ejemploNo: 'Consultar solo concursos de sociedades mercantiles, sin datos de personas físicas.',
    norma: 'Lista de la AEPD de tratamientos que requieren EIPD (Art. 35.4 RGPD), criterio 4',
  },
  biometricIdentification: {
    queSignifica: 'Usar rasgos físicos (cara, huella, voz, iris) para identificar de forma única a una persona.',
    ejemploSi: 'Fichar con reconocimiento facial o con la huella dactilar.',
    ejemploNo: 'Guardar una fotografía en un expediente sin tratarla para identificar a nadie.',
    norma: 'RGPD, Art. 9; lista de la AEPD del Art. 35.4',
  },
  geneticData: {
    queSignifica: 'Datos sobre las características genéticas de una persona, normalmente obtenidos de un análisis biológico.',
    ejemploSi: 'Resultados de pruebas genéticas.',
    ejemploNo: 'Cualquier sistema que no trate ese tipo de información.',
    norma: 'RGPD, Art. 9; lista de la AEPD del Art. 35.4',
  },
  systematicMonitoring: {
    queSignifica: 'Observar o controlar a las personas de forma continuada.',
    ejemploSi: 'Seguir la actividad de los empleados o analizar grabaciones de videovigilancia.',
    ejemploNo: 'Tratar de forma puntual la solicitud que presenta una persona.',
    norma: 'Lista de la AEPD del Art. 35.4 RGPD y directrices europeas sobre la EIPD (WP248)',
  },
  largeScale: {
    queSignifica: 'Tratar datos de muchas personas, de muchos datos o durante mucho tiempo, o en un ámbito geográfico amplio.',
    ejemploSi: 'Datos de toda la población de la provincia.',
    ejemploNo: 'Los expedientes de una convocatoria pequeña.',
    norma: 'Lista de la AEPD del Art. 35.4 RGPD y directrices europeas sobre la EIPD (WP248)',
  },
  datasetCombination: {
    queSignifica: 'Cruzar o enlazar datos procedentes de distintos tratamientos o de distintas entidades.',
    ejemploSi: 'Cruzar el padrón con datos tributarios para detectar situaciones.',
    ejemploNo: 'Usar solo los datos que aporta el propio solicitante.',
    norma: 'Lista de la AEPD del Art. 35.4 RGPD y directrices europeas sobre la EIPD (WP248)',
  },
  vulnerableSubjects: {
    queSignifica: 'Personas en situación de mayor desprotección: menores, personas mayores dependientes, personas en riesgo de exclusión, solicitantes de prestaciones sociales…',
    ejemploSi: 'Solicitantes de una ayuda de emergencia social.',
    ejemploNo: 'Empresas o entidades públicas.',
    norma: 'Lista de la AEPD del Art. 35.4 RGPD y directrices europeas sobre la EIPD (WP248)',
  },
  preventsRightsOrService: {
    queSignifica: 'Pregunta si el resultado puede impedir que una persona ejerza un derecho o acceda a un servicio, una ayuda o un contrato.',
    ejemploSi: 'El sistema condiciona el acceso a una ayuda o a un puesto de trabajo.',
    ejemploNo: 'Solo informa o prepara documentación interna.',
    norma: 'Lista de la AEPD del Art. 35.4 RGPD',
  },
  hostingModel: {
    queSignifica: 'Pregunta dónde se procesan los datos: en el modelo de IA o, si la aplicación no usa IA, en el servidor donde se ejecuta la aplicación. De ello depende a dónde viajan los datos.',
    ejemploSi: '«Servidores propios»: Ollama o vLLM en un servidor de la Diputación. «Fuera del EEE»: la API de Gemini u OpenAI sin contrato que garantice el tratamiento en la UE, o una demostración publicada en un alojamiento gratuito en la nube cuyos servidores no estén en la UE.',
    ejemploNo: 'Si se usan varias opciones, elija la que procesará los datos reales y descríbalo en la documentación.',
    norma: 'RGPD, capítulo V (transferencias internacionales); ENS, medida [op.nub.1]',
  },

  'ensImpact.C': {
    queSignifica: `Confidencialidad: qué daño causaría que la información llegara a quien no debe. ${ENS_NIVELES}`,
    ejemploSi: 'Medio: se revelarían datos personales de los solicitantes.',
    ejemploNo: 'No afectada: solo maneja información pública.',
    norma: 'RD 311/2022 (ENS), Anexo I',
  },
  'ensImpact.I': {
    queSignifica: `Integridad: qué daño causaría que la información se alterara sin autorización. ${ENS_NIVELES}`,
    ejemploSi: 'Medio: se modificarían datos que sirven para resolver un expediente.',
    ejemploNo: 'Bajo: un error se detectaría en la revisión humana sin perjuicio grave.',
    norma: 'RD 311/2022 (ENS), Anexo I',
  },
  'ensImpact.T': {
    queSignifica: `Trazabilidad: qué daño causaría no poder saber quién hizo qué y cuándo. ${ENS_NIVELES}`,
    ejemploSi: 'Medio: no podría reconstruirse quién validó un borrador incorporado a un expediente.',
    ejemploNo: 'Bajo: uso interno de consulta sin efectos en expedientes.',
    norma: 'RD 311/2022 (ENS), Anexo I',
  },
  'ensImpact.A': {
    queSignifica: `Autenticidad: qué daño causaría no poder garantizar quién accede o de dónde procede la información. ${ENS_NIVELES}`,
    ejemploSi: 'Medio: alguien podría suplantar a un empleado y obtener o alterar borradores.',
    ejemploNo: 'Bajo: herramienta de consulta sin datos ni efectos relevantes.',
    norma: 'RD 311/2022 (ENS), Anexo I',
  },
  'ensImpact.D': {
    queSignifica: `Disponibilidad: qué daño causaría que el sistema dejara de funcionar. ${ENS_NIVELES}`,
    ejemploSi: 'Medio: se paralizaría la tramitación de un procedimiento con plazos.',
    ejemploNo: 'Bajo: el personal puede seguir trabajando sin la herramienta.',
    norma: 'RD 311/2022 (ENS), Anexo I',
  },
  auditLogsEnabled: {
    queSignifica: 'Pregunta si se guarda un registro de lo que se pide al sistema, de lo que responde, de quién lo usa y cuándo.',
    ejemploSi: 'Cada consulta queda registrada con fecha, usuario, petición y respuesta.',
    ejemploNo: 'No se guarda nada, o solo en la memoria del navegador.',
    norma: 'RD 311/2022 (ENS), medida [op.exp.8]',
  },
  deterministicConfig: {
    queSignifica: 'Pregunta si se fija la versión exacta del modelo y sus parámetros, de modo que pueda saberse con qué configuración se obtuvo cada resultado.',
    ejemploSi: 'Usa una versión concreta (por ejemplo, «gemini-2.5-flash») con temperatura baja.',
    ejemploNo: 'Usa un alias como «gemini-flash-latest», que cambia de modelo con el tiempo.',
    norma: 'Buena práctica de trazabilidad (ENS, [op.exp.8])',
  },
};
