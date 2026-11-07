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
- Frontend-only prototype for PRD 01–03:
  - Foundation: company, branches, settings, sequences, audit, security.
  - Auth/RBAC: users, roles, access review, password reset, 2FA mock.
  - Customers: list, wizard, detail, import, segments.
- State is mocked in Zustand and persisted in `localStorage`.
- Dashboard content outside PRD 01–03 is still placeholder.

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

Feature folders use this top-level layout:

```txt
src/features/<feature>/
  components/     # PascalCase component files
    UsersPage.tsx
    UsersTable.tsx
    UsersDialog.tsx
  hooks/          # camelCase hooks
    useUsersPage.ts
    useUsersDialog.ts
  data/           # types, seeds, schemas
    users.ts
    login-schema.ts
  store/          # Zustand stores
    auth-store.ts
```

Rules:

- Component files outside `src/components/ui` and `src/app` use **PascalCase**
  (`UsersTable.tsx`, `CustomerWizard.tsx`).
- Hooks use **camelCase** (`useUsersPage.ts`, `useUsersDialog.ts`).
- Put page/business logic in hooks. Components should focus on rendering and
  receive state/actions from hooks.
- `data/`, `hooks/`, and `store/` live at the top level of the feature, not
  inside individual component folders.
- Do not create `parts/` by default. Prefer sibling PascalCase components when
  a feature has multiple subcomponents. Keep `parts/` only when a component is
  genuinely complex enough to justify it.
- `index.ts` is optional. If present, it must only re-export. Never put state,
  composition, `"use client"`, or side effects in it.
- Pages in `src/app` compose components only. Do not put large data arrays or
  UI logic directly in page files.

## File Placement

- Layout components (shell, sidebar, topbar) →
  `src/components/layouts/<layout>/` with PascalCase files.
- Feature components → `src/features/<feature>/components/` with PascalCase
  files.
- Feature hooks → `src/features/<feature>/hooks/` with camelCase files.
- Feature data and schemas → `src/features/<feature>/data/`.
- Feature stores → `src/features/<feature>/store/`.
- Shared components → `src/components/shared/` with PascalCase files.
- shadcn/UI primitives → `src/components/ui/` (lowercase, keep shadcn naming).
- Providers → `src/components/providers/` with PascalCase files.
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
      DashboardShell.tsx
      DashboardSidebar.tsx
      DashboardTopbar.tsx
      BrandMark.tsx
      SidebarNavLink.tsx
      SidebarNavGroup.tsx
      data/navigation.ts
    shared/
      AccessDenied.tsx
      ActionIconButton.tsx
      ConfirmationDialog.tsx
      DataTable.tsx
      DataTablePagination.tsx
      PageHeader.tsx
      SelectField.tsx
      StatusBadge.tsx
    providers/
      PrototypeProvider.tsx
    ui/                        # shadcn primitives
  features/
    auth/
      components/              # PascalCase
      hooks/                   # useX.ts
      data/
      store/
    customers/
      components/
      hooks/
      data/
      store/
    foundation/
      components/
      hooks/
      data/
      store/
    dashboard/
      components/
      hooks/
  lib/utils.ts
```

## Testing

Agent verification is limited to linting:

```bash
npm run lint
```

Do **not** run `npm run build`, `npx tsc --noEmit`, smoke tests, browser
automation, or other runtime checks. The user handles manual testing.

## UI Component Rules

- Use the shadcn `Select` (`src/components/ui/select.tsx`) for dropdowns. Do not
  create or use a native `<select>` wrapper.
- Use the shadcn `Pagination` primitives. Wrap them in `DataTablePagination`
  for client-side table pagination.
- Use `DataTable` for reusable tables. Define columns with `key`, `header`, and
  an optional `cell` renderer. Use `getRowKey` for the row key.
- Table actions must use icon-only `ActionIconButton` with tooltip. Do not use
  text-only action buttons.
- Every icon-only button must have an accessible `aria-label` and a tooltip.
- Destructive table actions use `tone="destructive"`.
- Use `ConfirmationDialog` from shared components for confirmation flows.
- Use `SelectField` for standard select inputs with an accessible label.

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

- Put page and business logic in `hooks/` using camelCase filenames.
- Name component files outside `components/ui` and `app` with PascalCase.
- Put hardcoded data, types, and schemas in the feature-level `data/`.
- Use `SelectField` (shadcn Select) for dropdowns.
- Use `DataTable` for tables and `DataTablePagination` for pagination.
- Use `ActionIconButton` with tooltip for table actions.
- Use `ConfirmationDialog` for confirmation flows.
- Use `text-sm text-muted-foreground` for metadata.
- Keep imports ordered and use the `@/` alias.
- Run `npm run lint` after changes.

## Don't

- Don't create `atoms/`, `molecules/`, or `organisms/` folders.
- Don't create `parts/` by default; prefer sibling PascalCase components.
- Don't use native `<select>` or a native select wrapper.
- Don't put page logic directly inside components.
- Don't use text-only action buttons inside tables.
- Don't put data, state, composition, or `"use client"` in `index.ts`.
- Don't hardcode colors or duplicate shadcn primitives.
- Don't use red for non-destructive actions.
- Don't add large gradients, glows, or decorative effects without a clear
  visual reason.
- Don't put passwords or secrets in client code for production. Current local
  auth is development-only.
- Don't run build, typecheck, smoke tests, or browser automation; only lint.
- Don't modify the `nextjs-agent-rules` block.

## Commands

```bash
npm run dev          # start development server
npm run lint         # eslint (the only verification agents should run)
```

`npm run build` and `npx tsc --noEmit` are available for humans but must not be
run by agents as verification.
