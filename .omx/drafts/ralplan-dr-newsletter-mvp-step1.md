# RALPLAN-DR Step 1 Draft — Newsletter System MVP

## Evidence Base
- Deep-interview spec: `.omx/specs/deep-interview-newsletter-system.md`
- PRD: `.omx/plans/prd-newsletter-system-mvp.md`
- Test spec: `.omx/plans/test-spec-newsletter-system-mvp.md`
- Repository state: greenfield workspace with no app source files or package manifest yet; current files are OMX planning/spec artifacts only.

## RALPLAN-DR Short Mode

### Principles
1. **Writing-first beginner clarity** — prioritize a simple long-form editor and obvious publish/send actions over dashboard breadth.
2. **Single-brand MVP boundary** — avoid multi-tenant workspace, billing, CRM automation, advanced analytics, and team workflows in the first pass.
3. **Typed end-to-end coherence** — keep Next.js, Convex, Clerk, Tiptap, and Resend boundaries explicit and TypeScript-first.
4. **Publish before send** — email sending should operate on a published article with a stable public URL.
5. **Constrained rendering over generic conversion** — support a known set of Tiptap nodes and render them safely for public web and email.

### Top 3 Decision Drivers
1. **End-to-end MVP speed** — the first usable flow must prove write -> publish URL -> email subscriber.
2. **Operational simplicity** — minimize custom backend/auth/email infrastructure while preserving verifiable behavior.
3. **Renderer reliability** — public article HTML and email-safe HTML must be predictable from stored Tiptap JSON.

### Viable Implementation Options

#### Option A — Next.js app owns UI/routes; Convex owns data/mutations; Resend called through a Next.js server route/action
**Pros**
- Keeps provider secrets and email provider call in the familiar Next.js server boundary.
- Easy to mock route/action for integration tests.
- Natural fit for Vercel-compatible hosting and Clerk middleware.

**Cons**
- Splits business flow across Convex mutations and Next.js route/action orchestration.
- Needs clear idempotency/status handling so send records stay consistent if Resend succeeds but status update fails.

**Best when**
- The team wants the shortest route to MVP using Vercel/Next.js conventions and simple mocked email tests.

#### Option B — Convex owns article/subscriber/send orchestration; Next.js is mostly UI/rendering; Resend called from Convex action
**Pros**
- Centralizes article, subscriber, and send-status state transitions in Convex.
- Cleaner audit trail around pending/sent/failed EmailSend records.
- Reduces client/Next.js orchestration complexity after UI calls one Convex action.

**Cons**
- Requires carefully configuring secrets/runtime for Convex actions.
- Email HTML rendering either must be shared between Next.js and Convex or implemented as a constrained server-side utility with compatible runtime assumptions.

**Best when**
- The team wants stronger backend workflow ownership and clearer send-status consistency.

#### Recommended baseline
Use **Option B with a constrained shared renderer package/module** if runtime compatibility is manageable; otherwise fall back to Option A for faster MVP delivery. For planning handoff, treat Option B as preferred because the PRD explicitly needs inspectable send status and Convex is already selected for backend/functions/data.

## Requirements Summary

### Must build
- Clerk-protected admin area.
- Article list with draft/published/sent states.
- Article editor with title, excerpt/slug support, Tiptap body JSON, links, headings, lists, blockquote, and image insertion.
- Draft save and preview.
- Publish mutation creating public route visibility.
- Public article route by slug/id with basic SEO metadata.
- Basic subscriber storage with email/status.
- Send published article to active subscribers through Resend.
- Record send success/failure status.

### Must not build in MVP
- Multi-tenant workspace selector.
- Billing/subscription plans.
- CRM tags, segments, automations, A/B tests.
- Advanced analytics dashboard.
- Team roles, approvals, collaboration workflow.

## Adaptive Implementation Steps

### Phase 0 — Scaffold and project hygiene
Create:
- `package.json`
- `pnpm-lock.yaml` after install
- `next.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `.gitignore`
- `.env.example`
- `README.md`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `convex/` scaffold files

Acceptance:
- App boots locally with Next.js App Router and TypeScript.
- Static checks are wired in package scripts: `lint`, `typecheck`, `build`, and test command placeholders or real test runner scripts.

### Phase 1 — Auth and route boundaries
Create:
- `middleware.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx` if needed by Clerk flow
- `src/lib/auth.ts` or equivalent auth helper

Acceptance:
- Unauthenticated users cannot access `/admin`.
- Authenticated admin can reach the dashboard.
- Public routes remain reachable without auth.

### Phase 2 — Convex schema and server functions
Create:
- `convex/schema.ts`
- `convex/articles.ts`
- `convex/subscribers.ts`
- `convex/emailSends.ts`
- `convex/auth.config.ts` if Clerk/Convex auth integration requires it

Acceptance:
- Article, Subscriber, and EmailSend models match the PRD draft fields.
- Mutations/queries support create/update/list/get/publish for articles, create/list subscribers, and send-status recording.
- Unit checks cover required field/status/email validation.

### Phase 3 — Tiptap editor and article admin UX
Create:
- `src/app/admin/articles/page.tsx`
- `src/app/admin/articles/new/page.tsx`
- `src/app/admin/articles/[articleId]/edit/page.tsx`
- `src/components/editor/TiptapEditor.tsx`
- `src/components/editor/ImageInsertControl.tsx`
- `src/components/articles/ArticleForm.tsx`
- `src/components/articles/ArticleToolbar.tsx`
- `src/lib/tiptap/schema.ts`

Acceptance:
- Admin can create a long-form article with title, heading, paragraph, link, list, blockquote, and at least one image.
- Draft save persists Tiptap JSON to Convex.
- UI exposes clear Save, Preview, Publish actions.

### Phase 4 — Public rendering and preview
Create:
- `src/app/admin/articles/[articleId]/preview/page.tsx`
- `src/app/articles/[slug]/page.tsx`
- `src/components/articles/ArticleRenderer.tsx`
- `src/lib/render/tiptapToHtml.ts`
- `src/lib/render/tiptapToPlainText.ts`
- `src/lib/slug.ts`

Acceptance:
- Preview closely matches the public article layout.
- Published article is available on a stable public URL.
- Draft articles are not public.
- Metadata uses article title and excerpt.

### Phase 5 — Subscriber management
Create:
- `src/app/admin/subscribers/page.tsx`
- `src/components/subscribers/SubscriberForm.tsx`
- `src/components/subscribers/SubscriberList.tsx`
- Optional public subscribe route/component: `src/components/subscribers/PublicSubscribeForm.tsx`

Acceptance:
- At least one active subscriber can be created and listed.
- Invalid email addresses are rejected.
- Unsubscribed subscribers are excluded from send target lists.

### Phase 6 — Email rendering and send flow
Create:
- `convex/sendArticle.ts` or `src/app/api/articles/[articleId]/send/route.ts` depending on selected Option B/A boundary
- `src/lib/email/renderArticleEmail.tsx` or `src/lib/email/renderArticleEmail.ts`
- `src/lib/email/resend.ts`
- `src/components/articles/SendArticleButton.tsx`
- `src/components/articles/SendStatusPanel.tsx`

Acceptance:
- Only published articles can be sent.
- Send flow calls Resend with expected recipient, subject, HTML body, and public article URL.
- Success/failure is recorded in EmailSend records and visible or inspectable.
- Automated tests use a mock Resend path unless real sender/domain is configured.

### Phase 7 — Verification hardening and documentation
Create/update:
- `tests/unit/article-schema.test.ts`
- `tests/unit/subscriber-validation.test.ts`
- `tests/unit/tiptap-renderer.test.ts`
- `tests/unit/email-renderer.test.ts`
- `tests/integration/article-flow.test.ts`
- `tests/integration/send-flow.test.ts`
- Optional `tests/e2e/newsletter-smoke.spec.ts`
- `README.md`
- `.env.example`

Acceptance:
- Typecheck, lint, build pass.
- Unit/integration tests pass.
- E2E or manual smoke evidence covers sign in -> create article -> save -> preview -> publish -> public URL -> add subscriber -> send -> status evidence.
- README documents local setup, environment variables, Resend dev constraints, and verification commands.

## Testable Acceptance Criteria
- Admin sign-in via Clerk works and protects `/admin` routes.
- Admin can create and save a draft article with title, rich body, and at least one image.
- Draft can be previewed before publish.
- Article can be published to a public URL.
- Public article route renders title/body/image content and basic metadata.
- Active subscriber can be stored and listed.
- Published article can be sent through Resend or a mocked Resend provider in test/dev.
- Send success/failure is recorded and visible or inspectable.
- Non-goals remain absent: no multi-tenant workspace, billing, segmentation, automations, advanced analytics, or team approval flow.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Image storage choice delays editor completion | Medium | Start with URL-based image insertion or Convex file storage spike; keep abstraction small in `ImageInsertControl`. |
| Tiptap JSON to email HTML is unreliable | High | Constrain supported nodes; build renderer unit tests before broad editor features. |
| Resend domain/sender not available locally | Medium | Add mock provider/test mode; document real-send gap in README and final verification. |
| Clerk + Convex auth integration friction | Medium | Implement route protection first; isolate Convex auth assumptions in one helper/config file. |
| Send status inconsistency on partial failures | High | Create pending EmailSend records before provider call; update to sent/failed in one controlled action; make retry/manual inspection possible later. |
| Scope creep into SaaS/email marketing platform | High | Keep non-goal regression checklist in verification and PR review. |

## Verification Steps
1. Install dependencies and generate lockfile.
2. Run `pnpm lint`.
3. Run `pnpm typecheck`.
4. Run `pnpm test` or the chosen unit/integration runner.
5. Run `pnpm build`.
6. Run local app and Convex dev server.
7. E2E/manual smoke:
   - Sign in as admin.
   - Create article with title, heading, paragraph, link, and image.
   - Save draft.
   - Preview article.
   - Publish article.
   - Open public URL.
   - Add active subscriber.
   - Send article email through mock or real Resend dev sender.
   - Confirm send status/log evidence.
8. Non-goal regression check: verify no multi-tenant, billing, segmentation, automation, advanced analytics, or team approval surfaces were introduced.

## ADR Draft

### Title
Adopt a Convex-centered workflow for the single-brand newsletter MVP on Next.js App Router.

### Decision
Build the MVP with Next.js App Router + TypeScript for UI/routes, Tiptap for article editing, Convex for article/subscriber/send-status data and core mutations/actions, Clerk for admin authentication, Resend for email delivery, and Vercel-compatible hosting. Prefer Convex-owned send orchestration with a constrained shared renderer; allow a Next.js server route fallback if runtime compatibility blocks shared email rendering.

### Drivers
- Fastest path to a working write -> publish -> send MVP.
- Beginner-focused product simplicity.
- Typed data/functions and inspectable send status.
- Avoiding custom auth/database/email infrastructure.

### Alternatives Considered
1. **Next.js server-route-owned send orchestration** — simpler Vercel/Resend boundary but splits state workflow between Next.js and Convex.
2. **Convex-owned send orchestration** — stronger state consistency and backend ownership, but needs runtime-compatible email rendering and secret configuration.
3. **Reopen Supabase/Payload stack comparison** — rejected for this step because the user already selected Option 2 and the spec says not to reopen unless blockers appear.

### Why Chosen
Convex-centered workflow best matches the selected stack and the MVP need for draft/publish/send state transitions while keeping the app single-brand and implementation speed high.

### Consequences
- Renderer compatibility becomes a first-class implementation risk.
- Email sending should be tested through mock/provider boundaries before real domain setup.
- Future multi-tenant or CRM expansion remains deferred and should not shape first-pass schema/UI.

### Follow-ups
- Decide image storage during implementation spike: URL insertion vs Convex file storage vs external object storage.
- Confirm Resend dev/production sender constraints before real-send verification.
- Confirm final test runner choice during scaffold.

## Available Agent Types Roster and Staffing Guidance

### Available agent types
- `explore` — repo/file/symbol mapping and greenfield structure checks.
- `architect` — architecture boundary review, send-flow tradeoffs, auth/data/rendering cohesion.
- `critic` — plan quality, option fairness, risk/test adequacy, scope creep detection.
- `executor` — implementation of assigned feature slices.
- `test-engineer` — unit/integration/e2e strategy and test implementation.
- `verifier` — final evidence collection and acceptance criteria validation.
- `writer` — README, setup docs, handoff notes.
- `dependency-expert` — package/API decision checks if Tiptap/Convex/Clerk/Resend integration uncertainty appears.
- `researcher` — official-doc confirmation for current SDK behavior when needed.

### Ralph path
Use `$ralph` when one persistent owner should execute sequentially:
- Recommended reasoning: high for implementation planning/checkpoints, medium for routine code edits.
- Handoff: include this draft, PRD, test spec, selected Option B baseline, and strict non-goal checklist.
- Best for: conservative delivery, fewer shared-file conflicts, clearer single-owner verification.

### Team path
Use `$team` when parallel throughput matters:
- Lane 1 `executor`: Scaffold/auth/layout and Clerk route protection.
- Lane 2 `executor`: Convex schema, article/subscriber/email send records.
- Lane 3 `executor`: Tiptap editor and article admin UI.
- Lane 4 `test-engineer`: Test harness, unit renderer tests, integration mocks.
- Lane 5 `writer` or `verifier`: README/env docs and final evidence capture.
- Suggested reasoning: executor medium, test-engineer medium/high, verifier high, architect/critic high.

## Team Launch Hints
- `$team implement the newsletter MVP from .omx/drafts/ralplan-dr-newsletter-mvp-step1.md using the selected stack and PRD/test spec; do not add multi-tenant/billing/CRM analytics scope.`
- Or shell-style OMX: `omx team --plan .omx/drafts/ralplan-dr-newsletter-mvp-step1.md`
- Cap concurrent lanes at 4-5 until scaffold stabilizes to reduce conflicts.
- Assign disjoint write scopes:
  - Scaffold/auth: root config, `src/app/*`, `middleware.ts`.
  - Convex/data: `convex/*` only.
  - Editor/rendering: `src/components/editor/*`, `src/components/articles/*`, `src/lib/render/*`.
  - Tests/docs: `tests/*`, `README.md`, `.env.example`.

## Team Verification Path
1. Integration lead merges lanes and resolves shared types/imports.
2. Test lane runs unit/integration tests and reports failures with file-level ownership.
3. Verifier runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
4. Verifier performs E2E/manual smoke against local app and Convex dev server.
5. Final review checks non-goal regression list and validates changed files are within MVP scope.
6. If Resend real send cannot be verified, document mock evidence and exact domain/sender gap.

## Goal-Mode Follow-up Suggestions
- `$ultragoal` — recommended default if the user wants durable goal tracking for delivering the full MVP through verified completion.
- `$autoresearch-goal` — use only if execution pauses for official-doc-heavy research on Tiptap rendering, Convex actions, Clerk/Convex auth, or Resend constraints.
- `$performance-goal` — not recommended for first MVP; use later if editor rendering or send throughput becomes a measurable performance target.

## Open Questions for Execution Handoff
- Should images start as URL insertion, Convex file storage, or an external upload provider?
- Should real Resend sending be required for MVP completion, or is mocked/sandbox send evidence acceptable until domain setup?
- Which test stack should be used after scaffold: Vitest + Testing Library + Playwright, or a lighter first-pass setup?
