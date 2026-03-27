import { compare, hash } from "bcryptjs";
import * as mock from "@/lib/mock-db";
import { getSupabaseAdminClient } from "@/lib/integrations/supabase-admin";
import { calculateSubscriptionContribution, simulateDraw } from "@/lib/draw";
import {
  AdminSnapshot,
  Charity,
  DashboardSnapshot,
  DrawRecord,
  DrawSimulationResult,
  NotificationRecord,
  Profile,
  ScoreEntry,
  SiteStats,
  SubscriptionPlan,
  SubscriptionRecord,
  SubscriptionStatus,
  SystemSettings,
  WinnerClaim,
} from "@/lib/types";
import { futureIso, nowIso, slugify } from "@/lib/utils";

let latestSimulationResult: DrawSimulationResult | null = null;

function shouldUseMockData() {
  return !getSupabaseAdminClient();
}

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name),
    email: String(row.email),
    role: row.role as Profile["role"],
    selectedCharityId: String(row.selected_charity_id ?? ""),
    charityPercentage: Number(row.charity_percentage ?? 10),
    country: String(row.country ?? ""),
    createdAt: String(row.created_at ?? nowIso()),
    passwordHash: typeof row.password_hash === "string" ? row.password_hash : undefined,
  };
}

function mapSubscription(row: Record<string, unknown>): SubscriptionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    plan: row.plan as SubscriptionPlan,
    status: row.status as SubscriptionStatus,
    renewalDate: String(row.renewal_date),
    startedAt: String(row.started_at),
    stripeCustomerId:
      typeof row.stripe_customer_id === "string" ? row.stripe_customer_id : undefined,
    stripeSubscriptionId:
      typeof row.stripe_subscription_id === "string"
        ? row.stripe_subscription_id
        : undefined,
  };
}

function mapScore(row: Record<string, unknown>): ScoreEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    score: Number(row.score),
    playedAt: String(row.played_at),
    createdAt: String(row.created_at ?? nowIso()),
  };
}

function mapWinner(row: Record<string, unknown>): WinnerClaim {
  return {
    id: String(row.id),
    drawId: String(row.draw_id),
    userId: String(row.user_id),
    matchCount: Number(row.match_count) as 3 | 4 | 5,
    amount: Number(row.amount),
    verificationStatus: row.verification_status as WinnerClaim["verificationStatus"],
    payoutStatus: row.payout_status as WinnerClaim["payoutStatus"],
    proofFilename:
      typeof row.proof_filename === "string" ? row.proof_filename : undefined,
    proofUploadedAt:
      typeof row.proof_uploaded_at === "string" ? row.proof_uploaded_at : undefined,
    proofUrl: typeof row.proof_url === "string" ? row.proof_url : undefined,
    proofPublicId:
      typeof row.proof_public_id === "string" ? row.proof_public_id : undefined,
  };
}

function mapDraw(row: Record<string, unknown>): DrawRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    monthLabel: String(row.month_label),
    scheduledFor: String(row.scheduled_for),
    drawMode: row.draw_mode as DrawRecord["drawMode"],
    algorithmBias:
      typeof row.algorithm_bias === "string"
        ? (row.algorithm_bias as DrawRecord["algorithmBias"])
        : undefined,
    status: row.status as DrawRecord["status"],
    numbers: [
      Number(row.slot_one),
      Number(row.slot_two),
      Number(row.slot_three),
      Number(row.slot_four),
      Number(row.slot_five),
    ],
    totalPrizePool: Number(row.total_prize_pool),
    rolloverAmount: Number(row.rollover_amount ?? 0),
  };
}

function mapNotification(row: Record<string, unknown>): NotificationRecord {
  return {
    id: String(row.id),
    userId: typeof row.user_id === "string" ? row.user_id : undefined,
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    createdAt: String(row.created_at ?? nowIso()),
  };
}

async function listLiveCharityEvents() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("charity_events").select("*");
  if (error) throw error;
  return (data ?? []) as Array<Record<string, unknown>>;
}

async function listLiveCharitiesRaw(): Promise<Charity[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const [{ data: charities, error }, events] = await Promise.all([
    supabase.from("charities").select("*").order("featured", { ascending: false }).order("name"),
    listLiveCharityEvents(),
  ]);
  if (error) throw error;
  return ((charities ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    shortDescription: String(row.short_description),
    description: String(row.description),
    image: String(row.image),
    impactMetric: String(row.impact_metric),
    featured: Boolean(row.featured),
    events: events
      .filter((event: Record<string, unknown>) => String(event.charity_id) === String(row.id))
      .map((event: Record<string, unknown>) => ({
        id: String(event.id),
        title: String(event.title),
        date: String(event.event_date),
        venue: String(event.venue),
      })),
  })) satisfies Charity[];
}

async function listLiveProfiles(): Promise<Profile[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapProfile(row),
  );
}

async function listLiveSubscriptions(): Promise<SubscriptionRecord[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("subscriptions").select("*");
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapSubscription(row),
  );
}

async function listLiveScores(userId?: string): Promise<ScoreEntry[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  let query = supabase.from("score_entries").select("*").order("played_at", { ascending: false });
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapScore(row),
  );
}

async function listLiveDraws(status?: "simulation" | "published"): Promise<DrawRecord[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  let query = supabase
    .from("draws")
    .select("*")
    .order("scheduled_for", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapDraw(row),
  );
}

async function listLiveWinners(userId?: string): Promise<WinnerClaim[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  let query = supabase.from("winner_claims").select("*").order("proof_uploaded_at", { ascending: false });
  if (userId) {
    query = query.eq("user_id", userId);
  }
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapWinner(row),
  );
}

async function listLiveNotifications(): Promise<NotificationRecord[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) =>
    mapNotification(row),
  );
}

export async function getProfileById(id: string) {
  if (shouldUseMockData()) {
    return mock.getProfileById(id);
  }

  const supabase = getSupabaseAdminClient()!;
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data) : undefined;
}

export async function authenticate(email: string, password: string) {
  if (shouldUseMockData()) {
    return mock.authenticate(email, password);
  }

  const supabase = getSupabaseAdminClient()!;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error) throw error;
  if (!data || !data.password_hash) return null;

  const matches = await compare(password, String(data.password_hash));
  return matches ? mapProfile(data) : null;
}

export async function createProfile(input: {
  fullName: string;
  email: string;
  password: string;
  charityId: string;
  charityPercentage: number;
  country: string;
}) {
  if (shouldUseMockData()) {
    return mock.createProfile(input);
  }

  const supabase = getSupabaseAdminClient()!;
  const passwordHash = await hash(input.password, 10);
  const id = crypto.randomUUID();
  const { error } = await supabase.from("profiles").insert({
    id,
    full_name: input.fullName,
    email: input.email.trim().toLowerCase(),
    password_hash: passwordHash,
    role: "subscriber",
    selected_charity_id: input.charityId,
    charity_percentage: Math.max(input.charityPercentage, 10),
    country: input.country,
  });
  if (error) throw error;
  return (await getProfileById(id))!;
}

export async function getSettings() {
  if (shouldUseMockData()) {
    return mock.getSettings();
  }

  const supabase = getSupabaseAdminClient()!;
  const { data, error } = await supabase.from("system_settings").select("*").eq("id", true).maybeSingle();
  if (error) throw error;

  return {
    monthlyPrice: Number(data?.monthly_price ?? 2499),
    yearlyPrice: Number(data?.yearly_price ?? 23999),
    minimumCharityPercentage: Number(data?.minimum_charity_percentage ?? 10),
    prizePoolPercentage: Number(data?.prize_pool_percentage ?? 45),
  } satisfies SystemSettings;
}

export async function listCharities(filters?: {
  query?: string;
  category?: string;
}): Promise<Charity[]> {
  const charities = shouldUseMockData() ? mock.listCharities() : await listLiveCharitiesRaw();
  const query = filters?.query?.trim().toLowerCase();
  const category = filters?.category?.trim().toLowerCase();

  return charities.filter((charity: Charity) => {
    const queryMatches =
      !query ||
      charity.name.toLowerCase().includes(query) ||
      charity.description.toLowerCase().includes(query) ||
      charity.shortDescription.toLowerCase().includes(query);
    const categoryMatches = !category || category === "all" || charity.category.toLowerCase() === category;
    return queryMatches && categoryMatches;
  });
}

export async function getCharityBySlug(slug: string): Promise<Charity | undefined> {
  if (shouldUseMockData()) {
    return mock.getCharityBySlug(slug);
  }

  const charities = await listLiveCharitiesRaw();
  return charities.find((charity: Charity) => charity.slug === slug);
}

export async function getSubscriptionByUserId(userId: string) {
  if (shouldUseMockData()) {
    const admin = mock.getAdminSnapshot();
    return admin.subscriptions.find((subscription) => subscription.userId === userId);
  }

  const supabase = getSupabaseAdminClient()!;
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSubscription(data) : undefined;
}

export async function hasActiveSubscriberAccess(userId: string) {
  const subscription = await getSubscriptionByUserId(userId);
  return subscription?.status === "active";
}

export async function ensureSubscription(userId: string, plan: SubscriptionPlan) {
  if (shouldUseMockData()) {
    return mock.ensureSubscription(userId, plan);
  }

  const supabase = getSupabaseAdminClient()!;
  const existing = await getSubscriptionByUserId(userId);
  const renewalDate = futureIso(plan === "monthly" ? 30 : 365);

  if (existing) {
    const { error } = await supabase
      .from("subscriptions")
      .update({
        plan,
        status: "active",
        renewal_date: renewalDate,
      })
      .eq("id", existing.id);
    if (error) throw error;
    return (await getSubscriptionByUserId(userId))!;
  }

  const id = crypto.randomUUID();
  const { error } = await supabase.from("subscriptions").insert({
    id,
    user_id: userId,
    plan,
    status: "active",
    renewal_date: renewalDate,
    started_at: nowIso(),
  });
  if (error) throw error;

  await supabase.from("subscription_events").insert({
    id: crypto.randomUUID(),
    subscription_id: id,
    event_type: "subscription.activated",
    payload_summary: `Subscription activated on ${plan} plan.`,
    created_at: nowIso(),
  });

  return (await getSubscriptionByUserId(userId))!;
}

export async function updateSubscriptionStatus(userId: string, status: SubscriptionStatus) {
  if (shouldUseMockData()) {
    return mock.updateSubscriptionStatus(userId, status);
  }

  const supabase = getSupabaseAdminClient()!;
  const existing = await getSubscriptionByUserId(userId);
  if (!existing) throw new Error("Subscription not found.");
  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", existing.id);
  if (error) throw error;
  return (await getSubscriptionByUserId(userId))!;
}

export async function cancelSubscription(userId: string) {
  return updateSubscriptionStatus(userId, "canceled");
}

export async function updateCharitySelection(
  userId: string,
  charityId: string,
  charityPercentage: number,
) {
  if (shouldUseMockData()) {
    return mock.updateCharitySelection(userId, charityId, charityPercentage);
  }

  const supabase = getSupabaseAdminClient()!;
  const settings = await getSettings();
  const { error } = await supabase
    .from("profiles")
    .update({
      selected_charity_id: charityId,
      charity_percentage: Math.max(charityPercentage, settings.minimumCharityPercentage),
    })
    .eq("id", userId);
  if (error) throw error;
  return (await getProfileById(userId))!;
}

export async function addScore(userId: string, score: number, playedAt: string) {
  if (shouldUseMockData()) {
    return mock.addScore(userId, score, playedAt);
  }

  const supabase = getSupabaseAdminClient()!;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("score_entries").insert({
    id,
    user_id: userId,
    score,
    played_at: playedAt,
    created_at: nowIso(),
  });
  if (error) throw error;

  const userScores = await listLiveScores(userId);
  const extraScores = userScores.slice(5);

  if (extraScores.length) {
    const { error: deleteError } = await supabase
      .from("score_entries")
      .delete()
      .in(
        "id",
        extraScores.map((entry) => entry.id),
      );
    if (deleteError) throw deleteError;
  }

  return listLiveScores(userId);
}

export async function updateScore(scoreId: string, score: number, playedAt: string) {
  if (shouldUseMockData()) {
    return mock.updateScore(scoreId, score, playedAt);
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase
    .from("score_entries")
    .update({ score, played_at: playedAt } as never)
    .eq("id", scoreId);
  if (error) throw error;
}

export async function addAdminScoreForUser(userId: string, score: number, playedAt: string) {
  return addScore(userId, score, playedAt);
}

export async function addStandaloneDonation(input: {
  charityId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  userId?: string;
}) {
  if (shouldUseMockData()) {
    return mock.addStandaloneDonation(input);
  }

  const supabase = getSupabaseAdminClient()!;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("donations").insert({
    id,
    charity_id: input.charityId,
    donor_name: input.donorName,
    donor_email: input.donorEmail,
    amount: input.amount,
    source: "independent",
    user_id: input.userId ?? null,
    created_at: nowIso(),
  });
  if (error) throw error;
}

export async function addNotification(input: {
  email: string;
  subject: string;
  message: string;
  userId?: string;
}) {
  if (shouldUseMockData()) {
    mock.addNotification(input);
    return;
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase.from("notifications").insert({
    id: crypto.randomUUID(),
    user_id: input.userId ?? null,
    email: input.email,
    subject: input.subject,
    message: input.message,
    created_at: nowIso(),
  });
  if (error) throw error;
}

export async function submitWinnerProof(
  userId: string,
  drawId: string,
  payload: { filename: string; url?: string; publicId?: string },
) {
  if (shouldUseMockData()) {
    return mock.submitWinnerProof(userId, drawId, payload.filename);
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase
    .from("winner_claims")
    .update({
      proof_filename: payload.filename,
      proof_url: payload.url ?? null,
      proof_public_id: payload.publicId ?? null,
      proof_uploaded_at: nowIso(),
      verification_status: "pending",
    })
    .eq("user_id", userId)
    .eq("draw_id", drawId);
  if (error) throw error;
}

export async function updateWinnerStatus(
  winnerId: string,
  verificationStatus: WinnerClaim["verificationStatus"],
  payoutStatus: WinnerClaim["payoutStatus"],
) {
  if (shouldUseMockData()) {
    return mock.updateWinnerStatus(winnerId, verificationStatus, payoutStatus);
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase
    .from("winner_claims")
    .update({
      verification_status: verificationStatus,
      payout_status: payoutStatus,
    })
    .eq("id", winnerId);
  if (error) throw error;
}

export async function addCharity(input: {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image?: string;
  impactMetric?: string;
}) {
  if (shouldUseMockData()) {
    return mock.addCharity(input);
  }

  const supabase = getSupabaseAdminClient()!;
  const id = crypto.randomUUID();
  const { error } = await supabase.from("charities").insert({
    id,
    slug: slugify(input.name),
    name: input.name,
    category: input.category,
    short_description: input.shortDescription,
    description: input.description,
    image:
      input.image ||
      "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80",
    impact_metric: input.impactMetric || "New charity waiting for first impact milestone",
    featured: false,
  });
  if (error) throw error;
}

export async function updateCharity(input: {
  charityId: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  impactMetric: string;
}) {
  if (shouldUseMockData()) {
    return mock.updateCharity(input);
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase
    .from("charities")
    .update({
      slug: slugify(input.name),
      name: input.name,
      category: input.category,
      short_description: input.shortDescription,
      description: input.description,
      image: input.image,
      impact_metric: input.impactMetric,
    })
    .eq("id", input.charityId);
  if (error) throw error;
}

export async function deleteCharity(charityId: string) {
  if (shouldUseMockData()) {
    mock.deleteCharity(charityId);
    return;
  }

  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase.from("charities").delete().eq("id", charityId);
  if (error) throw error;
}

export async function toggleFeaturedCharity(charityId: string) {
  if (shouldUseMockData()) {
    mock.toggleFeaturedCharity(charityId);
    return;
  }

  const charities = await listCharities();
  const charity = charities.find((entry) => entry.id === charityId);
  if (!charity) throw new Error("Charity not found.");
  const supabase = getSupabaseAdminClient()!;
  const { error } = await supabase
    .from("charities")
    .update({ featured: !charity.featured })
    .eq("id", charityId);
  if (error) throw error;
}

export async function listPublishedDraws(): Promise<DrawRecord[]> {
  if (shouldUseMockData()) {
    return mock.listPublishedDraws();
  }

  return listLiveDraws("published");
}

export async function listRecentWinners(): Promise<WinnerClaim[]> {
  if (shouldUseMockData()) {
    return mock.listRecentWinners();
  }

  return listLiveWinners();
}

export async function getCharityTotals(): Promise<Array<{ charity: Charity; total: number }>> {
  if (shouldUseMockData()) {
    return mock.getCharityTotals();
  }

  const [charities, profiles, subscriptions, settings] = await Promise.all([
    listCharities(),
    listLiveProfiles(),
    listLiveSubscriptions(),
    getSettings(),
  ]);

  const supabase = getSupabaseAdminClient()!;
  const { data: donations, error } = await supabase.from("donations").select("*");
  if (error) throw error;

  return charities.map((charity: Charity) => {
    const subscriptionTotal = profiles.reduce((sum: number, profile: Profile) => {
      if (profile.selectedCharityId !== charity.id) return sum;
      const subscription = subscriptions.find((item: SubscriptionRecord) => item.userId === profile.id);
      if (!subscription || subscription.status !== "active") return sum;
      return (
        sum +
        calculateSubscriptionContribution(settings, subscription, profile).charityContribution
      );
    }, 0);

    const donationTotal = (donations ?? [])
      .filter((donation: Record<string, unknown>) => String(donation.charity_id) === charity.id)
      .reduce((sum: number, donation: Record<string, unknown>) => sum + Number(donation.amount), 0);

    return { charity, total: subscriptionTotal + donationTotal };
  });
}

export async function getPublicStats(): Promise<SiteStats> {
  if (shouldUseMockData()) {
    return mock.getPublicStats();
  }

  const [profiles, subscriptions, settings] = await Promise.all([
    listLiveProfiles(),
    listLiveSubscriptions(),
    getSettings(),
  ]);
  const activeProfiles = profiles.filter((profile) => {
    const subscription = subscriptions.find((item) => item.userId === profile.id);
    return subscription?.status === "active";
  });

  const charityTotals = await getCharityTotals();
  const totalPrizePool = activeProfiles.reduce((sum, profile) => {
    const subscription = subscriptions.find((item) => item.userId === profile.id);
    if (!subscription) return sum;
    return sum + calculateSubscriptionContribution(settings, subscription, profile).prizeContribution;
  }, 0);

  return {
    activeSubscribers: activeProfiles.length,
    totalPrizePool,
    charityRaised: charityTotals.reduce((sum, item) => sum + item.total, 0),
    charitiesSupported: charityTotals.length,
  };
}

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  if (shouldUseMockData()) {
    return mock.getDashboardSnapshot(userId);
  }

  const [profile, subscription, charities, scores, winnings] = await Promise.all([
    getProfileById(userId),
    getSubscriptionByUserId(userId),
    listCharities(),
    listLiveScores(userId),
    listLiveWinners(userId),
  ]);
  if (!profile) throw new Error("User not found.");

  const supabase = getSupabaseAdminClient()!;
  const { count } = await supabase
    .from("draw_ticket_snapshots")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  const publishedDraws = await listPublishedDraws();

  return {
    profile,
    subscription,
    selectedCharity: charities.find((charity) => charity.id === profile.selectedCharityId),
    scores,
    winnings,
    nextDrawDate: publishedDraws[0]?.scheduledFor ?? futureIso(30),
    drawsEntered: count ?? 0,
  };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  if (shouldUseMockData()) {
    return mock.getAdminSnapshot();
  }

  const [users, subscriptions, charities, draws, winners, notifications] = await Promise.all([
    listLiveProfiles(),
    listLiveSubscriptions(),
    listCharities(),
    listLiveDraws(),
    listLiveWinners(),
    listLiveNotifications(),
  ]);

  return { users, subscriptions, charities, draws, winners, notifications };
}

export async function simulateAdminDraw(
  mode: "random" | "algorithmic",
  bias: "frequent" | "rare",
) {
  if (shouldUseMockData()) {
    return mock.simulateAdminDraw(mode, bias);
  }

  const [profiles, subscriptions, scores, settings, draws] = await Promise.all([
    listLiveProfiles(),
    listLiveSubscriptions(),
    listLiveScores(),
    getSettings(),
    listPublishedDraws(),
  ]);

  latestSimulationResult = simulateDraw({
    settings,
    activeProfiles: profiles.filter((profile) =>
      subscriptions.some(
        (subscription: SubscriptionRecord) =>
          subscription.userId === profile.id && subscription.status === "active",
      ),
    ),
    activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "active"),
    scores,
    bias: mode === "algorithmic" ? bias : undefined,
    rolloverAmount: draws[0]?.rolloverAmount ?? 0,
  });

  return latestSimulationResult;
}

export async function publishAdminDraw(
  mode: "random" | "algorithmic",
  bias: "frequent" | "rare",
) {
  if (shouldUseMockData()) {
    return mock.publishAdminDraw(mode, bias);
  }

  const result = await simulateAdminDraw(mode, bias);
  const supabase = getSupabaseAdminClient()!;
  const drawId = crypto.randomUUID();
  const scheduledFor = nowIso();
  const title = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const { error } = await supabase.from("draws").insert({
    id: drawId,
    title: `${title} Charity Draw`,
    month_label: title,
    scheduled_for: scheduledFor,
    draw_mode: mode,
    algorithm_bias: mode === "algorithmic" ? bias : null,
    status: "published",
    slot_one: result.numbers[0],
    slot_two: result.numbers[1],
    slot_three: result.numbers[2],
    slot_four: result.numbers[3],
    slot_five: result.numbers[4],
    total_prize_pool: result.totalPrizePool,
    rollover_amount: result.rolloverAmount,
  });
  if (error) throw error;

  const scores = await listLiveScores();
  const subscriptions = await listLiveSubscriptions();
  const activeProfiles = (await listLiveProfiles()).filter((profile) =>
    subscriptions.some(
      (subscription) =>
        subscription.userId === profile.id && subscription.status === "active",
    ),
  );

  const snapshotRows = activeProfiles
    .map((profile: Profile) => {
      const userScores = scores.filter((entry) => entry.userId === profile.id).slice(0, 5);
      if (userScores.length < 5) return null;
      return {
        id: crypto.randomUUID(),
        draw_id: drawId,
        user_id: profile.id,
        slot_one: userScores[0].score,
        slot_two: userScores[1].score,
        slot_three: userScores[2].score,
        slot_four: userScores[3].score,
        slot_five: userScores[4].score,
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  if (snapshotRows.length) {
    const { error: snapshotError } = await supabase
      .from("draw_ticket_snapshots")
      .insert(snapshotRows);
    if (snapshotError) throw snapshotError;
  }

  if (result.winners.length) {
    const winnerRows = result.winners.map((winner) => ({
      id: crypto.randomUUID(),
      draw_id: drawId,
      user_id: winner.userId,
      match_count: winner.matchCount,
      amount: winner.amount,
      verification_status: winner.verificationStatus,
      payout_status: winner.payoutStatus,
    }));

    const { error: winnersError } = await supabase.from("winner_claims").insert(winnerRows);
    if (winnersError) throw winnersError;

    await Promise.all(
      result.winners.map(async (winner) => {
        const profile = activeProfiles.find((entry) => entry.id === winner.userId);
        if (!profile) return;
        await addNotification({
          userId: profile.id,
          email: profile.email,
          subject: "You have a winning draw to verify",
          message:
            "Your latest draw result is ready. Upload your proof from the dashboard to begin verification.",
        });
      }),
    );
  }

  return { drawId, result };
}

export async function getLatestSimulationResult() {
  if (shouldUseMockData()) {
    return mock.getLatestSimulationResult();
  }

  return latestSimulationResult;
}

export async function getCredentials(): Promise<{
  admin: { email: string; password: string };
  subscriber: { email: string; password: string };
}> {
  return mock.getCredentials();
}
