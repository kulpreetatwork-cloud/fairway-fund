# FairwayFund

FairwayFund is a full-stack MERN-style assignment build for the Digital Heroes Golf Charity Subscription Platform PRD. The application combines subscription billing, golf score tracking, monthly prize draws, charity contribution management, winner verification, and administrative reporting in a single responsive web experience.

The project is built with Next.js, TypeScript, Tailwind CSS, Supabase-ready persistence, Stripe Checkout, signed session authentication, and optional Cloudinary and Resend integrations.

## Highlights

- Charity-first public marketing website with featured causes, draw explainer, and clear subscription CTA
- Secure signup and login with hashed passwords and signed session cookies
- Subscriber dashboard with rolling 5-score management, charity controls, participation summary, winnings, and proof upload
- Admin dashboard for draw simulation, draw publishing, subscription management, score management, charity management, winner verification, and analytics
- Prize engine with 5/4/3 slot matching, equal tier splitting, ticket snapshots, and jackpot rollover
- Supabase-backed data mode with SQL schema and seed scripts
- Demo fallback mode for local testing when live integrations are not configured

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Stripe
- Cloudinary
- Resend
- `bcryptjs`
- `jose`

## Core Product Scope

The build covers the main PRD requirements:

- Public visitor experience
- Registered subscriber experience
- Administrator controls
- Monthly and yearly subscriptions
- Rolling latest-five golf scores
- Random and algorithmic draw flows
- Charity selection and donation support
- Winner proof upload and payout tracking
- Mobile-first responsive UI

## Demo Accounts

Use these seeded accounts after the database seed is applied:

- Subscriber: `rhea@fairwayfund.demo` / `Demo123!`
- Admin: `admin@fairwayfund.demo` / `Admin123!`

## Project Structure

```text
src/
  app/                 App routes, pages, and API handlers
  components/          Shared UI and layout components
  lib/                 Auth, data layer, integrations, draw logic, utils
supabase/
  schema.sql           Database schema
  seed.sql             Seed data
public/                Static assets
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment file

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 3. Add required environment values

Minimum local setup:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-long-random-secret
```

### 4. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Required

- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Cloudinary

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Email

- `RESEND_API_KEY`
- `SENDER_EMAIL`

If provider credentials are omitted, the app falls back to demo mode for the unsupported parts of the flow.

## Supabase Setup

Create a new Supabase project and add the project URL and keys to `.env.local`.

Run the SQL files in this order inside Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

The seed script creates:

- system settings
- demo charities
- demo charity events
- subscriber and admin demo users
- sample subscription data
- sample golf scores

## Stripe Setup

For local Stripe testing:

1. Enable Stripe Test Mode
2. Add `STRIPE_SECRET_KEY` to `.env.local`
3. Run the app locally
4. Start webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

5. Copy the generated `whsec_...` value into:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

6. Restart the dev server

Use the Stripe test card:

```text
4242 4242 4242 4242
```

with any future expiry, any valid CVC, and any postal code if requested.

## Cloudinary Setup

Cloudinary is used for winner proof uploads.

Add these values to enable real uploads:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Without Cloudinary, the app can still accept the proof submission flow in fallback mode, but the image will not be remotely stored.

## Resend Setup

To enable real transactional emails, add:

- `RESEND_API_KEY`
- `SENDER_EMAIL`

If these are omitted, email sending remains non-live.

## Deployment

### Vercel

Recommended deployment target: Vercel.

Before deploying:

1. Push this repository to GitHub
2. Import the repo into Vercel
3. Add production environment variables in Vercel
4. Set:

```env
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

Important:

- Do not reuse the local Stripe CLI webhook secret in production
- Create a Stripe webhook endpoint for:

```text
https://your-vercel-domain.vercel.app/api/stripe/webhook
```

- Add the new webhook signing secret from Stripe Dashboard into Vercel as `STRIPE_WEBHOOK_SECRET`

## Validation Commands

Use these before final submission:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Notes

- `.env.local` is ignored and should never be committed
- Supabase is the persistent data source when configured
- Demo mode is intended for quick local testing only
- Local Stripe webhook secrets and deployed Stripe webhook secrets are different

## Assignment Readiness

This repository is structured to support:

- local development
- GitHub submission
- Vercel deployment
- Supabase-backed persistence
- Stripe subscription testing
- Cloudinary-based proof uploads
- admin and subscriber demo validation
