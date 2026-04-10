# IAgentics Procurement Assessment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js web app where IAgentics consultants run a procurement maturity assessment during sales meetings, producing a visual dashboard with radar chart, classification, and estimated financial impact, exportable as a multi-page A4 PDF and shareable via WhatsApp.

**Architecture:** Client-side only Next.js 14+ App Router app with 3 routes (`/`, `/assessment`, `/results`). Global state via Zustand with `persist` middleware (localStorage survives refresh). Pure calculation library (`lib/calculations.ts`) is the single source of business truth, covered by Vitest unit tests. Dashboard export reuses rendered DOM via `html2canvas` → `jsPDF` for fidelity.

**Tech Stack:** Next.js 15 (App Router), TypeScript strict, Tailwind CSS, Zustand 4 (+ persist), Recharts, Framer Motion, html2canvas, jsPDF, Vitest + @testing-library/jest-dom. Deploy target: Railway (Nixpacks, `next start`).

**Spec:** See `docs/superpowers/specs/2026-04-09-procurement-assessment-design.md` for full context.

---

## File Structure

```
Assessment/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout, Inter font, dark theme, metadata pt-BR
│   │   ├── page.tsx                    # Tela 1 — company info form
│   │   ├── assessment/page.tsx         # Tela 2 — wizard
│   │   ├── results/page.tsx            # Tela 3 — results dashboard
│   │   └── globals.css                 # Tailwind directives + CSS vars
│   ├── components/
│   │   ├── AppHeader.tsx               # Logo + app title, used on every page
│   │   ├── CurrencyInput.tsx           # BRL masked input for annual spend
│   │   ├── ProgressBar.tsx             # "Pergunta X de 8" + gradient bar
│   │   ├── QuestionCard.tsx            # Clickable card for one score option (0–5)
│   │   ├── WizardNav.tsx               # Back/Next buttons with validation
│   │   ├── RadarChart.tsx              # Recharts radar with 2 series
│   │   ├── PillarDetail.tsx            # Horizontal bar for one pillar's score
│   │   ├── ClassificationBadge.tsx     # Colored badge (BAIXA/MEDIA/ALTA/BIC)
│   │   ├── FinancialImpact.tsx         # Colored card with R$ impact message
│   │   ├── CommentsSummary.tsx         # List of comments grouped by pillar
│   │   ├── ExportPDFButton.tsx         # Button that lazy-loads PDF lib and downloads
│   │   └── WhatsAppShareButton.tsx     # Anchor to wa.me with pre-filled text
│   ├── data/
│   │   └── assessment-data.ts          # 4 pillars × 2 questions × 6 options + CLASSIFICATIONS
│   ├── lib/
│   │   ├── calculations.ts             # Pillar/total scores, classification, financial impact
│   │   ├── calculations.test.ts        # Vitest unit tests
│   │   ├── currency.ts                 # formatBRL, parseBRL
│   │   ├── currency.test.ts            # Vitest unit tests
│   │   ├── pdf.ts                      # Multi-page A4 export via html2canvas + jsPDF
│   │   └── whatsapp.ts                 # buildWhatsAppURL — pure function
│   ├── store/
│   │   └── assessment-store.ts         # Zustand store with persist middleware
│   └── types/
│       └── assessment.ts               # Shared TypeScript types
├── public/
│   └── logo.webp                       # IAgentics logo copied from user's desktop
├── docs/
│   └── superpowers/
│       ├── specs/2026-04-09-procurement-assessment-design.md
│       └── plans/2026-04-09-procurement-assessment.md  (this file)
├── railway.json
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── package.json
├── .gitignore
└── README.md
```

Each file has a single, focused responsibility. Files that change together (types + data seed, calculations + tests) live together.

---

## Task Index

| # | Task | Files | Atomic commit |
|---|---|---|---|
| 1 | Scaffold Next.js + git init | `package.json`, `src/app/*`, `tsconfig.json`, `.gitignore` | `chore: scaffold Next.js app with TypeScript and Tailwind` |
| 2 | Install runtime & dev dependencies | `package.json`, `package-lock.json` | `chore: install runtime and dev dependencies` |
| 3 | Configure Vitest | `vitest.config.ts`, `package.json` | `chore: configure Vitest for unit tests` |
| 4 | Tailwind brand tokens + globals.css + logo | `tailwind.config.ts`, `src/app/globals.css`, `public/logo.webp` | `style: add brand tokens, globals, logo` |
| 5 | Railway + Next config | `railway.json`, `next.config.mjs`, `package.json` | `chore: configure Railway deploy and next config` |
| 6 | Types | `src/types/assessment.ts` | `feat: add assessment type definitions` |
| 7 | Data seed (4 pillars × 8 questions × 48 options) | `src/data/assessment-data.ts` | `feat: add assessment data seed` |
| 8 | Currency lib (TDD) | `src/lib/currency.ts`, `src/lib/currency.test.ts` | `feat: add BRL currency format/parse utilities with tests` |
| 9 | Calculations lib (TDD) | `src/lib/calculations.ts`, `src/lib/calculations.test.ts` | `feat: add assessment calculations with tests` |
| 10 | Zustand store with persist | `src/store/assessment-store.ts` | `feat: add Zustand assessment store` |
| 11 | Root layout + fonts + metadata | `src/app/layout.tsx`, `src/app/globals.css` | `feat: add root layout with Inter font and dark theme` |
| 12 | AppHeader component | `src/components/AppHeader.tsx` | `feat: add AppHeader with logo` |
| 13 | Currency input + Tela 1 home form | `src/components/CurrencyInput.tsx`, `src/app/page.tsx` | `feat: add home page with company info form` |
| 14 | Wizard primitives (ProgressBar, QuestionCard, WizardNav) | `src/components/{ProgressBar,QuestionCard,WizardNav}.tsx` | `feat: add wizard primitive components` |
| 15 | Tela 2 wizard page | `src/app/assessment/page.tsx` | `feat: add wizard page with animations and guards` |
| 16 | RadarChart component | `src/components/RadarChart.tsx` | `feat: add Recharts radar component` |
| 17 | Results sub-components | `src/components/{PillarDetail,ClassificationBadge,FinancialImpact,CommentsSummary}.tsx` | `feat: add results dashboard sub-components` |
| 18 | Tela 3 results page | `src/app/results/page.tsx` | `feat: add results dashboard page with guards` |
| 19 | WhatsApp share | `src/lib/whatsapp.ts`, `src/components/WhatsAppShareButton.tsx` | `feat: add WhatsApp share button` |
| 20 | PDF export | `src/lib/pdf.ts`, `src/components/ExportPDFButton.tsx`, modify `src/app/results/page.tsx` | `feat: add multi-page PDF export` |
| 21 | Final verification (build, lint, test) | none (verification only) | `chore: final verification pass` |

---

## Task 1: Scaffold Next.js + git init

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `tailwind.config.ts`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, and other default `create-next-app` scaffolding
- Create: `.git/` (via `git init`)

**Context:** Working directory `C:\Users\rgoal\Desktop\IAgentics\Assessment` contains only `docs/` (spec and plan) and `.superpowers/` (brainstorm session). No code, not a git repo yet. We need to scaffold a Next.js 14+ project with TypeScript, Tailwind, App Router, `src/` directory, and ESLint. `create-next-app` refuses to run in a directory that contains unexpected files, so we temporarily stash `docs/` and `.superpowers/` before running it, then move them back.

- [ ] **Step 1.1: Stash pre-existing directories so create-next-app sees an empty dir**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  mkdir -p ../.assessment-stash && \
  mv docs ../.assessment-stash/docs && \
  mv .superpowers ../.assessment-stash/superpowers
```

Expected: `docs/` and `.superpowers/` moved out. `ls -a` shows only `.` and `..` in `Assessment/`.

- [ ] **Step 1.2: Run create-next-app with fixed flags**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  npx --yes create-next-app@latest . \
    --typescript \
    --tailwind \
    --eslint \
    --app \
    --src-dir \
    --import-alias "@/*" \
    --use-npm \
    --no-turbopack \
    --no-git
```

Expected: `create-next-app` prints "Success! Created..." and exits 0. The directory now contains `package.json`, `tsconfig.json`, `src/app/`, `public/`, `node_modules/`, etc. `--no-git` tells it not to auto-init (we'll do it ourselves after restoring stashed files).

If Next prompts interactively (e.g., "Would you like to use Turbopack?"), it's because a flag is wrong for the installed version. In that case, rerun with `--no-turbopack` removed and let it default. If `--no-git` isn't recognized either, drop it — we'll remove any auto-created `.git` before re-initing.

- [ ] **Step 1.3: Restore stashed directories**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  mv ../.assessment-stash/docs ./docs && \
  mv ../.assessment-stash/superpowers ./.superpowers && \
  rmdir ../.assessment-stash
```

Expected: `docs/` and `.superpowers/` are back in place. `rmdir` only succeeds if the stash is empty, which it should be.

- [ ] **Step 1.4: Initialize git repo**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git init && \
  git branch -M main
```

Expected: "Initialized empty Git repository" and the default branch is named `main`.

- [ ] **Step 1.5: Pin Node engine in package.json**

Modify `package.json` to add an `engines` field below `version`:

```json
"engines": {
  "node": ">=20.0.0"
},
```

- [ ] **Step 1.6: Verify dev server boots**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build completes with "✓ Compiled successfully". Any TS errors here must be fixed before continuing.

- [ ] **Step 1.7: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add -A && \
  git commit -m "chore: scaffold Next.js app with TypeScript and Tailwind"
```

Expected: a commit is created. If git complains about missing user.name/email, set them with `git config user.email` / `git config user.name` (do NOT use `--global`).

---

## Task 2: Install runtime & dev dependencies

**Files:**
- Modify: `package.json`, `package-lock.json`

- [ ] **Step 2.1: Install runtime dependencies**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  npm install zustand@^4 recharts@^2 framer-motion@^11 html2canvas@^1.4 jspdf@^2.5
```

Expected: `npm` installs the 5 packages and updates `package.json` + `package-lock.json` without errors.

- [ ] **Step 2.2: Install dev dependencies**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  npm install --save-dev vitest@^2 @vitest/ui@^2 jsdom@^25 @testing-library/jest-dom@^6
```

Expected: 4 dev packages installed without errors. (We add `jsdom` and testing-library even though our tests are pure functions — future-proofs the Vitest config in case the agent adds component tests accidentally.)

- [ ] **Step 2.3: Verify types resolve**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 2.4: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add package.json package-lock.json && \
  git commit -m "chore: install runtime and dev dependencies"
```

---

## Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add scripts)

- [ ] **Step 3.1: Create vitest.config.ts**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
```

- [ ] **Step 3.2: Add test scripts to package.json**

In `package.json`, inside `"scripts"`, add:

```json
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"
```

- [ ] **Step 3.3: Smoke test — create and run a trivial test**

Create `src/lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run:

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: Vitest prints "1 passed" and exits 0.

- [ ] **Step 3.4: Delete smoke test**

Remove `src/lib/smoke.test.ts` (it was only to verify the config).

- [ ] **Step 3.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add vitest.config.ts package.json && \
  git commit -m "chore: configure Vitest for unit tests"
```

---

## Task 4: Tailwind v4 brand tokens + globals.css + logo

**IMPORTANT — Tailwind v4:** Task 1 installed Tailwind CSS **v4** (Next 16.x default). Tailwind v4 does NOT use `tailwind.config.ts` — all theme tokens live inside CSS via `@theme` blocks, and content detection is automatic. Utilities like `bg-brand-purple` are auto-generated from custom `--color-brand-purple` properties in `@theme`. Do NOT create a `tailwind.config.ts` file.

**Files:**
- Overwrite: `src/app/globals.css` (completely replace the create-next-app default)
- Create: `public/logo.webp` (copied from user's Desktop)

- [ ] **Step 4.1: Copy logo file into public/**

```bash
cp "C:/Users/rgoal/Desktop/IAgentics/IAgentics_gradient@1.5x.webp" \
   "C:/Users/rgoal/Desktop/IAgentics/Assessment/public/logo.webp"
```

Expected: file exists at `public/logo.webp`. Verify with `ls -l "C:/Users/rgoal/Desktop/IAgentics/Assessment/public/logo.webp"`.

- [ ] **Step 4.2: Replace src/app/globals.css with Tailwind v4 theme + brand tokens**

Completely overwrite `src/app/globals.css` with the following content. This replaces the `create-next-app` default that uses Geist fonts / light theme tokens. We're defining custom brand tokens in `@theme`, a dark base, PDF export helpers, and reduced-motion support.

```css
@import "tailwindcss";

@theme {
  /* Brand color palette — each --color-* generates a bg-/text-/border-/ring-* utility */
  --color-brand-purple: #7030A0;
  --color-brand-purple-light: #a855f7;
  --color-brand-purple-dark: #4c1d95;
  --color-brand-dark: #0a0a0a;
  --color-brand-surface: #111827;
  --color-brand-border: #1f2937;
  --color-brand-text: #e5e7eb;
  --color-brand-muted: #9ca3af;
  --color-brand-danger: #dc2626;
  --color-brand-warning: #f59e0b;
  --color-brand-success: #10b981;

  /* Fonts — --font-inter is injected by next/font in layout.tsx */
  --font-sans: var(--font-inter), system-ui, sans-serif;

  /* Background images — available as bg-gradient-purple / bg-radial-purple */
  --background-image-gradient-purple: linear-gradient(135deg, #1a0d29 0%, #111827 100%);
  --background-image-radial-purple: radial-gradient(ellipse at top, rgba(112, 48, 160, 0.2), transparent 50%);

  /* Keyframes + named animations — available as animate-fade-in / animate-slide-in */
  --animate-fade-in: fadeIn 0.4s ease-out;
  --animate-slide-in: slideIn 0.35s ease-out;

  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(8px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    0% { opacity: 0; transform: translateX(20px); }
    100% { opacity: 1; transform: translateX(0); }
  }
}

:root {
  color-scheme: dark;
}

html, body {
  background-color: var(--color-brand-dark);
  color: var(--color-brand-text);
  min-height: 100%;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

*:focus-visible {
  outline: 2px solid var(--color-brand-purple);
  outline-offset: 2px;
  border-radius: 4px;
}

/* PDF export mode — applied via JS on <body> before html2canvas capture */
body.pdf-export {
  background-color: #ffffff !important;
  color: #111827 !important;
}
body.pdf-export .no-print {
  display: none !important;
}
body.pdf-export * {
  animation: none !important;
  transition: none !important;
}
body.pdf-export [data-card] {
  background-color: #f9fafb !important;
  border-color: #e5e7eb !important;
  color: #111827 !important;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4.3: Verify build still passes**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: "✓ Compiled successfully". Tailwind v4 generates the new utilities automatically from the `@theme` tokens. If the build fails with "unknown utility" or similar for `bg-brand-*`, verify the `@theme` block is inside `src/app/globals.css` and the file starts with `@import "tailwindcss";` before it.

- [ ] **Step 4.4: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/app/globals.css public/logo.webp && \
  git commit -m "style: add brand tokens, globals, logo"
```

---

## Task 5: Railway + Next config

**Note:** Task 1 scaffolded `next.config.ts` (TypeScript), not `.mjs`. We edit the `.ts` file here.

**Files:**
- Create: `railway.json`
- Modify: `next.config.ts`
- Modify: `package.json` (start script)

- [ ] **Step 5.1: Create railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

- [ ] **Step 5.2: Update start script to respect PORT**

In `package.json`, replace the `"start"` script with:

```json
"start": "next start -p ${PORT:-3000}"
```

Note: on Windows local runs this expansion still works because npm spawns the command through a shell. Railway provides `$PORT` at runtime.

- [ ] **Step 5.3: Replace src/../next.config.ts**

Overwrite `next.config.ts` with:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Logo is a local webp — next/image serves from /public by default
    unoptimized: false,
  },
  // Zero backend calls — no env-required rewrites/headers
};

export default nextConfig;
```

- [ ] **Step 5.4: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: "✓ Compiled successfully".

- [ ] **Step 5.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add railway.json next.config.ts package.json && \
  git commit -m "chore: configure Railway deploy and next config"
```

---

## Task 6: Types

**Files:**
- Create: `src/types/assessment.ts`

- [ ] **Step 6.1: Create src/types/assessment.ts**

```ts
export type ScoreValue = 0 | 1 | 2 | 3 | 4 | 5;

export type PillarId = 'dados' | 'pessoas' | 'processos' | 'tecnologia';

export type ClassificationId = 'baixa' | 'media' | 'alta' | 'best-in-class';

export interface ScoreOption {
  value: ScoreValue;
  label: string;
  description: string;
}

export interface Question {
  id: string;
  pillarId: PillarId;
  text: string;
  options: ScoreOption[];
}

export interface Pillar {
  id: PillarId;
  number: 1 | 2 | 3 | 4;
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

export interface CompanyInfo {
  companyName: string;
  evaluatorName: string;
  assessmentDate: string; // ISO yyyy-mm-dd
  annualSpend: number;    // BRL in whole reais
}

export interface Answer {
  questionId: string;
  score: ScoreValue;
  comment: string;
}

export interface Classification {
  id: ClassificationId;
  label: string;
  color: string;
}

export interface PillarScore {
  score: number;
  max: 10;
  percentage: number;
}

export interface FinancialImpact {
  minLossPercent: number | null;
  maxLossPercent: number | null;
  minLossAmount: number | null;
  maxLossAmount: number | null;
  message: string;
}

export interface AssessmentResult {
  totalScore: number;
  totalPercentage: number;
  classification: Classification;
  pillarScores: Record<PillarId, PillarScore>;
  financialImpact: FinancialImpact;
}
```

- [ ] **Step 6.2: Verify typecheck**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 6.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/types/assessment.ts && \
  git commit -m "feat: add assessment type definitions"
```

---

## Task 7: Data seed (4 pillars × 8 questions × 48 options)

**Files:**
- Create: `src/data/assessment-data.ts`

- [ ] **Step 7.1: Create src/data/assessment-data.ts**

```ts
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
```

- [ ] **Step 7.2: Verify typecheck**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npx tsc --noEmit
```

Expected: no output, exit 0.

- [ ] **Step 7.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/data/assessment-data.ts && \
  git commit -m "feat: add assessment data seed"
```

---

## Task 8: Currency lib (TDD)

**Files:**
- Create: `src/lib/currency.test.ts` (first — TDD)
- Create: `src/lib/currency.ts`

- [ ] **Step 8.1: Write failing tests in src/lib/currency.test.ts**

```ts
import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRL } from './currency';

describe('formatBRL', () => {
  it('formats 0 as "R$ 0,00"', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats integer value with thousand separator', () => {
    expect(formatBRL(1234567)).toBe('R$ 1.234.567,00');
  });

  it('formats decimal value', () => {
    expect(formatBRL(1234567.89)).toBe('R$ 1.234.567,89');
  });

  it('rounds to 2 decimals', () => {
    expect(formatBRL(1.005)).toBe('R$ 1,01');
  });
});

describe('parseBRL', () => {
  it('parses "R$ 0,00" as 0', () => {
    expect(parseBRL('R$ 0,00')).toBe(0);
  });

  it('parses "R$ 1.234.567,89" as 1234567.89', () => {
    expect(parseBRL('R$ 1.234.567,89')).toBe(1234567.89);
  });

  it('parses bare digits "1234567" as 1234567', () => {
    expect(parseBRL('1234567')).toBe(1234567);
  });

  it('parses "1,50" as 1.5', () => {
    expect(parseBRL('1,50')).toBe(1.5);
  });

  it('returns 0 for empty string', () => {
    expect(parseBRL('')).toBe(0);
  });

  it('returns 0 for non-numeric garbage', () => {
    expect(parseBRL('abc')).toBe(0);
  });

  it('round-trips format → parse', () => {
    const values = [0, 1, 100, 1234.56, 1234567.89, 99999999.99];
    for (const v of values) {
      expect(parseBRL(formatBRL(v))).toBe(v);
    }
  });
});
```

- [ ] **Step 8.2: Run tests — expect failure (module missing)**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: tests FAIL with "Cannot find module './currency'".

- [ ] **Step 8.3: Implement src/lib/currency.ts**

```ts
const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number): string {
  // Replace NBSP (U+00A0) inserted by Intl with a regular space for stable tests.
  return formatter.format(value).replace(/\u00A0/g, ' ');
}

export function parseBRL(raw: string): number {
  if (!raw) return 0;
  // Strip everything that isn't a digit, comma, dot, or minus.
  const cleaned = raw.replace(/[^\d,.\-]/g, '');
  if (!cleaned) return 0;
  // pt-BR: dots are thousand separators, comma is decimal separator.
  // Remove all dots, then replace comma with dot.
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
```

- [ ] **Step 8.4: Run tests — expect pass**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: all currency tests pass. If any fail because of non-breaking space in `formatBRL` output, the replace step above should handle it — if not, debug by logging `formatBRL(0).charCodeAt(2)`.

- [ ] **Step 8.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/lib/currency.ts src/lib/currency.test.ts && \
  git commit -m "feat: add BRL currency format/parse utilities with tests"
```

---

## Task 9: Calculations lib (TDD)

**Files:**
- Create: `src/lib/calculations.test.ts`
- Create: `src/lib/calculations.ts`

This is the business-critical core. We test boundaries, all classifications, and edge cases.

- [ ] **Step 9.1: Write failing tests in src/lib/calculations.test.ts**

```ts
import { describe, it, expect } from 'vitest';
import {
  calculatePillarScore,
  calculateTotalScore,
  calculateTotalPercentage,
  getClassification,
  calculateFinancialImpact,
  computeResult,
} from './calculations';
import { CLASSIFICATIONS } from '@/data/assessment-data';
import type { Answer, CompanyInfo } from '@/types/assessment';

function answer(id: string, score: 0 | 1 | 2 | 3 | 4 | 5, comment = ''): Answer {
  return { questionId: id, score, comment };
}

function answerMap(entries: Answer[]): Record<string, Answer> {
  return Object.fromEntries(entries.map(a => [a.questionId, a]));
}

describe('calculatePillarScore', () => {
  it('returns 0 when no answers', () => {
    expect(calculatePillarScore('dados', {})).toEqual({ score: 0, max: 10, percentage: 0 });
  });

  it('sums 2 answers in the same pillar', () => {
    const answers = answerMap([answer('1.1', 3), answer('1.2', 4)]);
    expect(calculatePillarScore('dados', answers)).toEqual({ score: 7, max: 10, percentage: 70 });
  });

  it('ignores answers from other pillars', () => {
    const answers = answerMap([answer('1.1', 3), answer('2.1', 5)]);
    expect(calculatePillarScore('dados', answers)).toEqual({ score: 3, max: 10, percentage: 30 });
  });

  it('returns 100% when both answers are max', () => {
    const answers = answerMap([answer('4.1', 5), answer('4.2', 5)]);
    expect(calculatePillarScore('tecnologia', answers)).toEqual({ score: 10, max: 10, percentage: 100 });
  });
});

describe('calculateTotalScore', () => {
  it('returns 0 for empty answers', () => {
    expect(calculateTotalScore({})).toBe(0);
  });

  it('sums all 8 answers', () => {
    const answers = answerMap([
      answer('1.1', 3), answer('1.2', 4),
      answer('2.1', 2), answer('2.2', 3),
      answer('3.1', 4), answer('3.2', 5),
      answer('4.1', 2), answer('4.2', 1),
    ]);
    expect(calculateTotalScore(answers)).toBe(24);
  });

  it('returns 40 when all answers are 5', () => {
    const answers = answerMap([
      answer('1.1', 5), answer('1.2', 5),
      answer('2.1', 5), answer('2.2', 5),
      answer('3.1', 5), answer('3.2', 5),
      answer('4.1', 5), answer('4.2', 5),
    ]);
    expect(calculateTotalScore(answers)).toBe(40);
  });
});

describe('calculateTotalPercentage', () => {
  it('0 points → 0%', () => expect(calculateTotalPercentage(0)).toBe(0));
  it('40 points → 100%', () => expect(calculateTotalPercentage(40)).toBe(100));
  it('20 points → 50%', () => expect(calculateTotalPercentage(20)).toBe(50));
  it('24 points → 60%', () => expect(calculateTotalPercentage(24)).toBe(60));
  it('rounds to 1 decimal place', () => {
    expect(calculateTotalPercentage(13)).toBe(32.5);
  });
});

describe('getClassification', () => {
  it('0% → BAIXA', () => expect(getClassification(0).id).toBe('baixa'));
  it('30% → BAIXA', () => expect(getClassification(30).id).toBe('baixa'));
  it('30.99% → BAIXA', () => expect(getClassification(30.99).id).toBe('baixa'));
  it('31% → MÉDIA', () => expect(getClassification(31).id).toBe('media'));
  it('50% → MÉDIA', () => expect(getClassification(50).id).toBe('media'));
  it('50.99% → MÉDIA', () => expect(getClassification(50.99).id).toBe('media'));
  it('51% → ALTA', () => expect(getClassification(51).id).toBe('alta'));
  it('59% → ALTA', () => expect(getClassification(59).id).toBe('alta'));
  it('59.99% → ALTA', () => expect(getClassification(59.99).id).toBe('alta'));
  it('60% → BEST IN CLASS', () => expect(getClassification(60).id).toBe('best-in-class'));
  it('100% → BEST IN CLASS', () => expect(getClassification(100).id).toBe('best-in-class'));
});

describe('calculateFinancialImpact', () => {
  it('BAIXA with 100k spend → 8k..15k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.baixa);
    expect(r.minLossPercent).toBe(8);
    expect(r.maxLossPercent).toBe(15);
    expect(r.minLossAmount).toBe(8_000);
    expect(r.maxLossAmount).toBe(15_000);
    expect(r.message).toContain('8%');
    expect(r.message).toContain('15%');
  });

  it('MÉDIA with 100k spend → 3k..8k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.media);
    expect(r.minLossAmount).toBe(3_000);
    expect(r.maxLossAmount).toBe(8_000);
  });

  it('ALTA with 100k spend → up to 3k', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS.alta);
    expect(r.minLossPercent).toBe(0);
    expect(r.maxLossPercent).toBe(3);
    expect(r.minLossAmount).toBe(0);
    expect(r.maxLossAmount).toBe(3_000);
    expect(r.message).toContain('até');
  });

  it('BEST IN CLASS → nulls + "topo" message', () => {
    const r = calculateFinancialImpact(100_000, CLASSIFICATIONS['best-in-class']);
    expect(r.minLossPercent).toBeNull();
    expect(r.maxLossPercent).toBeNull();
    expect(r.minLossAmount).toBeNull();
    expect(r.maxLossAmount).toBeNull();
    expect(r.message.toLowerCase()).toContain('topo');
  });

  it('spend = 0 → zero amounts, no crash', () => {
    const r = calculateFinancialImpact(0, CLASSIFICATIONS.baixa);
    expect(r.minLossAmount).toBe(0);
    expect(r.maxLossAmount).toBe(0);
  });
});

describe('computeResult', () => {
  const company: CompanyInfo = {
    companyName: 'Empresa Teste',
    evaluatorName: 'Consultor',
    assessmentDate: '2026-04-09',
    annualSpend: 1_000_000,
  };

  it('computes complete result for happy path', () => {
    const answers = answerMap([
      answer('1.1', 3), answer('1.2', 4),
      answer('2.1', 2), answer('2.2', 3),
      answer('3.1', 4), answer('3.2', 5),
      answer('4.1', 2), answer('4.2', 1),
    ]);
    const r = computeResult(company, answers);
    expect(r.totalScore).toBe(24);
    expect(r.totalPercentage).toBe(60);
    expect(r.classification.id).toBe('best-in-class');
    expect(r.pillarScores.dados).toEqual({ score: 7, max: 10, percentage: 70 });
    expect(r.pillarScores.pessoas).toEqual({ score: 5, max: 10, percentage: 50 });
    expect(r.pillarScores.processos).toEqual({ score: 9, max: 10, percentage: 90 });
    expect(r.pillarScores.tecnologia).toEqual({ score: 3, max: 10, percentage: 30 });
    expect(r.financialImpact.message.toLowerCase()).toContain('topo');
  });

  it('low score → BAIXA + financial impact', () => {
    const answers = answerMap([
      answer('1.1', 1), answer('1.2', 0),
      answer('2.1', 1), answer('2.2', 1),
      answer('3.1', 0), answer('3.2', 1),
      answer('4.1', 1), answer('4.2', 0),
    ]);
    const r = computeResult(company, answers);
    expect(r.totalScore).toBe(5);
    expect(r.totalPercentage).toBe(12.5);
    expect(r.classification.id).toBe('baixa');
    expect(r.financialImpact.minLossAmount).toBe(80_000);
    expect(r.financialImpact.maxLossAmount).toBe(150_000);
  });
});
```

- [ ] **Step 9.2: Run tests — expect failure (module missing)**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: calculations tests FAIL with "Cannot find module './calculations'" (currency tests still pass).

- [ ] **Step 9.3: Implement src/lib/calculations.ts**

```ts
import type {
  Answer,
  AssessmentResult,
  Classification,
  CompanyInfo,
  FinancialImpact,
  PillarId,
  PillarScore,
} from '@/types/assessment';
import { ASSESSMENT_DATA, CLASSIFICATIONS } from '@/data/assessment-data';
import { formatBRL } from './currency';

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculatePillarScore(
  pillarId: PillarId,
  answers: Record<string, Answer>,
): PillarScore {
  const pillar = ASSESSMENT_DATA.find(p => p.id === pillarId);
  if (!pillar) return { score: 0, max: 10, percentage: 0 };
  const score = pillar.questions.reduce((acc, q) => acc + (answers[q.id]?.score ?? 0), 0);
  return { score, max: 10, percentage: round1((score / 10) * 100) };
}

export function calculateTotalScore(answers: Record<string, Answer>): number {
  return Object.values(answers).reduce((acc, a) => acc + (a?.score ?? 0), 0);
}

export function calculateTotalPercentage(totalScore: number): number {
  return round1((totalScore / 40) * 100);
}

export function getClassification(percentage: number): Classification {
  if (percentage < 31) return CLASSIFICATIONS.baixa;
  if (percentage < 51) return CLASSIFICATIONS.media;
  if (percentage < 60) return CLASSIFICATIONS.alta;
  return CLASSIFICATIONS['best-in-class'];
}

export function calculateFinancialImpact(
  annualSpend: number,
  classification: Classification,
): FinancialImpact {
  const safeSpend = Math.max(0, annualSpend);

  switch (classification.id) {
    case 'baixa': {
      const minLossAmount = safeSpend * 0.08;
      const maxLossAmount = safeSpend * 0.15;
      return {
        minLossPercent: 8,
        maxLossPercent: 15,
        minLossAmount,
        maxLossAmount,
        message:
          `Sua empresa pode estar perdendo entre ${formatBRL(minLossAmount)} (8%) e ${formatBRL(maxLossAmount)} (15%) do spend anual`,
      };
    }
    case 'media': {
      const minLossAmount = safeSpend * 0.03;
      const maxLossAmount = safeSpend * 0.08;
      return {
        minLossPercent: 3,
        maxLossPercent: 8,
        minLossAmount,
        maxLossAmount,
        message:
          `Sua empresa pode estar perdendo entre ${formatBRL(minLossAmount)} (3%) e ${formatBRL(maxLossAmount)} (8%) do spend anual`,
      };
    }
    case 'alta': {
      const maxLossAmount = safeSpend * 0.03;
      return {
        minLossPercent: 0,
        maxLossPercent: 3,
        minLossAmount: 0,
        maxLossAmount,
        message:
          `Sua empresa pode estar perdendo até ${formatBRL(maxLossAmount)} (3%) do spend anual`,
      };
    }
    case 'best-in-class':
    default:
      return {
        minLossPercent: null,
        maxLossPercent: null,
        minLossAmount: null,
        maxLossAmount: null,
        message: 'Sua operação está no topo — foco em melhoria contínua',
      };
  }
}

export function computeResult(
  company: CompanyInfo,
  answers: Record<string, Answer>,
): AssessmentResult {
  const totalScore = calculateTotalScore(answers);
  const totalPercentage = calculateTotalPercentage(totalScore);
  const classification = getClassification(totalPercentage);
  const pillarIds: PillarId[] = ['dados', 'pessoas', 'processos', 'tecnologia'];
  const pillarScores = pillarIds.reduce(
    (acc, id) => {
      acc[id] = calculatePillarScore(id, answers);
      return acc;
    },
    {} as Record<PillarId, PillarScore>,
  );
  const financialImpact = calculateFinancialImpact(company.annualSpend, classification);
  return { totalScore, totalPercentage, classification, pillarScores, financialImpact };
}
```

- [ ] **Step 9.4: Run tests — expect pass**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: all tests in `currency.test.ts` AND `calculations.test.ts` pass (at least ~35 test cases).

- [ ] **Step 9.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/lib/calculations.ts src/lib/calculations.test.ts && \
  git commit -m "feat: add assessment calculations with tests"
```

---

## Task 10: Zustand store with persist

**Files:**
- Create: `src/store/assessment-store.ts`

- [ ] **Step 10.1: Create src/store/assessment-store.ts**

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Answer, AssessmentResult, CompanyInfo, Question, ScoreValue } from '@/types/assessment';
import { ALL_QUESTIONS } from '@/data/assessment-data';
import { computeResult } from '@/lib/calculations';

interface AssessmentState {
  company: CompanyInfo | null;
  answers: Record<string, Answer>;
  currentQuestionIndex: number;
  isComplete: boolean;

  setCompany: (info: CompanyInfo) => void;
  setAnswer: (questionId: string, score: ScoreValue, comment: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  completeAssessment: () => void;
  reset: () => void;

  getCurrentQuestion: () => Question | null;
  getResult: () => AssessmentResult | null;
}

const TOTAL_QUESTIONS = ALL_QUESTIONS.length; // 8

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      company: null,
      answers: {},
      currentQuestionIndex: 0,
      isComplete: false,

      setCompany: (info) => set({ company: info }),

      setAnswer: (questionId, score, comment) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: { questionId, score, comment },
          },
        })),

      goToQuestion: (index) => {
        if (index < 0 || index >= TOTAL_QUESTIONS) return;
        set({ currentQuestionIndex: index });
      },

      nextQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        }
      },

      previousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      completeAssessment: () => set({ isComplete: true }),

      reset: () => set({
        company: null,
        answers: {},
        currentQuestionIndex: 0,
        isComplete: false,
      }),

      getCurrentQuestion: () => {
        const { currentQuestionIndex } = get();
        return ALL_QUESTIONS[currentQuestionIndex] ?? null;
      },

      getResult: () => {
        const { company, answers, isComplete } = get();
        if (!company || !isComplete) return null;
        return computeResult(company, answers);
      },
    }),
    {
      name: 'iagentics-assessment-v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        company: state.company,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        isComplete: state.isComplete,
      }),
    },
  ),
);

export const TOTAL_ASSESSMENT_QUESTIONS = TOTAL_QUESTIONS;
```

- [ ] **Step 10.2: Verify typecheck**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 10.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/store/assessment-store.ts && \
  git commit -m "feat: add Zustand assessment store"
```

---

## Task 11: Root layout + fonts + metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 11.1: Replace src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'IAgentics — Assessment de Maturidade em Procurement',
  description:
    'Avaliação de maturidade em procurement com diagnóstico visual, classificação e estimativa de impacto financeiro.',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-brand-dark text-brand-text antialiased">
        <noscript>
          <div style={{ padding: 20, background: '#7030A0', color: 'white', textAlign: 'center' }}>
            Este aplicativo requer JavaScript ativado para funcionar.
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 11.2: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 11.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/app/layout.tsx && \
  git commit -m "feat: add root layout with Inter font and dark theme"
```

---

## Task 12: AppHeader component

**Files:**
- Create: `src/components/AppHeader.tsx`

- [ ] **Step 12.1: Create src/components/AppHeader.tsx**

```tsx
import Image from 'next/image';
import Link from 'next/link';

interface AppHeaderProps {
  right?: React.ReactNode;
}

export function AppHeader({ right }: AppHeaderProps) {
  return (
    <header className="w-full border-b border-brand-border bg-brand-dark/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 focus-visible:outline-none">
          <Image
            src="/logo.webp"
            alt="IAgentics"
            width={36}
            height={36}
            priority
            className="h-9 w-9 rounded-md object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-white">IAgentics</span>
            <span className="text-[10px] uppercase tracking-widest text-brand-muted">
              Procurement Maturity Assessment
            </span>
          </div>
        </Link>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
```

- [ ] **Step 12.2: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes (component is exported but not yet used — warning OK).

- [ ] **Step 12.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/components/AppHeader.tsx && \
  git commit -m "feat: add AppHeader with logo"
```

---

## Task 13: CurrencyInput + Tela 1 home form

**Files:**
- Create: `src/components/CurrencyInput.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 13.1: Create src/components/CurrencyInput.tsx**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { formatBRL, parseBRL } from '@/lib/currency';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function CurrencyInput({ value, onChange, id, required, placeholder, className }: CurrencyInputProps) {
  const [display, setDisplay] = useState<string>(() => (value > 0 ? formatBRL(value) : ''));

  // Reflect external value changes (e.g., store rehydration).
  useEffect(() => {
    setDisplay(value > 0 ? formatBRL(value) : '');
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setDisplay(raw);
    onChange(parseBRL(raw));
  }

  function handleBlur() {
    if (display.trim() === '') {
      onChange(0);
      return;
    }
    const parsed = parseBRL(display);
    setDisplay(parsed > 0 ? formatBRL(parsed) : '');
    onChange(parsed);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      required={required}
      placeholder={placeholder ?? 'R$ 0,00'}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      autoComplete="off"
    />
  );
}
```

- [ ] **Step 13.2: Replace src/app/page.tsx**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/AppHeader';
import { CurrencyInput } from '@/components/CurrencyInput';
import { useAssessmentStore } from '@/store/assessment-store';

export default function HomePage() {
  const router = useRouter();
  const company = useAssessmentStore((s) => s.company);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const answers = useAssessmentStore((s) => s.answers);
  const setCompany = useAssessmentStore((s) => s.setCompany);
  const reset = useAssessmentStore((s) => s.reset);

  const today = new Date().toISOString().slice(0, 10);

  const [companyName, setCompanyName] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(today);
  const [annualSpend, setAnnualSpend] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const hasInProgress = hydrated && !!company && !isComplete && Object.keys(answers).length > 0;
  const hasCompleted = hydrated && !!company && isComplete;

  const isValid =
    companyName.trim().length >= 2 &&
    evaluatorName.trim().length >= 2 &&
    assessmentDate.length >= 10 &&
    annualSpend > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setCompany({
      companyName: companyName.trim(),
      evaluatorName: evaluatorName.trim(),
      assessmentDate,
      annualSpend,
    });
    router.push('/assessment');
  }

  function handleStartNew() {
    reset();
    setCompanyName('');
    setEvaluatorName('');
    setAssessmentDate(today);
    setAnnualSpend(0);
  }

  const inputClass =
    'w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-3 text-base text-white placeholder:text-brand-muted focus:border-brand-purple focus:outline-none';

  return (
    <div className="relative min-h-screen bg-brand-dark bg-radial-purple">
      <AppHeader />
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-12 sm:px-6">
        {hasCompleted && (
          <div className="rounded-lg border border-brand-purple/40 bg-brand-purple/10 p-4">
            <p className="text-sm text-white">
              Você tem um relatório completo de <strong>{company?.companyName}</strong>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/results')}
                className="rounded-md bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-brand-purple-light"
              >
                Ver resultado
              </button>
              <button
                type="button"
                onClick={handleStartNew}
                className="rounded-md border border-brand-border px-4 py-2 text-sm text-brand-text hover:bg-brand-surface"
              >
                Iniciar novo
              </button>
            </div>
          </div>
        )}

        {hasInProgress && !hasCompleted && (
          <button
            type="button"
            onClick={() => router.push('/assessment')}
            className="rounded-lg border border-brand-purple/40 bg-brand-purple/10 p-4 text-left text-sm text-white hover:bg-brand-purple/20"
          >
            ⏵ Retomar assessment em andamento ({company?.companyName})
          </button>
        )}

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Vamos começar</h1>
          <p className="text-brand-muted">
            Em menos de 5 minutos você terá um diagnóstico visual da maturidade de procurement da empresa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="companyName" className="text-sm font-medium text-brand-text">
              Nome da empresa *
            </label>
            <input
              id="companyName"
              type="text"
              required
              minLength={2}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="evaluatorName" className="text-sm font-medium text-brand-text">
              Nome do consultor *
            </label>
            <input
              id="evaluatorName"
              type="text"
              required
              minLength={2}
              value={evaluatorName}
              onChange={(e) => setEvaluatorName(e.target.value)}
              className={inputClass}
              placeholder="Ex: Maria Silva"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assessmentDate" className="text-sm font-medium text-brand-text">
              Data
            </label>
            <input
              id="assessmentDate"
              type="date"
              value={assessmentDate}
              onChange={(e) => setAssessmentDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="annualSpend" className="text-sm font-medium text-brand-text">
              Spend anual estimado (R$) *
            </label>
            <CurrencyInput
              id="annualSpend"
              required
              value={annualSpend}
              onChange={setAnnualSpend}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="mt-2 rounded-lg bg-brand-purple px-6 py-3 text-base font-semibold text-white transition hover:bg-brand-purple-light disabled:cursor-not-allowed disabled:bg-brand-border disabled:text-brand-muted"
          >
            Iniciar Assessment →
          </button>
        </form>
      </main>
    </div>
  );
}
```

- [ ] **Step 13.3: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes. If TypeScript complains about Zustand action selectors, check that each selector function is inline (not referring to unreachable types).

- [ ] **Step 13.4: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/components/CurrencyInput.tsx src/app/page.tsx && \
  git commit -m "feat: add home page with company info form"
```

---

## Task 14: Wizard primitives (ProgressBar, QuestionCard, WizardNav)

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/QuestionCard.tsx`
- Create: `src/components/WizardNav.tsx`

- [ ] **Step 14.1: Create ProgressBar.tsx**

```tsx
interface ProgressBarProps {
  current: number; // 1-indexed
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Progresso do assessment">
      <div className="flex items-center justify-between text-xs text-brand-muted" aria-live="polite">
        <span>
          Pergunta <strong className="text-white">{current}</strong> de {total}
        </span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full bg-gradient-to-r from-brand-purple to-brand-purple-light transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 14.2: Create QuestionCard.tsx**

```tsx
import type { ScoreOption } from '@/types/assessment';

interface QuestionCardProps {
  option: ScoreOption;
  selected: boolean;
  onSelect: () => void;
}

export function QuestionCard({ option, selected, onSelect }: QuestionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'flex w-full items-center gap-4 rounded-lg border px-4 py-3 text-left transition',
        selected
          ? 'border-brand-purple bg-brand-purple/15 shadow-[0_0_0_1px_#7030A0]'
          : 'border-brand-border bg-brand-surface hover:border-brand-purple/60',
      ].join(' ')}
    >
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg font-bold',
          selected ? 'bg-brand-purple text-white' : 'bg-brand-border text-brand-purple-light',
        ].join(' ')}
      >
        {option.value}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-white">{option.label}</span>
        <span className="text-xs text-brand-muted">{option.description}</span>
      </span>
    </button>
  );
}
```

- [ ] **Step 14.3: Create WizardNav.tsx**

```tsx
interface WizardNavProps {
  canGoBack: boolean;
  canGoForward: boolean;
  isLastQuestion: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function WizardNav({ canGoBack, canGoForward, isLastQuestion, onBack, onNext }: WizardNavProps) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        className="rounded-lg border border-brand-border px-5 py-3 text-sm font-medium text-brand-text hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Voltar
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        className="rounded-lg bg-brand-purple px-6 py-3 text-sm font-semibold text-white hover:bg-brand-purple-light disabled:cursor-not-allowed disabled:bg-brand-border disabled:text-brand-muted"
      >
        {isLastQuestion ? 'Ver Resultado →' : 'Próxima →'}
      </button>
    </div>
  );
}
```

- [ ] **Step 14.4: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 14.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/components/ProgressBar.tsx src/components/QuestionCard.tsx src/components/WizardNav.tsx && \
  git commit -m "feat: add wizard primitive components"
```

---

## Task 15: Tela 2 wizard page

**Files:**
- Create: `src/app/assessment/page.tsx`

- [ ] **Step 15.1: Create src/app/assessment/page.tsx**

```tsx
'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import { WizardNav } from '@/components/WizardNav';
import { useAssessmentStore, TOTAL_ASSESSMENT_QUESTIONS } from '@/store/assessment-store';
import { ALL_QUESTIONS, getPillarById } from '@/data/assessment-data';
import type { ScoreValue } from '@/types/assessment';

const SCORE_VALUES: ScoreValue[] = [0, 1, 2, 3, 4, 5];

export default function AssessmentPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const company = useAssessmentStore((s) => s.company);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const answers = useAssessmentStore((s) => s.answers);
  const currentIndex = useAssessmentStore((s) => s.currentQuestionIndex);
  const setAnswer = useAssessmentStore((s) => s.setAnswer);
  const nextQuestion = useAssessmentStore((s) => s.nextQuestion);
  const previousQuestion = useAssessmentStore((s) => s.previousQuestion);
  const completeAssessment = useAssessmentStore((s) => s.completeAssessment);

  // Route guards — only run after hydration to avoid SSR mismatch on persist
  useEffect(() => {
    if (!company) {
      router.replace('/');
      return;
    }
    if (isComplete) {
      router.replace('/results');
    }
  }, [company, isComplete, router]);

  const currentQuestion = ALL_QUESTIONS[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const pillar = currentQuestion ? getPillarById(currentQuestion.pillarId) : undefined;
  const isLast = currentIndex === TOTAL_ASSESSMENT_QUESTIONS - 1;
  const hasScore = currentAnswer !== undefined;
  const canGoForward = hasScore;

  const handleSelect = useCallback(
    (score: ScoreValue) => {
      if (!currentQuestion) return;
      setAnswer(currentQuestion.id, score, currentAnswer?.comment ?? '');
    },
    [currentQuestion, currentAnswer, setAnswer],
  );

  const handleNext = useCallback(() => {
    if (!canGoForward) return;
    if (isLast) {
      completeAssessment();
      router.push('/results');
    } else {
      nextQuestion();
    }
  }, [canGoForward, isLast, completeAssessment, nextQuestion, router]);

  // Keyboard: ←/→ between options, Enter advances if valid, Esc goes back
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!currentQuestion) return;
      const target = e.target as HTMLElement | null;
      // Don't hijack keys while typing in the comment textarea.
      if (target && target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter' && canGoForward) {
        e.preventDefault();
        handleNext();
        return;
      }
      if (e.key === 'Escape' && currentIndex > 0) {
        previousQuestion();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const currentScore = currentAnswer?.score;
        const currentPos = currentScore === undefined ? -1 : SCORE_VALUES.indexOf(currentScore);
        const delta = e.key === 'ArrowLeft' ? -1 : 1;
        const nextPos = Math.max(0, Math.min(SCORE_VALUES.length - 1, currentPos + delta));
        const nextScore = SCORE_VALUES[nextPos];
        if (nextScore !== currentScore) {
          handleSelect(nextScore);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentQuestion, currentIndex, currentAnswer, canGoForward, handleNext, handleSelect, previousQuestion]);

  function handleComment(e: React.ChangeEvent<HTMLTextAreaElement>) {
    // Textarea is disabled until a score is selected, so currentAnswer is always defined here.
    if (!currentQuestion || !currentAnswer) return;
    setAnswer(currentQuestion.id, currentAnswer.score, e.target.value);
  }

  const anim = useMemo(
    () =>
      reduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } },
    [reduceMotion],
  );

  if (!company || !currentQuestion || !pillar) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-12 text-brand-muted">Carregando…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AppHeader />
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
        <ProgressBar current={currentIndex + 1} total={TOTAL_ASSESSMENT_QUESTIONS} />

        <AnimatePresence mode="wait">
          <motion.section
            key={currentQuestion.id}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-purple-light">
                <span className="text-lg">{pillar.icon}</span>
                <span>{pillar.name}</span>
              </div>
              <p className="text-xs text-brand-muted">{pillar.description}</p>
            </div>

            <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">
              {currentQuestion.text}
            </h2>

            <div className="flex flex-col gap-2">
              {currentQuestion.options.map((opt) => (
                <QuestionCard
                  key={opt.value}
                  option={opt}
                  selected={currentAnswer?.score === opt.value}
                  onSelect={() => handleSelect(opt.value)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="comment" className="text-sm font-medium text-brand-muted">
                💬 Comentário (opcional)
              </label>
              <textarea
                id="comment"
                rows={3}
                maxLength={500}
                value={currentAnswer?.comment ?? ''}
                onChange={handleComment}
                disabled={!hasScore}
                placeholder={
                  hasScore
                    ? 'Notas do consultor sobre essa resposta…'
                    : 'Selecione uma pontuação acima para habilitar o comentário'
                }
                className="w-full rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm text-white placeholder:text-brand-muted focus:border-brand-purple focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <WizardNav
              canGoBack={currentIndex > 0}
              canGoForward={canGoForward}
              isLastQuestion={isLast}
              onBack={previousQuestion}
              onNext={handleNext}
            />
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
```

- [ ] **Step 15.2: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes. Any unused-var/lint warnings tied to the intentional eslint-disable are OK.

- [ ] **Step 15.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/app/assessment/page.tsx && \
  git commit -m "feat: add wizard page with animations and guards"
```

---

## Task 16: RadarChart component

**Files:**
- Create: `src/components/RadarChart.tsx`

- [ ] **Step 16.1: Create src/components/RadarChart.tsx**

```tsx
'use client';

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PillarId, PillarScore } from '@/types/assessment';

interface RadarChartProps {
  pillarScores: Record<PillarId, PillarScore>;
}

const PILLAR_LABELS: Record<PillarId, string> = {
  dados: 'Dados & Analytics',
  pessoas: 'Pessoas & Governança',
  processos: 'Processos',
  tecnologia: 'Tecnologia',
};

export function RadarChart({ pillarScores }: RadarChartProps) {
  const data = (Object.keys(PILLAR_LABELS) as PillarId[]).map((id) => ({
    pillar: PILLAR_LABELS[id],
    atual: pillarScores[id].percentage,
    bestInClass: 100,
  }));

  return (
    <div className="h-[320px] w-full sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar data={data} outerRadius="70%">
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{ fill: '#e5e7eb', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            stroke="#374151"
          />
          <Radar
            name="Best-in-Class"
            dataKey="bestInClass"
            stroke="#6b7280"
            fill="#6b7280"
            fillOpacity={0.15}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <Radar
            name="Análise Atual"
            dataKey="atual"
            stroke="#7030A0"
            fill="#7030A0"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ color: '#e5e7eb', fontSize: 12, paddingTop: 8 }}
            iconType="circle"
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 16.2: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 16.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/components/RadarChart.tsx && \
  git commit -m "feat: add Recharts radar component"
```

---

## Task 17: Results sub-components

**Files:**
- Create: `src/components/PillarDetail.tsx`
- Create: `src/components/ClassificationBadge.tsx`
- Create: `src/components/FinancialImpact.tsx`
- Create: `src/components/CommentsSummary.tsx`

- [ ] **Step 17.1: Create ClassificationBadge.tsx**

```tsx
import type { Classification } from '@/types/assessment';

interface ClassificationBadgeProps {
  classification: Classification;
  large?: boolean;
}

export function ClassificationBadge({ classification, large }: ClassificationBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider text-white shadow-lg',
        large ? 'px-5 py-2 text-base' : 'px-3 py-1 text-xs',
      ].join(' ')}
      style={{ backgroundColor: classification.color }}
    >
      {classification.label}
    </span>
  );
}
```

- [ ] **Step 17.2: Create PillarDetail.tsx**

```tsx
import type { Pillar, PillarScore } from '@/types/assessment';

interface PillarDetailProps {
  pillar: Pillar;
  score: PillarScore;
}

function colorFor(percentage: number): string {
  if (percentage < 31) return '#dc2626';
  if (percentage < 51) return '#f59e0b';
  return '#10b981';
}

export function PillarDetail({ pillar, score }: PillarDetailProps) {
  const color = colorFor(score.percentage);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium text-white">
          <span className="text-lg">{pillar.icon}</span>
          <span>{pillar.name.replace(/&/g, '&').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}</span>
        </div>
        <span className="font-mono text-xs text-brand-muted">
          {score.score}/{score.max} · {score.percentage}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score.percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 17.3: Create FinancialImpact.tsx**

```tsx
import type { Classification, FinancialImpact as FinancialImpactData } from '@/types/assessment';

interface FinancialImpactProps {
  classification: Classification;
  impact: FinancialImpactData;
}

export function FinancialImpact({ classification, impact }: FinancialImpactProps) {
  const isBIC = classification.id === 'best-in-class';
  return (
    <div
      data-card
      className="flex flex-col gap-2 rounded-xl border p-5"
      style={{
        borderColor: classification.color,
        backgroundColor: `${classification.color}1A`, // ~10% opacity hex
      }}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">
        <span>{isBIC ? '🏆' : '⚠️'}</span>
        Impacto financeiro estimado
      </div>
      <p className="text-base leading-relaxed text-white sm:text-lg">{impact.message}</p>
      <p className="text-xs text-brand-muted">
        Benchmarks Big4 (Deloitte, PwC, KPMG, EY) para maturidade em procurement.
      </p>
    </div>
  );
}
```

- [ ] **Step 17.4: Create CommentsSummary.tsx**

```tsx
import type { Answer, Pillar } from '@/types/assessment';

interface CommentsSummaryProps {
  pillars: Pillar[];
  answers: Record<string, Answer>;
}

export function CommentsSummary({ pillars, answers }: CommentsSummaryProps) {
  const items = pillars.flatMap((pillar) =>
    pillar.questions
      .map((q) => ({ pillar, question: q, answer: answers[q.id] }))
      .filter((x) => x.answer?.comment?.trim()),
  );

  if (items.length === 0) return null;

  return (
    <div data-card className="flex flex-col gap-4 rounded-xl border border-brand-border bg-brand-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
        Comentários registrados
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map(({ pillar, question, answer }) => (
          <li
            key={question.id}
            className="border-l-2 border-brand-purple pl-3 text-sm leading-relaxed text-brand-text"
          >
            <div className="text-[11px] uppercase tracking-wider text-brand-muted">
              {pillar.icon} Pergunta {question.id} — {question.text}
            </div>
            <div className="mt-1 text-white">&quot;{answer.comment}&quot;</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 17.5: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 17.6: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/components/PillarDetail.tsx src/components/ClassificationBadge.tsx src/components/FinancialImpact.tsx src/components/CommentsSummary.tsx && \
  git commit -m "feat: add results dashboard sub-components"
```

---

## Task 18: Tela 3 results page

**Files:**
- Create: `src/app/results/page.tsx`

- [ ] **Step 18.1: Create src/app/results/page.tsx**

```tsx
'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AppHeader } from '@/components/AppHeader';
import { ClassificationBadge } from '@/components/ClassificationBadge';
import { PillarDetail } from '@/components/PillarDetail';
import { FinancialImpact } from '@/components/FinancialImpact';
import { CommentsSummary } from '@/components/CommentsSummary';
import { useAssessmentStore } from '@/store/assessment-store';
import { ASSESSMENT_DATA } from '@/data/assessment-data';
import { computeResult } from '@/lib/calculations';
import type { PillarId } from '@/types/assessment';

const RadarChart = dynamic(
  () => import('@/components/RadarChart').then((m) => m.RadarChart),
  { ssr: false, loading: () => <div className="h-[320px] w-full animate-pulse rounded-xl bg-brand-surface" /> },
);

export default function ResultsPage() {
  const router = useRouter();
  const company = useAssessmentStore((s) => s.company);
  const answers = useAssessmentStore((s) => s.answers);
  const isComplete = useAssessmentStore((s) => s.isComplete);
  const reset = useAssessmentStore((s) => s.reset);

  useEffect(() => {
    if (!company || !isComplete) {
      router.replace('/');
    }
  }, [company, isComplete, router]);

  const result = useMemo(() => {
    if (!company || !isComplete) return null;
    return computeResult(company, answers);
  }, [company, answers, isComplete]);

  const pillarIds: PillarId[] = ['dados', 'pessoas', 'processos', 'tecnologia'];

  if (!company || !result) {
    return (
      <div className="min-h-screen bg-brand-dark">
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-12 text-brand-muted">Carregando…</main>
      </div>
    );
  }

  const formattedDate = (() => {
    try {
      const [y, m, d] = company.assessmentDate.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return company.assessmentDate;
    }
  })();

  const fadeIn = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: 'easeOut' as const },
  });

  function handleNewAssessment() {
    if (confirm('Iniciar um novo assessment? O resultado atual será perdido.')) {
      reset();
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark">
      <AppHeader
        right={
          <button
            type="button"
            onClick={handleNewAssessment}
            className="no-print rounded-md border border-brand-border px-3 py-1.5 text-xs text-brand-muted hover:bg-brand-surface"
          >
            + Novo Assessment
          </button>
        }
      />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        {/* PDF Page 1 — Summary + Radar */}
        <section
          id="pdf-page-1"
          className="flex flex-col gap-6"
        >
          <motion.div
            data-card
            {...fadeIn(0)}
            className="rounded-xl border border-brand-purple/40 bg-gradient-purple p-6"
          >
            <div className="flex flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:gap-3">
              <span><strong className="text-brand-text">{company.companyName}</strong></span>
              <span>· Consultor: {company.evaluatorName}</span>
              <span>· {formattedDate}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white">{result.totalScore}</span>
                <span className="text-xl text-brand-muted">/40</span>
              </div>
              <div className="text-2xl font-semibold text-brand-purple-light">
                {result.totalPercentage}%
              </div>
              <ClassificationBadge classification={result.classification} large />
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              data-card
              {...fadeIn(0.1)}
              className="rounded-xl border border-brand-border bg-brand-surface p-5"
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-muted">
                Visão por pilar
              </h3>
              <RadarChart pillarScores={result.pillarScores} />
            </motion.div>

            <motion.div
              data-card
              {...fadeIn(0.2)}
              className="flex flex-col gap-5 rounded-xl border border-brand-border bg-brand-surface p-5"
            >
              <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-muted">
                Detalhamento por pilar
              </h3>
              {pillarIds.map((id) => {
                const pillar = ASSESSMENT_DATA.find((p) => p.id === id)!;
                return <PillarDetail key={id} pillar={pillar} score={result.pillarScores[id]} />;
              })}
            </motion.div>
          </div>
        </section>

        {/* PDF Page 2 — Financial impact */}
        <section id="pdf-page-2" className="flex flex-col gap-6">
          <motion.div {...fadeIn(0.3)}>
            <FinancialImpact classification={result.classification} impact={result.financialImpact} />
          </motion.div>
        </section>

        {/* PDF Page 3 — Comments (optional) */}
        <section id="pdf-page-3" className="flex flex-col gap-6">
          <motion.div {...fadeIn(0.4)}>
            <CommentsSummary pillars={ASSESSMENT_DATA} answers={answers} />
          </motion.div>
        </section>

        {/* Action buttons — not exported to PDF */}
        <div className="no-print mt-4 flex flex-wrap gap-3">
          {/* ExportPDFButton and WhatsAppShareButton slotted in Task 19/20 */}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 18.2: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 18.3: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/app/results/page.tsx && \
  git commit -m "feat: add results dashboard page with guards"
```

---

## Task 19: WhatsApp share

**Files:**
- Create: `src/lib/whatsapp.ts`
- Create: `src/components/WhatsAppShareButton.tsx`
- Modify: `src/app/results/page.tsx` (slot the button)

- [ ] **Step 19.1: Create src/lib/whatsapp.ts**

```ts
import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

export function buildWhatsAppText(company: CompanyInfo, result: AssessmentResult): string {
  const p = result.pillarScores;
  return [
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
}

export function buildWhatsAppURL(company: CompanyInfo, result: AssessmentResult): string {
  const text = buildWhatsAppText(company, result);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 19.2: Create src/components/WhatsAppShareButton.tsx**

```tsx
'use client';

import type { AssessmentResult, CompanyInfo } from '@/types/assessment';
import { buildWhatsAppURL } from '@/lib/whatsapp';

interface WhatsAppShareButtonProps {
  company: CompanyInfo;
  result: AssessmentResult;
}

export function WhatsAppShareButton({ company, result }: WhatsAppShareButtonProps) {
  const url = buildWhatsAppURL(company, result);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1fb855]"
    >
      <span>📱</span> Compartilhar via WhatsApp
    </a>
  );
}
```

- [ ] **Step 19.3: Slot the button into src/app/results/page.tsx**

In `src/app/results/page.tsx`, add this import at the top alongside other `@/components` imports:

```tsx
import { WhatsAppShareButton } from '@/components/WhatsAppShareButton';
```

And replace the final action buttons block:

```tsx
        <div className="no-print mt-4 flex flex-wrap gap-3">
          {/* ExportPDFButton and WhatsAppShareButton slotted in Task 19/20 */}
        </div>
```

with:

```tsx
        <div className="no-print mt-4 flex flex-wrap gap-3">
          <WhatsAppShareButton company={company} result={result} />
        </div>
```

- [ ] **Step 19.4: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes.

- [ ] **Step 19.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/lib/whatsapp.ts src/components/WhatsAppShareButton.tsx src/app/results/page.tsx && \
  git commit -m "feat: add WhatsApp share button"
```

---

## Task 20: PDF export

**Files:**
- Create: `src/lib/pdf.ts`
- Create: `src/components/ExportPDFButton.tsx`
- Modify: `src/app/results/page.tsx`

- [ ] **Step 20.1: Create src/lib/pdf.ts**

```ts
import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export async function exportResultsPDF(
  company: CompanyInfo,
  _result: AssessmentResult,
): Promise<void> {
  // Lazy import so the PDF libs don't bloat the initial bundle.
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pageIds = ['pdf-page-1', 'pdf-page-2', 'pdf-page-3'] as const;
  const elements = pageIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => {
      if (!el) return false;
      // Skip a page that's entirely empty (e.g., pdf-page-3 without comments)
      return el.textContent?.trim() !== '' && el.offsetHeight > 0;
    });

  if (elements.length === 0) {
    throw new Error('Nada para exportar: seções do relatório não encontradas.');
  }

  // Ensure fonts are fully loaded before capture
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await (document as Document & { fonts: { ready: Promise<void> } }).fonts.ready;
  }

  document.body.classList.add('pdf-export');
  try {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;
    const maxContentHeight = pageHeight - margin * 2 - 12; // reserve footer

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const scaledHeight = Math.min((canvas.height * contentWidth) / canvas.width, maxContentHeight);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, margin + 5, contentWidth, scaledHeight);

      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(
        'Relatório gerado por IAgentics | www.iagentics.com.br',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' },
      );
      pdf.text(`Página ${i + 1}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    const filename = `iagentics-assessment-${slugify(company.companyName)}-${company.assessmentDate}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.classList.remove('pdf-export');
  }
}
```

- [ ] **Step 20.2: Create src/components/ExportPDFButton.tsx**

```tsx
'use client';

import { useState } from 'react';
import type { AssessmentResult, CompanyInfo } from '@/types/assessment';

interface ExportPDFButtonProps {
  company: CompanyInfo;
  result: AssessmentResult;
}

export function ExportPDFButton({ company, result }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    try {
      const { exportResultsPDF } = await import('@/lib/pdf');
      await exportResultsPDF(company, result);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-purple-light disabled:cursor-wait disabled:opacity-60"
      >
        <span>📄</span>
        {isExporting ? 'Gerando PDF…' : 'Exportar Relatório PDF'}
      </button>
      {error && <p className="text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 20.3: Slot the button into src/app/results/page.tsx**

Add the import:

```tsx
import { ExportPDFButton } from '@/components/ExportPDFButton';
```

Replace the action buttons block that currently contains only `WhatsAppShareButton`:

```tsx
        <div className="no-print mt-4 flex flex-wrap gap-3">
          <WhatsAppShareButton company={company} result={result} />
        </div>
```

with:

```tsx
        <div className="no-print mt-4 flex flex-wrap gap-3">
          <ExportPDFButton company={company} result={result} />
          <WhatsAppShareButton company={company} result={result} />
        </div>
```

- [ ] **Step 20.4: Verify build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: build passes. The PDF libs should be in a dynamic chunk, not the main bundle.

- [ ] **Step 20.5: Commit**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add src/lib/pdf.ts src/components/ExportPDFButton.tsx src/app/results/page.tsx && \
  git commit -m "feat: add multi-page PDF export"
```

---

## Task 21: Final verification (build, lint, test)

**Files:**
- None (verification only)

- [ ] **Step 21.1: Run full test suite**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run test:run
```

Expected: all tests pass in `currency.test.ts` and `calculations.test.ts`. Roughly ~35 test cases.

- [ ] **Step 21.2: Run lint**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run lint
```

Expected: no errors. Warnings about unused `_result` in `pdf.ts` can be fixed by renaming the parameter or prefixing with `_` (already done). Fix any real errors before proceeding.

- [ ] **Step 21.3: Run typecheck**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 21.4: Run production build**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run build
```

Expected: `✓ Compiled successfully`. The build output should list `/`, `/assessment`, and `/results` as routes. Note the First Load JS size for each — the `/results` route should NOT include `html2canvas` or `jspdf` in the initial bundle (they should be in a separate chunk).

- [ ] **Step 21.5: Manual smoke test — dev server**

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && npm run dev
```

In a browser at `http://localhost:3000`:
1. Fill the form on `/` with: company "Teste Ltda", consultor "João", today's date, spend "R$ 10.000.000,00". Click "Iniciar Assessment".
2. Complete all 8 questions with varied scores (e.g., 3, 4, 2, 3, 4, 5, 2, 1). Add at least 1 comment.
3. Click "Ver Resultado →". Verify:
   - Summary card shows score, percentage, and classification badge
   - Radar chart renders with 2 visible polygons
   - 4 pillar bars are visible with correct colors
   - Financial impact card shows a BRL message matching the classification
   - Comments section lists the comment
4. Click "Exportar Relatório PDF". Verify a PDF downloads with 3 pages (or 2 if no comments).
5. Click "Compartilhar via WhatsApp". Verify a new tab opens `wa.me` with the expected text.
6. Refresh the browser mid-wizard (new assessment) — should resume on the same question.
7. Click "+ Novo Assessment" → confirms → returns to `/`.

Stop the dev server with Ctrl+C.

- [ ] **Step 21.6: Commit (verification only — no code changes)**

If steps 21.1–21.5 produced no code changes, there's nothing to commit. If lint surfaced an issue and you fixed it:

```bash
cd "C:/Users/rgoal/Desktop/IAgentics/Assessment" && \
  git add -A && \
  git commit -m "chore: final verification pass"
```

- [ ] **Step 21.7: Summarize success**

Report to the user:
- Tests passing: X of X
- Build status: ✓
- Lint status: ✓
- Manual smoke test: ✓
- Dev server URL: `http://localhost:3000`
- Deploy: `git push` to a Railway-linked remote, or `railway up` via CLI

---

## Self-Review Notes

**Spec coverage check:**
- ✓ 4 pillars × 2 questions × 6 options → Task 7 seed
- ✓ Classification ranges (0-30.99, 31-50.99, 51-59.99, ≥60) → Task 9 `getClassification` + tests
- ✓ Financial impact tables for each classification → Task 9 `calculateFinancialImpact` + tests
- ✓ Tela 1 form with 4 fields + BRL mask + localStorage resume → Task 13
- ✓ Tela 2 wizard with progress bar, 6 cards, comment, nav, animations, keyboard → Tasks 14, 15
- ✓ Tela 3 with summary, radar, pillars, impact, comments → Tasks 16, 17, 18
- ✓ PDF export multi-page A4 → Task 20
- ✓ WhatsApp share → Task 19
- ✓ Dark theme + brand tokens + Inter font → Tasks 4, 11
- ✓ Logo IAgentics from user file → Task 4
- ✓ Zustand + persist for single in-progress assessment → Task 10
- ✓ Railway deploy config → Task 5
- ✓ Vitest unit tests for calculations + currency → Tasks 8, 9
- ✓ Reset / "Novo Assessment" button → Task 18
- ✓ Route guards (`/assessment` without company, `/results` without complete) → Tasks 15, 18
- ✓ Mobile-first responsive (Tailwind breakpoints throughout) → Task 13+

**Placeholder scan:** no `TBD`, `TODO`, or `handle edge cases` language in the plan. Each step shows complete code.

**Type consistency check:** `ScoreValue`, `PillarId`, `Answer`, `AssessmentResult`, `FinancialImpact`, `CompanyInfo` are all defined in Task 6 and referenced consistently in Tasks 7–20. `ALL_QUESTIONS` and `CLASSIFICATIONS` exported from `@/data/assessment-data` are used by Tasks 9, 10, 18. `TOTAL_ASSESSMENT_QUESTIONS` exported from `@/store/assessment-store` is used by Task 15.
