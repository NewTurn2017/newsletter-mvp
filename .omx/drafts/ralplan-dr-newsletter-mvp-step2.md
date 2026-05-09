# RALPLAN-DR Consensus Plan v2 — Newsletter System MVP

## Evidence Base
- Deep-interview spec: `.omx/specs/deep-interview-newsletter-system.md`
- PRD: `.omx/plans/prd-newsletter-system-mvp.md`
- Test spec: `.omx/plans/test-spec-newsletter-system-mvp.md`
- Prior draft: `.omx/drafts/ralplan-dr-newsletter-mvp-step1.md`
- Architect review: required Convex-owned send boundary, Convex-side auth, pure TS renderer, EmailSend idempotency, and URL-based image MVP.
- Repository state: greenfield workspace with no app source files or package manifest yet; current files are OMX planning/spec artifacts only.

## RALPLAN-DR Short Mode

### Principles
1. **Writing-first beginner clarity** — prioritize a simple long-form editor and obvious save/preview/publish/send actions over dashboard breadth.
2. **Single-brand MVP boundary** — avoid multi-tenant workspace, billing, CRM automation, advanced analytics, and team workflows in the first pass.
3. **Convex-owned workflow integrity** — write, publish, subscriber, and email-send state transitions must be enforced in Convex functions, not only in UI.
4. **Publish before send** — email sending operates only on a published article with a stable public URL.
5. **Constrained rendering over generic conversion** — support a known set of Tiptap nodes and render them safely through pure TypeScript utilities for public web and email/plain text.

### Top 3 Decision Drivers
1. **End-to-end MVP proof** — prove write -> publish URL -> email subscriber with status evidence.
2. **Backend state consistency** — article/subscriber/send records should be owned by one backend workflow with idempotency and auditability.
3. **Runtime-safe rendering** — Tiptap JSON must render without depending on React/Next-only APIs in Convex actions.

### Viable Implementation Options

#### Option A — Next.js server route/action owns Resend send; Convex owns data
**Pros**
- Matches common Resend + Next.js examples and runtime assumptions.
- Easier to use React Email in a Next.js server boundary.
- Faster first provider call if Convex action/runtime setup is unfamiliar.

**Cons**
- Splits send workflow across Next.js and Convex.
- Makes EmailSend idempotency/status updates more failure-prone.
- Requires more careful API authorization in addition to Convex authorization.

**Status**
- Valid fallback only if Convex action runtime or renderer compatibility blocks implementation.
- Not the main plan.

#### Option B — Convex owns article/subscriber/send orchestration; Next.js owns UI and public routes
**Pros**
- Centralizes publish/send state transitions in Convex.
- Supports pending/sent/failed records and duplicate prevention in one backend boundary.
- Fits selected stack and PRD requirement for inspectable send status.

**Cons**
- Requires Convex action environment variables and external API call setup for Resend.
- Requires pure TS renderer rather than React Email-only rendering.

**Status**
- **Chosen baseline.** Execution should implement `convex/sendArticle.ts` as the definitive send boundary.

## Requirements Summary

### Must build
- Clerk-protected admin area and public article routes.
- Convex-side admin authorization for every write/publish/send mutation/action.
- Article list with draft/published/sent states.
- Article editor with title, excerpt/slug support, Tiptap body JSON, headings, paragraphs, links, lists, blockquote, and URL-based image insertion.
- Draft save and preview.
- Publish mutation creating public route visibility.
- Public article route by slug with basic SEO metadata.
- Basic subscriber storage with email/status.
- Convex action to send a published article to active subscribers through Resend.
- EmailSend records with pending/sent/failed transitions and duplicate prevention.

### Must not build in MVP
- Multi-tenant workspace selector.
- Billing/subscription plans.
- CRM tags, segments, automations, A/B tests.
- Advanced analytics dashboard.
- Team roles, approvals, collaboration workflow.
- First-party image upload/storage; use URL-based image insertion for MVP.

## Architecture Decisions

### Backend/send boundary
- Main path: `convex/sendArticle.ts` action calls Resend.
- Next.js must not own the send orchestration in the main implementation.
- Next.js UI triggers Convex action and reads Convex send state.
- A Next.js route/action may exist only as a documented contingency if Convex action runtime blocks Resend calls.

### Convex-side auth
- Add a shared Convex helper, e.g. `convex/lib/auth.ts`, with `requireAdmin(ctx)`.
- Every Convex mutation/action that creates/updates/publishes/sends must call `requireAdmin`.
- `/admin` route protection is required but insufficient by itself.

### Renderer contract
- Store article content as Tiptap JSON.
- Add pure TypeScript renderers that avoid React/Next-only APIs:
  - `src/lib/render/tiptapToHtml.ts`
  - `src/lib/render/tiptapToPlainText.ts`
- Supported nodes for MVP: doc, paragraph, heading, text, bold, italic, link, bulletList, orderedList, listItem, blockquote, hardBreak, image.
- Public article rendering and email rendering should reuse the same constrained renderer behavior where possible.
- Email HTML should include title, rendered article body, and public article URL.

### EmailSend state and idempotency
- For each article-recipient pair, prevent duplicate sent records by index/query check.
- Send action flow:
  1. require admin identity,
  2. fetch and verify article is `published`,
  3. fetch active subscribers,
  4. create or reuse `pending` EmailSend records before provider calls,
  5. call Resend per recipient or accepted batch shape,
  6. update each record to `sent` with provider message id or `failed` with error,
  7. mark article `sent` only after at least one successful send, while preserving individual failure records.
- Retry behavior: first MVP may expose inspectable failed records; automatic retry is out of scope.

### Image MVP path
- Use URL-based image insertion in Tiptap for MVP.
- Validate image URL string and render it with safe `src`, `alt`, and responsive styling.
- First-party upload/storage is a follow-up, not an MVP dependency.

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
- Scripts exist: `dev`, `convex:dev`, `lint`, `typecheck`, `test`, `build`.
- `.env.example` lists Clerk, Convex, Resend, and public app URL variables.

### Phase 1 — Clerk + Convex auth boundary
Create:
- `middleware.ts`
- `src/app/providers.tsx` for Clerk/Convex provider wiring
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/sign-in/[[...sign-in]]/page.tsx`
- `src/app/sign-up/[[...sign-up]]/page.tsx` if needed
- `convex/auth.config.ts`
- `convex/lib/auth.ts`

Acceptance:
- Unauthenticated users cannot access `/admin`.
- Public routes remain reachable.
- Convex write/publish/send functions call `requireAdmin`, not just UI guards.

### Phase 2 — Convex schema and core server functions
Create:
- `convex/schema.ts`
- `convex/articles.ts`
- `convex/subscribers.ts`
- `convex/emailSends.ts`

Acceptance:
- Article, Subscriber, and EmailSend models match PRD fields.
- Article functions: list/get/create/update/publish.
- Subscriber functions: list/create/setStatus.
- EmailSend functions: listByArticle and internal helpers for pending/sent/failed transitions.
- Indexes support article slug lookup, subscriber email lookup, send lookup by article+recipient.

### Phase 3 — Tiptap editor and article admin UX
Create:
- `src/app/admin/articles/page.tsx`
- `src/app/admin/articles/new/page.tsx`
- `src/app/admin/articles/[articleId]/edit/page.tsx`
- `src/components/editor/TiptapEditor.tsx`
- `src/components/editor/ImageUrlInsertControl.tsx`
- `src/components/articles/ArticleForm.tsx`
- `src/components/articles/ArticleToolbar.tsx`
- `src/lib/tiptap/schema.ts`

Acceptance:
- Admin can create a long-form article with title, heading, paragraph, link, list, blockquote, and at least one URL image.
- Draft save persists Tiptap JSON to Convex.
- UI exposes clear Save, Preview, Publish actions.

### Phase 4 — Pure TS rendering, preview, and public route
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
- Renderer tests cover every supported MVP node.

### Phase 5 — Subscriber management
Create:
- `src/app/admin/subscribers/page.tsx`
- `src/components/subscribers/SubscriberForm.tsx`
- `src/components/subscribers/SubscriberList.tsx`
- Optional `src/components/subscribers/PublicSubscribeForm.tsx`

Acceptance:
- At least one active subscriber can be created and listed.
- Invalid email addresses are rejected client-side and server-side.
- Unsubscribed subscribers are excluded from send targets.

### Phase 6 — Convex-owned email send flow
Create:
- `convex/sendArticle.ts`
- `convex/lib/email.ts` or similar Resend wrapper usable by Convex action
- `src/lib/email/renderArticleEmail.ts` if wrapper around pure renderers is useful
- `src/components/articles/SendArticleButton.tsx`
- `src/components/articles/SendStatusPanel.tsx`

Acceptance:
- Only published articles can be sent.
- Send action calls Resend from Convex with expected recipient, subject, HTML body, plain text body, and public article URL.
- Pending records are created before provider calls.
- Duplicate article-recipient sends are prevented.
- Each recipient records `sent` with provider id or `failed` with error.
- Article status becomes `sent` only when at least one send succeeds.
- Tests use a mock Resend path unless real sender/domain is configured.

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
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` pass or gaps are documented with exact blockers.
- E2E/manual smoke covers sign in -> create article -> save -> preview -> publish -> public URL -> add subscriber -> send -> status evidence.
- README documents local setup, environment variables, Resend dev constraints, and verification commands.

## Testable Acceptance Criteria
- Admin sign-in via Clerk works and protects `/admin` routes.
- Convex write/publish/send functions reject unauthenticated calls.
- Admin can create and save a draft article with title, rich body, and at least one URL image.
- Draft can be previewed before publish.
- Article can be published to a public URL.
- Public article route renders title/body/image content and basic metadata.
- Active subscriber can be stored and listed.
- Published article can be sent through Resend from `convex/sendArticle.ts`, or through a mocked Resend provider in test/dev.
- EmailSend records show pending -> sent/failed transitions and prevent duplicate article-recipient sends.
- Send success/failure is recorded and visible or inspectable.
- Non-goals remain absent: no multi-tenant workspace, billing, segmentation, automations, advanced analytics, or team approval flow.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Tiptap JSON to email HTML is unreliable | High | Constrain supported nodes; implement pure TS renderer and tests before broad editor features. |
| Convex action + Resend env/runtime friction | Medium | Isolate Resend wrapper in `convex/lib/email.ts`; keep Next.js route fallback documented but not in main path. |
| Clerk UI protection mistaken for backend protection | High | Require `convex/lib/auth.ts` and test unauthenticated Convex mutation/action rejection. |
| Send status inconsistency on partial failures | High | Create pending records before provider calls; update each record to sent/failed; prevent duplicates by article-recipient lookup. |
| URL image insertion is less polished than upload | Medium | Accept as MVP scope; document upload/storage follow-up. |
| Resend domain/sender not available locally | Medium | Add mock provider/test mode; document real-send gap in README and final verification. |
| Scope creep into SaaS/email marketing platform | High | Keep non-goal regression checklist in verification and PR review. |

## Verification Steps
1. Install dependencies and generate lockfile.
2. Run `pnpm lint`.
3. Run `pnpm typecheck`.
4. Run `pnpm test`.
5. Run `pnpm build`.
6. Run local app and Convex dev server.
7. E2E/manual smoke:
   - Sign in as admin.
   - Create article with title, heading, paragraph, link, and URL image.
   - Save draft.
   - Preview article.
   - Publish article.
   - Open public URL.
   - Add active subscriber.
   - Send article email through mock or real Resend dev sender.
   - Confirm send status/log evidence.
8. Auth negative checks:
   - `/admin` redirects unauthenticated users.
   - Convex create/update/publish/send functions reject unauthenticated calls.
9. Non-goal regression check: verify no multi-tenant, billing, segmentation, automation, advanced analytics, or team approval surfaces were introduced.

## ADR

### Decision
Build the MVP with Next.js App Router + TypeScript for UI/routes, Tiptap for article editing, Convex for article/subscriber/send-status data and core mutations/actions, Clerk for admin authentication, Resend for email delivery, and Vercel-compatible hosting. Use **Convex-owned send orchestration** as the main path via `convex/sendArticle.ts`. Use URL-based image insertion for MVP.

### Drivers
- Fastest path to a working write -> publish -> send MVP.
- Beginner-focused product simplicity.
- Backend-owned send status, idempotency, and auditability.
- Avoiding custom auth/database/email infrastructure.

### Alternatives Considered
1. **Next.js server-route-owned send orchestration** — simpler Resend/React Email boundary but splits state workflow between Next.js and Convex; retained only as fallback.
2. **Convex-owned send orchestration** — chosen for state consistency and PRD-aligned send-status ownership.
3. **Reopen Supabase/Payload stack comparison** — rejected because the user selected Option 2 and no blocker currently invalidates it.
4. **First-party image upload in MVP** — rejected for first pass; URL-based image insertion proves the writing flow with lower implementation risk.

### Why Chosen
Convex-centered workflow best matches the selected stack and the MVP need for draft/publish/send state transitions. URL image insertion keeps the editor scope small while still satisfying “article with image” acceptance criteria.

### Consequences
- Renderer compatibility becomes a first-class implementation task.
- Email sending must be testable through mock/provider boundaries before real domain setup.
- Future upload/storage, multi-tenant, CRM, or analytics work remains deferred and should not shape first-pass schema/UI.

### Follow-ups
- Replace URL image insertion with upload/storage after MVP validation if needed.
- Confirm Resend dev/production sender constraints before real-send verification.
- Confirm final test runner choice during scaffold.
- Revisit SaaS/multi-tenant schema only after single-brand flow is proven.

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
- Suggested reasoning: high for implementation planning/checkpoints, medium for routine code edits.
- Handoff: include this plan, PRD, test spec, selected Option B baseline, and strict non-goal checklist.
- Best for: conservative delivery, fewer shared-file conflicts, clearer single-owner verification.

### Team path
Use `$team` when parallel throughput matters after scaffold stabilizes:
- Lane 1 `executor`: Scaffold/auth/layout and Clerk route protection.
- Lane 2 `executor`: Convex schema, auth helper, article/subscriber/email send records.
- Lane 3 `executor`: Tiptap editor, URL image insertion, article admin UI.
- Lane 4 `executor`: Pure TS renderers, public article route, email body construction.
- Lane 5 `test-engineer`: Test harness, renderer tests, send-flow mocks.
- Lane 6 `writer` or `verifier`: README/env docs and final evidence capture.
- Suggested reasoning: executor medium, test-engineer medium/high, verifier high, architect/critic high.

## Team Launch Hints
- `$team implement the newsletter MVP from .omx/plans/ralplan-newsletter-system-mvp.md using the selected stack and PRD/test spec; do not add multi-tenant/billing/CRM analytics scope.`
- Shell-style OMX: `omx team --plan .omx/plans/ralplan-newsletter-system-mvp.md`
- Cap concurrent lanes at 4-5 until scaffold stabilizes to reduce conflicts.
- Assign disjoint write scopes:
  - Scaffold/auth: root config, `src/app/*`, `middleware.ts`.
  - Convex/data/send: `convex/*` only.
  - Editor/admin UI: `src/components/editor/*`, `src/components/articles/*`, `src/app/admin/articles/*`.
  - Rendering/public/email: `src/lib/render/*`, `src/lib/email/*`, `src/app/articles/*`.
  - Tests/docs: `tests/*`, `README.md`, `.env.example`.

## Team Verification Path
1. Integration lead merges lanes and resolves shared types/imports.
2. Test lane runs unit/integration tests and reports failures with file-level ownership.
3. Verifier runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.
4. Verifier performs E2E/manual smoke against local app and Convex dev server.
5. Verifier checks auth negative cases and EmailSend idempotency/status evidence.
6. Final review checks non-goal regression list and validates changed files are within MVP scope.
7. If Resend real send cannot be verified, document mock evidence and exact domain/sender gap.

## Goal-Mode Follow-up Suggestions
- `$ultragoal` — recommended default if the user wants durable goal tracking for delivering the full MVP through verified completion.
- `$autoresearch-goal` — use only if execution pauses for official-doc-heavy research on Tiptap rendering, Convex actions, Clerk/Convex auth, or Resend constraints.
- `$performance-goal` — not recommended for first MVP; use later if editor rendering or send throughput becomes a measurable performance target.

## Changelog from v1
- Locked send orchestration to `convex/sendArticle.ts` as main path.
- Added Convex-side `requireAdmin` enforcement for writes/publish/send.
- Defined pure TypeScript Tiptap JSON renderer contract for public/email/plain text.
- Added EmailSend pending/sent/failed transition and idempotency rules.
- Chose URL-based image insertion for MVP and deferred upload/storage.
