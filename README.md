# NuxtHub × Better Auth

A Nuxt 4 authentication template using [Nuxt Better Auth](https://better-auth.nuxt.dev),
NuxtHub, and Nuxt UI. Deploy to **Cloudflare Workers with D1** or **Vercel with
Turso**. Both use the same SQLite schema and server-side session checks.

## Run locally

Use Node 22.19+, 24.11+, or 26+, with [Corepack](https://github.com/nodejs/corepack) installed.

1. Create a repository from this template, clone it, and copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Generate an auth secret, then copy the output into `NUXT_BETTER_AUTH_SECRET` in `.env`:

   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Keep `NUXT_PUBLIC_SITE_URL=http://localhost:3000` for local development.
   Leave the Cloudflare and Turso variables empty to use local SQLite.

3. Install dependencies, create the schema, and start Nuxt:

   ```bash
   corepack enable
   pnpm install
   pnpm db:migrate
   pnpm dev
   ```

Open [localhost:3000](http://localhost:3000). Create an account with the sign-up
form or continue anonymously. The database is stored in `.data/db/sqlite.db`.

By default, new databases contain **no demo users or public-password accounts**.
The initial migration creates a new schema; existing installations need a
separate data-migration plan.
`/user` and `/secret` require a session. `/admin` additionally requires the
`admin` role. These pages use Nuxt Better Auth's auth route rules.
The example admin role can visit the admin page but cannot manage other users.
`/about` is public, whether you are signed in or signed out.

## Deploy

Use separate database environments for development, previews, and production.
Apply schema migrations before each deployment. Neither deployment path requires
the optional demo accounts.

The template uses Nuxt Better Auth 0.3.1 and a single initial migration for
Better Auth 1.7.3. Databases from earlier PR previews that still have
`account.issuer` need the [Better Auth upgrade steps](https://www.better-auth.com/docs/guides/1-7-upgrade-guide#account-identity-keeps-the-provider-key)
before updating; the initial migration does not upgrade existing tables.

### Cloudflare Workers with D1

Authenticate Wrangler and create a D1 database:

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create nuxthub-better-auth
```

Set `NUXT_HUB_CLOUDFLARE_DATABASE_ID` in `.env` to the returned ID.
Change the Worker name in `nuxt.config.ts` for your fork.
Keep `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` unset; NuxtHub selects Turso
when both are present, even with a Cloudflare preset.

```bash
pnpm build:cloudflare
pnpm exec wrangler d1 migrations apply DB --config .output/server/wrangler.json --remote
pnpm exec wrangler deploy --config .output/server/wrangler.json --var NUXT_PUBLIC_SITE_URL:https://your-worker.workers.dev
pnpm exec wrangler secret put NUXT_BETTER_AUTH_SECRET --config .output/server/wrangler.json
```

Enter the strong secret generated for this deployment when prompted.
The first deployment is not ready for auth traffic until the secret is set.
NuxtHub generates the Wrangler config with the `DB` binding and migrations
directory. Pass that config explicitly to D1 commands; `wrangler deploy` does
not apply migrations.

### Vercel with Turso

Link a Vercel project and connect a Turso database:

```bash
pnpm dlx vercel@latest link
pnpm dlx vercel@latest integration add tursocloud --plan starter --name nuxthub-better-auth-db
```

The integration may require browser authorization. It supplies
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Alternatively, configure credentials
for your own Turso database. Keep `NUXT_HUB_CLOUDFLARE_DATABASE_ID` unset.

Configure the production secret and HTTPS origin, then migrate and deploy:

```bash
pnpm dlx vercel@latest env add NUXT_BETTER_AUTH_SECRET production
pnpm dlx vercel@latest env add NUXT_PUBLIC_SITE_URL production
pnpm dlx vercel@latest env run -e production -- env -u VERCEL -u VERCEL_ENV pnpm db:migrate
pnpm dlx vercel@latest deploy --prod
```

Configure a separate secret and database for previews. Check the integration's
environment assignments; previews must not point at the production database.
Set `NUXT_PUBLIC_SITE_URL` to the preview's HTTPS origin. Without an explicit URL,
the auth module uses Vercel's platform URL; it does not trust the request host in
production. For OAuth previews, use a stable preview origin and register its
callback with GitHub. Local development uses `.env` as described above.

The `env -u` arguments preserve the downloaded Turso credentials but prevent
the migration command from being treated as a Vercel build. Builds deliberately
disable automatic migrations and read database credentials at runtime, so build
credentials are not embedded in the bundle.

### Node with local SQLite

```bash
pnpm db:migrate
pnpm build:node
node --env-file=.env .output/server/index.mjs
```

Set `NUXT_PUBLIC_SITE_URL` to your HTTPS origin and persist `.data/db/sqlite.db`
across releases. Run behind a trusted reverse proxy that forwards a reliable
client IP for rate limiting.

## Optional demo accounts

Set `NUXT_PUBLIC_DEMO_ACCOUNTS_ENABLED=true` in `.env` locally or in your
deployment's runtime environment. This shows the User and Admin quick-login
buttons and enables the Nitro seed plugin. After schema migrations, the first
request automatically creates the demo accounts on SQLite, D1, or Turso.
No separate seed command is needed.

Use only a disposable demo database. Both `user@nuxthub.demo` and
`admin@nuxthub.demo` use the public password `nuxthub-demo`. Restarts do not
overwrite existing accounts. Turning the flag off hides the buttons and stops
seeding, but does not remove accounts or disable their passwords.
Use a fresh database for a real application.

## Optional GitHub OAuth

Create a [GitHub OAuth app](https://github.com/settings/developers) with this
local callback URL:

```text
http://localhost:3000/api/auth/callback/github
```

Set `NUXT_GITHUB_CLIENT_ID`, `NUXT_GITHUB_CLIENT_SECRET`, and
`NUXT_PUBLIC_GITHUB_AUTH_ENABLED=true` in `.env`. Use the corresponding HTTPS
callback and runtime variables on either Cloudflare or Vercel. Store the client
secret as a Worker secret or a private Vercel environment variable, never public
runtime config. Previous deployments must rename `GITHUB_CLIENT_ID` and
`GITHUB_CLIENT_SECRET` to their `NUXT_` equivalents.

GitHub controls are hidden until enabled. Users can link GitHub from `/user`.
Test sign-in and linking with your own OAuth app before deployment.
Do not link a personal GitHub account to a shared demo user.

## Nuxt conventions

`useUserSession()` provides the shared SSR-hydrated session. Form inputs use local
`ref` state; action composables provide pending and error state. Do not copy the
session into another store or a module-level ref.

The linked-account `useFetch` forwards cookies during SSR and uses a user-specific
key. Page access uses auth route rules. When adding private API handlers, use
`requireUserSession(event)` to enforce access server-side. The TypeScript config
references Nuxt's app, server, shared, and tooling projects.

## Development checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build:node
```

CI runs these checks without cloud credentials. The auth test applies the initial
migration to an in-memory SQLite database, then verifies signup, login, and sessions.
