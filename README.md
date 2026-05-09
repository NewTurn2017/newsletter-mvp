# 뉴스레터 MVP

글 작성 -> 웹 공개 URL 발행 -> 구독자 메일 발송까지 이어지는 싱글 브랜드 뉴스레터 시스템입니다.

## 스택

- Next.js App Router + TypeScript
- `/admin` 영역 Clerk 인증
- Convex 데이터/함수/Storage: 글, 구독자, 이미지, 발송 상태 관리
- Tiptap 에디터: 굵게, 이탤릭, 제목 크기, 목록, 인용, 요약 박스, 파일 업로드 이미지, 드래그 리사이즈
- OpenAI Responses API: `gpt-5.4-nano` 제목 기반 슬러그와 본문 기반 2줄 요약 자동 생성
- Resend 메일 발송: `convex/sendArticle.ts`

## 로컬 실행

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

실제 Convex dev deployment와 연결할 때는 두 번째 터미널에서 실행합니다.

```bash
pnpm convex:dev
```

## 환경 변수

`.env.example`의 Clerk, Convex, Resend, 앱 URL 변수를 맞춥니다.

- 이미지 업로드는 Convex Storage를 사용하므로 `pnpm convex:dev`가 실행 중이어야 합니다.
- AI 슬러그/요약 생성은 Convex action에서 실행되므로 `OPENAI_API_KEY`는 Convex deployment 환경 변수에 설정해야 합니다. 키가 없으면 슬러그는 로컬 slugify, 요약은 본문 기반 fallback을 사용합니다.
- Resend 실제 발송은 Convex 함수에서 실행되므로 `RESEND_API_KEY`, `RESEND_FROM_EMAIL`은 Convex deployment 환경 변수에도 설정해야 합니다.
- `RESEND_API_KEY`가 없거나 `RESEND_MOCK=1`이면 로컬/개발 검증용 mock provider ID를 기록합니다.

## 검증

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm convex:dev --once
pnpm build
```

수동 스모크 경로: 로그인 -> 구독자 추가 -> 글 작성 -> 커버/본문 이미지 업로드/크기 조절 -> 드래프트 저장 -> AI 슬러그/요약 자동 생성 확인 -> 공개 -> 공개 URL 확인 -> 메일 발송 -> 발송 상태 확인.

## MVP 범위

포함: 단일 관리자, 드래프트/공개/발송, 기본 구독자, Convex Storage 이미지 업로드, EmailSend 상태 기록. 제외: 멀티테넌트 워크스페이스, 결제, CRM 태그/세그먼트/자동화, 고급 분석, 팀 승인 플로우.
