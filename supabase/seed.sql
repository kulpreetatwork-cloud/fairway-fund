insert into system_settings (id, monthly_price, yearly_price, minimum_charity_percentage, prize_pool_percentage)
values (true, 2499, 23999, 10, 45)
on conflict (id) do update
set monthly_price = excluded.monthly_price,
    yearly_price = excluded.yearly_price,
    minimum_charity_percentage = excluded.minimum_charity_percentage,
    prize_pool_percentage = excluded.prize_pool_percentage;

insert into charities (id, slug, name, category, short_description, description, image, impact_metric, featured)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'fairways-for-hope',
    'Fairways For Hope',
    'Youth Golf Access',
    'Opening junior golf to underserved communities.',
    'Fairways For Hope funds coaching, equipment grants, and transport for talented young golfers who would otherwise never reach a course.',
    'https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=1200&q=80',
    '1,240 junior sessions funded',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'greens-with-purpose',
    'Greens With Purpose',
    'Mental Health',
    'Therapeutic golf and wellness retreats.',
    'Greens With Purpose uses golf-led mindfulness retreats and community coaching to support mental health recovery for adults and veterans.',
    'https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80',
    '320 retreat scholarships awarded',
    false
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'clean-water-open',
    'Clean Water Open',
    'Global Relief',
    'Funding clean water infrastructure through golf fundraising.',
    'Clean Water Open turns monthly subscriptions and event sponsorship into reliable water access projects for rural communities.',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80',
    '18 villages supported',
    false
  )
on conflict (id) do nothing;

insert into charity_events (id, charity_id, title, event_date, venue)
values
  ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'Spring Charity Golf Day', '2026-04-18T09:00:00.000Z', 'The Ridge Club'),
  ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'Wellness Nine & Dine', '2026-05-09T16:00:00.000Z', 'Amber Links'),
  ('44444444-4444-4444-4444-444444444443', '33333333-3333-3333-3333-333333333333', 'Summer Scramble For Wells', '2026-06-14T10:00:00.000Z', 'Blue Coast Golf Estate')
on conflict (id) do nothing;

insert into profiles (id, full_name, email, password_hash, role, selected_charity_id, charity_percentage, country)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Ava Sterling',
    'admin@fairwayfund.demo',
    '$2b$10$Eo.kwNN7QbPDVcJ8BixH/.LYkxIGiwbg3/ha7V/6CXuPxGy5AJxO6',
    'admin',
    '11111111-1111-1111-1111-111111111111',
    15,
    'India'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Rhea Kapoor',
    'rhea@fairwayfund.demo',
    '$2b$10$R3qx0uqcjYPeXdDwXZAoh.YsTQOugoWv5AUjWiY7WqNrYgvg/LkGO',
    'subscriber',
    '11111111-1111-1111-1111-111111111111',
    12,
    'India'
  )
on conflict (id) do nothing;

insert into subscriptions (id, user_id, plan, status, renewal_date, started_at)
values
  ('55555555-5555-5555-5555-555555555551', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'monthly', 'active', now() + interval '30 days', now())
on conflict (id) do nothing;

insert into score_entries (id, user_id, score, played_at, created_at)
values
  ('66666666-6666-6666-6666-666666666661', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 34, '2026-03-24', now()),
  ('66666666-6666-6666-6666-666666666662', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 30, '2026-03-18', now()),
  ('66666666-6666-6666-6666-666666666663', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 32, '2026-03-11', now()),
  ('66666666-6666-6666-6666-666666666664', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 28, '2026-03-05', now()),
  ('66666666-6666-6666-6666-666666666665', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 35, '2026-02-27', now())
on conflict (id) do nothing;
