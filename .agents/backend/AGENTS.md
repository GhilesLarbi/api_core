# Backend — Conventions

## Communication — keep it short (MANDATORY)

Replies must be terse: answer the exact question and stop. No walls of text, no enumerating every option/edge case, no recap padding. Don't act or suggest alternatives without explicit permission.

**Never push to start building.** Do not end replies with "Want me to build/start/wire this?" or nudge toward implementation. The user decides when to build. During analysis/discussion, answer and stop — no unprompted next-step suggestions.

**Match the question's granularity — "list X" means a bare list, nothing more.** When asked to list/name things, reply with one item per line, plain words, a short "what it is" at most. Do NOT nest fields/columns/features/caveats/sub-headers under each item unless explicitly asked. Never mix levels (table vs field vs feature) in one answer. Detail comes only on a follow-up. Err toward under-explaining.

FastAPI + SQLAlchemy (async, asyncpg) + PostgreSQL. Layered: `endpoints → services → repositories → models`, wired through `ServiceProvider`.

## Scope — change exactly what was asked (MANDATORY)

**Do the named change and stop.** Not the "correct end state", not what the change implies, not what
would obviously come next. If the instruction names one layer, only that layer's files may be
touched. Everything beyond it — a new file, a renamed function, a rewired dependency, a signature
change, deleting code that the change made dead — is a separate instruction that has not been given.

**Never change a contract that was not named.** Response models, route paths, parameter names and
public function names are contracts. Leave them exactly as they are and make the code underneath
satisfy them. If they genuinely cannot be satisfied, say so in one sentence and stop; do not
redesign them.

**Broad instruction means ask for the size, not guess it.** When an instruction could reasonably mean
a three-line edit or a six-file rewrite, name both in one sentence and ask which, before touching
anything. Guessing wrong burns far more time than asking, and guessing big is the worse failure:
the result is a wall of unrequested changes that has to be read and reverted.

**Do not tidy in passing.** No deleting now-unused code, no fixing a nearby bug, no renaming for
consistency, no removing an import that became unused elsewhere. Note it in one line afterwards if
it matters; do not act on it.

## No comments, no docstrings (MANDATORY)

**Do not write comments or docstrings.** Not on functions, not on dependencies, not above a branch,
not to justify a decision. The code says what it does; explaining it in prose beside it is noise the
next reader has to scroll past.

Existing comments stay where they are. Do not add new ones. If something genuinely cannot be
understood without prose, say it in the reply instead.

## Never invent a value (MANDATORY)

**Every literal must have a source: the user, a document they gave, or existing code.** Defaults,
thresholds, string formats, column lengths, fallback rules, enum members. If a value has no source,
it does not get written.

**When something needed is unspecified: revert, then ask.** Undo the partial work so the tree is left
in a working state, then ask the one question. Leaving broken code alongside an open question is the
worst outcome — it is neither an answer nor a working tree.

**Never make a value plausible to fill a gap.** An invented default is indistinguishable from a
researched one in the output, so it silently becomes the user's decision. State that it is
undecided instead.

**Read the code before reasoning about it.** Open the model, the schema, the caller. Do not argue
from how these things usually work; several such arguments have turned out not to apply here at all.

## Vocabulary — use the codebase's words (MANDATORY)

Speak in the terms that exist in the code: the table names, the column names, the role names. Never
introduce a synonym from an external document, an industry term, or a word invented to sound
precise. If a word is not a table, a column, or plain everyday language, do not use it. When a
source document names something differently from the code, translate it before speaking.

## Defaults and standards over custom code (MANDATORY)

**Always use the framework/library's built-in defaults and standard mechanisms. Do not write custom workarounds, wrappers, or "hacks".**

- Before building anything custom, **check what the framework already provides** — inspect the actual signature/params (e.g. `inspect.signature(...)`), read the docs. Most needs are already covered by a built-in parameter.
- If a standard is spec-locked (e.g. OAuth2's `username`/`password` field names via `OAuth2PasswordRequestForm`), **keep the standard** — do not override it with a custom form/field just to change a label.
- Prefer built-in FastAPI/Pydantic/SQLAlchemy features (dependencies, `responses=`, security schemes, validators, etc.) over hand-rolled equivalents.
- Only write custom code when the framework genuinely offers no built-in path — and say so explicitly first.

## Env vs settings.py — the real split (MANDATORY)

There are exactly three homes for a value, and the deciding question is **"is it a secret?"**, not "does it change between environments":

1. **The repo-root `.env` — `ENVIRONMENT` and nothing else.** `PRODUCTION` / `STAGING` / `LOCAL`, typed as the `Environment` `StrEnum` in `settings.py`. Compose passes it to the api, the worker, the scheduler and the two web services. It is the one switch a deployment sets.
2. **`backend/.env` → `secrets.py` — secrets only.** Credentials, keys, and the internal addresses of the backing services (`POSTGRES_*`, `REDIS_*`, `MAIL_*`, `SEAWEEDFS_HOST`, `SEAWEEDFS_S3_PORT`, `AWS_*`, `SECRET_KEY`). Every field is declared **without a default**, so a missing one crashes at boot instead of running on a guess.
3. **`settings.py` — everything else, including the per-environment values.** A value that differs per environment but is not a secret is **derived from `ENVIRONMENT`** by a `@model_validator(mode="after")`, never read from a file:

```python
SERVER_HOST: AnyHttpUrl = f"http://127.0.0.1:8000"
SEAWEEDFS_CDN_HOST: AnyHttpUrl = "http://localhost:8333"
@model_validator(mode="after")
def set_hosts(self) -> "Settings":
    if self.ENVIRONMENT == Environment.PRODUCTION:
        ...
```

Group the fields a validator sets and give them **one** validator, not one each. Compare with the enum member (`Environment.PRODUCTION`), never the string.

`Settings` is a `BaseSettings` with no `env_file`, so it reads only the process environment — which is why moving `ENVIRONMENT` between env files changes nothing in the code.

The `SEAWEEDFS` pair is the worked example of the split. `SEAWEEDFS_HOST` is a secret: it names the internal service (`seaweedfs:8333`) that only the pooled client dials. `SEAWEEDFS_CDN_HOST` is a setting: it is the **browser-facing** hostname baked into every URL the api hands out, so it is public by definition and derives from `ENVIRONMENT`.

Litmus test: *"Would leaking this hurt?"* If yes → `secrets.py`. If no → `settings.py`, derived from `ENVIRONMENT` if it varies. Never add a third env file, and never put a credential in `settings.py`.

## Shared connections — reuse the pooled clients (MANDATORY)

`app/core/connections.py` opens **one** long-lived client per backing service at startup and hands it out via getters. Redis (`get_redis()`), DB sessions (`AsyncSessionLocal`), and S3 (`connect_s3()` → `get_s3()`) all follow this. **Use the getter — never open your own per-call client.**

- `s3_session = aioboto3.Session(...)` is only a credentials/config factory — cheap, holds no connection. The connection pool lives inside the **client**, not the session.
- `async with s3_session.client(...)` builds a **new** client → a **new `aiohttp` connection pool** on enter, and tears it down (closing every TCP/TLS conn) on exit. Doing that per call means a fresh handshake every time — never reuse `s3_session.client(...)` in a hot path.
- For S3 **network** operations (`head_object`, `copy_object`, `put_object`, …) call `get_s3()` — the pooled client wired at startup against `SEAWEEDFS_S3_URL`.

```python
from app.core.connections import get_s3

s3 = get_s3()                        # shared, pooled — no `async with`
await s3.copy_object(...)
```

**Only exception:** presigned-URL generation (`generate_presigned_post` / `generate_presigned_url`) is a **local signing operation — no network call** — and must be signed against the *public* endpoint (`SEAWEEDFS_PUBLIC_S3_URL`), which differs from the internal pooled client. There it's fine to open a short-lived `s3_session.client(...)` purely to reach the signing method.

## Logging — structlog contract (MANDATORY)

All logging goes through the structlog pipeline in `app/core/logger/`. The pipeline **rejects** log calls that miss the contract at runtime.

**Every log call:**
```python
import structlog
from app.core.logger import LogAction, LogEvent

logger = structlog.get_logger(__name__)   # module-level, name = __name__

logger.info(
    LogEvent.S3_CONNECTED,        # 1st positional arg = a LogEvent member, never a bare string
    action=LogAction.SERVER,      # action= is REQUIRED — require_action raises if missing/invalid
    some_field=value,             # extra structured context as kwargs
)
```

**Rules:**
- **Event** = a member of `LogEvent` (closed vocabulary in `app/core/logger/enums.py`). The pipeline splits it into `event=<enum name lowercased>` + `message=<enum value>`. **Never pass a raw string** as the event.
- **Action** = a member of `LogAction` (closed vocabulary). `action=` is mandatory on every call — the `require_action` processor raises `ValueError` otherwise. It can also be bound via `structlog.contextvars.bind_contextvars(action=...)`.
- **Add before you use:** a new event or action means adding a member to `enums.py` first — don't inline literals. Keep the vocabulary intentional (add a member only when a real surface needs it).
- Extra data → structured kwargs (Pydantic models / SQLAlchemy rows / dicts are auto-serialized). Choose level by outcome: `logger.info` normal, `logger.warning` 4xx-ish, `logger.error` failures.
- `setup_logging()` is called **once** per process at startup (already wired for api + worker). Never reconfigure structlog elsewhere.

## External API clients — `app/clients/` (MANDATORY)

Every external/third-party API (google, facebook, haveibeenpwned, …) lives under `app/clients/<service>/`. Each folder contains **explicitly** `api.py`, `client.py`, and `parser.py` **only when it makes sense**. Classes are named `<Service>Api`, `<Service>Client`, `<Service>Parser`.

**`<Service>Api`** — the raw HTTP layer.
- `@staticmethod` methods, one per endpoint/operation.
- Each takes **raw primitive params, one per field** — never dicts/lists/objects (e.g. `access_token: str`, `hash_prefix: str`).
- Body is just the raw call via `http_client()`, decorated `@retry(reraise=True, stop=stop_after_attempt(3))`, `timeout=settings.REQUESTS_TIME_OUT`, then `response.raise_for_status()` and return the **raw** response (`response.json()` / `response.text`).
- `BASE_URL` as a class attribute. No parsing, no business logic.

```python
class InstagramApi:
    BASE_URL = "https://graph.instagram.com"

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    @retry(reraise=True, stop=stop_after_attempt(3))
    async def exchange_short_token_for_long(access_token: str) -> Dict:
        async with http_client() as client:
            response = await client.get(
                f"{InstagramApi.BASE_URL}/access_token",
                params={"grant_type": "ig_exchange_token", "client_secret": secrets.INSTAGRAM_PRO_APP_SECRET, "access_token": access_token},
                timeout=settings.REQUESTS_TIME_OUT,
            )
            response.raise_for_status()
            return response.json()
```

**`<Service>Client`** — orchestration.
- `@staticmethod` methods that call the `Api` raw method(s). Mostly one-liners; does any non-HTTP prep (hashing, choosing fields).
- For complex responses, maps the raw JSON to our internal Pydantic schema via the `Parser`. Simple endpoints return directly — no parser.

**`<Service>Parser`** — `@staticmethod` methods that take raw JSON and return our Pydantic schemas (`app/schemas`). Add it **only** when the mapping is non-trivial.

**Hard rule:** clients / api / parser are **stateless** and have **NO knowledge of the DB, session, or `ServiceProvider`**. Pure external I/O + mapping. Services call clients, never the reverse.

## Multilingual data (MANDATORY)

A per-language value is stored as one JSONB column holding every language slot, typed by a
`MultilingualBase` subclass and mapped with `PydanticType` (e.g. `PermissionLang` on
`Permission.label` / `Permission.description`).

Responses never expose the raw object. A response schema that reads such a column inherits
`LocalizedResponse` and declares the field as `str`: its wildcard before-validator resolves any
`MultilingualBase` (or language-keyed dict) to the reading language's string, falling back through
the other languages. Never hand-roll a per-field resolver.

## Compose service → build target (MANDATORY)

Every process gets its own stage, and **the stage owns its `CMD`**. A compose service names its stage with `target:` and passes **no `command:`** — a command in compose is a second place the entrypoint can be defined, and the two drift.

| service | `target:` | the stage's `CMD` runs |
| --------- | ----------- | ----------------------- |
| api | `api` | `python -m app.main` |
| worker | `worker` | `python -m app.taskiq.worker` |
| scheduler | `scheduler` | `python -m app.taskiq.scheduler` |

The `base` stage carries the install and the source and defines **no `CMD`**; adding one there would silently become the default for every stage that forgets its own.

Each entrypoint decides *how* to run from `settings.ENVIRONMENT`, never from the compose file:

- `app/main.py` — `PRODUCTION` / `STAGING` serve the app through gunicorn with `uvicorn_worker.UvicornWorker` and `settings.API_WORKERS`; anything else uses the reloading `uvicorn.run`.
- `app/taskiq/worker.py` — `reload` is on outside `PRODUCTION` / `STAGING`, and `workers` is `settings.TASKIQ_WORKERS`.

`app/taskiq` is exactly three files. `main.py` builds the broker and the scheduler and registers the lifecycle handlers; `worker.py` and `scheduler.py` are entrypoints that nothing imports. Both address the broker **by the string `"app.taskiq.main:broker"`** and list the task modules in `modules=[…]`, letting taskiq's own `import_object` / `import_tasks` do the loading. Never point that string at an entrypoint module: `python -m app.taskiq.worker` runs that file as `__main__`, so taskiq would import it a second time under its real name and register every task twice.

## No redundant intermediate variables (MANDATORY)

Don't assign a value to a variable just to use it once — reference it directly.

```python
# WRONG
SQLALCHEMY_DATABASE_URL = secrets.DATABASE_URL
async_engine = create_async_engine(SQLALCHEMY_DATABASE_URL, ...)

# RIGHT
async_engine = create_async_engine(secrets.DATABASE_URL, ...)
```

Only introduce a name when the value is **reused** or the name adds **real clarity**. A single-use alias is noise.

## Endpoint contract must match its caller (MANDATORY)

When an endpoint is reached through a declared flow, scheme, or URL (OAuth2 `tokenUrl`/`refreshUrl`, a security scheme, a documented client, a webhook sender), the endpoint MUST accept **exactly** what that caller sends: HTTP method, `Content-Type`, body encoding (form-urlencoded vs JSON), and field names. Shaping the advertised entry point and the endpoint independently causes silent `4xx` (e.g. a form-encoded caller hitting a JSON-body endpoint → `422`).

- Reconcile the contract on **both** ends before finalizing.
- **Verify by exercising the real caller** (click the docs button, run the actual client/flow) — not a hand-written request of the shape you assumed.
- If you advertise a standard flow, conform to its standard request format; if you won't, don't advertise it.

## Calls — explicit keyword arguments (MANDATORY)

When calling any function or class, pass arguments **by keyword**, not positionally:

```python
raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND, status_code=404)
token = create_access_token(subject=user.id)
user = await self.user_repo.get_by_id(user_id=user_id)
```

Applies to our code and library calls where the keyword is accepted. Leave positional only where the callee requires it (e.g. SQLAlchemy `mapped_column(String, ...)` column-type arg, `field_validator("email")` field list).

## Signatures — multiline for 2+ params (MANDATORY)

If a function / method / endpoint has **more than one parameter** (counting `self`), explode the signature: one parameter per line, trailing comma, and `) -> ReturnType:` on its own line.

```python
#########################################################################################################
#########################################################################################################
def _channel(
    self,
    channel_type: ChannelType,
) -> NotificationChannel:
    ...
```

Single-parameter (or `self`-only / no-arg) signatures stay on one line:

```python
def user_repo(self) -> "UserRepository":
    ...
```

## Function separator (MANDATORY)

Every function, method, endpoint, **and class** (models, schemas, services, repositories, channels, etc.) — in any file — MUST be preceded by this exact two-line separator. In a file with multiple schemas/classes, the separator is what visually separates them:

```
#########################################################################################################
#########################################################################################################
```

Rules:
- Exactly **two** lines, each **105** `#` characters — nothing more, nothing less.
- **Only** `#` characters. No text, no dashes, no other characters. Nothing between the two lines.
- **Indent the separator to match the function it precedes.** Module-level functions → column 0. Class methods → indented to the method's level (e.g. 4 spaces). The `#` count stays 105; only leading whitespace changes.
- Placed directly above the function (above its decorators if it has any).

Module-level function:

```python
#########################################################################################################
#########################################################################################################
@router.post("/login")
async def login(...):
    ...
```

Class method (separator indented to match the method):

```python
class UserService(BaseService):

    #########################################################################################################
    #########################################################################################################
    async def register_new_user(self, ...):
        ...
```

- Applies to standalone functions, classes (schemas/models/services/repos), class methods, `__init__`, properties, and endpoint handlers alike.

Schemas — separate each **class** only. Do **not** put separators before validators or other methods inside a schema:

```python
#########################################################################################################
#########################################################################################################
class UserCreate(BaseModel):
    email: EmailStr

    @field_validator('email')       # no separator before validators inside a schema
    def lowercase_email(cls, v):
        return v.lower()

#########################################################################################################
#########################################################################################################
class UserResponse(BaseModel):
    ...
```
- Do **not** use any other divider style (`# ---- #`, shorter/longer `#` runs, section-label comments between separators, etc.).

## Migrations — autogenerate must come back empty (MANDATORY)

**After every migration, run `alembic revision --autogenerate` a second time and read the result. It
must contain `pass` and nothing else.** A second autogenerate compares the database against the
model metadata with the first migration already applied, so anything it still emits is drift: the
two disagree, and the next person to generate a revision gets that difference silently folded into
an unrelated change. Delete the probe revision once it comes back empty.

**Read the whole generated file before applying it — never just the operation you asked for.** A
migration that adds one column and drops five indexes is a migration that destroys five indexes.

**Fix the cause, never the symptom.** Do not hand-edit the drift out of the generated file and move
on; it comes back on the next revision. The cause is almost always one of:

- **Something created in raw SQL and never declared in the metadata.** `op.execute("CREATE INDEX ...")`
  puts an object in the database that `Base.metadata` has no idea about, so autogenerate offers to
  drop it. Declare it in `__table_args__` too — the migration builds it, the model declares it, and
  both must say the same thing.
- **An expression alembic cannot compare.** Watch the log for `Cannot compare index '...', assuming
  equal and skipping` — that is not a pass, it is a comparison that gave up. For a Postgres operator
  class this means the class was written inside the expression; move it into `postgresql_ops` keyed
  by the expression text, and the comparison becomes real:

```python
Index(
    "idx_item_name_fr_trgm",
    text("(name ->> 'fr')"),
    postgresql_using="gin",
    postgresql_ops={"(name ->> 'fr')": "gin_trgm_ops"},
)
```

- **A type or default alembic renders differently than it reflects**, which is what `render_item`
  and the comparator ordering in `migrations/env.py` already exist to handle. If a new one appears,
  it belongs in `env.py` — not worked around in a revision.

Warnings printed during autogenerate count as failures. A clean run prints no `UserWarning` and no
`Cannot compare`.

## Never wait (MANDATORY)

Never run anything that blocks: no `sleep`, no polling loop, no waiting for something to become
ready. The user is watching, and waiting is never acceptable.

If a command does not return quickly, kill it and take the fast way out instead of diagnosing while
it hangs.
