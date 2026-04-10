import type { Classification, ClassificationId, Pillar } from '@/types/assessment';

export const CLASSIFICATIONS: Record<ClassificationId, Classification> = {
  baixa:           { id: 'baixa',           label: 'BAIXA',         color: '#dc2626' },
  media:           { id: 'media',           label: 'MÉDIA',         color: '#f59e0b' },
  alta:            { id: 'alta',            label: 'ALTA',          color: '#10b981' },
  'best-in-class': { id: 'best-in-class',   label: 'BEST IN CLASS', color: '#7030A0' },
};

export const ASSESSMENT_DATA: Pillar[] = [
  {
    id: 'dados',
    number: 1,
    name: 'DADOS & ANALYTICS',
    icon: '📊',
    description: 'Avalia se a área tem visibilidade real do Spend',
    questions: [
      {
        id: '1.1',
        pillarId: 'dados',
        text: 'Existe spend analysis estruturado?',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Não existe visibilidade do gasto' },
          { value: 1, label: 'Muito inicial',  description: 'Análises pontuais em Excel, sem padrão' },
          { value: 2, label: 'Básico',         description: 'Base consolidada, mas com baixa confiabilidade' },
          { value: 3, label: 'Estruturado',    description: 'Classificação por categoria estruturada' },
          { value: 4, label: 'Gerenciado',     description: 'Dashboards e análises recorrentes' },
          { value: 5, label: 'Otimizado',      description: 'Analytics avançado, integrado e orientado à decisão' },
        ],
      },
      {
        id: '1.2',
        pillarId: 'dados',
        text: 'Qualidade e governança de dados de compras',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Dados inconsistentes ou inexistentes' },
          { value: 1, label: 'Muito inicial',  description: 'Dados descentralizados e sem padrão' },
          { value: 2, label: 'Básico',         description: 'Algum controle, mas com erros frequentes' },
          { value: 3, label: 'Estruturado',    description: 'Governança básica definida' },
          { value: 4, label: 'Gerenciado',     description: 'Dados confiáveis e auditáveis' },
          { value: 5, label: 'Otimizado',      description: 'Governança robusta + data-driven culture' },
        ],
      },
    ],
  },
  {
    id: 'pessoas',
    number: 2,
    name: 'PESSOAS & GOVERNANÇA',
    icon: '👥',
    description: 'Avalia capacidade do time e clareza de papéis',
    questions: [
      {
        id: '2.1',
        pillarId: 'pessoas',
        text: 'Capacidade e senioridade do time',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Perfil operacional' },
          { value: 1, label: 'Muito inicial',  description: 'Baixa capacitação técnica' },
          { value: 2, label: 'Básico',         description: 'Conhecimento básico de compras' },
          { value: 3, label: 'Estruturado',    description: 'Conhecimento em strategic sourcing' },
          { value: 4, label: 'Gerenciado',     description: 'Atuação consultiva com áreas internas' },
          { value: 5, label: 'Otimizado',      description: 'Time altamente estratégico e influente' },
        ],
      },
      {
        id: '2.2',
        pillarId: 'pessoas',
        text: 'Gestão de stakeholders internos',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Relacionamento inexistente' },
          { value: 1, label: 'Muito inicial',  description: 'Atuação sob demanda' },
          { value: 2, label: 'Básico',         description: 'Relacionamento reativo' },
          { value: 3, label: 'Estruturado',    description: 'Interação estruturada' },
          { value: 4, label: 'Gerenciado',     description: 'Atuação proativa e colaborativa' },
          { value: 5, label: 'Otimizado',      description: 'Procurement como parceiro estratégico do negócio' },
        ],
      },
    ],
  },
  {
    id: 'processos',
    number: 3,
    name: 'PROCESSOS',
    icon: '⚙️',
    description: 'Avalia o nível de padronização e estratégia',
    questions: [
      {
        id: '3.1',
        pillarId: 'processos',
        text: 'Maturidade do processo de strategic sourcing',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Não existe processo' },
          { value: 1, label: 'Muito inicial',  description: 'Compras emergenciais predominam' },
          { value: 2, label: 'Básico',         description: 'Processo informal' },
          { value: 3, label: 'Estruturado',    description: 'Processo estruturado e aplicado parcialmente' },
          { value: 4, label: 'Gerenciado',     description: 'Processo consistente e replicável' },
          { value: 5, label: 'Otimizado',      description: 'Excelência com melhoria contínua' },
        ],
      },
      {
        id: '3.2',
        pillarId: 'processos',
        text: 'Gestão por categorias (Category Management)',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Inexistente' },
          { value: 1, label: 'Muito inicial',  description: 'Agrupamento básico de itens' },
          { value: 2, label: 'Básico',         description: 'Algumas categorias definidas' },
          { value: 3, label: 'Estruturado',    description: 'Estratégias por categoria documentadas' },
          { value: 4, label: 'Gerenciado',     description: 'Gestão ativa por categoria' },
          { value: 5, label: 'Otimizado',      description: 'Category management avançado e integrado ao negócio' },
        ],
      },
    ],
  },
  {
    id: 'tecnologia',
    number: 4,
    name: 'TECNOLOGIA',
    icon: '💻',
    description: 'Avalia o uso de ferramentas e automação',
    questions: [
      {
        id: '4.1',
        pillarId: 'tecnologia',
        text: 'Uso de tecnologia em Procurement',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Totalmente manual' },
          { value: 1, label: 'Muito inicial',  description: 'Uso básico de planilhas' },
          { value: 2, label: 'Básico',         description: 'Sistema implantado, mas subutilizado' },
          { value: 3, label: 'Estruturado',    description: 'Uso estruturado de e-procurement' },
          { value: 4, label: 'Gerenciado',     description: 'Integração com ERP e automações' },
          { value: 5, label: 'Otimizado',      description: 'Digitalização avançada (IA, analytics, automação)' },
        ],
      },
      {
        id: '4.2',
        pillarId: 'tecnologia',
        text: 'Automação e eficiência operacional',
        options: [
          { value: 0, label: 'Inexistente',    description: 'Processos totalmente manuais' },
          { value: 1, label: 'Muito inicial',  description: 'Baixa eficiência operacional' },
          { value: 2, label: 'Básico',         description: 'Algumas automações pontuais' },
          { value: 3, label: 'Estruturado',    description: 'Automação em etapas críticas' },
          { value: 4, label: 'Gerenciado',     description: 'Processos otimizados' },
          { value: 5, label: 'Otimizado',      description: 'Operação altamente automatizada e escalável' },
        ],
      },
    ],
  },
];

// Flattened ordered list of the 8 questions — used by the wizard for index navigation
export const ALL_QUESTIONS = ASSESSMENT_DATA.flatMap(p => p.questions);

export function getPillarById(id: string): Pillar | undefined {
  return ASSESSMENT_DATA.find(p => p.id === id);
}

export function getQuestionByIndex(index: number) {
  return ALL_QUESTIONS[index];
}
