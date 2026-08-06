# Invitation Registration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require admin-generated invitation codes for registration, attach account expiry to users, and expose invitation/user expiry data in admin.

**Architecture:** Shared invitation and account-expiry helpers define the rules. Registration consumes an invitation in one database transaction, login/auth reject expired accounts, and admin APIs manage invitation codes. UI changes are limited to the register page and admin dashboard tables.

**Tech Stack:** Next.js pages API, PostgreSQL, Joi, React, Ant Design, existing `PaginationTable`.

---

### Task 1: Shared Rules

**Files:**
- Create: `lib/invitationCodes.js`
- Create: `lib/accountExpiry.js`
- Test: `tests/invitationCodes.test.js`
- Test: `tests/accountExpiry.test.js`

- [ ] Add tests for invitation code generation, duration labels, expiry calculation, and account expiry.
- [ ] Implement shared helpers and run the tests.

### Task 2: Database Migration

**Files:**
- Create: `db/updates/add-invitation-codes.js`
- Modify: `package.json`

- [ ] Add `invitation_codes` table.
- [ ] Add `users.invitation_code`, `users.invitation_code_id`, `users.account_expires_at`, and `users.status`.
- [ ] Add npm script `migrate-invitation-codes`.

### Task 3: API Changes

**Files:**
- Create: `pages/api/invitation-codes/index.js`
- Modify: `pages/api/auth/register.js`
- Modify: `pages/api/auth/login.js`
- Modify: `pages/api/users/index.js`
- Modify: `lib/apiAuth.js`
- Modify: `lib/api.js`

- [ ] Register with invitation code in a transaction.
- [ ] Reject expired users on login and protected API access.
- [ ] Add admin invitation list/create API.
- [ ] Include invitation and expiry fields in user list.

### Task 4: UI Changes

**Files:**
- Modify: `pages/register.js`
- Modify: `components/admin/UserManager.js`
- Create: `components/admin/InvitationCodeManager.js`
- Modify: `components/admin/Dashboard/index.js`

- [ ] Add invitation code input and success expiry prompt to registration.
- [ ] Show invitation code, expiry, and status in users list.
- [ ] Add invitation code management tab with generate form and list.

### Task 5: Verification

**Commands:**
- `node tests/invitationCodes.test.js`
- `node tests/accountExpiry.test.js`
- `node tests/apiAuth.test.js`
- `node -c pages/api/auth/register.js`
- `node -c pages/api/auth/login.js`
- `node -c pages/api/invitation-codes/index.js`
- `node -c pages/api/users/index.js`
- `node -c db/updates/add-invitation-codes.js`
- `npm run build`
