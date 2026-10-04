# Registro de fuentes normativas

> Cada corrección normativa del plan se apoya en una fuente oficial anotada aquí con su versión y fecha de consulta.
> Sirve para resolver discrepancias entre auditorías: ante una duda, prevalece la fuente oficial consultada, no el criterio de un modelo.

**Estados:** `cotejado` (texto oficial leído y contrastado) · `parcial` (localizado en fuente oficial, pendiente de lectura íntegra del precepto) · `pendiente` (por cotejar antes de usarlo en una corrección).

| Norma | Preceptos de interés | Fuente oficial | Versión | Consulta | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Reglamento (UE) 2024/1689 (RIA) | Arts. 3, 4, 5, 6, 26, 27, 43, 49, 50, 86, 99; Anexos III, VI, VIII | [EUR-Lex, versión consolidada 27/07/2026](https://eur-lex.europa.eu/eli/reg/2024/1689/2026-07-27/eng) | Consolidada 27/07/2026 | — | pendiente |
| Reglamento (UE) 2026/1744 (Ómnibus Digital sobre IA) | Calendario Anexo III/Anexo I, nuevas prohibiciones, Art. 49.2 y Anexo VIII | [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng) | DOUE 24/07/2026 | 04/10/2026 (localizado; contenido verificado solo en fuentes secundarias) | parcial |
| Guía de la Comisión sobre la definición de sistema de IA | Art. 3.1 RIA | [Comisión Europea](https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-ai-system-definition-facilitate-first-ai-acts-rules-application) | — | — | pendiente |
| AI Act Service Desk (Comisión) | Art. 6; Anexo III, punto 5(a) | [Art. 6](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-6) · [Anexo III](https://ai-act-service-desk.ec.europa.eu/en/ai-act/annex-3) | — | — | pendiente |
| RD 729/2023 (Estatuto AESIA) | Art. 8 (principios de actuación) | [BOE-A-2023-18911](https://www.boe.es/buscar/act.php?id=BOE-A-2023-18911) | Consolidada | 05/10/2026 (rúbrica del Art. 8 confirmada) | parcial |
| Ley 39/2015 (PACAP) | Arts. 26, 70, 79, 80 | [BOE-A-2015-10565](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565) | Consolidada | — | pendiente |
| Ley 40/2015 (LRJSP) | Arts. 32, 36, 41, 42, 43 | [BOE-A-2015-10566](https://www.boe.es/buscar/act.php?id=BOE-A-2015-10566) | Consolidada | — | pendiente |
| Ley 15/2022 | Art. 23 | [BOE-A-2022-11589](https://www.boe.es/buscar/act.php?id=BOE-A-2022-11589#a23) | Consolidada | — | pendiente |
| RD 311/2022 (ENS) | Arts. 40–41, Anexos I y II | [BOE-A-2022-7191](https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191) | Consolidada | — | pendiente |
| Reglamento (UE) 2016/679 (RGPD) | Arts. 4.4, 6.1, 9, 10, 22, 30, 35 | [EUR-Lex](https://eur-lex.europa.eu/legal-content/ES/ALL/?uri=CELEX%3A32016R0679) | — | — | pendiente |
| LOPDGDD 3/2018 | — | [BOE-A-2018-16673](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673) | Consolidada | — | pendiente |
| Lista AEPD de tratamientos que requieren EIPD (Art. 35.4 RGPD) | 11 criterios (innovación: 10; obstáculo a derechos: 11) | [AEPD](https://www.aepd.es/documento/listas-dpia-es-35-4.pdf) | — | — | pendiente |
| Directrices WP248 rev.01 (EIPD) | 9 criterios | [Comisión Europea – Grupo del Art. 29](https://ec.europa.eu/newsroom/article29/items/611236) | rev.01 (2017) | — | pendiente |
| Guía CCN-STIC 884D | Contenido real (servicios de IA en Azure) | [CCN-CERT](https://www.ccn-cert.cni.es/gl/pdf/guias/series-ccn-stic/800-guia-esquema-nacional-de-seguridad/4330-ccn-stic-884d-guia-de-configuracion-segura-servicios-de-ia/file.html) | — | — | pendiente |
| NTI de Documento Electrónico | Formato, firma y metadatos | [BOE-A-2011-13169](https://www.boe.es/buscar/act.php?id=BOE-A-2011-13169) | — | — | pendiente |
| OWASP Top 10 for LLM Applications 2025 | LLM01, LLM02, LLM06, LLM09 | [OWASP GenAI](https://genai.owasp.org/llmrisk/llm092025-misinformation/) | 2025 | — | pendiente |

## Procedencia de los criterios en disputa

| Criterio | Planteado por | Estado de cotejo |
| :--- | :--- | :--- |
| El Ómnibus mantiene el registro del Art. 49.2 para sistemas del Art. 6.3 | Claude (fuentes secundarias) | parcial: confirmar en el texto de EUR-Lex |
| La CCN-STIC 884D no contiene medidas «IA-01…IA-12» | GPT Sol 6.1 (guía oficial) | pendiente de cotejo propio |
| Anexo III 5(a) limitado a prestaciones y servicios públicos esenciales | GPT Sol 6.1 | pendiente de cotejo propio |
| Numeración de la lista AEPD (11 criterios) frente a WP248 (9) | GPT Sol 6.1 | pendiente de cotejo propio |
| Art. 8 RD 729/2023 = principios de actuación | GPT Sol 6.1; confirmado por Claude en el BOE | parcial |

Ningún criterio pasa a código en la Fase 1 sin estar en estado `cotejado`.
