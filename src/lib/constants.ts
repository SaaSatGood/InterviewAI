export type PositionCategory = 'tech' | 'sales' | 'support';

export interface Position {
    id: string;
    label: string;
    icon: string;
    category: PositionCategory;
}

export const POSITIONS: Position[] = [
    // Tech
    { id: 'frontend', label: 'Frontend Developer', icon: 'Layout', category: 'tech' },
    { id: 'backend', label: 'Backend Developer', icon: 'Server', category: 'tech' },
    { id: 'fullstack', label: 'Full Stack Developer', icon: 'Layers', category: 'tech' },
    { id: 'mobile', label: 'Mobile Developer', icon: 'Smartphone', category: 'tech' },
    { id: 'devops', label: 'DevOps Engineer', icon: 'Cloud', category: 'tech' },
    { id: 'datascience', label: 'Data Scientist', icon: 'Database', category: 'tech' },
    { id: 'ml-engineer', label: 'Machine Learning Engineer', icon: 'Brain', category: 'tech' },
    { id: 'qa', label: 'QA Engineer', icon: 'TestTube', category: 'tech' },
    { id: 'security', label: 'Security Engineer', icon: 'Shield', category: 'tech' },
    { id: 'sre', label: 'Site Reliability Engineer', icon: 'Activity', category: 'tech' },
    { id: 'architect', label: 'Software Architect', icon: 'Building', category: 'tech' },
    { id: 'product-manager', label: 'Product Manager', icon: 'Briefcase', category: 'tech' },
    { id: 'game-developer', label: 'Game Developer', icon: 'Gamepad', category: 'tech' },
    { id: 'blockchain', label: 'Blockchain Developer', icon: 'Link', category: 'tech' },

    // Sales
    { id: 'sdr', label: 'Sales Development Rep (SDR)', icon: 'Target', category: 'sales' },
    { id: 'bdr', label: 'Business Development Rep (BDR)', icon: 'TrendingUp', category: 'sales' },
    { id: 'account-executive', label: 'Account Executive', icon: 'Briefcase', category: 'sales' },
    { id: 'sales-manager', label: 'Sales Manager', icon: 'Users', category: 'sales' },
    { id: 'customer-success', label: 'Customer Success Manager', icon: 'Heart', category: 'sales' },

    // Support
    { id: 'customer-support', label: 'Customer Support Rep', icon: 'Headphones', category: 'support' },
    { id: 'technical-support', label: 'Technical Support Engineer', icon: 'Wrench', category: 'support' },
    { id: 'support-lead', label: 'Support Lead/Manager', icon: 'Activity', category: 'support' },
] as const;

export const STACKS: Record<string, { id: string; label: string; category?: string }[]> = {
    frontend: [
        // Frameworks
        { id: 'react', label: 'React / Next.js', category: 'Frameworks' },
        { id: 'vue', label: 'Vue.js / Nuxt', category: 'Frameworks' },
        { id: 'angular', label: 'Angular', category: 'Frameworks' },
        { id: 'svelte', label: 'Svelte / SvelteKit', category: 'Frameworks' },
        { id: 'solid', label: 'Solid.js', category: 'Frameworks' },
        { id: 'qwik', label: 'Qwik', category: 'Frameworks' },
        { id: 'astro', label: 'Astro', category: 'Frameworks' },
        // Core
        { id: 'typescript', label: 'TypeScript', category: 'Core' },
        { id: 'html-css', label: 'HTML / CSS / JavaScript', category: 'Core' },
        { id: 'tailwind', label: 'Tailwind CSS', category: 'Styling' },
        { id: 'sass', label: 'SASS / SCSS', category: 'Styling' },
        { id: 'styled-components', label: 'Styled Components / CSS-in-JS', category: 'Styling' },
        // State & Data
        { id: 'redux', label: 'Redux / Redux Toolkit', category: 'State Management' },
        { id: 'zustand', label: 'Zustand', category: 'State Management' },
        { id: 'graphql-client', label: 'GraphQL (Apollo, URQL)', category: 'Data Fetching' },
        { id: 'react-query', label: 'TanStack Query / SWR', category: 'Data Fetching' },
        // Testing
        { id: 'testing-library', label: 'Testing Library / Vitest', category: 'Testing' },
        { id: 'storybook', label: 'Storybook', category: 'Testing' },
        // Build Tools
        { id: 'webpack', label: 'Webpack / Vite / esbuild', category: 'Build Tools' },
        // Performance
        { id: 'web-perf', label: 'Web Performance / Core Vitals', category: 'Performance' },
        { id: 'pwa', label: 'PWA / Service Workers', category: 'Performance' },
    ],
    backend: [
        // Languages & Frameworks
        { id: 'node', label: 'Node.js / Express / Fastify', category: 'JavaScript' },
        { id: 'nestjs', label: 'NestJS', category: 'JavaScript' },
        { id: 'python', label: 'Python / Django / FastAPI', category: 'Python' },
        { id: 'flask', label: 'Flask', category: 'Python' },
        { id: 'java', label: 'Java / Spring Boot', category: 'Java' },
        { id: 'go', label: 'Go / Golang', category: 'Go' },
        { id: 'csharp', label: 'C# / .NET Core', category: 'C#' },
        { id: 'ruby', label: 'Ruby on Rails', category: 'Ruby' },
        { id: 'php', label: 'PHP / Laravel / Symfony', category: 'PHP' },
        { id: 'rust', label: 'Rust / Actix / Axum', category: 'Rust' },
        { id: 'elixir', label: 'Elixir / Phoenix', category: 'Elixir' },
        { id: 'scala', label: 'Scala / Play / Akka', category: 'Scala' },
        // Databases
        { id: 'postgresql', label: 'PostgreSQL', category: 'Databases' },
        { id: 'mysql', label: 'MySQL / MariaDB', category: 'Databases' },
        { id: 'mongodb', label: 'MongoDB', category: 'Databases' },
        { id: 'redis', label: 'Redis / Caching', category: 'Databases' },
        { id: 'prisma', label: 'Prisma / Drizzle / ORMs', category: 'Databases' },
        // APIs
        { id: 'rest-api', label: 'REST API Design', category: 'APIs' },
        { id: 'graphql', label: 'GraphQL', category: 'APIs' },
        { id: 'grpc', label: 'gRPC / Protocol Buffers', category: 'APIs' },
        // Messaging
        { id: 'message-queues', label: 'RabbitMQ / Kafka / SQS', category: 'Messaging' },
        // Auth
        { id: 'auth', label: 'OAuth / JWT / Auth0', category: 'Security' },
    ],
    fullstack: [
        { id: 'mern', label: 'MERN Stack (MongoDB, Express, React, Node)' },
        { id: 'mean', label: 'MEAN Stack (MongoDB, Express, Angular, Node)' },
        { id: 't3', label: 'T3 Stack (Next.js, TRPC, Prisma)' },
        { id: 'nextjs', label: 'Next.js Full Stack' },
        { id: 'remix', label: 'Remix' },
        { id: 'nuxt', label: 'Nuxt.js Full Stack' },
        { id: 'laravel', label: 'Laravel + Vue/React' },
        { id: 'django-react', label: 'Django + React' },
        { id: 'rails-react', label: 'Rails + React / Hotwire' },
        { id: 'spring-react', label: 'Spring Boot + React' },
        { id: 'supabase', label: 'Supabase / Firebase' },
        { id: 'serverless', label: 'Serverless (AWS Lambda, Vercel)' },
    ],
    mobile: [
        { id: 'react-native', label: 'React Native' },
        { id: 'flutter', label: 'Flutter / Dart' },
        { id: 'ios', label: 'iOS (Swift / SwiftUI)' },
        { id: 'android', label: 'Android (Kotlin / Jetpack Compose)' },
        { id: 'expo', label: 'Expo' },
        { id: 'kotlin-multiplatform', label: 'Kotlin Multiplatform' },
        { id: 'capacitor', label: 'Capacitor / Ionic' },
        { id: 'pwa-mobile', label: 'PWA for Mobile' },
    ],
    devops: [
        { id: 'aws', label: 'AWS (EC2, Lambda, S3, EKS)' },
        { id: 'gcp', label: 'Google Cloud Platform' },
        { id: 'azure', label: 'Microsoft Azure' },
        { id: 'kubernetes', label: 'Kubernetes / Helm' },
        { id: 'docker', label: 'Docker / Docker Compose' },
        { id: 'terraform', label: 'Terraform / Pulumi / IaC' },
        { id: 'ansible', label: 'Ansible / Configuration Management' },
        { id: 'cicd', label: 'CI/CD (GitHub Actions, GitLab CI, Jenkins)' },
        { id: 'linux', label: 'Linux / Shell Scripting' },
        { id: 'networking', label: 'Networking / Load Balancing / CDN' },
        { id: 'argocd', label: 'ArgoCD / GitOps' },
    ],
    datascience: [
        { id: 'python-ml', label: 'Python (Pandas, NumPy, Scikit-learn)' },
        { id: 'sql', label: 'SQL / Data Warehousing' },
        { id: 'spark', label: 'Apache Spark / PySpark' },
        { id: 'tableau', label: 'Tableau / Power BI / Looker' },
        { id: 'r', label: 'R Programming' },
        { id: 'statistics', label: 'Statistics & Probability' },
        { id: 'dbt', label: 'dbt / Data Modeling' },
        { id: 'airflow', label: 'Apache Airflow / Prefect' },
    ],
    'ml-engineer': [
        { id: 'pytorch', label: 'PyTorch' },
        { id: 'tensorflow', label: 'TensorFlow / Keras' },
        { id: 'nlp', label: 'NLP (Transformers, BERT, GPT)' },
        { id: 'cv', label: 'Computer Vision (OpenCV, YOLO)' },
        { id: 'mlops', label: 'MLOps (MLflow, Kubeflow, Weights & Biases)' },
        { id: 'llm', label: 'LLMs & Prompt Engineering' },
        { id: 'rag', label: 'RAG / Vector Databases' },
        { id: 'huggingface', label: 'Hugging Face Ecosystem' },
        { id: 'langchain', label: 'LangChain / LlamaIndex' },
    ],
    qa: [
        { id: 'selenium', label: 'Selenium / WebDriver' },
        { id: 'cypress', label: 'Cypress' },
        { id: 'playwright', label: 'Playwright' },
        { id: 'jest', label: 'Jest / Vitest' },
        { id: 'api-testing', label: 'API Testing (Postman, REST Assured)' },
        { id: 'performance', label: 'Performance Testing (JMeter, k6, Gatling)' },
        { id: 'mobile-testing', label: 'Mobile Testing (Appium, Detox)' },
        { id: 'bdd', label: 'BDD (Cucumber, Gherkin)' },
    ],
    security: [
        { id: 'pentesting', label: 'Penetration Testing' },
        { id: 'appsec', label: 'Application Security (OWASP Top 10)' },
        { id: 'network', label: 'Network Security' },
        { id: 'cloud-security', label: 'Cloud Security (AWS, GCP)' },
        { id: 'devsecops', label: 'DevSecOps' },
        { id: 'sast-dast', label: 'SAST / DAST Tools' },
        { id: 'iam', label: 'IAM / Identity & Access Management' },
    ],
    sre: [
        { id: 'monitoring', label: 'Monitoring (Prometheus, Grafana, Datadog)' },
        { id: 'logging', label: 'Logging (ELK Stack, Loki)' },
        { id: 'incident', label: 'Incident Management / On-Call' },
        { id: 'chaos', label: 'Chaos Engineering' },
        { id: 'slos', label: 'SLOs / SLIs / Error Budgets' },
        { id: 'capacity', label: 'Capacity Planning' },
    ],
    architect: [
        { id: 'microservices', label: 'Microservices Architecture' },
        { id: 'distributed', label: 'Distributed Systems' },
        { id: 'event-driven', label: 'Event-Driven Architecture' },
        { id: 'ddd', label: 'Domain-Driven Design' },
        { id: 'cloud-native', label: 'Cloud-Native Architecture' },
        { id: 'system-design', label: 'System Design' },
        { id: 'api-design', label: 'API Design & Versioning' },
        { id: 'cqrs', label: 'CQRS / Event Sourcing' },
    ],
    'product-manager': [
        { id: 'agile', label: 'Agile / Scrum / Kanban' },
        { id: 'roadmap', label: 'Product Roadmapping' },
        { id: 'analytics', label: 'Product Analytics (Mixpanel, Amplitude)' },
        { id: 'ux', label: 'UX Research' },
        { id: 'stakeholder', label: 'Stakeholder Management' },
        { id: 'okrs', label: 'OKRs / Goal Setting' },
        { id: 'ab-testing', label: 'A/B Testing / Experimentation' },
    ],
    'game-developer': [
        { id: 'unity', label: 'Unity / C#' },
        { id: 'unreal', label: 'Unreal Engine / C++' },
        { id: 'godot', label: 'Godot / GDScript' },
        { id: 'graphics', label: '3D Graphics / Shaders / HLSL' },
        { id: 'multiplayer', label: 'Multiplayer / Networking' },
        { id: 'physics', label: 'Game Physics' },
    ],
    blockchain: [
        { id: 'solidity', label: 'Solidity / Ethereum' },
        { id: 'web3', label: 'Web3.js / Ethers.js / Wagmi' },
        { id: 'defi', label: 'DeFi Protocols' },
        { id: 'smart-contracts', label: 'Smart Contract Auditing' },
        { id: 'rust-blockchain', label: 'Rust (Solana, Substrate)' },
        { id: 'nft', label: 'NFTs / ERC Standards' },
    ],

    // Sales Stacks
    sdr: [
        { id: 'outbound', label: 'Outbound Prospecting', category: 'Methodology' },
        { id: 'cold-calling', label: 'Cold Calling & Emailing', category: 'Methodology' },
        { id: 'salesforce', label: 'Salesforce CRM', category: 'Tools' },
        { id: 'hubspot', label: 'HubSpot CRM', category: 'Tools' },
        { id: 'outreach', label: 'Outreach / Salesloft', category: 'Tools' },
        { id: 'linkedin-sales', label: 'LinkedIn Sales Navigator', category: 'Tools' },
        { id: 'objection-handling', label: 'Objection Handling', category: 'Methodology' },
    ],
    bdr: [
        { id: 'lead-generation', label: 'Lead Generation Strategies', category: 'Methodology' },
        { id: 'market-analysis', label: 'Market Analysis', category: 'Methodology' },
        { id: 'crm-mastery', label: 'CRM Mastery', category: 'Tools' },
        { id: 'strategic-prospecting', label: 'Strategic Prospecting', category: 'Methodology' },
    ],
    'account-executive': [
        { id: 'closing-techniques', label: 'Closing Techniques', category: 'Methodology' },
        { id: 'demo-skills', label: 'Product Demo Skills', category: 'Methodology' },
        { id: 'negotiation', label: 'Advanced Negotiation', category: 'Methodology' },
        { id: 'pipeline-management', label: 'Pipeline Management', category: 'Process' },
    ],
    'sales-manager': [
        { id: 'sales-strategy', label: 'Sales Strategy & Planning', category: 'Management' },
        { id: 'coaching', label: 'Sales Coaching & Mentoring', category: 'Management' },
        { id: 'forecasting', label: 'Sales Forecasting', category: 'Analytics' },
    ],
    'customer-success': [
        { id: 'onboarding', label: 'Customer Onboarding', category: 'Success' },
        { id: 'retention', label: 'Churn Reduction & Retention', category: 'Success' },
        { id: 'upselling', label: 'Upselling & Cross-selling', category: 'Sales' },
        { id: 'gainsight', label: 'Gainsight / Success Tools', category: 'Tools' },
    ],

    // Support Stacks
    'customer-support': [
        { id: 'ticketing', label: 'Ticketing Systems (Zendesk, Freshdesk)', category: 'Tools' },
        { id: 'active-listening', label: 'Active Listening & Empathy', category: 'Skills' },
        { id: 'problem-escalation', label: 'Problem Escalation Process', category: 'Process' },
        { id: 'written-comm', label: 'Business Writing & Chat Etiquette', category: 'Skills' },
    ],
    'technical-support': [
        { id: 'troubleshooting', label: 'Technical Troubleshooting', category: 'Skills' },
        { id: 'api-basics', label: 'API Basics (Postman, REST)', category: 'Technical' },
        { id: 'logging-tools', label: 'Logging Tools (LogRocket, Sentry)', category: 'Technical' },
        { id: 'kb-creation', label: 'Knowledge Base Content Creation', category: 'Process' },
    ],
    'support-lead': [
        { id: 'sla-management', label: 'SLA & KPI Management', category: 'Management' },
        { id: 'team-leadership', label: 'Team Leadership', category: 'Management' },
        { id: 'csat-metrics', label: 'CSAT / NPS Improvement', category: 'Analytics' },
    ],
};

// Soft Skills & Business Topics - Available for all positions
export const SOFT_SKILLS = [
    { id: 'communication', label: 'Technical Communication', description: 'Explaining complex concepts clearly' },
    { id: 'problem-solving', label: 'Problem Solving', description: 'Structured approach to challenges' },
    { id: 'teamwork', label: 'Teamwork & Collaboration', description: 'Working effectively with others' },
    { id: 'leadership', label: 'Leadership & Mentoring', description: 'Guiding and developing others' },
    { id: 'conflict-resolution', label: 'Conflict Resolution', description: 'Handling disagreements professionally' },
    { id: 'time-management', label: 'Time Management', description: 'Prioritization and deadlines' },
    { id: 'adaptability', label: 'Adaptability', description: 'Responding to change effectively' },
    { id: 'critical-thinking', label: 'Critical Thinking', description: 'Analytical decision making' },
];

export const BUSINESS_TOPICS = [
    { id: 'requirements', label: 'Requirements Gathering', description: 'Understanding stakeholder needs' },
    { id: 'estimations', label: 'Project Estimations', description: 'Accurate time and effort estimates' },
    { id: 'tech-debt', label: 'Technical Debt Management', description: 'Balancing speed vs quality' },
    { id: 'stakeholder-comm', label: 'Stakeholder Communication', description: 'Business-tech translation' },
    { id: 'cost-optimization', label: 'Cost Optimization', description: 'Efficient resource usage' },
    { id: 'metrics', label: 'Business Metrics & KPIs', description: 'Measuring impact and success' },
    { id: 'product-thinking', label: 'Product Thinking', description: 'User-centric development' },
    { id: 'risk-assessment', label: 'Risk Assessment', description: 'Identifying and mitigating risks' },
];

export const MODERN_PRACTICES = [
    { id: 'clean-code', label: 'Clean Code & SOLID', description: 'Writing maintainable code' },
    { id: 'tdd', label: 'TDD / BDD', description: 'Test-driven development' },
    { id: 'code-review', label: 'Code Review Best Practices', description: 'Effective feedback' },
    { id: 'documentation', label: 'Technical Documentation', description: 'Clear and useful docs' },
    { id: 'agile-practices', label: 'Agile Practices', description: 'Scrum, Kanban, ceremonies' },
    { id: 'git-workflow', label: 'Git Workflow', description: 'Branching strategies, PRs' },
    { id: 'observability', label: 'Observability', description: 'Logging, monitoring, tracing' },
    { id: 'security-practices', label: 'Security Best Practices', description: 'Secure by design' },
];

export const DIFFICULTIES = [
    { id: 'intern', label: 'Intern', description: 'Basics, willingness to learn' },
    { id: 'junior', label: 'Junior', description: 'Fundamentals and basic logic' },
    { id: 'mid', label: 'Mid-Level', description: 'System design and complex algorithms' },
    { id: 'senior', label: 'Senior', description: 'Architecture, scalability, and leadership' },
    { id: 'staff', label: 'Staff / Principal', description: 'Cross-team impact, strategy, mentorship' },
] as const;

// Interviewer names by domain
export const INTERVIEWER_NAMES: Record<string, string[]> = {
    // Tech positions
    frontend: ['Alex Rivera', 'Samantha Chen', 'Jordan Lee'],
    backend: ['Marcus Johnson', 'Priya Patel', 'Chris Thompson'],
    fullstack: ['Sarah Martinez', 'James Kim', 'Laura Singh'],
    mobile: ['Ryan Cooper', 'Aisha Williams', 'Brandon Park'],
    devops: ['Mike Torres', 'Nina Gupta', 'Eric Hansen'],
    datascience: ['Rachel Green', 'Omar Khan', 'Diana Chang'],
    'ml-engineer': ['Andrew Ng-style', 'Fatima Al-Rashid', 'Lucas Weber'],
    qa: ['Jennifer Walsh', 'Carlos Mendez', 'Tina Park'],
    security: ['Bruce Wayne', 'Natasha Romanova', 'Alan Turing-style'],
    sre: ['Lisa Chang', 'Dmitri Petrov', 'Hannah Schmidt'],
    architect: ['Robert Martin-style', 'Sophia Anderson', 'Wei Zhang'],
    'product-manager': ['Jessica Taylor', 'Nathan Brooks', 'Maria Garcia'],
    // Niche tech
    'game-developer': ['Jake Wilson', 'Sakura Ito', 'Dylan Foster'],
    blockchain: ['Vitalik-style', 'Amir Goldstein', 'Cynthia Dwork'],
    // Sales
    sdr: ['Tyler Reed', 'Megan Fisher'],
    bdr: ['Kevin Brooks', 'Anna White'],
    'account-executive': ['Robert Moore', 'Sarah Jenkins'],
    'sales-manager': ['Thomas Hunt', 'Patricia Bell'],
    'customer-success': ['Emily Carter', 'David Ross'],
    // Support
    'customer-support': ['Karen Knight', 'Steven Page'],
    'technical-support': ['Daniel Wright', 'Michelle Scott'],
    'support-lead': ['Mark Hall', 'Sandra Young'],
};

const DEFAULT_INTERVIEWER_NAMES = ['Alex Thompson', 'Sarah Kim', 'Michael Chen'];

export function getRandomInterviewerName(position: string): string {
    const names = INTERVIEWER_NAMES[position] || DEFAULT_INTERVIEWER_NAMES;
    return names[Math.floor(Math.random() * names.length)];
}
