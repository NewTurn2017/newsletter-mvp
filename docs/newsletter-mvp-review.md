# Newsletter MVP Review Notes

Canonical source: `.omx/plans/ralplan-newsletter-system-mvp.md`.

## Review status

Final worker-3 refresh after the leader's Convex send-flow fixes: the implementation now aligns much more closely with the canonical MVP plan. Fresh local checks for lint/typecheck/test are green, and the leader reported a green production build after the fixes. A local build rerun in this worker is currently blocked by an existing `.next/dev/lock` from a running Next dev process, not by a compile failure.

## Current implementation review findings

- `convex/sendArticle.ts:8-43` — **Resolved from prior review** — send orchestration remains in the canonical Convex action boundary and now calls the exported `api.articles.getForSend`, `api.subscribers.listActive`, `api.emailSends.findForArticleRecipient`, `api.emailSends.ensurePending`, `api.emailSends.markSent`, and `api.emailSends.markFailed` names.
- `convex/sendArticle.ts:30-35` and `convex/emailSends.ts:35-52` — **Resolved from prior review** — send status mutations now use the same `sendId` argument shape.
- `convex/articles.ts:32-37` and `src/lib/email/sendArticleWorkflow.ts:41-45` — **Resolved from prior review** — send eligibility is now filtered to `published` or `sent`, and the workflow rejects missing/draft articles before provider calls.
- `tests/integration/send-flow.test.ts:33-111` — **Improved** — tests now exercise unpublished rejection, pending creation before provider calls, sent/pending duplicate skips, retry of failed sends, provider failure recording, and article `sent` marking after a successful recipient.
- `convex/lib/auth.ts:7-17` — **Medium remaining risk** — `requireAdmin` allows any signed-in email when `ADMIN_EMAILS` is unset. This is acceptable for local/demo setup only if documented; production should require explicit admin configuration or fail closed.
- `convex/emailSends.ts:13-19` and `convex/subscribers.ts:20-23` — **Low/Medium review note** — send-path helper queries are intentionally callable by the Convex action, but they do not call `requireAdmin` themselves. Keep them private-by-convention to the send action or convert to generated internal functions before production hardening.
- Source-only non-goal scan found no implementation of multi-tenant workspace, billing/pricing, CRM segmentation/automation, advanced analytics, approval workflow, or first-party upload/storage.

## Required review gates

### 1. Convex-owned send boundary

Review files:

- `convex/sendArticle.ts`
- `convex/emailSends.ts`
- `convex/lib/auth.ts`
- `src/lib/email/sendArticleWorkflow.ts`
- any Resend wrapper used by the action

Pass criteria:

- `sendArticle.ts` is the only main orchestration boundary for sending.
- The action calls `requireAdmin(ctx)` in Convex.
- Pending records are created/reused before Resend calls.
- Article-recipient idempotency is enforced by an index/query, not by UI state.
- Status transitions are explicit and inspectable: `pending -> sent` or `pending -> failed`.
- Internal/API function names and argument names match the exported functions.
- Draft/unpublished articles are rejected before provider calls.

### 2. Pure TypeScript rendering

Review files:

- `src/lib/render/tiptapToHtml.ts`
- `src/lib/render/tiptapToPlainText.ts`
- any email-rendering wrapper

Pass criteria:

- Renderer does not depend on React components, Next.js request/runtime APIs, or browser DOM APIs.
- Unknown nodes are handled safely.
- Text, URLs, and attributes are escaped before HTML output.
- Image output is URL-only and uses safe `src` and `alt` handling.

### 3. Admin auth boundary

Review files:

- `middleware.ts` / `src/proxy.ts`
- `src/app/admin/**`
- `convex/lib/auth.ts`
- Convex mutation/action files

Pass criteria:

- `/admin` is protected in the app.
- Convex write/publish/send functions enforce admin authorization server-side.
- UI-only checks are treated as UX, not authorization.
- Production admin configuration does not silently fail open.

### 4. MVP scope control

Reject additions that implement non-goals:

- workspace/team/tenant abstractions;
- billing plans;
- tags, segments, automations, or A/B tests;
- advanced analytics;
- team approval/collaboration workflow;
- first-party image upload/storage.

## Documentation requirements before handoff

- README documents setup, env vars, scripts, and the send boundary.
- `.env.example` lists Clerk, Convex, Resend, app URL, and admin variables.
- Verification evidence records exact command outputs for lint, typecheck, tests, and build.
- Any Resend real-send limitation is documented as a local/dev constraint, not hidden.
