# IAgentics — Web App de Assessment de Maturidade em Procurement

**Data:** 2026-04-09
**Status:** Design aprovado, pronto para planejamento de implementação
**Autor:** Brainstorm colaborativo (Claude + rgoal)

---

## 1. Contexto & Objetivo

Transformar uma planilha Excel de assessment de maturidade de procurement em um web app completo e responsivo, usado por **consultores da IAgentics em reuniões comerciais** com clientes. O resultado final é um diagnóstico visual (radar chart + classificação + impacto financeiro) que reforça a proposta de valor da consultoria.

**Uso-alvo:** consultor roda o app num notebook/TV durante a reunião, lê cada pergunta em voz alta junto com o cliente, responde no wizard, e no final exibe/exporta o dashboard de resultados.

**Não é:** uma ferramenta self-service para o cliente final. É um instrumento de vendas.

---

## 2. Stack Técnico

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Requisito da spec, roteamento por convenção, deploy Railway trivial |
| Linguagem | **TypeScript** (strict) | Tipagem forte nos cálculos |
| Estilização | **Tailwind CSS** | Dev rápido, utilitários responsivos |
| Estado global | **Zustand 4** + middleware `persist` | API mínima, localStorage embutido |
| Gráficos | **Recharts** | Radar chart pronto, customizável |
| Animações | **Framer Motion** | Transições sutis do wizard e fade dos cards |
| PDF | **html2canvas + jsPDF** | Captura o DOM já renderizado → fidelidade visual |
| Testes | **Vitest** (só cálculos) | Rápido, integração nativa com Vite/Next |
| Deploy | **Railway** (Nixpacks, `next start`) | Autodetect, sem config complexa |
| Backend | **Nenhum** | 100% client-side, sem API, sem banco |

---

## 3. Decisões tomadas no brainstorm

| # | Decisão | Alternativas descartadas |
|---|---|---|
| 1 | Projeto instalado direto em `Assessment/` (sem subpasta) | Subpasta `assessment-app/` |
| 2 | Package manager: **npm** | pnpm, yarn, bun |
| 3 | Estado global: **Zustand + persist** | React Context + useReducer |
| 4 | Testes: **só unitários em `calculations.ts` e `currency.ts`** (Vitest) | Testes de componentes, e2e |
| 5 | Deploy: **Railway** (Next.js server) | Static export, Vercel, só dev local |
| 6 | Logo: **arquivo local** `C:/Users/rgoal/Desktop/IAgentics/IAgentics_gradient@1.5x.webp` copiado para `public/logo.webp` | Placeholder texto, SVG custom |
| 7 | PDF: **A4 multi-página** (capa + pilares/impacto + comentários) | 1 página só, PDF responsivo |
| 8 | localStorage: **um único assessment em andamento** (limpa no reset) | Histórico, import/export JSON |
| 9 | Wizard nav: **clique seleciona, botão "Próxima" avança** (desabilitado até ter resposta) | Auto-avança, híbrido |
| 10 | Layout do wizard: **lista vertical de 6 cards empilhados** | Grid 3×2, escala Likert |
| 11 | Dashboard: **grid 2 colunas no desktop** (Radar + Pilares lado a lado), 1 coluna no mobile | Fluxo vertical único |

---

## 4. Modelo de dados

### 4.1 Types (`src/types/assessment.ts`)

```ts
export type ScoreValue = 0 | 1 | 2 | 3 | 4 | 5;
export type PillarId = 'dados' | 'pessoas' | 'processos' | 'tecnologia';
export type ClassificationId = 'baixa' | 'media' | 'alta' | 'best-in-class';

export interface ScoreOption {
  value: ScoreValue;
  label: string;        // "Inexistente", "Muito inicial"…
  description: string;  // Texto específico da pergunta para aquele nível
}

export interface Question {
  id: string;           // "1.1", "1.2", "2.1"…
  pillarId: PillarId;
  text: string;
  options: ScoreOption[]; // 6 opções (0..5)
}

export interface Pillar {
  id: PillarId;
  number: 1 | 2 | 3 | 4;
  name: string;          // "DADOS & ANALYTICS"
  icon: string;          // "📊"
  description: string;   // "Avalia se a área tem visibilidade real do Spend"
  questions: Question[]; // exatamente 2
}

export interface CompanyInfo {
  companyName: string;
  evaluatorName: string;
  assessmentDate: string; // ISO yyyy-mm-dd
  annualSpend: number;    // em reais (number, não centavos)
}

export interface Answer {
  questionId: string;
  score: ScoreValue;
  comment: string;        // "" se vazio
}

export interface Classification {
  id: ClassificationId;
  label: string;              // "BAIXA", "MÉDIA", "ALTA", "BEST IN CLASS"
  color: string;              // hex
  percentageMin: number;      // inclusive
  percentageMaxExclusive: number; // exclusive (próxima faixa começa aqui)
}

export interface PillarScore {
  score: number;      // 0..10
  max: 10;
  percentage: number; // 0..100 (1 casa decimal)
}

export interface FinancialImpact {
  minLossPercent: number | null;
  maxLossPercent: number | null;
  minLossAmount: number | null;
  maxLossAmount: number | null;
  message: string;
}

export interface AssessmentResult {
  totalScore: number;               // 0..40
  totalPercentage: number;          // 0..100 (1 casa decimal)
  classification: Classification;
  pillarScores: Record<PillarId, PillarScore>;
  financialImpact: FinancialImpact;
}
```

### 4.2 Seed de dados (`src/data/assessment-data.ts`)

Array hardcoded dos 4 pilares × 2 perguntas × 6 opções, exatamente conforme a spec original. Nunca mutado.

- **Pilar 1 — DADOS & ANALYTICS** (📊): Pergunta 1.1 (Spend analysis estruturado), 1.2 (Qualidade e governança de dados)
- **Pilar 2 — PESSOAS & GOVERNANÇA** (👥): Pergunta 2.1 (Capacidade e senioridade do time), 2.2 (Gestão de stakeholders)
- **Pilar 3 — PROCESSOS** (⚙️): Pergunta 3.1 (Maturidade do strategic sourcing), 3.2 (Category Management)
- **Pilar 4 — TECNOLOGIA** (💻): Pergunta 4.1 (Uso de tecnologia), 4.2 (Automação)

Cada pergunta tem as 6 descrições 0–5 conforme spec.

### 4.3 Zustand Store (`src/store/assessment-store.ts`)

```ts
interface AssessmentState {
  // Estado persistido
  company: CompanyInfo | null;
  answers: Record<string, Answer>;     // keyed by questionId
  currentQuestionIndex: number;        // 0..7
  isComplete: boolean;

  // Ações
  setCompany(info: CompanyInfo): void;
  setAnswer(questionId: string, score: ScoreValue, comment: string): void;
  goToQuestion(index: number): void;
  nextQuestion(): void;
  previousQuestion(): void;
  completeAssessment(): void;
  reset(): void;

  // Selectors derivados (não persistidos)
  getCurrentQuestion(): Question | null;
  getResult(): AssessmentResult | null;
}
```

**Persist config:**
- Chave: `iagentics-assessment-v1`
- Campos persistidos: `company`, `answers`, `currentQuestionIndex`, `isComplete`
- Selectors nunca são persistidos — são sempre derivados on-demand

---

## 5. Regras de negócio

### 5.1 Classificação

Aplicada sobre `totalPercentage` (sem arredondamento):

| Faixa (%) | ID | Label | Cor |
|---|---|---|---|
| `p < 31` | `baixa` | BAIXA | `#dc2626` (vermelho) |
| `31 ≤ p < 51` | `media` | MÉDIA | `#f59e0b` (amarelo) |
| `51 ≤ p < 60` | `alta` | ALTA | `#10b981` (verde) |
| `p ≥ 60` | `best-in-class` | BEST IN CLASS | `#7030A0` (roxo) |

**Pseudocódigo:**
```ts
function getClassification(percentage: number): Classification {
  if (percentage < 31) return BAIXA;
  if (percentage < 51) return MEDIA;
  if (percentage < 60) return ALTA;
  return BEST_IN_CLASS;
}
```

Valores de referência (denominador = 40):
- BAIXA: 0 a 12.39 pontos (0 a 30.99%)
- MÉDIA: 12.40 a 20.39 pontos (31 a 50.99%)
- ALTA: 20.40 a 23.99 pontos (51 a 59.99%)
- BEST IN CLASS: 24 pontos ou mais (≥ 60%)

**Nota:** O usuário especificou "BIC > 60%", mas pela tabela ALTA termina em "59,99%", deixando um gap em 60,00%. Interpretamos pragmaticamente como **`p ≥ 60`** → BIC. Assim, uma pontuação de exatamente 24/40 (60%) cai em BIC, não em ALTA. Isso é o único valor inteiro possível em 60% e bate com a intenção de reconhecer atingimento pleno.

### 5.2 Impacto financeiro

Função pura de `annualSpend` (R$) e `classification`:

| Classificação | Min loss % | Max loss % | Template de mensagem |
|---|---:|---:|---|
| BAIXA | 8% | 15% | `"Sua empresa pode estar perdendo entre {minBRL} (8%) e {maxBRL} (15%) do spend anual"` |
| MÉDIA | 3% | 8% | `"Sua empresa pode estar perdendo entre {minBRL} (3%) e {maxBRL} (8%) do spend anual"` |
| ALTA | 0% | 3% | `"Sua empresa pode estar perdendo até {maxBRL} (3%) do spend anual"` |
| BEST IN CLASS | — | — | `"Sua operação está no topo — foco em melhoria contínua"` |

Spend = 0 → retorna 0 em todos os campos sem crashar.

### 5.3 Formatação BRL

`lib/currency.ts` — wrapper de `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`:

```ts
formatBRL(1234567.89) // "R$ 1.234.567,89"
parseBRL("R$ 1.234.567,89") // 1234567.89
parseBRL("") // 0
parseBRL("abc") // 0
```

Round-trip: `parseBRL(formatBRL(x)) === x` deve valer para todos os inputs válidos.

### 5.4 Cálculo de scores

```ts
calculatePillarScore(pillarId, answers): { score, max: 10, percentage }
calculateTotalScore(answers): number  // 0..40
calculateTotalPercentage(totalScore): number  // 0..100 com 1 casa decimal
computeResult(company, answers): AssessmentResult  // compõe tudo
```

Pergunta ausente em `answers` é tratada como score 0 (não crasha).

---

## 6. Estrutura de arquivos

```
Assessment/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (dark theme, fonte Inter, metadata pt-BR)
│   │   ├── page.tsx                # Tela 1 — info da empresa
│   │   ├── assessment/page.tsx     # Tela 2 — wizard
│   │   ├── results/page.tsx        # Tela 3 — dashboard
│   │   └── globals.css             # Tailwind + CSS vars da marca
│   ├── components/
│   │   ├── AppHeader.tsx           # Logo IAgentics + título
│   │   ├── QuestionCard.tsx        # 1 card de opção (0–5) clicável
│   │   ├── ProgressBar.tsx         # "Pergunta X de 8" + barra
│   │   ├── WizardNav.tsx           # Voltar / Próxima com validação
│   │   ├── RadarChart.tsx          # Recharts wrapper (2 séries)
│   │   ├── PillarDetail.tsx        # Barra horizontal por pilar
│   │   ├── ClassificationBadge.tsx # Badge colorido da faixa
│   │   ├── FinancialImpact.tsx     # Card de impacto em R$
│   │   ├── CommentsSummary.tsx     # Lista de comentários agrupados
│   │   ├── ExportPDFButton.tsx     # Dispara geração e download
│   │   └── WhatsAppShareButton.tsx # Gera link wa.me
│   ├── data/
│   │   └── assessment-data.ts      # Seed dos 4 pilares × 2 perguntas × 6 opções
│   ├── lib/
│   │   ├── calculations.ts         # Score, %, classificação, impacto
│   │   ├── calculations.test.ts    # Vitest
│   │   ├── currency.ts             # formatBRL, parseBRL
│   │   ├── currency.test.ts        # Vitest
│   │   ├── pdf.ts                  # Geração A4 multi-página
│   │   └── whatsapp.ts             # Builder da URL wa.me
│   ├── store/
│   │   └── assessment-store.ts     # Zustand store
│   └── types/
│       └── assessment.ts           # Types compartilhados
├── public/
│   └── logo.webp                   # Copiado de IAgentics_gradient@1.5x.webp
├── docs/
│   └── superpowers/specs/
│       └── 2026-04-09-procurement-assessment-design.md
├── railway.json
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── package.json
└── .gitignore
```

---

## 7. Telas & Fluxos

### 7.1 Tela 1 — Informações iniciais (`/`)

**Layout:** container centralizado, max-width 560px, fundo dark com gradiente radial roxo sutil no topo.

**Conteúdo:**
- `<AppHeader>` (logo + título)
- Título H1 "Vamos começar"
- Subtítulo de 1 linha explicando o propósito
- Form:
  1. Nome da empresa (required, minLength 2)
  2. Nome do consultor (required, minLength 2)
  3. Data (type=date, default hoje, editável)
  4. Spend anual (input texto com máscara BRL em tempo real, required, > 0)
- Botão "Iniciar Assessment →" (desabilitado até validação passar)
- Se há assessment em andamento no localStorage: botão secundário "Retomar assessment em andamento"
- Se há assessment completo: banner "Você tem um relatório completo de {empresa}. [Ver resultado] [Iniciar novo]"

**Ações:**
- Submit → `setCompany(info)` → `router.push('/assessment')`
- Retomar → `router.push('/assessment')` sem limpar
- Iniciar novo → `reset()` → limpa form

### 7.2 Tela 2 — Wizard (`/assessment`)

**Layout:** max-width 720px, scroll vertical. **Lista vertical de cards (variante A).**

**Estrutura:**
```
AppHeader
ProgressBar ("Pergunta X de 8" + barra)
PillarBadge (icon + name + description)
Question H2
6× QuestionCard (vertical, empilhados, número grande à esquerda + descrição à direita)
Textarea comentário (3 linhas, maxLength 500)
WizardNav (← Voltar | Próxima →)
```

**Guards de rota:**
- Sem `company` no store → redirect `/`
- `isComplete === true` → redirect `/results` (com override via query `?restart=1` que redireciona `/` após reset)

**Comportamento:**
- Clicar card → `setAnswer(id, score, commentExistente)` imediato
- Digitar comentário → `setAnswer(id, scoreExistente, comment)` com debounce 200ms (reduz writes no localStorage)
- Voltar: desabilitado na pergunta 1; preserva estado atual
- Próxima: desabilitado até `score` estar definido; na última pergunta vira **"Ver Resultado →"** e chama `completeAssessment()` + redirect `/results`
- Animação: slide horizontal entre perguntas (direção invertida em "Voltar"). Respeita `prefers-reduced-motion` (sem slide, só fade)
- Teclado: ←/→ entre opções, Enter avança (se válido), ESC volta
- Recarregar browser: retoma exatamente na mesma pergunta (Zustand persist)

### 7.3 Tela 3 — Dashboard (`/results`)

**Layout:** max-width 1100px. **Grid 2 colunas no desktop (`lg:grid-cols-2`), 1 coluna no mobile (variante B).**

**Estrutura:**
```
AppHeader                             [Novo Assessment]

SEÇÃO 1 — Resumo Geral (full width)
  Empresa · Consultor · Data
  26/40 · 65% · [ALTA badge]

SEÇÃO 2 — Radar Chart    │ SEÇÃO 3 — Pilares
(2 colunas no desktop)   │ (4 barras horizontais)

SEÇÃO 4 — Impacto Financeiro (full width, card colorido por classificação)

SEÇÃO 5 — Comentários (full width, só se houver pelo menos 1)

Botões: [📄 Exportar PDF] [📱 WhatsApp]
```

**Guards:**
- Sem `isComplete === true` → redirect `/`

**Comportamento:**
- `computeResult()` via `useMemo` — uma vez por render
- Radar: 4 eixos (Dados, Pessoas, Processos, Tecnologia), 2 séries:
  - Best-in-Class: cinza transparente, 100% em cada eixo
  - Análise Atual: roxo `#7030A0`, 50% opacity no fill, stroke sólido
  - Labels ≥ 12px, `outerRadius` responsivo (menor no mobile)
- Pilares: barras horizontais com cor conforme % do pilar — mesma regra da classificação global (`p < 31` vermelho, `31 ≤ p < 51` amarelo, `p ≥ 51` verde). Isso elimina gaps em 30% e 50%.
- Impacto: borda/ícone com cor da classificação
- Comentários: renderiza a seção só se `≥ 1` não vazio
- Animação: fade-in com stagger (0/100/200/300ms nas seções)
- "Novo Assessment": confirm dialog → `reset()` → `/`

---

## 8. Export PDF

**Arquivo:** `lib/pdf.ts`
**Estratégia:** html2canvas captura `<section>` wrappers pré-definidos no DOM, jsPDF monta A4 portrait multi-página.

**Implementação:**
- Função: `exportResultsPDF(result, company): Promise<void>`
- Aplica classe `.pdf-export` no `<body>` antes da captura:
  - Fundo branco forçado
  - Oculta elementos com `.no-print`
  - Remove animações
- Remove a classe no `finally`
- Aguarda `document.fonts.ready` antes de capturar (fontes carregadas)
- Lazy import de html2canvas/jsPDF — só importa quando clicar

**Páginas:**
1. `#pdf-page-1` — Capa: logo + info empresa + Resumo + Radar
2. `#pdf-page-2` — Detalhamento por pilar + Impacto financeiro
3. `#pdf-page-3` — Comentários (renderiza só se houver comentários)

**Cada página:**
```ts
const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#fff' });
const imgData = canvas.toDataURL('image/png');
const imgWidth = 190; // mm, margem 10mm cada lado
const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 267);
if (pageIndex > 0) pdf.addPage();
pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, imgHeight);
// Rodapé
pdf.setFontSize(8);
pdf.setTextColor(107, 114, 128);
pdf.text('Relatório gerado por IAgentics | www.iagentics.com.br', 105, 290, { align: 'center' });
pdf.text(`Página ${pageIndex + 1}`, 200, 290, { align: 'right' });
```

**Arquivo gerado:** `iagentics-assessment-{empresa-slug}-{data}.pdf`

**Fallbacks:**
- Radar SVG com gradiente que falha no html2canvas → converter SVG → data URL → `<img>` antes
- Erro na geração → toast "Não foi possível gerar o PDF. Tente novamente." + log

---

## 9. WhatsApp Share

**Arquivo:** `lib/whatsapp.ts` — função pura sem dependências.

```ts
function buildWhatsAppURL(company: CompanyInfo, result: AssessmentResult): string {
  const p = result.pillarScores;
  const text = [
    `🔍 Assessment de Maturidade — ${company.companyName}`,
    `📊 Pontuação: ${result.totalScore}/40 (${result.totalPercentage}%)`,
    `📋 Classificação: ${result.classification.label}`,
    ``,
    `Pilares:`,
    `• Dados & Analytics: ${p.dados.percentage}%`,
    `• Pessoas & Governança: ${p.pessoas.percentage}%`,
    `• Processos: ${p.processos.percentage}%`,
    `• Tecnologia: ${p.tecnologia.percentage}%`,
    ``,
    `💡 Gerado por IAgentics | www.iagentics.com.br`,
  ].join('\n');
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
```

Botão é um `<a href={url} target="_blank" rel="noopener">`. Funciona em mobile (abre o app) e desktop (WhatsApp Web).

---

## 10. Design visual

- **Tema:** dark base (`#0a0a0a` background, `#111827` cards)
- **Primária:** roxo `#7030A0` (marca)
- **Acento:** branco, cinza claro (`#e5e7eb`, `#9ca3af`)
- **Tipografia:** Inter (self-hosted via `next/font/google`)
- **Cards:** bordas sutis `#1f2937`, hover com ring roxo, selecionados com borda roxa + background tingido
- **Gradientes sutis** nos cards de resumo (`linear-gradient(135deg, #1a0d29, #111827)`)
- **Ícones dos pilares:** emojis (📊 👥 ⚙️ 💻)
- **Animações Framer Motion:**
  - Tela 1: fade-in do form
  - Tela 2: slide horizontal entre perguntas, fade-in nos cards
  - Tela 3: fade-in com stagger nas 5 seções
  - Respeita `prefers-reduced-motion`
- **Mobile-first:** testado em 360px, 768px, 1280px, 1920px

---

## 11. Testes

**Escopo:** exclusivamente `lib/calculations.ts` e `lib/currency.ts`. Sem testes de componente, sem e2e.

**`calculations.test.ts`:**
- `calculatePillarScore` — soma correta, pergunta faltando = 0
- `calculateTotalScore` — soma correta 0..40, ausentes = 0
- `calculateTotalPercentage` — divisão, 1 casa decimal
- `getClassification` — limites críticos 0, 30.99, 31, 50.99, 51, 59.99, 60, 100 + valores intermediários 30.5, 50.5, 59.5
- `calculateFinancialImpact`:
  - BAIXA spend=100.000 → min 8.000, max 15.000
  - MÉDIA spend=100.000 → min 3.000, max 8.000
  - ALTA spend=100.000 → min 0, max 3.000
  - BIC → nulls + mensagem "topo"
  - spend=0 → zeros, não crasha
- `computeResult` — cenário feliz, objeto bem formado

**`currency.test.ts`:**
- `formatBRL(0)` → `"R$ 0,00"`
- `formatBRL(1234567.89)` → `"R$ 1.234.567,89"`
- `parseBRL("R$ 1.234.567,89")` → `1234567.89`
- `parseBRL("")` → `0`
- `parseBRL("abc")` → `0`
- Round-trip para 10 valores

**Scripts package.json:**
```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"
```

---

## 12. Acessibilidade

- Semântica: `<main>`, `<section>`, `<nav>`, labels em inputs
- Foco visível: ring roxo em tudo focável (`focus-visible:ring-2 ring-brand-purple`)
- Keyboard: QuestionCards são `<button>`, tabuláveis, Enter/Space ativam
- Setas ←/→ navegam entre opções no wizard
- `prefers-reduced-motion`: via Framer Motion `useReducedMotion()`
- Contraste AA em todo texto contra dark
- Screen reader: `aria-live="polite"` no ProgressBar, `aria-label` nos botões icônicos
- Labels do radar em font-size ≥ 12px

---

## 13. Performance

- Fontes: `next/font/google` (Inter) self-hosted, sem CLS
- Imagens: `next/image` com `priority` na logo do header
- Recharts: `dynamic(() => import('@/components/RadarChart'), { ssr: false })` — lazy só em `/results`
- html2canvas + jsPDF: lazy import só ao clicar "Exportar PDF" (economia ~300KB no bundle inicial)
- Zustand persist: assíncrono e lazy por padrão

---

## 14. Deploy Railway

**`railway.json`:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

**`package.json` scripts:**
```json
"dev": "next dev",
"build": "next build",
"start": "next start -p ${PORT:-3000}",
"lint": "next lint",
"test": "vitest",
"test:run": "vitest run"
```

- Node 20 (declarado em `engines`)
- Railway autodetecta Next.js via Nixpacks
- Porta via `$PORT` (Railway seta automaticamente)
- Sem variáveis de ambiente necessárias (app 100% client-side)
- Domínio Railway automático `.up.railway.app`; custom domain depois se quiser

---

## 15. Edge cases & tratamento de erros

| Situação | Comportamento |
|---|---|
| Sem JS (noscript) | Aviso "Este app requer JavaScript para funcionar" |
| localStorage bloqueado/cheio | App continua funcionando, só perde persistência |
| PDF falha | Toast de erro + log no console, sem quebrar a tela |
| Acessa `/results` sem `isComplete` | Redirect para `/` |
| Acessa `/assessment` sem `company` | Redirect para `/` |
| Acessa `/assessment` com assessment completo | Redirect para `/results` (override com `?restart=1`) |
| Data inválida | Input `type="date"` valida; fallback para hoje se parse falhar |
| Spend = 0 ou negativo | Validação no form bloqueia; cálculo defensivo aceita 0 |

---

## 16. Fora do escopo (YAGNI)

- Histórico de múltiplos assessments
- Import/export JSON manual
- Autenticação / multi-usuário
- Backend / banco de dados
- Customização dos pilares ou perguntas (hardcoded)
- Tradução pra outros idiomas (só pt-BR)
- Testes de componente / e2e
- SEO avançado (app é interno de vendas)
- Analytics / telemetria
- Dark mode toggle (sempre dark)
- Assinatura digital do relatório
- Envio automático por e-mail

---

## 17. Critérios de sucesso

O app está "pronto" quando:

1. ✅ Consultor consegue completar um assessment end-to-end em < 5 min sem ajuda
2. ✅ Todos os limites de classificação têm testes unitários passando
3. ✅ `formatBRL`/`parseBRL` têm round-trip test passando
4. ✅ Recarregar o browser no meio do wizard volta exatamente onde parou
5. ✅ PDF gerado contém todas as 5 seções visíveis, legíveis, sem overflow
6. ✅ WhatsApp share abre com o texto correto pré-preenchido
7. ✅ Radar chart fica legível em mobile (viewport ≥ 360px)
8. ✅ Lighthouse Performance ≥ 90 e Accessibility ≥ 95 em `/results`
9. ✅ Deploy no Railway funciona com `git push` sem config extra além do `railway.json`
10. ✅ Logo IAgentics aparece no header, tela inicial, dashboard, e PDF
