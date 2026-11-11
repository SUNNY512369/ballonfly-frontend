# Documents System

The platform includes a generic document management system for any type of legal document. Documents are owner-scoped and can optionally be linked to a DD room.

## Schema (`documents` table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (UUID) | Primary key |
| `ownerId` | text | Clerk user ID of the document owner |
| `title` | varchar(500) | Document title |
| `documentType` | varchar(100) | Flexible type field (e.g., "LOI", "NDA", "APA", "Employment Agreement", "Lease") |
| `content` | text | Full document content (Markdown/plain text) |
| `status` | varchar(50) | Document status, default "draft" |
| `ddRoomId` | text | Optional link to a DD room |
| `createdAt` | timestamp | Auto-set on creation |
| `updatedAt` | timestamp | Auto-set on creation and update |

## Key Design Principles

- **Type-agnostic:** The `documentType` field is a free-text string, not an enum. Any document type can be stored — LOIs, NDAs, asset purchase agreements, operating agreements, board resolutions, etc.
- **Owner-scoped:** All document endpoints filter by the authenticated user's `ownerId`. Users can only see, edit, and delete their own documents.
- **Room linkable:** Documents can optionally reference a `ddRoomId` to associate them with a due diligence room (e.g., the LOI for an acquisition).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/documents` | List all documents owned by the current user |
| GET | `/documents/:documentId` | Get a single document (owner-only) |
| DELETE | `/documents/:documentId` | Delete a document (owner-only) |

## Frontend

- **Dashboard:** Document cards appear below the DD rooms section. Each card shows title, type badge, status, and creation date. Hovering reveals a delete button with inline confirm/cancel.
- **Document view:** `/documents/:documentId` renders the full document content.
