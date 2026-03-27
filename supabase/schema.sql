create table if not exists profiles (
  id uuid primary key,
  full_name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null check (role in ('subscriber', 'admin')),
  selected_charity_id uuid,
  charity_percentage integer not null default 10,
  country text not null,
  created_at timestamptz not null default now()
);

create table if not exists charities (
  id uuid primary key,
  slug text unique not null,
  name text not null,
  category text not null,
  short_description text not null,
  description text not null,
  image text not null,
  impact_metric text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists charity_events (
  id uuid primary key,
  charity_id uuid not null references charities(id) on delete cascade,
  title text not null,
  event_date timestamptz not null,
  venue text not null
);

create table if not exists subscriptions (
  id uuid primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  status text not null check (status in ('active', 'canceled', 'lapsed', 'past_due', 'incomplete')),
  renewal_date timestamptz not null,
  started_at timestamptz not null default now(),
  stripe_customer_id text,
  stripe_subscription_id text
);

create table if not exists subscription_events (
  id uuid primary key,
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  event_type text not null,
  payload_summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists score_entries (
  id uuid primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  score integer not null check (score between 1 and 45),
  played_at date not null,
  created_at timestamptz not null default now()
);

create table if not exists draws (
  id uuid primary key,
  title text not null,
  month_label text not null,
  scheduled_for timestamptz not null,
  draw_mode text not null check (draw_mode in ('random', 'algorithmic')),
  algorithm_bias text check (algorithm_bias in ('frequent', 'rare')),
  status text not null check (status in ('simulation', 'published')),
  slot_one integer not null,
  slot_two integer not null,
  slot_three integer not null,
  slot_four integer not null,
  slot_five integer not null,
  total_prize_pool integer not null,
  rollover_amount integer not null default 0
);

create table if not exists draw_ticket_snapshots (
  id uuid primary key,
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  slot_one integer not null,
  slot_two integer not null,
  slot_three integer not null,
  slot_four integer not null,
  slot_five integer not null
);

create table if not exists winner_claims (
  id uuid primary key,
  draw_id uuid not null references draws(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  match_count integer not null check (match_count in (3, 4, 5)),
  amount integer not null,
  verification_status text not null check (verification_status in ('pending', 'approved', 'rejected')),
  payout_status text not null check (payout_status in ('pending', 'paid')),
  proof_filename text,
  proof_uploaded_at timestamptz,
  proof_url text,
  proof_public_id text
);

create table if not exists donations (
  id uuid primary key,
  charity_id uuid not null references charities(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  donor_name text not null,
  donor_email text not null,
  amount integer not null,
  source text not null check (source in ('subscription', 'independent')),
  created_at timestamptz not null default now()
);

create table if not exists system_settings (
  id boolean primary key default true,
  monthly_price integer not null,
  yearly_price integer not null,
  minimum_charity_percentage integer not null,
  prize_pool_percentage integer not null
);

create table if not exists notifications (
  id uuid primary key,
  user_id uuid references profiles(id) on delete set null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
