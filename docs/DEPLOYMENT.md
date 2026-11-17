# Deployment environments

The application has two runtime modes:

- `RUN_MODE=demo`: browser-local progress, no account required.
- `RUN_MODE=connected`: Supabase authentication, server-authoritative actions, PostgreSQL persistence.

## Environment matrix

| Setting | Preview | Staging | Production |
| --- | --- | --- | --- |
| `RUN_MODE` | `demo` by default | `connected` | `connected` |
| `DEMO_MODE` | `true` | `false` | `false` |
| Supabase project | optional isolated preview project | dedicated staging project | dedicated production project |
| Model key | optional | staging key | production key |
| Auth callback | Preview origin + `/auth/callback` | Staging origin + `/auth/callback` | Production origin + `/auth/callback` |
| Learning records | local or disposable preview DB | staging data only | production data only |

Preview deployments must never point at the production Supabase project. Enable
Connected mode on a preview only after its own Supabase project and service-role
key have been configured.

## Required variables

Demo mode needs no secrets. Connected mode requires:

```text
RUN_MODE=connected
DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Optional model evaluation:

```text
LLM_BASE_URL=
LLM_MODEL=
LLM_API_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` and `LLM_API_KEY` are server-only. Never add a
`NEXT_PUBLIC_` prefix to either key.

## Supabase setup

1. Create separate Supabase projects for staging and production.
2. Link the CLI to the intended environment.
3. Apply all migrations before deploying application code that depends on them.
4. Configure the GitHub OAuth callback and magic-link redirect URLs.
5. Verify that `profiles`, `simulation_runs`, and `simulation_events` all have
   row-level security enabled.

```bash
npx supabase link --project-ref <project-ref>
npx supabase db push
```

Use an expand-migrate-contract sequence for schema changes that affect running
code. Keep application rollback compatible with the currently deployed schema.

## Vercel setup

1. Import the repository as one Vercel project.
2. Keep Production pointed at `main`.
3. Create Preview and Staging environments with separate Supabase credentials.
4. Disable GitHub fork previews or ensure they cannot access a shared service-role
   key.
5. Add the deployed `/auth/callback` URL to Supabase for each origin.

If Staging must be a stable URL, create a separate Vercel environment using the
same repository but its own environment variables and Supabase project.

## Connected E2E session

Create a Playwright storage-state file by signing into the staging application:

```bash
npx playwright codegen --save-storage=e2e-auth.json http://127.0.0.1:3000/login
```

Then run:

```bash
$env:E2E_CONNECTED="1"
$env:E2E_STORAGE_STATE="S:\path\to\e2e-auth.json"
$env:PLAYWRIGHT_CHANNEL="chrome"
npm run test:e2e
```

The storage-state file contains session cookies and must remain untracked.

## Release checklist

- CI, unit tests, build and demo E2E are green.
- Migrations have been reviewed and applied to staging.
- Supabase redirect URLs include the target origin.
- Preview, staging and production use different service-role keys.
- Demo mode remains usable without secrets.
- `/api/health` reports the intended runtime mode.
- Roll back the application if error rate or auth failures increase after release.
