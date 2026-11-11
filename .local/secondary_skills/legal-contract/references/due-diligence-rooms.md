# Due Diligence Room Platform

The legal platform includes an interactive Due Diligence (DD) room for M&A transactions. This is a full-stack feature with its own database schema, API endpoints, and React UI.

## Architecture

- **Frontend:** `artifacts/legal-platform/src/pages/dd-room.tsx` — React + shadcn/ui
- **API:** `artifacts/api-server/src/routes/dd-*.ts` — Express REST endpoints
- **DB:** PostgreSQL via Drizzle ORM — tables in `lib/db/src/schema/dd-*.ts`
- **Auth:** Clerk; middleware at `artifacts/api-server/src/middlewares/requireAuth.ts`
- **Room Auth:** `artifacts/api-server/src/middlewares/requireRoomAccess.ts` — room-level authorization
- **File Storage:** Replit Object Storage via `@google-cloud/storage`
- **OpenAPI:** `lib/api-spec/openapi.yaml` with codegen to `@workspace/api-client-react` and `@workspace/api-zod`

## Database Tables

| Table | Purpose |
|-------|---------|
| `dd_rooms` | Room metadata: name, buyer/seller, purchase price, deal structure, ownerId |
| `dd_categories` | Checklist categories (8 auto-created from template, plus custom) |
| `dd_items` | Individual checklist items with status tracking |
| `dd_files` | Uploaded documents linked to items (object storage paths) |
| `dd_comments` | Item-level discussion threads |
| `dd_activity` | Audit log of all actions |
| `dd_participants` | Room access control (email + role: viewer/contributor/admin) |

## Standard Checklist Template

When a room is created, 8 categories with 57 items are auto-populated from `DD_TEMPLATE` in `dd-rooms.ts`:

1. **Corporate & Organizational** (7 items) — Formation docs, bylaws, minutes, cap table, good standing, org chart, jurisdictions
2. **Financial** (8 items) — Audited/interim statements, tax returns, debt schedule, AR/AP aging, revenue breakdown, projections, bank accounts
3. **Contracts & Agreements** (7 items) — Customer/vendor/partnership/distribution/franchise/government contracts, change-of-control provisions
4. **Intellectual Property** (8 items) — Patents, trademarks, copyrights, domains, software licenses, IP assignments, open-source audit, trade secrets
5. **Employees & Benefits** (9 items) — Census, employment agreements, contractors, handbook, non-competes, benefits, stock options, workers' comp, OSHA
6. **Litigation & Legal** (6 items) — Pending litigation, settlements, consent decrees, investigations, insurance claims, regulator correspondence
7. **Insurance** (4 items) — All policies, claims history, broker info, certificates
8. **Technology & Data** (8 items) — Architecture docs, data flows, SOC 2, breach history, BCP/DR, SLA reports, vendor assessments, privacy policy

Custom categories and items can be added per-room via the API.

## Item Status Workflow

Items track progress through these statuses:

```text
not_started → uploaded → under_review → approved
                                      → flagged (with note)
```

### Automatic transitions

- Uploading a file to a `not_started` item changes its status to `uploaded`
- Deleting all files from an `uploaded` item reverts its status to `not_started`
- All other transitions (under_review, approved, flagged) are manual via the UI

## Access Control

Room-level authorization is enforced via `requireRoomAccess` middleware (`artifacts/api-server/src/middlewares/requireRoomAccess.ts`) and its variants. Each variant looks up the resource chain to find the parent room, then checks if the user is the room owner or an active participant.

| Middleware | Lookup Chain | Used On |
|-----------|-------------|---------|
| `requireRoomAccess(roomIdParam)` | Direct roomId | Room detail, update, stats, activity, participants, categories |
| `requireCategoryRoomAccess(categoryIdParam)` | category → room | Delete category, create items |
| `requireItemRoomAccess(itemIdParam)` | item → category → room | Update/delete items, list/create files, list/create comments |
| `requireFileRoomAccess(fileIdParam)` | file → item → category → room | Delete files |
| `requireCommentRoomAccess(commentIdParam)` | comment → item → category → room | Delete comments |

### Privilege levels

- **Room owner:** Full access to everything including participant management
- **Admin participant:** Can manage participants (add/remove) and all room content
- **Contributor/Viewer participant:** Can access room content but cannot manage participants
- **Non-participant:** Receives 403 on all room-scoped endpoints

The `GET /dd-rooms` listing only returns rooms where the user is owner or participant (no cross-tenant leakage).

Private file downloads (`GET /storage/objects/*`) also enforce room access by looking up the file's parent room through the `dd_files → dd_items → dd_categories` chain.

## Activity Feed Events

All significant actions are logged to `dd_activity` with the following event types:

| Action | Trigger |
|--------|---------|
| `file_uploaded` | File registered on an item |
| `file_deleted` | File removed from an item |
| `comment_deleted` | Comment removed from an item |
| `participant_removed` | Participant removed from room |
| `status_changed` | Item status updated |

Each activity entry records: `roomId`, `userId`, `userName`, `itemId` (optional), `action`, `details`, `createdAt`.

## File Upload Flow

1. Frontend requests presigned upload URL via `POST /api/storage/uploads/request-url` (sends file name, size, contentType as JSON)
2. Frontend uploads file directly to object storage using the presigned URL (PUT to GCS)
3. Frontend registers the file via `POST /api/dd-items/:itemId/files` with the returned storage URL
4. Backend normalizes the GCS URL to an object entity path (`/objects/<entityId>`) and validates:
   - URL must normalize to `/objects/` prefix format
   - URL must not already be registered (prevents duplicate registration / IDOR)
5. File downloads served via `GET /api/storage/objects/*path` with room-level authorization

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/dd-rooms` | requireAuth | List rooms (filtered by owner/participant) |
| POST | `/dd-rooms` | requireAuth | Create a new DD room (auto-populates 8 categories) |
| GET | `/dd-rooms/:roomId` | requireAuth + roomAccess | Get room with categories and items |
| PUT | `/dd-rooms/:roomId` | requireAuth + roomAccess | Update room metadata |
| POST | `/dd-rooms/:roomId/categories` | requireAuth + roomAccess | Add a custom category |
| DELETE | `/dd-categories/:categoryId` | requireAuth + categoryRoomAccess | Delete a category and its items |
| POST | `/dd-categories/:categoryId/items` | requireAuth + categoryRoomAccess | Add an item to a category |
| PUT | `/dd-items/:itemId` | requireAuth + itemRoomAccess | Update item (name, status, notes) |
| DELETE | `/dd-items/:itemId` | requireAuth + itemRoomAccess | Delete an item |
| GET | `/dd-items/:itemId/files` | requireAuth + itemRoomAccess | List files for an item |
| POST | `/dd-items/:itemId/files` | requireAuth + itemRoomAccess | Register an uploaded file |
| DELETE | `/dd-files/:fileId` | requireAuth + fileRoomAccess | Delete a file |
| GET | `/dd-items/:itemId/comments` | requireAuth + itemRoomAccess | List comments for an item |
| POST | `/dd-items/:itemId/comments` | requireAuth + itemRoomAccess | Add a comment |
| DELETE | `/dd-comments/:commentId` | requireAuth + commentRoomAccess | Delete a comment |
| GET | `/dd-rooms/:roomId/stats` | requireAuth + roomAccess | Get completion statistics |
| GET | `/dd-rooms/:roomId/activity` | requireAuth + roomAccess | Get activity feed |
| GET | `/dd-rooms/:roomId/participants` | requireAuth + roomAccess | List participants |
| POST | `/dd-rooms/:roomId/participants` | requireAuth + roomAccess (owner/admin) | Add a participant |
| DELETE | `/dd-participants/:participantId` | requireAuth + roomAccess (owner/admin) | Remove a participant |
| POST | `/storage/uploads/request-url` | requireAuth | Get presigned upload URL |
| GET | `/storage/objects/*` | requireAuth + fileRoomAccess | Download a file |
