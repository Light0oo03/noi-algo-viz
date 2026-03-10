# Repository Guidelines

## Project Structure & Module Organization
This repository is split by runtime:
- `front/`: Vue 3 + TypeScript app (Vite). Main code is in `front/src/` with `components/`, `pages/`, `core/` (algorithm logic), `stores/`, `api/`, and `router/`.
- `backend/`: NestJS + Prisma API. Entry is `backend/src/main.ts`; feature modules live under `backend/src/modules/`.
- `cloudflare/api-worker/`: Worker-side API and SQL schema.
- `record/`: dated progress/test notes.

## Build, Test, and Development Commands
Run commands inside each package directory.
- Frontend:
  - `cd front && pnpm install`
  - `pnpm dev` - start Vite dev server.
  - `pnpm build` - type-check (`vue-tsc`) and build production assets.
  - `pnpm preview` - preview the built frontend.
- Backend:
  - `cd backend && pnpm install`
  - `pnpm dev` - run API in watch mode with `tsx`.
  - `pnpm build` - adjust Prisma schema, generate client, compile TypeScript.
  - `pnpm start` - push schema then run compiled server.

## Coding Style & Naming Conventions
- Use TypeScript across frontend and backend.
- Use 2-space indentation and keep existing semicolon/quote style per file.
- Vue SFCs and pages use `PascalCase` (for example `GraphCanvas.vue`, `StackPlayground.vue`).
- Core algorithm modules use kebab-case filenames (for example `valid-parentheses.ts`, `dijkstra-code.ts`).
- Keep modules focused: UI in `components/` or `pages/`, algorithm state transitions in `core/`.

## Testing Guidelines
There is no unified automated test suite yet. Validate changes with:
- `pnpm build` in `front/` and `backend/` to catch type/build regressions.
- Manual scenario checks in `TEST_GUIDE.md` (especially `/playground` flows and animation controls).
- Record significant verification in `record/YYYY-MM-DD.md`.

## Commit & Pull Request Guidelines
- Follow the existing commit pattern: short, imperative summaries, usually prefixed with type tags such as `feat:`, `refactor:`, `ci:`.
- Keep commits scoped (frontend vs backend vs infra) and avoid mixing unrelated changes.
- Agent execution rule: when a coding task is completed to a clean, committable scope, the agent should commit automatically without waiting for an extra "please commit".
- Agent execution rule: after auto-commit, the agent should also run `git push` by default. If push fails due to auth/network/remote policy, report the exact error and next action.
- Agent workflow rule (must): 每完成一个“可测试小模块”，必须先给出明确验收步骤，再进入下一模块开发。
- Agent workflow rule (must): 审核通过后，涉及 `merge`/删除分支操作前，必须先征求用户同意。
- Agent workflow rule (must): 每次修复 bug 或实现新功能，都必须记录到 `record/YYYY-MM-DD.md`。
- PRs should include:
  - clear change summary and motivation,
  - linked issue/task,
  - screenshots or short recordings for UI changes,
  - verification notes (manual steps + build results).

## Dual-Agent Local Review Workflow (must)
- 目标：采用“开发 Agent + 评审 Agent”本地闭环，不再强依赖 GitHub `@codex review` 配额。
- 角色分工：
  - 开发 Agent：实现需求、提交代码、推送分支、根据评审意见修复。
  - 评审 Agent：仅做代码审查，不直接改业务代码。
- 评审通道：统一使用 `record/review/current.md` 作为单一事实来源（Single Source of Truth）。
- 状态流转：
  - 开发 Agent 完成一个可测试小模块后，提交并推送，然后停止在“等待评审”状态。
  - 评审 Agent 在 `record/review/current.md` 写入审查结论：
    - `状态: OPEN` 表示有待修复问题。
    - `状态: PASS` 表示当前模块可继续下一步开发。
  - 开发 Agent 读取 `record/review/current.md` 中所有 `OPEN` 问题并修复，提交后再次等待评审。
- 问题记录规范（评审 Agent 必须遵守）：
  - 每条问题需包含：`问题ID`、`级别(P0/P1/P2)`、`位置(文件:行)`、`问题描述`、`修改建议`、`复审结论`。
- 开发准入门槛：
  - 仅当 `record/review/current.md` 最新结论为 `状态: PASS`，开发 Agent 才能进入下一个功能模块。
- 兼容规则：
  - 若后续恢复 GitHub Codex 审核，可额外触发 `@codex review` 作为补充，不替代本地双 Agent 审核流程。

## Persistence Rule for Visual Editors
- Any user-editable visualization structure (for example graph/tree shape edits) must persist both locally and on backend.
- Save locally on every structural change, with account-scoped keys (for example `prefix:<userId>`, `guest` when logged out).
- For authenticated users, auto-sync changes to backend (debounced is fine) and load backend state first on login/refresh.
- Keep data isolated per account; switching accounts must load that account’s last saved structure.
- For modules that currently have no backend model yet (for example search/sort input arrays and targets), local account-scoped persistence is still required at minimum.
