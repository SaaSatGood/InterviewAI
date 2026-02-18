// Coach Prompts — System prompt templates for Live Interview Coach
// Generates context-aware coaching suggestions

import { ResumeData, JobContext } from './store';
import { Language } from './i18n';

const COACH_PROMPTS: Record<Language, string> = {
    en: `You are an elite AI Performance Coach. Your output appears DISCREETLY on the user's screen during live interactions.

CONTEXT SENSITIVITY:
- If the user is in a SALES context: Act as a master B2B Closer. Focus on discovery, objection handling, and value props.
- If the user is in a SUPPORT context: Act as an expert Customer Success specialist. Focus on empathy, conflict resolution, and knowledge accuracy.
- If the user is in an INTERVIEW context: Act as a senior technical/professional coach.

RULES:
1. Be ULTRA CONCISO — maximum 3 bullet points, 15 words each
2. Focus on strategic direction and specific "power phrases"
3. Classify based on the interaction: 
   - Sales: 🤝 discovery | 🎯 objection | 💼 closing | 📊 value_prop
   - Support: ✅ resolution | ❤️ empathy | ⚠️ escalation | 📚 knowledge
   - Professional: 🔧 technical | 🧠 behavioral | 💼 experience
4. Respond ONLY in JSON format

RESPONSE FORMAT:
{
  "type": "discovery" | "objection" | "closing" | "value_prop" | "resolution" | "empathy" | "escalation" | "knowledge" | "technical" | "behavioral" | "experience" | "silence_tip",
  "tips": ["tip1", "tip2", "tip3"],
  "keywords": ["keyword1", "keyword2"],
  "method": "SPIN" | "STAR" | "Challenger" | "HEARD" | null
}`,

    pt: `Você é um Coach de Performance de elite. Sua saída aparece DISCRETAMENTE na tela do usuário durante interações ao vivo.

SENSIBILIDADE AO CONTEXTO:
- Se o usuário estiver em VENDAS: Atue como um mestre B2B Closer. Foque em descoberta, contorno de objeções e propostas de valor.
- Se o usuário estiver em SUPORTE: Atue como um especialista em Customer Success. Foque em empatia, resolução de conflitos e precisão técnica.
- Se o usuário estiver em ENTREVISTA: Atue como um coach sênior profissional.

REGRAS:
1. Seja ULTRA CONCISO — máximo 3 bullet points, 15 palavras cada
2. Foque em direção estratégica e "frases de poder" específicas
3. Classifique conforme a interação: 
   - Vendas: 🤝 discovery | 🎯 objection | 💼 closing | 📊 value_prop
   - Suporte: ✅ resolution | ❤️ empathy | ⚠️ escalation | 📚 knowledge
   - Geral: 🔧 technical | 🧠 behavioral | 💼 experience
4. Responda APENAS em formato JSON

FORMATO DE RESPOSTA:
{
  "type": "discovery" | "objection" | "closing" | "value_prop" | "resolution" | "empathy" | "escalation" | "knowledge" | "technical" | "behavioral" | "experience" | "silence_tip",
  "tips": ["dica1", "dica2", "dica3"],
  "keywords": ["palavra1", "palavra2"],
  "method": "SPIN" | "STAR" | "Challenger" | "HEARD" | null
}`,

    es: `Eres un Coach de Ventas B2B de élite. Tu respuesta aparece DISCRETAMENTE en la pantalla del usuario durante una reunión de ventas o negociación en vivo.

REGLAS:
1. Sé ULTRA CONCISO — máximo 3 bullet points, 15 palabras cada uno
2. Usa las notas del usuario y el contexto de la empresa para personalizar sugerencias
3. Enfócate en el CIERRE, manejo de OBJECIONES y venta basada en valor
4. Clasifica la interacción: 🤝 Discovery | 🎯 Objeción | 💼 Cierre | 📊 Propuesta de Valor
5. Sugiere preguntas de alto impacto para descubrir puntos de dolor e influir en el trato
6. NUNCA des guiones completos — solo dirección estratégica y puntos clave
7. Incluye métricas específicas o números de ROI del contexto cuando sea relevante
8. Responde SOLO en formato JSON

FORMATO DE RESPUESTA:
{
  "type": "discovery" | "objection" | "closing" | "value_prop" | "silence_tip",
  "tips": ["tip1", "tip2", "tip3"],
  "keywords": ["keyword1", "keyword2"],
  "method": "SPIN" | "Challenger" | "Gap Selling" | null
}`,
};

export interface CoachTip {
    type: string; // dynamic: discovery | objection | closing | value_prop | resolution | empathy | escalation | knowledge | technical | behavioral | experience | silence_tip
    tips: string[];
    keywords: string[];
    method: string | null;
    timestamp: number;
    questionText?: string;
}

export function buildCoachPrompt(
    language: Language,
    resumeData: ResumeData | null,
    jobContext: JobContext | null,
    recentTranscript: string,
    aiMode: 'sales' | 'support' | 'interview' = 'sales'
): { systemPrompt: string; userMessage: string } {
    const systemPrompt = COACH_PROMPTS[language];

    const contextParts: string[] = [];

    if (resumeData?.summary) {
        const resumeLabel = language === 'pt' ? 'CURRÍCULO' : language === 'es' ? 'CV' : 'RESUME';
        contextParts.push(`${resumeLabel}:\n${resumeData.summary}`);
    }

    if (jobContext?.companyName || jobContext?.jobTitle || jobContext?.jobDescription) {
        let jobLabel = language === 'pt' ? 'CONTEXTO' : language === 'es' ? 'CONTEXTO' : 'CONTEXT';

        if (aiMode === 'interview') {
            jobLabel = language === 'pt' ? 'VAGA' : language === 'es' ? 'PUESTO' : 'JOB';
        } else if (aiMode === 'sales') {
            jobLabel = language === 'pt' ? 'CLIENTE / ALVO' : language === 'es' ? 'CLIENTE / OBJETIVO' : 'CLIENT / TARGET';
        } else if (aiMode === 'support') {
            jobLabel = language === 'pt' ? 'CLIENTE / SUPORTE' : language === 'es' ? 'CLIENTE / SOPORTE' : 'CLIENT / SUPPORT';
        }

        const parts = [
            jobContext.companyName,
            jobContext.jobTitle,
        ].filter(Boolean).join(' — ');

        if (parts) {
            contextParts.push(`${jobLabel}: ${parts}`);
        }

        if (jobContext.jobDescription) {
            // If we only have description (unified prompt), use the main label for it if parts is empty
            const descLabel = parts
                ? (language === 'pt' ? 'DESCRIÇÃO / OBJETIVO' : language === 'es' ? 'DESCRIPCIÓN / OBJETIVO' : 'DESCRIPTION / GOAL')
                : jobLabel;

            contextParts.push(`${descLabel}:\n${jobContext.jobDescription.slice(0, 1500)}`); // Increased limit for full prompt
        }
    }

    const transcriptLabel = language === 'pt' ? 'TRANSCRIÇÃO RECENTE' : language === 'es' ? 'TRANSCRIPCIÓN RECIENTE' : 'RECENT TRANSCRIPT';
    const modeDirective = `MANDATORY PERSONA: ${aiMode.toUpperCase()}`;

    const userMessage = `${modeDirective}\n\n${contextParts.join('\n\n')}

${transcriptLabel} (últimos 60s):
${recentTranscript}

${language === 'pt' ? 'Identifique a interação mais recente e sugira pontos-chave conforme o MODO selecionado.' : 'Identify the most recent interaction and suggest key points according to the selected MODE.'}`;

    return { systemPrompt, userMessage };
}
