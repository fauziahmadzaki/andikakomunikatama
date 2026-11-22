# 02 — Authentication, Users & RBAC PRD

## Metadata

| Field | Value |
|---|---|
| Document ID | PRD-02 |
| Version | 1.0 |
| Status | Draft |
| Phase | 0 |
| Dependencies | PRD-01 |
| Related tables | `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `user_branches`, `audit_logs` |
| Related ERD | `erd-v2-core.mmd` |

## 1. Summary & Goals

Provide secure staff authentication, role-based access control, and branch
data scoping. Menus are not security; every request must be authorized on the
server.

### Goals

- Staff login with username/password.
- Secure session cookies and expiry.
- Password reset with one-time tokens.
- TOTP 2FA for privileged roles.
- Role and permission management.
- Branch scope enforcement at query and object level.
- User lifecycle and access review.

### Non-goals

- Customer portal authentication (deferred).
- SSO/SAML (not v1).
- API tokens for machine integrations (PRD-13 may add later).

## 2. Actors & Permissions

| Actor | Capabilities |
|---|---|
| `owner` | Full user/role management, access review |
| `admin` | Create/update users, assign roles within policy |
| `branch_manager` | Read users in own branch, request role changes |
| user | Manage own password and 2FA |
| `hrd` | Read employee-linked accounts |

Permissions:

```txt
auth.login, auth.logout, auth.reset_password, auth.2fa
user.read, user.create, user.update, user.deactivate
role.read, role.manage
permission.read
access.review
```

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Login accepts `username` + `password`; error messages do not reveal which field is wrong. | M |
| AUTH-02 | Session cookie is `HttpOnly`, `Secure`, `SameSite=Lax`; session id rotates on login. | M |
| AUTH-03 | Idle timeout 60 minutes; absolute timeout 12 hours. | M |
| AUTH-04 | Password reset uses a single-use token with 30-minute expiry. | M |
| AUTH-05 | TOTP 2FA is required for `owner`, `admin`, `finance`, `hrd`. | S |
| AUTH-06 | Users can be created, updated, deactivated, and assigned roles + branches. | M |
| AUTH-07 | Permissions are checked server-side on every route and action. | M |
| AUTH-08 | Branch scope restricts list, detail, and mutation access. | M |
| AUTH-09 | Object-level authorization prevents IDOR via UUID guessing. | M |
| AUTH-10 | Login rate limit: 5 attempts per minute per IP + username. | M |
| AUTH-11 | Every security event is audited. | M |
| AUTH-12 | Access review lists users, roles, branches, and last login. | S |
| AUTH-13 | Deactivated users cannot log in and active sessions are revoked. | M |
| AUTH-14 | Password policy: min 12 chars, not breached/common, Argon2id hash. | M |

## 4. Workflows

### WF-AUTH-01 — Login

- Actors: staff user
- Trigger: submit login form
- Preconditions: user exists and is active

Steps:

1. Validate input shape (`username`, `password`).
2. Apply rate limit by IP + username.
3. Load user by normalized username or email.
4. If user missing, run a dummy hash verification to equalize timing.
5. Verify password with Argon2id.
6. Check `is_active` and `deleted_at`.
7. If 2FA enabled, create a temporary challenge token and return `2fa_required`.
8. On success, rotate session id, create session with role/branch claims.
9. Set `HttpOnly` cookie; update `last_login_at`.
10. Write audit `auth.login_succeeded`.
11. Return safe user profile + permissions.

Failure cases:

- Invalid credentials → 401 generic message; audit `auth.login_failed`.
- Locked/rate-limited → 429.
- Inactive user → 403 generic message.
- 2FA required → 200 with challenge token, no session yet.

Acceptance:

```gherkin
Given an active user with valid credentials
When they log in
Then a session cookie is set
And last_login_at is updated
And auth.login_succeeded is audited

Given invalid credentials
When they log in
Then the response is 401 with a generic message
And auth.login_failed is audited
```

### WF-AUTH-02 — Logout and session expiry

- Actors: authenticated user, system
- Trigger: logout button, idle timeout, absolute timeout

Steps:

1. Logout: delete server session, clear cookie, audit `auth.logout`.
2. Idle timeout: middleware rejects session after 60 minutes of inactivity.
3. Absolute timeout: reject after 12 hours regardless of activity.
4. On rejection, return 401 and redirect to login.
5. Revoke all sessions when password changes or user is deactivated.

### WF-AUTH-03 — Forgot/reset password

- Actors: user, system
- Trigger: "Forgot password" form

Steps:

1. Accept email or username.
2. Always return the same response (do not reveal account existence).
3. If user exists, create hashed single-use token, expiry 30 minutes.
4. Send reset link through the notification module.
5. Audit `auth.password_reset_requested`.
6. Reset page validates token, expiry, and single use.
7. Validate new password against policy and history.
8. Update password hash, revoke all sessions, mark token used.
9. Audit `auth.password_reset_completed`.
10. Send confirmation notification.

Failure cases:

- Expired/used token → 400 generic.
- Weak password → 422 field errors.
- Notification failure → retry; do not block token creation.

### WF-AUTH-04 — 2FA enrollment and verification

- Actors: privileged user
- Trigger: security settings or login challenge

Steps:

1. Generate TOTP secret and otpauth URI.
2. Display QR code and recovery codes once.
3. User submits a valid 6-digit code.
4. Enable 2FA; store encrypted secret reference.
5. On login, require a valid TOTP code or recovery code.
6. Recovery codes are single-use and hashed.
7. Disabling 2FA requires password + current TOTP.
8. Audit enrollment, verification failures, recovery use, and disable.

Failure cases:

- Too many invalid codes → temporary lockout.
- Lost device → recovery code or owner-assisted reset with audit.

### WF-AUTH-05 — Create user and assign role/branch

- Actors: `owner`, `admin`
- Permissions: `user.create`
- Trigger: user management screen

Steps:

1. Fill username, email, full name, employee link (optional), branch.
2. Select role and branch scope.
3. Validate username/email uniqueness.
4. Create user with temporary password or invitation token.
5. Assign `user_roles` and `user_branches`.
6. Force password change on first login.
7. Audit `user.created`.
8. Send invitation notification.

Rules:

- `admin` cannot grant `owner`.
- Role assignment is limited by the actor's own permissions.
- At least one branch is required for branch-scoped roles.

### WF-AUTH-06 — Update/deactivate user

- Actors: `owner`, `admin`
- Permissions: `user.update`, `user.deactivate`

Steps:

1. Load user; verify actor can manage the target.
2. Update profile fields, roles, and branch scope.
3. Prevent removing the last active `owner`.
4. Deactivation revokes all sessions and blocks login.
5. Audit `user.updated` / `user.deactivated` with diff.
6. Notify the affected user.

Failure cases:

- Self-deactivation of the last owner → 409.
- Privilege escalation attempt → 403.
- Concurrent update → 409.

### WF-AUTH-07 — Permission check and 403

- Actors: system
- Trigger: every request

Steps:

1. Resolve session; reject if missing/expired.
2. Load permission set from cache keyed by user + role version.
3. Check required permission code.
4. Check branch scope for the target object.
5. Allow, or return 403 with a generic message.
6. Audit sensitive denials.

Rules:

- Deny by default.
- Object-level checks run after route-level checks.
- Permission cache invalidates on role or user changes.

### WF-AUTH-08 — Access review

- Actors: `owner`, `admin`
- Permissions: `access.review`

Steps:

1. List users with roles, branches, status, last login.
2. Highlight privileged roles and inactive accounts.
3. Reviewer marks keep/revoke/change.
4. Apply decisions with audit.
5. Export review report.

## 5. Session & State Models

### User

`invited` → `active` → `inactive`

### Session

`active` → `expired` / `revoked`

## 6. Permission Model

- Permissions are string codes: `<module>.<action>`.
- Roles bundle permissions through `role_permissions`.
- Users receive roles through `user_roles`, optionally scoped to a branch.
- Effective permissions = union of roles; branch scope intersects.
- Deny always wins.

## 7. Data References

- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`,
  `user_branches`, `audit_logs`
- Session store (Redis or database table `sessions` if server-side persistence
  is required).

## 8. API / Routes

```txt
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/2fa/verify
POST   /api/auth/2fa/enroll
POST   /api/auth/2fa/disable
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
GET    /api/users
POST   /api/users
PATCH  /api/users/:id
POST   /api/users/:id/deactivate
GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:id
GET    /api/permissions
GET    /api/access-review
```

## 9. UI Notes

- Login page must not reveal whether the username exists.
- Password fields never pre-filled on edit forms.
- 2FA setup shows recovery codes once with a copy/download action.
- User list shows role, branch scope, status, last login.
- Permission-denied pages return a clear 403, not an empty 200 page.

## 10. Audit & Notifications

Audit events:

- `auth.login_succeeded`, `auth.login_failed`, `auth.logout`
- `auth.password_reset_requested`, `auth.password_reset_completed`
- `auth.2fa_enabled`, `auth.2fa_disabled`, `auth.2fa_failed`
- `user.created`, `user.updated`, `user.deactivated`
- `role.created`, `role.updated`
- `access.denied`

Notifications:

- Invitation email/WA.
- Password reset link.
- Password changed confirmation.
- 2FA enabled/disabled alert.

## 11. Acceptance Criteria

```gherkin
Scenario: Branch-scoped CS cannot access another branch customer
  Given a CS user scoped to branch "JKT-01"
  When they request a customer from "BDG-01"
  Then the response is 403
  And access.denied is audited

Scenario: Deactivated user session is revoked
  Given a logged-in user
  When an admin deactivates the user
  Then the next request returns 401
  And the user cannot log in

Scenario: Privilege escalation is blocked
  Given an admin user
  When they try to grant the owner role
  Then the request is rejected with 403
```

## 12. Edge Cases & Failure Handling

- Concurrent password reset requests → latest token wins; previous tokens invalid.
- Session theft suspicion → revoke all sessions.
- Clock skew with TOTP → allow ±1 step.
- Permission cache stale → versioned invalidation.
- Brute force → rate limit + temporary lockout + alert.

## 13. Open Questions

- Should branch scope allow multiple branches per user? (Design allows it.)
- Should `finance` and `hrd` be global by default?
- Is Redis available for sessions, or should sessions live in PostgreSQL?
