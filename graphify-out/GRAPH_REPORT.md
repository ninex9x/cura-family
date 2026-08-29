# Graph Report - cura-family  (2026-08-29)

## Corpus Check
- 32 files · ~14,971 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 293 nodes · 418 edges · 26 communities (19 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6af60afc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- devDependencies
- MainActivity
- page.tsx
- health-state.ts
- compilerOptions
- route.ts
- package.json
- dependencies
- include
- dev.mjs
- CuraFamília
- worker/index.ts
- gradlew
- layout.tsx
- rendered-html.test.mjs
- vite.config.ts
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Q: Entender a estrutura, auditar informações que não podem ficar públicas e implementar o backend

## God Nodes (most connected - your core abstractions)
1. `MainActivity` - 29 edges
2. `compilerOptions` - 18 edges
3. `validateAppState()` - 16 edges
4. `Home()` - 13 edges
5. `GET()` - 10 edges
6. `PUT()` - 10 edges
7. `scripts` - 9 edges
8. `isRecord()` - 8 edges
9. `DownloadBridge` - 7 edges
10. `readString()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `validateAppState()`  [EXTRACTED]
  app/api/state/route.ts → lib/health-state.ts
- `PUT()` --calls--> `validateAppState()`  [EXTRACTED]
  app/api/state/route.ts → lib/health-state.ts
- `parseStoredState()` --calls--> `validateAppState()`  [EXTRACTED]
  app/page.tsx → lib/health-state.ts
- `currentRow()` --calls--> `ensureDbSchema()`  [EXTRACTED]
  app/api/state/route.ts → db/index.ts
- `currentRow()` --calls--> `getDb()`  [EXTRACTED]
  app/api/state/route.ts → db/index.ts

## Import Cycles
- None detected.

## Communities (26 total, 7 thin omitted)

### Community 0 - "devDependencies"
Cohesion: 0.06
Nodes (33): @cloudflare/vite-plugin, @cloudflare/workers-types, eslint, eslint-config-next, devDependencies, @cloudflare/vite-plugin, @cloudflare/workers-types, eslint (+25 more)

### Community 1 - "MainActivity"
Cohesion: 0.09
Nodes (16): android.app.Activity, DownloadBridge, MainActivity, android.content.Intent, android.net.Uri, android.os.Bundle, android.webkit.JavascriptInterface, android.webkit.ValueCallback (+8 more)

### Community 2 - "page.tsx"
Cohesion: 0.10
Nodes (28): createDemoState(), dateDaysAgo(), DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_DETAILS, formatDocumentDate(), formatHistoryDate(), Home(), inferMedicationForm() (+20 more)

### Community 3 - "health-state.ts"
Cohesion: 0.13
Nodes (25): AppStateValidation, ARRAY_LIMITS, DOCUMENT_CATEGORIES, DOCUMENT_MIME_TYPES, DocumentCategory, DOSE_STATUSES, DoseLog, DoseStatus (+17 more)

### Community 4 - "compilerOptions"
Cohesion: 0.09
Nodes (23): @cloudflare/workers-types, dom, dom.iterable, esnext, node, compilerOptions, allowImportingTsExtensions, allowJs (+15 more)

### Community 5 - "route.ts"
Cohesion: 0.14
Nodes (25): currentRow(), dynamic, GET(), isLocalRequest(), isSameOrigin(), json(), LOCAL_HOSTS, PUT() (+17 more)

### Community 6 - "package.json"
Cohesion: 0.10
Nodes (19): allowScripts, esbuild@0.28.1, unrs-resolver@1.11.1, workerd@1.20260828.1, engines, node, name, private (+11 more)

### Community 7 - "dependencies"
Cohesion: 0.13
Nodes (15): drizzle-orm, @fontsource/inter, @fontsource/material-symbols-outlined, next, dependencies, drizzle-orm, @fontsource/inter, @fontsource/material-symbols-outlined (+7 more)

### Community 8 - "include"
Cohesion: 0.20
Nodes (9): **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude (+1 more)

### Community 9 - "dev.mjs"
Cohesion: 0.33
Nodes (4): child, projectRoot, secretsPath, vinextCli

### Community 10 - "CuraFamília"
Cohesion: 0.22
Nodes (8): Arquitetura, Backend local, CuraFamília, Desenvolvimento local, `GET /api/state`, Privacidade, `PUT /api/state`, Requisitos

### Community 11 - "worker/index.ts"
Cohesion: 0.29
Nodes (3): Env, ExecutionContext, worker

### Community 12 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 26 - "Q: Entender a estrutura, auditar informações que não podem ficar públicas e implementar o backend"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Entender a estrutura, auditar informações que não podem ficar públicas e implementar o backend, Source Nodes

## Knowledge Gaps
- **114 isolated node(s):** `dynamic`, `LOCAL_HOSTS`, `metadata`, `viewport`, `View` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `validateAppState()` connect `health-state.ts` to `page.tsx`, `route.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `dynamic`, `LOCAL_HOSTS`, `metadata` to the rest of the system?**
  _114 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `MainActivity` be split into smaller, more focused modules?**
  _Cohesion score 0.09393939393939393 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09659090909090909 - nodes in this community are weakly interconnected._