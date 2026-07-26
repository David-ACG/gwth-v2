# Running GWTH_V2 locally, and seeing pages behind the login

Written 2026-07-26, after a lesson-viewer change had to ship without anyone
looking at it in a browser. The local environment had drifted: `.env.local`
still held Supabase-era variables and nothing else, so `next dev` had no
database, the auth API returned 500, and every route 404'd. Two hours of a
demo-prep session went into rediscovering that. This is the fix, written down.

## The one gotcha that wastes the most time

**A `.next` directory produced by `next build` makes `next dev` 404 every
route.** Not some routes: all of them, including `/api/*`, with a cheerful
"Ready in 334ms" because it never compiled anything. If you have run
`npm run build` (or anything that did), delete the build output before starting
the dev server:

```bash
rm -rf .next && npx next dev -p 3000
```

If pages 404 and you cannot see why, this is almost always it.

## What `.env.local` needs

`.env.local` is gitignored, so it holds no production secrets and can be
rebuilt freely. Beyond whatever is already there, local development needs:

| Variable | Local value | Why |
|---|---|---|
| `DATABASE_URL` | `postgresql://gwth:<pw>@127.0.0.1:5443/gwth_v2` | The app reads Postgres via Drizzle. Without it the data layer silently falls back to mock data and auth cannot write at all. |
| `BETTER_AUTH_SECRET` | any dev string | Better Auth refuses to start without it. |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Production asserts this is set; locally it must match the port you actually run on, or sign-in cookies land on the wrong origin. |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://localhost:3000` | Client half of the same. |
| `PRIVATE_CONTENT_MODE` | `off` | The W25 gate fails CLOSED by design, so an unset value locks every content page on a developer machine. |
| `NEXT_PUBLIC_MEDIA_CDN_BASE_URL` | `https://media.gwth.ai` | Lesson media lives on R2. Without it, pages try to fetch the pipeline LAN address. |

The local Postgres is the `gwth-v2-dev-postgres` container, published on
**127.0.0.1:5443** (not 5432). Get the password from the container:

```bash
docker exec gwth-v2-dev-postgres env | grep '^POSTGRES_PASSWORD='
```

## Making an account that can see lessons

Signing up is not enough: `requireEmailVerification` is on, and the dashboard
and lesson pages need a `manual_beta` grant.

```bash
# 1. create the account through the real API so Better Auth hashes the password
curl -s -X POST http://localhost:3000/api/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"name":"Local Check","email":"local-check@example.com","password":"Rafiki123"}'

# 2. verify the email and grant Month 1 access
PG="docker exec gwth-v2-dev-postgres psql -U gwth -d gwth_v2"
$PG -c "update \"user\" set email_verified=true where email='local-check@example.com';"
U=$($PG -tAc "select id from \"user\" where email='local-check@example.com';" | tr -d ' \n')
$PG -c "insert into user_access (user_id, access_source, subscription_state, subscription_month)
        values ('$U','manual_beta','month1',1)
        on conflict (user_id) do update set subscription_state='month1', subscription_month=1;"
```

The password must be at least 8 characters with an uppercase letter and a
digit: `src/lib/validations.ts` enforces that on the **login** schema as well as
signup, so a shorter one cannot be typed back in.

### Giving a local lesson media

Local lesson rows usually have no audio or video, so the narration bar renders
its "no read-along" state and there is nothing to look at. Point one at the
real production media to see the full viewer:

```bash
LID=19e4bc1c-ab8a-43b0-830e-f5f7447b295e
docker exec gwth-v2-dev-postgres psql -U gwth -d gwth_v2 -c \
  "update lessons set
     audio_file_url='http://192.168.178.50:8088/api/lessons/$LID/audio/kokoro_main.wav',
     audio_duration=1931,
     intro_video_url='http://192.168.178.50:8088/api/lessons/$LID/video/v3-six-superpowers-2026-07-26.mp4'
   where slug like 'welcome-to-gwth%';"
```

The LAN form is fine to store: `rowToLesson` rewrites it to the CDN at the data
boundary, which is exactly what you want to be exercising.

## Screenshotting pages behind the login

`deploy/shot-local-authed.mjs` signs in and captures the dashboard, the
syllabus, the lesson video page and a lesson prose page (the last one reached
by clicking, because the viewer paginates in client state rather than the URL).

```bash
node deploy/shot-local-authed.mjs completion/<TASK>/local
```

Credentials come from `DEMO_EMAIL` / `DEMO_PASSWORD`, defaulting to the local
account above, so nothing sensitive is committed. It also works against
production by passing a base URL:

```bash
DEMO_EMAIL=... DEMO_PASSWORD=... node deploy/shot-local-authed.mjs out/dir https://gwth.ai
```

## Ports in use on this machine

3000 is free for this app. 3001 is the staging container, and 3010 is a
different project entirely (`fdebuild-app`), so a server that fails to bind
there will silently serve someone else's site. Check before assuming:

```bash
ss -lnt | grep -E ':(3000|3001|3010)'
```
