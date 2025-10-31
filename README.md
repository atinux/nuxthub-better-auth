# NuxtHub x BetterAuth

A demo of using [BetterAuth](https://better-auth.com) with [NuxtHub](https://hub.nuxt.com) (Cloudflare Pages with D1 & KV).

https://better-auth.nuxt.dev

[![Deploy to NuxtHub](https://hub.nuxt.com/button.svg)](https://admin.hub.nuxt.com/new?repo=atinux/nuxthub-better-auth)

## Features

- Server-Side rendering on Cloudflare Workers
- [SQL Database](https://hub.nuxt.com/docs/features/database) on the edge
- Use [Key Value Storage](https://hub.nuxt.com/docs/features/kv) as secondary storage for sessions, etc.
- `useAuth()` Vue composable for easy authentication
- `serverAuth()` composable for accessing Better Auth instance on the server
- One click deploy on 275+ locations for free

## Setup

Make sure to install the dependencies with [pnpm](https://pnpm.io/installation#using-corepack):

```bash
pnpm install
```

Copy the `.env.example` file to `.env` and update the variables with your own values.

The `BETTER_AUTH_SECRET` should be a random string of your choosing used by Better Auth for encryption and generating hashes.

The `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` should be your GitHub OAuth application credentials (see [create an OAuth application](https://github.com/settings/applications/new)).

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

## Deploy

Deploy the application on the Edge with [NuxtHub](https://hub.nuxt.com) on your Cloudflare account:

```bash
npx nuxthub deploy
```

Then checkout your server logs, analaytics and more in the [NuxtHub Admin](https://admin.hub.nuxt.com).

You can also deploy using [Cloudflare Pages CI](https://hub.nuxt.com/docs/getting-started/deploy#cloudflare-pages-ci).

### Database Migrations

Right now, we don't automatically run migrations on deployment. You can manually run them by visiting the `/api/migrate` endpoint after deploying.
