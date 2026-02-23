# Visão Geral do Projeto InterviewAI

## 📝 Introdução

**InterviewAI** é um simulador de entrevistas para desenvolvedores, projetado para ajudar profissionais a praticarem entrevistas técnicas, comportamentais e de lógica. A aplicação utiliza inteligência artificial para gerar perguntas dinâmicas e contextuais, avaliar respostas e fornecer feedback detalhado.

Uma das principais características do InterviewAI é sua arquitetura **BYOK (Bring Your Own Key)**, onde a chave da API do usuário é armazenada localmente no navegador, garantindo privacidade e segurança sem a necessidade de um backend intermediário para processamento de IA.

## 🚀 Funcionalidades Principais

### 1. Entrevistas Personalizadas
O sistema permite configurar simulações baseadas em:
- **Cargo**: Frontend, Backend, Fullstack, Mobile, DevOps, etc.
- **Stack Tecnológico**: React, Node.js, Python, Java, AWS, etc.
- **Nível de Dificuldade**: Júnior, Pleno, Sênior, Especialista.
- **Tipo de Entrevista**: Técnica, Comportamental (Soft Skills), Lógica e System Design.

### 2. Interação em Tempo Real (Chat e Voz)
- **Interface de Chat**: Similar a aplicativos de mensagem modernos, com suporte a markdown para código.
- **Interação por Voz**: Utiliza a Web Speech API para reconhecimento de fala (Speech-to-Text) e síntese de voz (Text-to-Speech), permitindo uma experiência de entrevista verbal realista.

### 3. Avaliação Detalhada
Ao final de cada sessão, o usuário recebe um relatório completo contendo:
- **Pontuação Geral e por Categoria**.
- **Feedback Qualitativo**: Pontos fortes e áreas para melhoria.
- **Sugestões de Ação**: Recomendações práticas de estudo e aprimoramento.

### 4. Suporte a Múltiplos Modelos de IA
A aplicação é agnóstica em relação ao provedor de IA e suporta diversos modelos (conforme disponibilidade da API configurada):
- **OpenAI**: GPT-5, GPT-4o, GPT-4.1, o3, etc.
- **Google Gemini**: Gemini 3 Flash, Gemini 2.5 Pro/Flash.
- **Anthropic**: Claude Opus 4.6, Claude Sonnet 4.5.
- **Azure**: GPT-4 Turbo.

## 🛠️ Stack Tecnológico

O projeto foi construído utilizando tecnologias modernas de desenvolvimento web:

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router).
- **Linguagem**: TypeScript.
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) para design responsivo e utilitário.
- **Animações**: [Framer Motion](https://www.framer.com/motion/) para transições fluidas e micro-interações.
- **Gerenciamento de Estado**: [Zustand](https://github.com/pmndrs/zustand) para estado global leve e performático.
- **Ícones**: Lucide React e React Icons.
- **Integração com IA**: SDKs específicos e chamadas de API diretas.

## 📂 Estrutura do Projeto

A estrutura de diretórios segue o padrão do Next.js App Router:

```bash
/
├── docs/               # Documentação do projeto
├── src/
│   ├── app/            # Rotas e páginas (Next.js App Router)
│   ├── components/     # Componentes React reutilizáveis
│   ├── hooks/          # Custom React Hooks (ex: useInterview, useVoice)
│   ├── lib/            # Utilitários, configurações de API e stores (Zustand)
│   └── types/          # Definições de tipos TypeScript
├── public/             # Assets estáticos (imagens, ícones)
└── prompts/            # Prompts de sistema para instrução da IA
```

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: As chaves de API (OpenAI, etc.) são armazenadas exclusivamente no `localStorage` do navegador do usuário.
- **Sem Backend Proprietário**: As requisições são feitas diretamente do cliente (browser) para as APIs dos provedores de IA, ou através de Edge Functions proxy quando necessário para contornar CORS, mas sem persistência de dados sensíveis nos servidores do InterviewAI.

## 👣 Próximos Passos (Roadmap)

- Melhoria na acessibilidade (ARIA labels).
- Expansão do banco de questões estáticas para fallback.
- Integração com mais provedores de IA.
- Modo de desafio "Live Coding" com editor de código integrado.
