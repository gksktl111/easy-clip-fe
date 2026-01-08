# Repository Guidelines

This guide keeps contributors aligned on structure, tooling, and review expectations for the `easy-clip-fe` Next.js app.

## Project Structure & Module Organization

- `app/`: App Router entrypoints (`layout.tsx`, `page.tsx`) and global styles in `globals.css` (Tailwind v4, inline theme definitions).
- `public/`: Static assets (e.g., `next.svg`, `vercel.svg`) served at the root path.
- Root configs: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`; package management via npm (`package-lock.json`).
- Add shared UI modules or hooks under `app/(lib|components|hooks)` to keep routes lean; co-locate styles when specific to a component.

## Build, Test, and Development Commands

- `npm run dev`: Start the Next.js dev server at `http://localhost:3000` with hot reload.
- `npm run build`: Production build (fails on type or lint errors).
- `npm run start`: Serve the production build locally; use for pre-deploy verification.
- `npm run lint`: ESLint with `eslint-config-next` (core web vitals + TypeScript). Run before any PR.

## Coding Style & Naming Conventions

- TypeScript-first; prefer typed props and return values. Functional React components only.
- Indent with two spaces; keep line width reasonable for readability.
- Component files in `app/` should use PascalCase (e.g., `Button.tsx`); utility modules camelCase (e.g., `formatDate.ts`).
- Favor Tailwind utility classes from `globals.css` over ad-hoc inline styles; keep dark mode variants aligned with existing palette variables.

## Testing Guidelines

- No automated tests are present yet. When adding tests, use Vitest + React Testing Library or Playwright for e2e.
- Place unit tests alongside code or under `__tests__/` with `*.test.tsx`/`*.spec.ts`; focus on rendering, accessibility, and routing behaviors.
- Aim for meaningful coverage of shared components/hooks; document any gaps in the PR description.

## Commit & Pull Request Guidelines

### Commit Rules

- Commit messages must follow: `type(scope): summary` (imperative form).  
  Example: `chore(css): apply Tailwind v4`
- Commit messages must be written in **Korean**.
- Allowed scopes:  
  `favorites`, `recent`, `folder`, `settings`, `clips`, `css`, `sidebar`, `filter`, `search`
- Allowed commit types:
  - **chore**: Non-code changes such as package updates, tsconfig edits, `.github` configs, build/test settings, etc.
    - Branch names follow the pattern: `chore/1`, `chore/2`, ... increasing with each new chore PR.
  - **feat**: New features
  - **refactor**: Structural or performance improvements without behavior change
  - **fix**: Bug fixes
  - **docs**: Documentation updates (README, guidelines, comments, etc.)
  - **style**: Non-functional formatting changes (spacing, naming, styling, file structure cleanup)
  - **hotfix**: Urgent patches that bypass normal release flow
  - **release**: Version bumps, release tagging, and deployment-related updates

### PR Creation Rules

- AI is allowed to use GitHub CLI (`gh`) to automate branch creation, commits, pushes, and PR creation.
- PR titles and bodies must be written in **Korean**, consistent with the commit message language rule.
- PRs must follow the repository template located at `.github/PULL_REQUEST_TEMPLATE.md`.
- Each PR body must include:
  - A short summary of the change
  - The reason for the change
  - Linked issue number (issues will be created separately by the maintainer)
  - Before/After screenshots or screen recordings for renderer/UI changes
  - Local validation results:
    - `npm run lint`
    - `npm run start`
    - `npm run package`
- `npm run test:e2e` (if applicable)

### Workflow (For AI Automation)

1. Select or create the branch with the required naming rule (`<type>/<issue-number>`, e.g., `feat/123`); keep branch names in English.
2. Stage changes and commit with Korean messages following `type(scope): summary` and allowed scopes only.
3. Push the branch:
   ```bash
   git push -u origin <branch>
   ```
4. Prepare `pr.md` using `.github/PULL_REQUEST_TEMPLATE.md`; answer every prompt in Korean (summary, reasons, tests, UI Before/After, related issues, checklist, notes).
5. Create a PR targeting `dev` via GitHub CLI, keeping the PR title/body in Korean:
   ```bash
   gh pr create --base dev --title "<한글 제목>" --body-file pr.md
   ```

### Branch Cleanup Shortcut

When the maintainer says “브랜치 정리해줘”, run:

1. Switch to `dev`

```bash
git checkout dev
```

2. Refresh remote refs and prune deleted branches

```bash
git fetch -p
```

3. Delete all local branches marked as `[gone]`

```bash
git branch -vv | awk '/: gone]/{print $1}' | xargs git branch -D
```

## Issue Creation Guidelines (For AI Automation)

### General Rules

- Issues must be created using GitHub CLI (`gh issue create`).
- Issue titles and bodies must be written in **Korean**, even though these rules are documented in English.
- Do not set labels; rely on title prefixes only (`[bug]`, `[feature]`, `[improvement]`).
- Do not create separate `.md` files for issue bodies; use `--body` with inline content.
- When the maintainer provides a natural-language instruction (e.g., “create an issue with this content”), the AI must:
  1. Interpret the user's description.
  2. Determine the correct issue type (bug, feature, improvement).
  3. Select the corresponding issue template.
  4. Generate a complete issue body matching the template format.
  5. Create the issue using GitHub CLI.
  6. Report the created issue number/URL back to the maintainer.

### Issue Templates & Classification Rules

Issue templates are located at:  
`.github/ISSUE_TEMPLATE/`

The AI must classify the issue into one of the following:

#### **1. Bug Report**

- Template: `bug_report.yml`
- Title prefix: `[bug] `
- Use when:
  - Functionality is broken
  - Unexpected behavior occurs
  - Errors appear in console/logs
  - There is a step-by-step reproduction path

#### **2. Feature Implementation**

- Template: `feature_implementation.yml`
- Title prefix: `[feature] `
- Use when:
  - Implementing a new feature
  - Adding UI/UX functionality
  - Creating a new user flow, page, or interactive behavior

#### **3. Improvement**

- Template: `improvement.yml`
- Title prefix: `[improvement] `
- Use when:
  - Improving UX, performance, or responsiveness
  - Refactoring or enhancing existing behavior
  - Suggesting code-quality improvements or UI polish

### Required Template Structure (AI Must Follow)

Each template has required fields that AI must fill:

#### **Bug Report Template**

From `bug_report.yml`:

- 어떤 문제가 발생했나요? (required)
- 재현 방법을 알려주세요 (required)
- 실제 결과는 어땠나요? (required)
- 기대한 결과는 무엇인가요? (required)
- 환경 정보를 알려주세요 (required)
- 로그나 스크린샷이 있다면 첨부해주세요 (optional)

#### **Feature Implementation Template**

From `feature_implementation.yml`:

- 어떤 기능을 구현하나요? (required)
- 어떻게 구현할 예정인가요? (optional)
- 추가로 공유할 내용이 있나요? (optional)

#### **Improvement Template**

From `improvement.yml`:

- 무엇을 개선하길 원하시나요? (required)
- 어떻게 개선하면 좋을지 제안해주세요 (optional)

### Workflow (For AI Automation)

When the maintainer requests an issue to be created:

1. **Interpretation**  
   AI reads the user's request and extracts:

   - The core goal of the issue or feature request
   - Any cause or background context
   - Implementation plan or improvement ideas (if provided)
   - Any additional reference information

2. **Classification**  
   AI determines the appropriate issue type:

   - Bug → bug_report.yml
   - Feature → feature_implementation.yml
   - Improvement → improvement.yml

3. **Issue Body Generation**  
   AI formats the user's input into the exact YAML-driven structure of the selected template.

4. **Issue Creation via GitHub CLI**  
   Example:

   ```bash
   gh issue create \
     --title "[feature] 새로운 폴더 드래그 정렬 기능" \
     --body $'## 어떤 기능을 구현하나요?\n\n...\n\n## 어떻게 구현할 예정인가요?\n\n...\n\n## 추가로 공유할 내용이 있나요?\n\n...'
   ```

5. **Report Back**  
   After creating the issue, AI must return:
   - Issue number (e.g., #42)
   - Issue URL (e.g., `https://github.com/<owner>/<repo>/issues/42`)

### Maintainer Trigger Examples

AI must respond to instructions such as:

- "Create a bug issue with this content."
- "Use the feature template to create an issue for this new functionality."
- "Open an improvement issue for this UX update."
- "Summarize what I said and open an issue."

.

## Security & Configuration Tips

- Secrets belong in `.env.local`; never commit environment files. Reference via `process.env` and document required keys in the PR.
- Rely on `public/` for non-sensitive assets; avoid embedding secrets or private URLs in client components.
