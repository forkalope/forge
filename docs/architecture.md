# Initial architecture

Forkalope starts as a modular monolith. The Go process owns the HTTP API, Git integration, background jobs, and storage orchestration. The React application is built as static assets and can be served by the same process.

## Storage boundary

The default `LocalBlobStore` stores immutable files at:

```text
<data-dir>/blobs/sha256/ab/cd/<sha256>
```

This gives each object a stable identity and makes future replication a simple `has(hash)` / transfer / verify workflow. A future peer storage adapter can implement the same boundary without changing issue, pull request, or repository features.

PostgreSQL is reserved for mutable metadata: accounts, permissions, issues, pull requests, reviews, notifications, and node configuration. It is intentionally not required by the first health-check server so the binary can be exercised before migrations and persistence land.

## Suggested next slices

1. Add configuration and structured request logging.
2. Add PostgreSQL migrations and a repository metadata model.
3. Add Git repository creation, browse, clone, and push endpoints.
4. Add authentication and organization permissions.
5. Add a peer manifest and replication worker for content-addressed blobs.
