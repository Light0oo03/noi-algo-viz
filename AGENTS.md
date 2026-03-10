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
- Agent workflow rule (must): 每次向 PR 分支 push 后，必须触发 Codex 审核（`@codex review`），并等待审核结果返回后再继续功能迭代。
- Agent workflow rule (must): 若 Codex 提出修改建议，必须先修复并 push，再次触发审核，直到无阻塞性建议。
- Agent workflow rule (must): 审核通过后，涉及 `merge`/删除分支操作前，必须先征求用户同意。
- Agent workflow rule (must): 每次修复 bug 或实现新功能，都必须记录到 `record/YYYY-MM-DD.md`。
- PRs should include:
  - clear change summary and motivation,
  - linked issue/task,
  - screenshots or short recordings for UI changes,
  - verification notes (manual steps + build results).

## Persistence Rule for Visual Editors
- Any user-editable visualization structure (for example graph/tree shape edits) must persist both locally and on backend.
- Save locally on every structural change, with account-scoped keys (for example `prefix:<userId>`, `guest` when logged out).
- For authenticated users, auto-sync changes to backend (debounced is fine) and load backend state first on login/refresh.
- Keep data isolated per account; switching accounts must load that account’s last saved structure.
- For modules that currently have no backend model yet (for example search/sort input arrays and targets), local account-scoped persistence is still required at minimum.
