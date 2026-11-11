# User Roles

How to store and enforce app roles with Clerk, and seed initial admins in development and production.

## Role storage and RBAC

Common ways to store roles:

- **Clerk user public metadata**, such as `publicMetadata.role = "admin"`.
- **Application database records**, such as a user role column or membership table.

Use the app's existing role storage. In both patterns, the **app implements and enforces RBAC server-side**; storing a role in Clerk metadata does not make Clerk enforce the app's permissions.

## Seed initial privileged users

An app needs initial privileged users, such as admins, who can authenticate and perform setup, management, and grant roles to other users.

Agent can seed development through direct Clerk development API calls or development DB writes, but cannot directly perform the equivalent production operations from its workspace. Development and production have separate Clerk identities; copying development records does not establish production admin access. Do not copy production credentials into development.

Write a seeding script using owner-configured emails or usernames, not hardcoded Clerk user IDs. Resolve users in the target environment; verify ownership before granting an existing account privileges.

- **Clerk public metadata:** If the user exists, merge the role into `publicMetadata` with `users.updateUserMetadata()`. Otherwise, call `users.createUser()` with `emailAddress: [email]` and `publicMetadata: { role: "admin" }` (or the configured role).
- **Database records:** Find the Clerk user by the configured identifier, or create it with `users.createUser()` if missing. Use its returned ID to create or update the app's user or membership record with the configured role.

For user creation, supply the instance's required fields and ensure a working sign-in method; never assign shared/default passwords. Use only trusted admin emails: Clerk marks supplied emails verified by default.

Make the script idempotent: preserve unrelated data, avoid duplicate users or grants, and track completed grants so reruns do not restore revoked privileges.

Configure the seeding script to run in both development and production, using each environment's Clerk instance and database. Run it from the workspace and verify that the privileged user can sign in and perform a privileged operation in development. Then publish, verify that the script runs in production, and repeat the sign-in and permission checks in the published app.

See Clerk's [basic metadata RBAC guide](https://clerk.com/docs/guides/secure/basic-rbac), [user metadata reference](https://clerk.com/docs/guides/users/extending), and [`createUser()` reference](https://clerk.com/docs/reference/backend/user/create-user).
