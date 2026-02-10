# 🎯 InterviewAI — Plano de Melhorias de User Experience

> Análise completa da experiência do usuário com propostas priorizadas por impacto e esforço.

---

## 1. Onboarding & Setup Flow

### 🔴 Problema: Muitos passos antes de iniciar
O fluxo atual possui **5 etapas** (role → stacks → competências → nível → currículo) antes do usuário começar a entrevistar. Isso causa abandono, especialmente para quem quer testar rápido.

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Quick Start Mode** — botão "Entrevista Rápida" na landing que usa defaults inteligentes (Fullstack, React+Node, Pleno) e vai direto pro chat | 🟢 Alto | 🟢 Baixo |
| 2 | **Unificar Steps 3 e 4** — soft skills/practices e nível na mesma tela com layout em abas | 🟡 Médio | 🟢 Baixo |
| 3 | **Salvar perfil** — lembrar a última configuração do usuário e oferecer "Repetir Última Entrevista" | 🟢 Alto | 🟡 Médio |
| 4 | **Templates prontos** — perfis pré-configurados (ex: "Frontend Pleno para FAANG", "Backend Sênior Startup") | 🟢 Alto | 🟡 Médio |

---

## 2. Chat Interface

### 🔴 Problema: Falta de contexto e controle durante a entrevista

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Progress Indicator** — barra indicando progresso (ex: "Pergunta 3 de 8") ao invés de apenas contadores no header | 🟢 Alto | 🟢 Baixo |
| 2 | **Dicas contextuais** — tooltip na primeira mensagem explicando como estruturar respostas (ex: método STAR) | 🟡 Médio | 🟢 Baixo |
| 3 | **Timer visível e inteligente** — mostrar tempo por pergunta, com alerta sutil se demorar muito (>5min) para simular pressão real | 🟡 Médio | 🟡 Médio |
| 4 | **Indicador de qualidade** — feedback micro em tempo real tipo "resposta curta" se a mensagem for muito breve | 🟢 Alto | 🟡 Médio |
| 5 | **Botão "Pular Pergunta"** — permitir pular para simular entrevistas reais onde você pode escolher não responder | 🟡 Médio | 🟢 Baixo |
| 6 | **Code Editor integrado** — Monaco Editor para perguntas de código ao invés de pedir código no chat (já no roadmap) | 🟢 Alto | 🔴 Alto |

---

## 3. Voice Mode & Live Coach

### 🟡 Problema: Funcionalidades avançadas com UX fragmentada

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Onboarding do Voice** — tutorial interativo na primeira vez que o usuário ativa o modo de voz, mostrando gestos e comandos | 🟢 Alto | 🟡 Médio |
| 2 | **Transição suave Text↔Voice** — ao trocar de modo, manter contexto visual com animação (não cortar abruptamente) | 🟡 Médio | 🟡 Médio |
| 3 | **Live Coach no modo chat** — exibir dicas do coach também na entrevista por texto (não apenas standalone), como sidebar colapsável | 🟢 Alto | 🟡 Médio |
| 4 | **Feedback háptico** — vibração no mobile quando o voice orb muda de estado | 🟡 Médio | 🟢 Baixo |

---

## 4. Relatório Pós-Entrevista

### 🟡 Problema: Relatório completo mas sem acionáveis claros

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Compartilhar Relatório** — botão para gerar link compartilhável ou exportar como imagem para LinkedIn/redes sociais | 🟢 Alto | 🟡 Médio |
| 2 | **Comparar com média** — mostrar como o score se compara com a "média" esperada para o nível selecionado | 🟢 Alto | 🟡 Médio |
| 3 | **Plano de ação interativo** — transformar o "Study Plan" em checklist que o usuário pode marcar como feito | 🟢 Alto | 🟡 Médio |
| 4 | **Histórico de entrevistas** — dashboard com evolução dos scores ao longo do tempo (gráfico de linha) | 🟢 Alto | 🔴 Alto |
| 5 | **Replay da entrevista** — permitir reler toda a conversa junto com o relatório, não apenas o resumo | 🟡 Médio | 🟢 Baixo |
| 6 | **Modo "Responder de Novo"** — permitir refazer uma pergunta específica para melhorar a nota | 🟡 Médio | 🟡 Médio |

---

## 5. Internacionalização & Consistência

### 🟡 Problema: Strings hardcoded e mistura de idiomas

O código atual tem diversas strings não traduzidas misturadas com o sistema i18n:
- `"Parar"`, `"Iniciar"`, `"Sistema ⚠️"` no LiveCoach
- `"Cancel"`, `"End Interview"` no ChatInterface
- `"{selected} selected"` no InterviewSetup
- Tooltips como `"Manage API Keys"`, `"Voice Mode"` sem tradução

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Audit completo de strings** — migrar TODAS as strings hardcoded para o sistema de i18n | 🟢 Alto | 🟡 Médio |
| 2 | **Idioma por contexto** — adaptar o nível de formalidade (pt-BR casual vs pt-PT formal) | 🟡 Médio | 🟡 Médio |
| 3 | **Idioma no relatório** — garantir que o AI responda no idioma selecionado pelo usuário, não apenas a UI | 🟢 Alto | 🟢 Baixo |

---

## 6. Acessibilidade (a11y)

### 🔴 Problema: Falta de suporte a navegação por teclado e leitores de tela

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **ARIA labels** — adicionar `aria-label` e `role` em todos os botões de ícone, orbs e controles interativos | 🟢 Alto | 🟢 Baixo |
| 2 | **Focus management** — gerenciar foco corretamente nos modais (trap focus) e nos steps do setup | 🟢 Alto | 🟡 Médio |
| 3 | **Contraste** — revisar os textos `text-neutral-600` e `text-neutral-500` que podem ter contraste insuficiente (WCAG AA) | 🟡 Médio | 🟢 Baixo |
| 4 | **Skip links** — adicionar "Pular para conteúdo" para navegação por teclado | 🟡 Médio | 🟢 Baixo |
| 5 | **Reduced motion** — respeitar `prefers-reduced-motion` para as animações do Framer Motion | 🟡 Médio | 🟡 Médio |

---

## 7. Mobile Experience

### 🟡 Problema: Layout funcional mas não otimizado para mobile

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Bottom sheet para setup** — usar padrão nativo de bottom sheet ao invés de modal centralizado no mobile | 🟡 Médio | 🟡 Médio |
| 2 | **Gesture controls** — swipe para navegar entre steps do setup | 🟡 Médio | 🟡 Médio |
| 3 | **Live Coach responsivo** — no mobile, usar tabs (Transcrição/Coach) ao invés de split-view que fica apertado | 🟢 Alto | 🟡 Médio |
| 4 | **Input adaptativo** — no mobile, fixar o input na parte inferior com teclado virtual aberto | 🟡 Médio | 🟢 Baixo |
| 5 | **PWA** — adicionar manifest.json e service worker para instalar como app no celular | 🟡 Médio | 🟡 Médio |

---

## 8. Gamificação & Engajamento

### 💡 Oportunidade: Aumentar retenção e recorrência

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Streak de prática** — "Você praticou 3 dias seguidos! 🔥" com notificações opcionais | 🟢 Alto | 🟡 Médio |
| 2 | **Badges/Conquistas** — desbloquear badges (ex: "Primeiro 90+", "10 Entrevistas", "Modo Voz Mestre") | 🟡 Médio | 🟡 Médio |
| 3 | **Desafio diário** — uma pergunta técnica rápida por dia, sem precisar de setup completo | 🟢 Alto | 🟡 Médio |
| 4 | **Nível de confiança** — indicador que cresce com a prática, ex: "Confiança: 72% → Pronto para entrevista real" | 🟡 Médio | 🟡 Médio |

---

## 9. Performance & Polish

### 🟡 Problema: Detalhes finos que impactam a percepção de qualidade

#### Propostas:
| # | Melhoria | Impacto | Esforço |
|---|----------|---------|---------|
| 1 | **Skeleton loading** — durante o carregamento da primeira mensagem e do relatório, mostrar skeletons ao invés de spinners | 🟡 Médio | 🟢 Baixo |
| 2 | **Streaming de respostas** — renderizar a resposta da IA palavra por palavra via SSE, não tudo de uma vez | 🟢 Alto | 🟡 Médio |
| 3 | **Timestamp correto** — o timestamp das mensagens do assistant usa `new Date()` no render (sempre mostra a hora atual), salvar no momento da criação | 🟡 Médio | 🟢 Baixo |
| 4 | **Erro mais amigável** — em vez de "Something went wrong" genérico, dar orientações específicas (chave inválida, rate limit, etc.) | 🟡 Médio | 🟢 Baixo |
| 5 | **Splash screen** — tela de loading inicial animada para evitar flash de conteúdo branco no primeiro load | 🟡 Médio | 🟢 Baixo |

---

## 🚀 Priorização Recomendada

### Sprint 1 — Quick Wins (1-2 semanas)
1. Quick Start Mode na landing page
2. Salvar último perfil utilizado
3. Progress indicator no chat
4. Audit de strings i18n
5. ARIA labels e contraste
6. Fix do timestamp das mensagens
7. Erros mais amigáveis

### Sprint 2 — Core UX (2-3 semanas)
1. Templates de perfil prontos
2. Streaming de respostas (SSE)
3. Histórico de entrevistas com gráfico
4. Compartilhar relatório
5. Live Coach no modo chat como sidebar
6. Skeleton loading

### Sprint 3 — Engagement & Delight (3-4 semanas)
1. Desafio diário
2. Badges e gamificação
3. Code Editor integrado
4. PWA com instalação mobile
5. Replay da entrevista completa

---

> **Nota**: Todas as melhorias foram priorizadas considerando o impacto na retenção e a viabilidade técnica com a stack atual (Next.js + Zustand + Framer Motion).
