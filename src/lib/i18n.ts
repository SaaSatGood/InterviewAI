// Internationalization system
export type Language = 'en' | 'pt' | 'es';

export const LANGUAGES: { id: Language; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'pt', label: 'Português', flag: '🇧🇷' },
    { id: 'es', label: 'Español', flag: '🇪🇸' },
];

export const translations: Record<Language, Record<string, string>> = {
    en: {
        // Landing Page
        'landing.title': 'InterviewAI',
        'landing.subtitle': 'Master your technical interviews with AI-powered simulations',
        'landing.description': 'Practice with realistic interviewers across 14+ roles, 50+ tech stacks, and 5 difficulty levels. Get detailed feedback and personalized study plans.',
        'landing.cta': 'Start Interview',
        'landing.free': '100% Free',
        'landing.freeDesc': 'No credit card required',
        'landing.noAccount': 'No Account Needed',
        'landing.noAccountDesc': 'Start practicing instantly',
        'landing.feature.interviewers': 'Real Interviewers',
        'landing.feature.interviewersDesc': 'Named AI personas',
        'landing.feature.roles': '14+ Roles',
        'landing.feature.rolesDesc': 'All tech positions',
        'landing.feature.stacks': '50+ Stacks',
        'landing.feature.stacksDesc': 'Latest technologies',
        'landing.feature.feedback': 'Instant Feedback',
        'landing.feature.feedbackDesc': 'Detailed reports',
        'landing.stats.positions': 'Positions',
        'landing.stats.stacks': 'Tech Stacks',
        'landing.stats.levels': 'Levels',
        'landing.stats.users': 'Users',

        // Setup
        'setup.title': 'Configure Your Interview',
        'setup.step': 'Step',
        'setup.of': 'of',
        'setup.customize': 'Customize to match your career goals',
        'setup.selectRole': 'Select Your Role',
        'setup.selectStack': 'Select Technology Stack',
        'setup.selectLevel': 'Select Experience Level',
        'setup.searchRoles': 'Search roles...',
        'setup.searchTech': 'Search technologies...',
        'setup.back': 'Back',
        'setup.next': 'Next',
        'setup.start': 'Start Interview',
        'setup.ready': 'Ready to start:',
        'setup.interviewFor': 'interview for',

        // Chat
        'chat.placeholder': 'Type your answer...',
        'chat.send': 'Send',
        'chat.endInterview': 'End Interview',
        'chat.generating': 'Generating report...',
        'chat.thinking': 'The interviewer is thinking...',

        // Report
        'report.title': 'Interview Evaluation',
        'report.subtitle': 'Technical Performance Report',
        'report.overall': 'Overall',
        'report.summary': 'Executive Summary',
        'report.questionAnalysis': 'Question Analysis',
        'report.bestMoments': 'Best Moments',
        'report.priorityImprovements': 'Priority Improvements',
        'report.strengths': 'Strengths',
        'report.weaknesses': 'Areas for Improvement',
        'report.studyPlan': 'Personalized Study Plan',
        'report.actionPlan': 'Action Plan',
        'report.nextTips': 'Next Interview Tips',
        'report.yourAnswer': 'Your Answer',
        'report.couldImprove': 'Could Improve',
        'report.newInterview': 'New Interview',
        'report.exportPdf': 'Export PDF',
        'report.weight': 'weight',

        // Hiring Decisions
        'hiring.strongHire': 'Strong Hire',
        'hiring.hire': 'Hire',
        'hiring.leanHire': 'Lean Hire',
        'hiring.leanNoHire': 'Lean No Hire',
        'hiring.noHire': 'No Hire',

        // Scores
        'score.technical': 'Technical',
        'score.problemSolving': 'Problem Solving',
        'score.communication': 'Communication',
        'score.experience': 'Experience',

        // API Key
        'apiKey.title': 'API Key Configuration',
        'apiKey.subtitle': 'Add your AI provider API key to start',
        'apiKey.name': 'Key Name',
        'apiKey.key': 'API Key',
        'apiKey.provider': 'Provider',
        'apiKey.add': 'Add Key',
        'apiKey.noKeys': 'No API keys configured',
        'apiKey.active': 'Active',
        'apiKey.setActive': 'Set Active',
        'apiKey.delete': 'Delete',

        // Common
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.close': 'Close',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
    },
    pt: {
        // Landing Page
        'landing.title': 'InterviewAI',
        'landing.subtitle': 'Domine suas entrevistas técnicas com simulações de IA',
        'landing.description': 'Pratique com entrevistadores realistas em 14+ cargos, 50+ tecnologias e 5 níveis de dificuldade. Receba feedback detalhado e planos de estudo personalizados.',
        'landing.cta': 'Iniciar Entrevista',
        'landing.free': '100% Gratuito',
        'landing.freeDesc': 'Sem cartão de crédito',
        'landing.noAccount': 'Sem Cadastro',
        'landing.noAccountDesc': 'Comece a praticar agora',
        'landing.feature.interviewers': 'Entrevistadores Reais',
        'landing.feature.interviewersDesc': 'Personas de IA',
        'landing.feature.roles': '14+ Cargos',
        'landing.feature.rolesDesc': 'Todas as áreas tech',
        'landing.feature.stacks': '50+ Stacks',
        'landing.feature.stacksDesc': 'Tecnologias atuais',
        'landing.feature.feedback': 'Feedback Instantâneo',
        'landing.feature.feedbackDesc': 'Relatórios detalhados',
        'landing.stats.positions': 'Cargos',
        'landing.stats.stacks': 'Tecnologias',
        'landing.stats.levels': 'Níveis',
        'landing.stats.users': 'Usuários',

        // Setup
        'setup.title': 'Configure Sua Entrevista',
        'setup.step': 'Passo',
        'setup.of': 'de',
        'setup.customize': 'Personalize para seus objetivos de carreira',
        'setup.selectRole': 'Selecione o Cargo',
        'setup.selectStack': 'Selecione a Tecnologia',
        'setup.selectLevel': 'Selecione o Nível',
        'setup.searchRoles': 'Buscar cargos...',
        'setup.searchTech': 'Buscar tecnologias...',
        'setup.back': 'Voltar',
        'setup.next': 'Próximo',
        'setup.start': 'Iniciar Entrevista',
        'setup.ready': 'Pronto para começar:',
        'setup.interviewFor': 'entrevista para',

        // Chat
        'chat.placeholder': 'Digite sua resposta...',
        'chat.send': 'Enviar',
        'chat.endInterview': 'Encerrar Entrevista',
        'chat.generating': 'Gerando relatório...',
        'chat.thinking': 'O entrevistador está pensando...',

        // Report
        'report.title': 'Avaliação da Entrevista',
        'report.subtitle': 'Relatório de Desempenho Técnico',
        'report.overall': 'Geral',
        'report.summary': 'Resumo Executivo',
        'report.questionAnalysis': 'Análise por Questão',
        'report.bestMoments': 'Melhores Momentos',
        'report.priorityImprovements': 'Melhorias Prioritárias',
        'report.strengths': 'Pontos Fortes',
        'report.weaknesses': 'Áreas para Melhoria',
        'report.studyPlan': 'Plano de Estudo Personalizado',
        'report.actionPlan': 'Plano de Ação',
        'report.nextTips': 'Dicas para Próxima Entrevista',
        'report.yourAnswer': 'Sua Resposta',
        'report.couldImprove': 'Poderia Melhorar',
        'report.newInterview': 'Nova Entrevista',
        'report.exportPdf': 'Exportar PDF',
        'report.weight': 'peso',

        // Hiring Decisions
        'hiring.strongHire': 'Forte Contratação',
        'hiring.hire': 'Contratar',
        'hiring.leanHire': 'Tendência a Contratar',
        'hiring.leanNoHire': 'Tendência a Não Contratar',
        'hiring.noHire': 'Não Contratar',

        // Scores
        'score.technical': 'Técnico',
        'score.problemSolving': 'Resolução de Problemas',
        'score.communication': 'Comunicação',
        'score.experience': 'Experiência',

        // API Key
        'apiKey.title': 'Configuração da API',
        'apiKey.subtitle': 'Adicione sua chave de API para começar',
        'apiKey.name': 'Nome da Chave',
        'apiKey.key': 'Chave API',
        'apiKey.provider': 'Provedor',
        'apiKey.add': 'Adicionar',
        'apiKey.noKeys': 'Nenhuma chave configurada',
        'apiKey.active': 'Ativa',
        'apiKey.setActive': 'Ativar',
        'apiKey.delete': 'Excluir',

        // Common
        'common.loading': 'Carregando...',
        'common.error': 'Erro',
        'common.success': 'Sucesso',
        'common.close': 'Fechar',
        'common.save': 'Salvar',
        'common.cancel': 'Cancelar',
    },
    es: {
        // Landing Page
        'landing.title': 'InterviewAI',
        'landing.subtitle': 'Domina tus entrevistas técnicas con simulaciones de IA',
        'landing.description': 'Practica con entrevistadores realistas en 14+ roles, 50+ tecnologías y 5 niveles de dificultad. Obtén feedback detallado y planes de estudio personalizados.',
        'landing.cta': 'Iniciar Entrevista',
        'landing.free': '100% Gratis',
        'landing.freeDesc': 'Sin tarjeta de crédito',
        'landing.noAccount': 'Sin Registro',
        'landing.noAccountDesc': 'Comienza a practicar ahora',
        'landing.feature.interviewers': 'Entrevistadores Reales',
        'landing.feature.interviewersDesc': 'Personas de IA',
        'landing.feature.roles': '14+ Roles',
        'landing.feature.rolesDesc': 'Todas las áreas tech',
        'landing.feature.stacks': '50+ Stacks',
        'landing.feature.stacksDesc': 'Tecnologías actuales',
        'landing.feature.feedback': 'Feedback Instantáneo',
        'landing.feature.feedbackDesc': 'Reportes detallados',
        'landing.stats.positions': 'Puestos',
        'landing.stats.stacks': 'Tecnologías',
        'landing.stats.levels': 'Niveles',
        'landing.stats.users': 'Usuarios',

        // Setup
        'setup.title': 'Configura Tu Entrevista',
        'setup.step': 'Paso',
        'setup.of': 'de',
        'setup.customize': 'Personaliza según tus objetivos de carrera',
        'setup.selectRole': 'Selecciona el Rol',
        'setup.selectStack': 'Selecciona la Tecnología',
        'setup.selectLevel': 'Selecciona el Nivel',
        'setup.searchRoles': 'Buscar roles...',
        'setup.searchTech': 'Buscar tecnologías...',
        'setup.back': 'Volver',
        'setup.next': 'Siguiente',
        'setup.start': 'Iniciar Entrevista',
        'setup.ready': 'Listo para comenzar:',
        'setup.interviewFor': 'entrevista para',

        // Chat
        'chat.placeholder': 'Escribe tu respuesta...',
        'chat.send': 'Enviar',
        'chat.endInterview': 'Terminar Entrevista',
        'chat.generating': 'Generando reporte...',
        'chat.thinking': 'El entrevistador está pensando...',

        // Report
        'report.title': 'Evaluación de la Entrevista',
        'report.subtitle': 'Reporte de Rendimiento Técnico',
        'report.overall': 'General',
        'report.summary': 'Resumen Ejecutivo',
        'report.questionAnalysis': 'Análisis por Pregunta',
        'report.bestMoments': 'Mejores Momentos',
        'report.priorityImprovements': 'Mejoras Prioritarias',
        'report.strengths': 'Fortalezas',
        'report.weaknesses': 'Áreas de Mejora',
        'report.studyPlan': 'Plan de Estudio Personalizado',
        'report.actionPlan': 'Plan de Acción',
        'report.nextTips': 'Tips para Próxima Entrevista',
        'report.yourAnswer': 'Tu Respuesta',
        'report.couldImprove': 'Podría Mejorar',
        'report.newInterview': 'Nueva Entrevista',
        'report.exportPdf': 'Exportar PDF',
        'report.weight': 'peso',

        // Hiring Decisions
        'hiring.strongHire': 'Contratar Definitivamente',
        'hiring.hire': 'Contratar',
        'hiring.leanHire': 'Inclinación a Contratar',
        'hiring.leanNoHire': 'Inclinación a No Contratar',
        'hiring.noHire': 'No Contratar',

        // Scores
        'score.technical': 'Técnico',
        'score.problemSolving': 'Resolución de Problemas',
        'score.communication': 'Comunicación',
        'score.experience': 'Experiencia',

        // API Key
        'apiKey.title': 'Configuración de API',
        'apiKey.subtitle': 'Agrega tu clave de API para comenzar',
        'apiKey.name': 'Nombre de la Clave',
        'apiKey.key': 'Clave API',
        'apiKey.provider': 'Proveedor',
        'apiKey.add': 'Agregar',
        'apiKey.noKeys': 'No hay claves configuradas',
        'apiKey.active': 'Activa',
        'apiKey.setActive': 'Activar',
        'apiKey.delete': 'Eliminar',

        // Common
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.close': 'Cerrar',
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
    },
};

export function detectBrowserLanguage(): Language {
    if (typeof window === 'undefined') return 'en';

    const browserLang = navigator.language.toLowerCase();

    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';

    return 'en';
}
