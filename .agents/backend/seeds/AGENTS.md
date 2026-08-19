# Seeds

Idempotent seeders for the reference data the app needs to run. Run manually inside the api
container:

```bash
docker compose exec api python -m app.seeds
```

## The pattern

One seeder module per table, wired in `__main__.py`:

- **JSON-driven seeders** (`admins.py`, `users.py`, `posts.py`): the records live in a JSON file
  under `data/`, the module loads it and upserts **by natural key** (email, or title for posts) —
  one `select` builds a `{natural_key: id}` map, then each record is an `update` when the key exists
  or a `session.add` when it does not. The seeder returns `(created, updated)`. A seeder that
  references another table (posts → users) resolves the foreign id by its natural key and skips
  records whose reference is missing.
- **Code-driven seeder** (`permissions.py`): the permission tree is declared in
  `app/core/permissions.py`, so the seeder walks `walk_permissions()` instead of reading a file,
  upserts by path, and deletes rows whose path is no longer declared.

`__main__.py` owns the session and the **single commit**: seeders never commit, so a failed run
leaves the database untouched. It runs permissions first, then admins (the first admin is granted
every grantable permission), then users, then posts, and prints one count line per seeder.

Adding a seeder = a JSON file in `data/`, one module exposing `seed_<name>(session) -> tuple`,
and one call + print line in `__main__.py`.
