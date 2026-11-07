<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MURANET Internal Systems

## Project Brief

MURANET Internal Systems is an internal operations portal for an ISP
(Internet Service Provider). It is used by internal staff to manage network
operations, customers, billing, and support tickets.

The current scope covers:

- Login with local/hardcoded credentials.
- Role-based users: `admin`, `teknisi`, `cs`.
- Internal dashboard shell with sidebar, expandable menu groups, and topbar.
- Dashboard content is intentionally empty for now; route placeholders exist
  under `/dashboard/*`.

The product language for UI copy is Indonesian. Code, comments, commits, and
documentation are in English.

## Tech Stack

- Next.js 16 (App Router, Cache Components enabled).
- React 19 + TypeScript (strict).
- Tailwind CSS v4.
- shadcn/ui primitives built on React Aria Components (`src/components/ui`).
- React Hook Form + Zod for forms and validation.
- Lucide React for icons.

## Basic Rules

1. Read the relevant Next.js docs in `node_modules/next/dist/docs/` before
   writing framework code. This Next.js version differs from older versions.
2. Never edit or remove the `nextjs-agent-rules` block at the top of this file.
3. Read `DESIGN.md` before doing UI work. It is the source of truth for visual
   design only (colors, typography, spacing, radii, elevation, component specs).
4. Use semantic design tokens (`bg-primary`, `text-muted-foreground`, etc.).
   Never hardcode hex/rgb values in components.
5. Red is reserved for destructive actions. Brand red is allowed only for logo,
   charts, and decorative accents.
6. Reuse existing primitives from `src/components/ui`. Do not recreate basic
   components.
7. Use `"use client"` only when a component needs browser APIs, state, effects,
   or event handlers.
8. Prefer `next/link` for navigation and Next.js server components by default.
9. React Aria `Button` uses `onPress` and `isDisabled`, not `onClick` and
   `disabled`.
10. Support both light and dark mode. Verify changes in both.
11. One page should have one main `<h1>`.
12. UI copy is Indonesian; identifiers, types, comments, and documentation are
    English.

## Component Structure

Do not use atomic design (`atoms/`, `molecules/`, `organisms/`).

A complex component gets its own folder:

```txt
component-name/
  index.ts              # re-export ONLY
  component-name.tsx    # composes the parts
  parts/                # subcomponents, short filenames
    sidebar.tsx
    topbar.tsx
    nav-link.tsx
  data/                 # types/interfaces, hardcoded data, component functions
    navigation.ts
```

Rules:

- `index.ts` must only re-export. Never put state, composition, `"use client"`,
  or side effects in it.
- Filenames inside `parts/` are short because the folder provides context
  (`sidebar.tsx`, not `dashboard-sidebar.tsx`).
- Put types/interfaces, hardcoded data (menu arrays, stats, tables), and
  component-related functions in `data/`.
- Helpers such as `findActiveHref`, `getPageTitle`, and `findLocalUser` belong
  in `data/`.
- Simple components may stay in a single file. Do not over-split.
- Pages compose components only. Do not put long data arrays or large UI logic
  directly in page files.

## File Placement

- Layout components (sidebar, topbar, shell) →
  `src/components/layouts/<layout>/`.
- Feature components →
  `src/features/<feature>/components/<component>/`.
- Feature data and component functions → `src/features/<feature>/data/`.
- shadcn/UI primitives → `src/components/ui/`.
- Global helpers (for example `cn`) → `src/lib/`.
- Route pages → `src/app/`.
- Use the `@/` path alias for cross-folder imports.

Current tree:

```txt
src/
  app/
    (auth)/login/page.tsx
    (internal)/
      layout.tsx
      dashboard/
        page.tsx
        [...slug]/page.tsx
  components/
    layouts/dashboard/
      index.ts
      dashboard-shell.tsx
      parts/
      data/navigation.ts
    ui/                        # shadcn primitives
  features/
    auth/
      components/login-form/
        index.ts
        login-form.tsx
        data/schema.ts
      data/users.ts
  lib/utils.ts
```

## Design Rules

- `DESIGN.md` contains design tokens and visual specifications only.
- Use Tailwind utility classes and semantic tokens from
  `src/app/globals.css`.
- Charts should use existing chart tokens (`chart-1` … `chart-5`) or the agreed
  status colors.
- Status colors:
  - Success / upward trend: emerald.
  - Warning / open issue: amber.
  - In progress: primary.
  - Danger: destructive.
- Spacing conventions: page `p-4 lg:p-6`, card content `p-5`, grid `gap-4`,
  section spacing `space-y-6`.
- Radius conventions: cards `rounded-xl`, buttons/inputs `rounded-lg`, badges
  `rounded-full`/`rounded-4xl`.

## Do

- Put hardcoded data and component functions in `data/`.
- Split complex components into clear `parts/`.
- Use `text-sm text-muted-foreground` for metadata.
- Add `aria-label` or `title` to icon-only buttons.
- Keep imports ordered and use the `@/` alias.
- Run `npx tsc --noEmit` after structural changes.

## Don't

- Don't create `atoms/`, `molecules/`, or `organisms/` folders.
- Don't put data, state, composition, or `"use client"` in `index.ts`.
- Don't hardcode colors or duplicate shadcn primitives.
- Don't use red for non-destructive actions.
- Don't add large gradients, glows, or decorative effects without a clear
  visual reason.
- Don't put passwords or secrets in client code for production. Current local
  auth is development-only.
- Don't modify the `nextjs-agent-rules` block.

## Commands

```bash
npm run dev          # start development server
npm run build        # production build
npm run lint         # eslint
npx tsc --noEmit     # type check
```
