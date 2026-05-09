# Test Spec — Newsletter System MVP

## Goal
Verify the selected Option 2 stack can deliver the MVP flow: **authenticated admin writes long-form article -> publishes web page -> sends email to subscriber**.

## 1. Static / Build Checks
- TypeScript typecheck passes.
- Lint passes.
- Production build passes.

## 2. Unit-Level Checks
- Article schema validates required title/content/status fields.
- Subscriber email validation rejects invalid email.
- Tiptap JSON renderer handles allowed node types.
- Email HTML renderer produces non-empty subject/body and includes public article URL.

## 3. Integration Checks
- Clerk-protected admin routes reject unauthenticated access.
- Article draft save persists to Convex.
- Publish mutation changes article status and creates public route data.
- Subscriber create/list works through Convex.
- Send mutation calls Resend with expected recipient, subject, and HTML payload.
- Send status is recorded as sent or failed.

## 4. E2E Smoke Flow
1. Start local app.
2. Sign in as admin.
3. Create article with title, heading, paragraph, link, and image.
4. Save draft.
5. Preview article.
6. Publish article.
7. Open public article URL.
8. Add subscriber.
9. Send article email.
10. Confirm send status/log evidence.

## 5. Manual Verification Notes
- Real Resend production sending requires verified domain/sender configuration.
- If no real domain is available, use Resend sandbox/test mode or mock provider for automated tests and document the gap.
- URL-based image insertion/rendering should be smoke-tested with at least one valid image URL.

## 6. Non-Goal Regression Checks
Confirm first pass does not accidentally introduce:
- Multi-tenant workspace selector.
- Billing screens.
- CRM segmentation/tags/automation.
- Advanced analytics dashboard.
- Team approval workflow.
