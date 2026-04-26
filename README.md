# JobUFO

All-in-one job application OS — resume builder + ATS checker + auto-fill + tracker + Sankey analytics.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase · Anthropic Claude API · Stripe · Vercel

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in keys
npm run dev
```

Open <http://localhost:3000>.

## Project docs

- [Product strategy](docs/product_plan.html)
- [4-week MVP dev plan](docs/mvp_dev_plan.html)

## Vibe-coding workflow

This repo is built with three Claude Code subagents in `.claude/agents/`:

- **planner** — drafts a per-task plan, waits for confirmation
- **coder** — implements after plan is approved
- **tester** — verifies (typecheck + lint + unit + integration)
