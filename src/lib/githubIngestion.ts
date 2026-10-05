/**
 * GitHub Ingestion Engine for Auditor IA · Sector Público
 * Fetches and analyzes public repositories without requiring external tokens.
 */

export interface GithubScanResult {
  appName: string;
  appDescription: string;
  readmeContent: string;
  agentsMdContent?: string;
  techStack: string;
  detectedAiSdk: string[];
  detectedFramework: string;
  hasAgentsFile: boolean;
  repoUrl: string;
  defaultBranch: string;
  isAiSystemDetected: boolean;
}

// Regex con límites de palabra para evitar falsos positivos (ej. "drag" o "fragment" que antes disparaban "rag")
const AI_README_REGEX = /\b(llm|lms|gpt-?[34]?|gemini|ollama|openai|langchain|anthropic|mistral|hugging\s*face|modelos?\s+de\s+lenguaje|inteligencia\s+artificial|machine\s+learning|deep\s+learning|redes?\s+neuronales?|asistente\s+de\s+ia|prompt\s+(?:engineering|injection|template)|vector\s+(?:database|store)|embeddings?|\brag\b|sistema\s+de\s+ia)\b/i;

/**
 * Indicio de que el repositorio usa IA: un SDK de IA entre las dependencias o una mención en el README.
 * La existencia de un AGENTS.md o CLAUDE.md no es indicio: son instrucciones para agentes de programación
 * y aparecen también en software sin IA. El resultado solo orienta la pregunta del Art. 3.1 RIA.
 */
export function detectAiSignals(input: { detectedAiSdk: string[]; agentsMdContent?: string | null; readmeContent?: string | null }): boolean {
  return input.detectedAiSdk.length > 0 || AI_README_REGEX.test(input.readmeContent || '');
}

export function parseGithubUrl(rawUrl: string): { owner: string; repo: string } | null {
  const cleaned = rawUrl.trim().replace(/\.git\/?$/, '').replace(/\/+$/, '');
  
  // Matches:
  // https://github.com/owner/repo
  // http://github.com/owner/repo
  // github.com/owner/repo
  // owner/repo
  const fullUrlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/i);
  if (fullUrlMatch) {
    return { owner: fullUrlMatch[1], repo: fullUrlMatch[2] };
  }

  const shortMatch = cleaned.match(/^([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }

  return null;
}

async function fetchRawFile(owner: string, repo: string, branch: string, filename: string): Promise<string | null> {
  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;
    const res = await fetch(url);
    if (res.ok) {
      return await res.text();
    }
  } catch {
    // ignore
  }
  return null;
}

export async function scanGithubRepository(rawUrl: string): Promise<GithubScanResult> {
  const parsed = parseGithubUrl(rawUrl);
  if (!parsed) {
    throw new Error('La URL introducida no parece un repositorio válido de GitHub (ejemplo: https://github.com/usuario/mi-app).');
  }

  const { owner, repo } = parsed;
  let defaultBranch = 'main';
  let appName = repo.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  let appDescription = '';

  // 1. Try GitHub REST API for repo metadata
  try {
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.name) appName = data.name;
      if (data.description) appDescription = data.description;
      if (data.default_branch) defaultBranch = data.default_branch;
    }
  } catch {
    // Fallback: continue with default branch 'main'
  }

  const branchList = [defaultBranch, 'main', 'master'];
  const uniqueBranches = Array.from(new Set(branchList));

  // 2. Fetch README
  let readmeContent: string | null = null;
  const readmeCandidates = ['README.md', 'readme.md', 'README.MD', 'README.txt', 'README'];

  for (const b of uniqueBranches) {
    for (const r of readmeCandidates) {
      readmeContent = await fetchRawFile(owner, repo, b, r);
      if (readmeContent) {
        defaultBranch = b;
        break;
      }
    }
    if (readmeContent) break;
  }

  if (!readmeContent) {
    // If raw failed, try API fallback
    try {
      const apiReadme = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`);
      if (apiReadme.ok) {
        const rData = await apiReadme.json();
        if (rData.content && rData.encoding === 'base64') {
          readmeContent = atob(rData.content.replace(/\s/g, ''));
        }
      }
    } catch {
      // ignore
    }
  }

  if (!readmeContent) {
    readmeContent = `# ${appName}\n${appDescription || 'Repositorio escaneado desde GitHub.'}`;
  }

  // 3. Check for existing AGENTS.md / CLAUDE.md / .cursorrules
  let agentsMdContent: string | null = null;
  const agentsCandidates = ['AGENTS.md', 'agents.md', 'CLAUDE.md', 'claude.md', '.cursorrules', 'SYSTEM_PROMPT.md'];

  for (const b of uniqueBranches) {
    for (const a of agentsCandidates) {
      agentsMdContent = await fetchRawFile(owner, repo, b, a);
      if (agentsMdContent) break;
    }
    if (agentsMdContent) break;
  }

  // 4. Inspect package.json or requirements.txt
  const detectedAiSdk: string[] = [];
  const frameworks: string[] = [];

  let packageJsonStr: string | null = null;
  for (const b of uniqueBranches) {
    packageJsonStr = await fetchRawFile(owner, repo, b, 'package.json');
    if (packageJsonStr) break;
  }

  if (packageJsonStr) {
    try {
      const pkg = JSON.parse(packageJsonStr);
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };

      // Framework detection
      if (allDeps['react']) frameworks.push('React');
      if (allDeps['next']) frameworks.push('Next.js');
      if (allDeps['vue']) frameworks.push('Vue');
      if (allDeps['vite']) frameworks.push('Vite');
      if (allDeps['typescript']) frameworks.push('TypeScript');
      if (allDeps['express']) frameworks.push('Express');
      if (allDeps['fastify']) frameworks.push('Fastify');
      if (allDeps['tailwindcss']) frameworks.push('Tailwind CSS');

      // AI SDKs detection
      if (allDeps['@google/genai'] || allDeps['@google/generative-ai']) detectedAiSdk.push('Google Gemini SDK');
      if (allDeps['openai']) detectedAiSdk.push('OpenAI SDK');
      if (allDeps['ollama'] || allDeps['ollama-node']) detectedAiSdk.push('Ollama Local SDK');
      if (allDeps['@anthropic-ai/sdk']) detectedAiSdk.push('Anthropic Claude SDK');
      if (allDeps['@langchain/core'] || allDeps['langchain']) detectedAiSdk.push('LangChain');
      if (allDeps['ai']) detectedAiSdk.push('Vercel AI SDK');
      if (allDeps['mistralai'] || allDeps['@mistralai/mistralai']) detectedAiSdk.push('Mistral AI SDK');
      if (allDeps['groq-sdk']) detectedAiSdk.push('Groq SDK');
      if (allDeps['docx']) frameworks.push('docx (Exportación Word)');
      if (allDeps['jspdf'] || allDeps['pdf-lib']) frameworks.push('PDF Generador');
    } catch {
      // ignore json error
    }
  }

  // Inspect Python requirements.txt
  let reqsStr: string | null = null;
  for (const b of uniqueBranches) {
    reqsStr = await fetchRawFile(owner, repo, b, 'requirements.txt');
    if (reqsStr) break;
  }

  if (reqsStr) {
    frameworks.push('Python');
    const lowerReqs = reqsStr.toLowerCase();
    if (lowerReqs.includes('fastapi')) frameworks.push('FastAPI');
    if (lowerReqs.includes('flask')) frameworks.push('Flask');
    if (lowerReqs.includes('django')) frameworks.push('Django');
    if (lowerReqs.includes('openai')) detectedAiSdk.push('OpenAI Python SDK');
    if (lowerReqs.includes('google-generativeai')) detectedAiSdk.push('Google Gemini Python SDK');
    if (lowerReqs.includes('ollama')) detectedAiSdk.push('Ollama Python SDK');
    if (lowerReqs.includes('anthropic')) detectedAiSdk.push('Anthropic Python SDK');
    if (lowerReqs.includes('langchain')) detectedAiSdk.push('LangChain Python');
    if (lowerReqs.includes('vllm')) detectedAiSdk.push('vLLM Inferencia Local');
    if (lowerReqs.includes('transformers')) detectedAiSdk.push('Hugging Face Transformers');
    if (lowerReqs.includes('python-docx')) frameworks.push('python-docx');
  }

  const stackElements = [...frameworks, ...detectedAiSdk];
  const techStack = stackElements.length > 0
    ? stackElements.join(', ')
    : 'Web Application / Desarrollo de Software';

  const isAiSystemDetected = detectAiSignals({ detectedAiSdk, agentsMdContent, readmeContent });

  return {
    appName,
    appDescription: appDescription || `Software auditado desde GitHub (${owner}/${repo})`,
    readmeContent,
    agentsMdContent: agentsMdContent || undefined,
    techStack,
    detectedAiSdk,
    detectedFramework: frameworks.join(', ') || 'Web',
    hasAgentsFile: Boolean(agentsMdContent && agentsMdContent.trim().length > 0),
    repoUrl: `https://github.com/${owner}/${repo}`,
    defaultBranch,
    isAiSystemDetected,
  };
}
