# SaaS Template

Every instruction file lives under `.agents/`, mirroring the repo's own folders. Nothing is loaded
automatically from there, so **read the file for the area you are about to touch before you touch
it**, and read the ones it links to.

| you are editing | read |
| --- | --- |
| `backend/` | [.agents/backend/AGENTS.md](.agents/backend/AGENTS.md) |
| `backend/app/seeds/` | [.agents/backend/seeds/AGENTS.md](.agents/backend/seeds/AGENTS.md) |
| `emails/` | [.agents/emails/AGENTS.md](.agents/emails/AGENTS.md) |
| anything under `web/` | [.agents/web/AGENTS.md](.agents/web/AGENTS.md) |
| `web/apps/admin/` | [.agents/web/admin/AGENTS.md](.agents/web/admin/AGENTS.md) |
| `web/apps/user/` | [.agents/web/user/AGENTS.md](.agents/web/user/AGENTS.md) |

`web/context/` holds the shared web docs (client brief, conventions) and stays next to the code.

## ENVIRONMENT — the one switch (MANDATORY)

The repo-root `.env` holds **`ENVIRONMENT` and nothing else**: `PRODUCTION`, `STAGING` or `LOCAL`.
Compose passes it to the api, the taskiq worker and scheduler, and the two web services, and every
process decides how to run from it — gunicorn or a reloading uvicorn, how many workers, a vite dev
server or a built bundle, and which public hostnames the backend hands out.

One switch, one file. Deploying somewhere new means setting that one value, never editing code and
never adding a second env file. Anything that varies per environment is **derived** from it, in
`backend/app/core/settings.py` for the api and `web/settings.ts` for the browser apps.

`backend/.env` is secrets only. Nothing else in the repo carries a `.env`.

## Project Structure
## Critical Rules
## Things to Avoid

## One commit (MANDATORY)

Everything staged goes into **one** commit. Never split work into several commits, however many
layers, packages or concerns it touched, and never explain that it "could" be split.

`git add -A`, one message, push. That is the whole procedure.

## Answer the question, never widen it (MANDATORY)

Answer exactly what was asked and stop. The reply ends on the last sentence that answers the
question.

**Never end on a different subject.** No "what's still missing", no "what isn't designed yet", no
listing the parts of the system the question did not cover, no unprompted next step. Raising a
neighbouring topic is worse than being long: it changes what the conversation is about, and the
user has to spend a turn dragging it back.

A fact only earns a place in the reply when it changes the answer itself — and then it is one
sentence inside the answer, never a closing paragraph hung off the end.

## Never wait (MANDATORY)

Never run anything that blocks: no `sleep`, no polling loop, no waiting for something to become
ready. The user is watching, and waiting is never acceptable.

If a command does not return quickly, kill it and take the fast way out instead of diagnosing while
it hangs.
