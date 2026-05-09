# PRD — Newsletter System MVP

## 1. Product Goal
Build a single-brand newsletter MVP for beginner creators who have content/information but do not yet understand newsletter tooling. The MVP must make long-form writing easy and support one complete publish path: **write article -> publish web URL -> send email to subscribers**.

## 2. Selected Stack
- Next.js App Router + TypeScript
- Tiptap editor
- Convex backend/database/functions
- Clerk authentication
- Resend email sending
- Vercel-compatible hosting

## 3. Primary User
A single admin/creator for one brand/newsletter. They need a low-friction writing and publishing tool, not a full email marketing suite.

## 4. Core Jobs To Be Done
1. As a creator, I can log in and access the newsletter admin.
2. As a creator, I can create a long-form article with title, rich body text, and images.
3. As a creator, I can save drafts and preview the article.
4. As a creator, I can publish an article to a public URL.
5. As a creator, I can maintain a basic subscriber list.
6. As a creator, I can send the published article to subscribers by email.

## 5. In Scope
### Admin/editor
- Clerk-protected admin route.
- Article list with draft/published/sent states.
- Tiptap editor with paragraph, headings, bold/italic, links, lists, blockquote, image insertion.
- Autosave or explicit save; explicit save is acceptable for first implementation.
- Preview mode matching public article rendering closely.

### Public article
- Public route for published article by slug/id.
- Blog-style long-form layout.
- Basic SEO metadata from title/excerpt.

### Subscribers
- Basic subscriber table: email, status, createdAt.
- Manual add and/or simple public subscribe form.
- No segmentation, tags, automation, A/B tests.

### Email sending
- Resend send endpoint/action via Convex/Next.js server boundary.
- Render article content into email-safe HTML.
- Track basic send status: queued/sent/failed and timestamp.

## 6. Out of Scope
- Multi-tenant workspaces.
- Billing/subscription plans.
- Advanced CRM, tags, segments, automations.
- Advanced analytics such as open/click tracking.
- Team roles, approvals, collaboration.
- Full Mailchimp replacement.

## 7. Data Model Draft
### Article
- id
- title
- slug
- editorJson: Tiptap JSON content
- excerpt
- coverImageUrl optional
- status: draft | published | sent
- publishedAt optional
- sentAt optional
- createdAt / updatedAt

### Subscriber
- id
- email
- status: active | unsubscribed
- createdAt / updatedAt

### EmailSend
- id
- articleId
- subscriberId optional
- recipientEmail
- status: pending | sent | failed
- providerMessageId optional
- error optional
- createdAt / sentAt

## 8. Acceptance Criteria
- Admin can sign in via Clerk.
- Admin can create a long-form article with title, rich text, and at least one image.
- Article can be saved as draft.
- Article can be previewed before publish.
- Article can be published to a public URL.
- At least one active subscriber can be stored.
- Published article can be sent through Resend to active subscribers.
- Send success/failure is visible or inspectable in app state/logs.

## 9. UX Principle
Prioritize beginner clarity over feature density: clear writing screen, obvious save/preview/publish/send actions, and minimal dashboard complexity.

## 10. Risks / Open Decisions
- Image storage path must be chosen during implementation: upload service, Convex file storage, or external object storage.
- Email HTML rendering from Tiptap JSON needs a reliable converter or constrained renderer.
- Resend domain setup is required for real production sending; local/dev may use verified test recipient/domain constraints.
