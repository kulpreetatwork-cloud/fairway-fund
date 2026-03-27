# FairwayFund

FairwayFund is a full-stack assignment build for the Digital Heroes golf charity subscription platform PRD. The app is built with Next.js, TypeScript, Tailwind CSS, secure signed sessions, a Supabase-ready data layer, Stripe checkout/webhook handling, Resend email hooks, and Cloudinary-based winner proof uploads.

## What is implemented

- Public homepage, charity directory, charity detail pages, and draw explainer
- Secure signup and login with hashed passwords and signed session cookies
- Subscriber dashboard with:
  - subscription status and renewal view
  - rolling 5-score management
  - score editing
  - charity selection and contribution updates
  - winnings and payout tracking
  - proof upload with Cloudinary support
- Admin dashboard with:
  - draw simulation and publishing
  - user subscription management
  - user score editing
  - charity create, edit, feature, and delete controls
  - winner verification and payout updates
  - analytics and notification activity
- Prize pool logic with 5/4/3 slot matching, equal tier splitting, and jackpot rollover
- Demo fallback mode for local testing when live provider credentials are not configured

## Demo credentials

- Subscriber: `rhea@fairwayfund.demo` / `Demo123!`
- Admin: `admin@fairwayfund.demo` / `Admin123!`

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment setup

Copy `.env.example` to `.env.local` and fill the values you want to use.

Required for all modes:

- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`

Optional for live integrations:

- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Stripe
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Resend
  - `RESEND_API_KEY`
  - `SENDER_EMAIL`
- Cloudinary
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

If the provider keys are omitted, the app runs in local demo mode using the in-memory repository and mock checkout behavior.

## Supabase setup

Run the SQL files in this order:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

The seed includes:

- system settings
- demo charities and events
- demo admin user
- demo subscriber user
- one active subscription
- five initial scores

## Cloudinary winner proof uploads

Winner proof uploads use Cloudinary when the Cloudinary environment variables are present. If those values are missing, the app still accepts the file selection and stores the proof metadata in fallback mode, but the image itself is not uploaded remotely.

## Notes

- The runtime automatically prefers Supabase when the required Supabase keys are configured.
- Passwords are hashed with `bcryptjs`.
- Sessions are signed with `jose`.
- Published data, edits, and uploaded proof metadata reset on restart only when you are running in demo fallback mode.
