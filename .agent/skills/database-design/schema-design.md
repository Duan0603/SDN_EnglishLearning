# Schema Design Principles (NoSQL Focus)

> Embedding vs Referencing, ObjectIds, flexible documents.

## NoSQL Pattern Decision (Embedding vs Referencing)

```
When to Embed (Single Document):
├── Data is "owned" by the parent
├── Data is always fetched together
├── Relationships are One-to-Few
└── Read performance is critical

When to Reference (Separate Collections):
├── Data is shared across multiple parents
├── Data grows without bound
├── Relationships are One-to-Many/Many-to-Many
└── Large document size limit concerns
```

## Primary Key Selection (MongoDB)

| Type | Use When | Prisma Implementation |
|------|----------|-----------------------|
| **ObjectId** | Default MongoDB ID | `@id @default(auto()) @map("_id") @db.ObjectId` |
| **UUID/String** | Cross-platform migration | `@id @default(uuid()) @map("_id")` |

## Timestamp Strategy

```
For every model:
├── createdAt → @default(now())
└── updatedAt → @updatedAt
```

## Relationship Types (Prisma MongoDB)

| Type | When | Implementation |
|------|------|----------------|
| **One-to-One** | Extension data | `@unique` relation field |
| **One-to-Many** | Parent-children | Array of IDs or `@relation` |
| **Many-to-Many** | Shared relationships | Array of IDs on both sides (Implicit/Explicit) |

## Referential Actions (Prisma)

```
├── Cascade → Delete children with parent
├── SetNull → Children become orphans
├── Restrict → Prevent delete if children exist
└── NoAction → No referential integrity check (Standard NoSQL)
```
