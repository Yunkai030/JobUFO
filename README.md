# InterviewMirror

All-in-one job application OS 鈥?resume builder + ATS checker + auto-fill + tracker + Sankey analytics.

## Stack

Next.js 16 (App Router) 路 TypeScript 路 Tailwind v4 路 shadcn/ui 路 Supabase 路 Anthropic Claude API 路 Stripe 路 Vercel

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

- **planner** 鈥?drafts a per-task plan, waits for confirmation
- **coder** 鈥?implements after plan is approved
- **tester** 鈥?verifies (typecheck + lint + unit + integration)
