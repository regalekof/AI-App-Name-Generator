# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

AI Domain Name Generator — a single Next.js 16 app (TypeScript, Tailwind CSS v4, shadcn/ui). No monorepo, no databases, no Docker. See `README.md` for full details.

### Running the app

- `pnpm dev` starts the dev server on `http://localhost:3000`.
- The `.env.local` file must exist (copy from `env.local` if missing): `cp env.local .env.local`
- The app works without any API keys via its built-in fallback name generator. Gemini/OpenAI keys are optional.

### Lint / Build / Test

- **Lint**: `pnpm lint` — note that ESLint is not included in `devDependencies`, so this command will fail. The project does not ship with an ESLint config file.
- **Build**: `pnpm build` — runs successfully; `typescript.ignoreBuildErrors` is enabled in `next.config.mjs`.
- **Tests**: No test framework or test files are present in the repo.

### Gotchas

- The file `env.local` (without the dot prefix) is checked into the repo. Next.js requires `.env.local` (with dot prefix), so you must copy it: `cp env.local .env.local`.
- The Gemini API key shipped in `env.local` may be expired or rate-limited; the app gracefully falls back to its local mock generator.
- `pnpm install` may warn about ignored build scripts for `sharp`. This is cosmetic and does not affect functionality.
