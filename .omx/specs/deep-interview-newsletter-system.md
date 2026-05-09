# Execution-Ready Spec — Newsletter System MVP

## Metadata
- Created: 20260509T130556Z
- Profile: standard
- Context type: greenfield
- Context snapshot: `.omx/context/newsletter-system-20260509T125250Z.md`
- Transcript: `.omx/interviews/newsletter-system-20260509T130556Z.md`
- Final ambiguity: 15.1%
- Threshold: 20%

## Clarity Breakdown
| Dimension | Score | Notes |
|---|---:|---|
| Intent | 0.86 | Make newsletter creation approachable for beginners. |
| Outcome | 0.90 | Long-form article can be written with images, web-published, and emailed. |
| Scope | 0.86 | Single-brand MVP, writing-first. |
| Constraints | 0.66 | Compare 2-3 stacks; do not lock one final implementation stack yet. |
| Success Criteria | 0.86 | End-to-end write -> public web article -> subscriber email flow. |

## Intent
Create a newsletter system for users who have gathered information/content but do not yet understand newsletter tools well. The product should lower the entry barrier by making the writing experience straightforward.

## Desired Outcome
A single-brand MVP where an admin/creator can:
1. Write a long-form blog-style article.
2. Insert and manage images.
3. Preview/publish it as a public web article.
4. Send the same content to subscribers by email.

## In Scope
- Tiptap-style rich text editor for long-form articles.
- Title/body/images/sections suitable for blog-form newsletters.
- Basic subscriber list sufficient for email sending.
- Public article URL.
- Email send flow for one published article.
- Stack/framework comparison with 2-3 options.

## Out of Scope / Non-goals
- Multi-tenant SaaS workspace model and billing.
- Advanced subscriber CRM: tags, segments, automations, A/B tests.
- Advanced analytics: open rate, click rate, cohorts.
- Team collaboration, approval workflow, roles/permissions beyond a simple admin.
- Full Mailchimp-style email marketing platform replacement.

## Decision Boundaries
- Agent may propose and compare 2-3 stack options by cost, speed, complexity, and scalability.
- Agent should not force a final single stack without a later selection.
- Agent may recommend a default favorite, but must preserve alternatives and tradeoffs.
- No implementation should start from this deep-interview artifact alone; hand off to planning first unless the user explicitly asks for execution.


## Selected Stack Decision
- Selected option: **Option 2 — Next.js + Tiptap + Convex + Clerk + Resend**.
- Decision date: 2026-05-09.
- Decision source: User selected “2안으로 진행.”

### Stack Components
- Web app/framework: Next.js App Router + React + TypeScript.
- Rich text editor: Tiptap, optimized for long-form blog-style writing with images.
- Backend/database/functions: Convex for typed server functions, article/subscriber/send-status data, and fast product iteration.
- Authentication: Clerk for quick single-admin authentication and future user/account growth.
- Email: Resend, ideally with React Email templates for rendering published article email.
- Hosting target: Vercel-compatible deployment for Next.js.

### Updated Decision Boundaries
- Treat Option 2 as the implementation/planning baseline.
- Do not reopen Supabase/Payload comparison unless a blocker appears.
- Keep MVP single-brand; do not introduce multi-tenant billing or workspace architecture in first pass.
- Prefer implementation speed and TypeScript coherence over lowest possible vendor count.

## Constraints
- Greenfield project; no existing product source files.
- User prefers a Tiptap-based editor concept.
- MVP should prioritize beginner writing experience over SaaS admin complexity.

## Testable Acceptance Criteria
- A creator can create a long-form article with title, body, and at least one image.
- The article can be saved as draft and previewed.
- The article can be published to a public URL.
- A basic subscriber list can receive the article by email.
- First version does not require multi-tenant billing, advanced CRM, advanced analytics, or team workflow.

## Assumptions Exposed + Resolutions
- Assumption: “easy access” could mean many things. Resolution: for MVP it primarily means easy writing.
- Assumption: newsletter output shape could be digest/image/template. Resolution: first output is long-form blog-style article.
- Assumption: SaaS may be immediate. Resolution: defer multi-tenant SaaS and billing; compare stack options without committing.

## Pressure-Pass Findings
The initial broad claim “beginners should easily access newsletters” was revisited and narrowed to writing-first UX, then to long-form blog-style articles. Non-goals explicitly cut SaaS/CRM/analytics/team/email-marketing breadth.

## Technical Context Findings
- Greenfield workspace. No source, package manifest, or existing framework detected.
- The technical recommendation should be architecture-first and stack-comparison-first.

## Recommended Planning Handoff
Use this spec as the input to `$ralplan` / `$plan --consensus --direct .omx/specs/deep-interview-newsletter-system.md`.
