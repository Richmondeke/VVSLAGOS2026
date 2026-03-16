## Phase 1.1 Task List: Monorepo Bootstrap

### Repository Setup
[x] 1.  Initialise git repo at project root
[x] 2.  Create root `package.json` with `"private": true` and workspace config
[x] 3.  Create `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`
[x] 4.  Install pnpm 9.x globally and verify version
[x] 5.  Create `turbo.json` with pipeline definitions: build, test, lint, dev
[x] 6.  Create root `tsconfig.base.json` with strict mode, paths, and composite settings
[x] 7.  Create `biome.json` with linting + formatting rules (4-space indent, double quotes, trailing commas)
[x] 8.  Create `.gitignore` covering node_modules, dist, .turbo, .env files
[x] 9.  Create `.env.example` at root with all required env var keys (no values)
[ ] 10. Create root `README.md` with setup instructions

### Folder Skeleton
[x] 11. Create `apps/api/` with empty `package.json` and `src/index.ts`
[x] 12. Create `apps/web/` with empty `package.json`
[x] 13. Create `apps/admin/` with empty `package.json`
[x] 14. Create `apps/workers/` with empty `package.json` and `src/index.ts`
[x] 15. Create `packages/contracts/` with `package.json` and `src/index.ts`
[x] 16. Create `packages/shared/` with `package.json` and `src/index.ts`
[x] 17. Create `packages/auth/` through `packages/platform/` with empty package stubs
[x] 18. Create `migrations/` with subdirs: auth, members, marketplace, finance, social, platform, reporting
[x] 19. Run `pnpm install` at root — verify workspace links resolve correctly
[x] 20. Run `pnpm turbo build` — verify no errors on empty packages

### TypeScript Config Per Package
[x] 21. Add `tsconfig.json` to each package extending `../../tsconfig.base.json`
[x] 22. Verify `packages/contracts` has `"declaration": true` and zero runtime deps
[x] 23. Run `pnpm tsc --noEmit` across all packages — zero errors

### CI Skeleton
[x] 24. Create `.github/workflows/ci.yml` with: install, lint, type-check, test
[ ] 25. Verify GitHub Actions workflow parses correctly (use act locally or push to check)
