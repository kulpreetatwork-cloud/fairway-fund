import {
  AdminSnapshot,
  Charity,
  DashboardSnapshot,
  DonationRecord,
  DrawRecord,
  DrawSimulationResult,
  DrawTicketSnapshot,
  NotificationRecord,
  Profile,
  ScoreEntry,
  SiteStats,
  SubscriptionEvent,
  SubscriptionPlan,
  SubscriptionRecord,
  SubscriptionStatus,
  SystemSettings,
  WinnerClaim,
} from "@/lib/types";
import { compareSync, hashSync } from "bcryptjs";
import { calculateSubscriptionContribution, simulateDraw } from "@/lib/draw";
import { createId, futureIso, nowIso, slugify } from "@/lib/utils";

const settings: SystemSettings = {
  monthlyPrice: 2499,
  yearlyPrice: 23999,
  minimumCharityPercentage: 10,
  prizePoolPercentage: 45,
};

const charities: Charity[] = [
  {
    id: "charity_1",
    slug: "fairways-for-hope",
    name: "Fairways For Hope",
    category: "Youth Golf Access",
    shortDescription: "Opening junior golf to underserved communities.",
    description:
      "Fairways For Hope funds coaching, equipment grants, and transport for talented young golfers who would otherwise never reach a course.",
    image:
      "https://images.unsplash.com/photo-1518600506278-4e8ef466b810?auto=format&fit=crop&w=1200&q=80",
    impactMetric: "1,240 junior sessions funded",
    featured: true,
    events: [
      {
        id: "event_1",
        title: "Spring Charity Golf Day",
        date: "2026-04-18T09:00:00.000Z",
        venue: "The Ridge Club",
      },
    ],
  },
  {
    id: "charity_2",
    slug: "greens-with-purpose",
    name: "Greens With Purpose",
    category: "Mental Health",
    shortDescription: "Therapeutic golf and wellness retreats.",
    description:
      "Greens With Purpose uses golf-led mindfulness retreats and community coaching to support mental health recovery for adults and veterans.",
    image:
      "https://images.unsplash.com/photo-1592919505780-303950717480?auto=format&fit=crop&w=1200&q=80",
    impactMetric: "320 retreat scholarships awarded",
    featured: false,
    events: [
      {
        id: "event_2",
        title: "Wellness Nine & Dine",
        date: "2026-05-09T16:00:00.000Z",
        venue: "Amber Links",
      },
    ],
  },
  {
    id: "charity_3",
    slug: "clean-water-open",
    name: "Clean Water Open",
    category: "Global Relief",
    shortDescription: "Funding clean water infrastructure through golf fundraising.",
    description:
      "Clean Water Open turns monthly subscriptions and event sponsorship into reliable water access projects for rural communities.",
    image:
      "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=1200&q=80",
    impactMetric: "18 villages supported",
    featured: false,
    events: [
      {
        id: "event_3",
        title: "Summer Scramble For Wells",
        date: "2026-06-14T10:00:00.000Z",
        venue: "Blue Coast Golf Estate",
      },
    ],
  },
];

const profiles: Profile[] = [
  {
    id: "user_admin",
    fullName: "Ava Sterling",
    email: "admin@fairwayfund.demo",
    role: "admin",
    selectedCharityId: "charity_1",
    charityPercentage: 15,
    country: "India",
    createdAt: "2026-03-01T10:00:00.000Z",
    passwordHash: hashSync("Admin123!", 10),
  },
  {
    id: "user_1",
    fullName: "Rhea Kapoor",
    email: "rhea@fairwayfund.demo",
    role: "subscriber",
    selectedCharityId: "charity_1",
    charityPercentage: 12,
    country: "India",
    createdAt: "2026-03-02T10:00:00.000Z",
    passwordHash: hashSync("Demo123!", 10),
  },
  {
    id: "user_2",
    fullName: "Mason Reid",
    email: "mason@fairwayfund.demo",
    role: "subscriber",
    selectedCharityId: "charity_2",
    charityPercentage: 10,
    country: "United Kingdom",
    createdAt: "2026-03-03T10:00:00.000Z",
    passwordHash: hashSync("Demo123!", 10),
  },
  {
    id: "user_3",
    fullName: "Noah Fernandes",
    email: "noah@fairwayfund.demo",
    role: "subscriber",
    selectedCharityId: "charity_3",
    charityPercentage: 18,
    country: "India",
    createdAt: "2026-03-04T10:00:00.000Z",
    passwordHash: hashSync("Demo123!", 10),
  },
];

const subscriptions: SubscriptionRecord[] = [
  {
    id: "sub_1",
    userId: "user_1",
    plan: "monthly",
    status: "active",
    renewalDate: futureIso(22),
    startedAt: "2026-03-05T10:00:00.000Z",
  },
  {
    id: "sub_2",
    userId: "user_2",
    plan: "yearly",
    status: "active",
    renewalDate: futureIso(280),
    startedAt: "2026-02-15T10:00:00.000Z",
  },
  {
    id: "sub_3",
    userId: "user_3",
    plan: "monthly",
    status: "past_due",
    renewalDate: "2026-03-10T10:00:00.000Z",
    startedAt: "2026-02-10T10:00:00.000Z",
  },
];

const subscriptionEvents: SubscriptionEvent[] = [
  {
    id: "evt_1",
    subscriptionId: "sub_1",
    type: "subscription.created",
    createdAt: "2026-03-05T10:00:00.000Z",
    payloadSummary: "Monthly plan activated in demo mode.",
  },
];

const scores: ScoreEntry[] = [
  { id: "score_1", userId: "user_1", score: 34, playedAt: "2026-03-24", createdAt: nowIso() },
  { id: "score_2", userId: "user_1", score: 30, playedAt: "2026-03-18", createdAt: nowIso() },
  { id: "score_3", userId: "user_1", score: 32, playedAt: "2026-03-11", createdAt: nowIso() },
  { id: "score_4", userId: "user_1", score: 28, playedAt: "2026-03-05", createdAt: nowIso() },
  { id: "score_5", userId: "user_1", score: 35, playedAt: "2026-02-27", createdAt: nowIso() },
  { id: "score_6", userId: "user_2", score: 26, playedAt: "2026-03-26", createdAt: nowIso() },
  { id: "score_7", userId: "user_2", score: 26, playedAt: "2026-03-17", createdAt: nowIso() },
  { id: "score_8", userId: "user_2", score: 29, playedAt: "2026-03-12", createdAt: nowIso() },
  { id: "score_9", userId: "user_2", score: 31, playedAt: "2026-03-03", createdAt: nowIso() },
  { id: "score_10", userId: "user_2", score: 24, playedAt: "2026-02-21", createdAt: nowIso() },
  { id: "score_11", userId: "user_3", score: 18, playedAt: "2026-03-09", createdAt: nowIso() },
  { id: "score_12", userId: "user_3", score: 21, playedAt: "2026-03-02", createdAt: nowIso() },
  { id: "score_13", userId: "user_3", score: 22, playedAt: "2026-02-25", createdAt: nowIso() },
  { id: "score_14", userId: "user_3", score: 19, playedAt: "2026-02-18", createdAt: nowIso() },
  { id: "score_15", userId: "user_3", score: 20, playedAt: "2026-02-10", createdAt: nowIso() },
];

const draws: DrawRecord[] = [
  {
    id: "draw_1",
    title: "March Charity Draw",
    monthLabel: "March 2026",
    scheduledFor: "2026-03-31T18:00:00.000Z",
    drawMode: "random",
    status: "published",
    numbers: [34, 30, 29, 28, 35],
    totalPrizePool: 24748,
    rolloverAmount: 0,
  },
];

const drawSnapshots: DrawTicketSnapshot[] = [
  {
    id: "snapshot_1",
    drawId: "draw_1",
    userId: "user_1",
    slots: [34, 30, 32, 28, 35],
  },
  {
    id: "snapshot_2",
    drawId: "draw_1",
    userId: "user_2",
    slots: [26, 26, 29, 31, 24],
  },
];

const winners: WinnerClaim[] = [
  {
    id: "winner_1",
    drawId: "draw_1",
    userId: "user_1",
    matchCount: 4,
    amount: 8661,
    verificationStatus: "approved",
    payoutStatus: "paid",
    proofFilename: "scorecard-rhea.png",
    proofUploadedAt: "2026-03-29T09:00:00.000Z",
  },
];

const donations: DonationRecord[] = [
  {
    id: "donation_1",
    charityId: "charity_1",
    donorName: "Rhea Kapoor",
    donorEmail: "rhea@fairwayfund.demo",
    amount: 300,
    createdAt: "2026-03-25T12:00:00.000Z",
    source: "independent",
    userId: "user_1",
  },
];

const notifications: NotificationRecord[] = [
  {
    id: "mail_1",
    userId: "user_1",
    email: "rhea@fairwayfund.demo",
    subject: "March draw result ready",
    message: "Your draw result is ready and proof review has been approved.",
    createdAt: "2026-03-29T09:00:00.000Z",
  },
];

let latestSimulationResult: DrawSimulationResult | null = null;

function sortScoresDesc(list: ScoreEntry[]) {
  return [...list].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
  );
}

function activeSubscriberProfiles() {
  return profiles.filter((profile) => {
    const subscription = subscriptions.find((item) => item.userId === profile.id);
    return subscription?.status === "active";
  });
}

function latestRolloverAmount() {
  const latestPublished = [...draws]
    .filter((draw) => draw.status === "published")
    .sort(
      (a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime(),
    )[0];

  return latestPublished?.rolloverAmount ?? 0;
}

export function listCharities() {
  return charities;
}

export function getCharityBySlug(slug: string) {
  return charities.find((charity) => charity.slug === slug);
}

export function getProfileById(id: string) {
  return profiles.find((profile) => profile.id === id);
}

export function authenticate(email: string, password: string) {
  return profiles.find((profile) => {
    return (
      profile.email.toLowerCase() === email.trim().toLowerCase() &&
      !!profile.passwordHash &&
      compareSync(password, profile.passwordHash)
    );
  });
}

export function createProfile({
  fullName,
  email,
  password,
  charityId,
  charityPercentage,
  country,
}: {
  fullName: string;
  email: string;
  password: string;
  charityId: string;
  charityPercentage: number;
  country: string;
}) {
  const existing = profiles.find(
    (profile) => profile.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (existing) {
    throw new Error("An account already exists for this email.");
  }

  const profile: Profile = {
    id: createId("user"),
    fullName,
    email: email.trim().toLowerCase(),
    role: "subscriber",
    selectedCharityId: charityId,
    charityPercentage: Math.max(charityPercentage, settings.minimumCharityPercentage),
    country,
    createdAt: nowIso(),
    passwordHash: hashSync(password, 10),
  };

  profiles.push(profile);

  return profile;
}

export function ensureSubscription(userId: string, plan: SubscriptionPlan) {
  const existing = subscriptions.find((subscription) => subscription.userId === userId);

  if (existing) {
    existing.plan = plan;
    existing.status = "active";
    existing.renewalDate = futureIso(plan === "monthly" ? 30 : 365);
    return existing;
  }

  const subscription: SubscriptionRecord = {
    id: createId("sub"),
    userId,
    plan,
    status: "active",
    renewalDate: futureIso(plan === "monthly" ? 30 : 365),
    startedAt: nowIso(),
  };

  subscriptions.push(subscription);
  subscriptionEvents.push({
    id: createId("evt"),
    subscriptionId: subscription.id,
    type: "subscription.activated",
    createdAt: nowIso(),
    payloadSummary: `Subscription activated on ${plan} plan.`,
  });
  return subscription;
}

export function addScore(userId: string, score: number, playedAt: string) {
  scores.push({
    id: createId("score"),
    userId,
    score,
    playedAt,
    createdAt: nowIso(),
  });

  const userScores = sortScoresDesc(scores.filter((entry) => entry.userId === userId));

  userScores.slice(5).forEach((extra) => {
    const index = scores.findIndex((entry) => entry.id === extra.id);
    if (index >= 0) {
      scores.splice(index, 1);
    }
  });

  return sortScoresDesc(scores.filter((entry) => entry.userId === userId));
}

export function addAdminScoreForUser(userId: string, score: number, playedAt: string) {
  return addScore(userId, score, playedAt);
}

export function updateScore(scoreId: string, score: number, playedAt: string) {
  const existing = scores.find((entry) => entry.id === scoreId);

  if (!existing) {
    throw new Error("Score not found.");
  }

  existing.score = score;
  existing.playedAt = playedAt;
  return existing;
}

export function updateCharitySelection(
  userId: string,
  charityId: string,
  charityPercentage: number,
) {
  const profile = getProfileById(userId);

  if (!profile) {
    throw new Error("User not found.");
  }

  profile.selectedCharityId = charityId;
  profile.charityPercentage = Math.max(charityPercentage, settings.minimumCharityPercentage);
  return profile;
}

export function addStandaloneDonation({
  charityId,
  donorName,
  donorEmail,
  amount,
  userId,
}: {
  charityId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  userId?: string;
}) {
  const donation: DonationRecord = {
    id: createId("donation"),
    charityId,
    donorName,
    donorEmail,
    amount,
    createdAt: nowIso(),
    source: "independent",
    userId,
  };

  donations.push(donation);
  return donation;
}

export function addNotification({
  email,
  subject,
  message,
  userId,
}: {
  email: string;
  subject: string;
  message: string;
  userId?: string;
}) {
  notifications.unshift({
    id: createId("mail"),
    email,
    subject,
    message,
    userId,
    createdAt: nowIso(),
  });
}

export function submitWinnerProof(userId: string, drawId: string, filename: string) {
  const winner = winners.find((item) => item.userId === userId && item.drawId === drawId);

  if (!winner) {
    throw new Error("No winning claim found for this draw.");
  }

  winner.proofFilename = filename;
  winner.proofUploadedAt = nowIso();
  winner.verificationStatus = "pending";
  return winner;
}

export function updateWinnerStatus(
  winnerId: string,
  verificationStatus: WinnerClaim["verificationStatus"],
  payoutStatus: WinnerClaim["payoutStatus"],
) {
  const winner = winners.find((item) => item.id === winnerId);

  if (!winner) {
    throw new Error("Winner record not found.");
  }

  winner.verificationStatus = verificationStatus;
  winner.payoutStatus = payoutStatus;
  return winner;
}

export function addCharity({
  name,
  category,
  shortDescription,
  description,
  image,
  impactMetric,
}: {
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image?: string;
  impactMetric?: string;
}) {
  const charity: Charity = {
    id: createId("charity"),
    slug: slugify(name),
    name,
    category,
    shortDescription,
    description,
    image:
      image ||
      "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80",
    impactMetric: impactMetric || "New charity waiting for first impact milestone",
    featured: false,
    events: [],
  };

  charities.push(charity);
  return charity;
}

export function updateCharity({
  charityId,
  name,
  category,
  shortDescription,
  description,
  image,
  impactMetric,
}: {
  charityId: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  impactMetric: string;
}) {
  const charity = charities.find((entry) => entry.id === charityId);

  if (!charity) {
    throw new Error("Charity not found.");
  }

  charity.slug = slugify(name);
  charity.name = name;
  charity.category = category;
  charity.shortDescription = shortDescription;
  charity.description = description;
  charity.image = image;
  charity.impactMetric = impactMetric;

  return charity;
}

export function deleteCharity(charityId: string) {
  const index = charities.findIndex((charity) => charity.id === charityId);

  if (index >= 0) {
    charities.splice(index, 1);
  }
}

export function toggleFeaturedCharity(charityId: string) {
  charities.forEach((charity) => {
    if (charity.id === charityId) {
      charity.featured = !charity.featured;
    }
  });
}

export function getSettings() {
  return settings;
}

export function getPublicStats(): SiteStats {
  const activeProfiles = activeSubscriberProfiles();
  const totalPrizePool = activeProfiles.reduce((sum, profile) => {
    const subscription = subscriptions.find((item) => item.userId === profile.id);

    if (!subscription) {
      return sum;
    }

    return sum + calculateSubscriptionContribution(settings, subscription, profile).prizeContribution;
  }, 0);

  const charityRaised =
    activeProfiles.reduce((sum, profile) => {
      const subscription = subscriptions.find((item) => item.userId === profile.id);

      if (!subscription) {
        return sum;
      }

      return sum + calculateSubscriptionContribution(settings, subscription, profile).charityContribution;
    }, 0) + donations.reduce((sum, donation) => sum + donation.amount, 0);

  return {
    activeSubscribers: activeProfiles.length,
    totalPrizePool,
    charityRaised,
    charitiesSupported: charities.length,
  };
}

export function getDashboardSnapshot(userId: string): DashboardSnapshot {
  const profile = getProfileById(userId);

  if (!profile) {
    throw new Error("User not found.");
  }

  return {
    profile,
    subscription: subscriptions.find((subscription) => subscription.userId === userId),
    selectedCharity: charities.find((charity) => charity.id === profile.selectedCharityId),
    scores: sortScoresDesc(scores.filter((score) => score.userId === userId)),
    winnings: winners.filter((winner) => winner.userId === userId),
    nextDrawDate: "2026-04-30T18:00:00.000Z",
    drawsEntered: drawSnapshots.filter((snapshot) => snapshot.userId === userId).length,
  };
}

export function simulateAdminDraw(
  mode: "random" | "algorithmic",
  bias: "frequent" | "rare",
) {
  const activeProfiles = activeSubscriberProfiles();
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "active");

  latestSimulationResult = simulateDraw({
    settings,
    activeProfiles,
    activeSubscriptions,
    scores,
    bias: mode === "algorithmic" ? bias : undefined,
    rolloverAmount: latestRolloverAmount(),
  });

  return latestSimulationResult;
}

export function publishAdminDraw(
  mode: "random" | "algorithmic",
  bias: "frequent" | "rare",
) {
  const result = simulateAdminDraw(mode, bias);
  const drawId = createId("draw");
  const scheduledFor = nowIso();
  const title = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  draws.unshift({
    id: drawId,
    title: `${title} Charity Draw`,
    monthLabel: title,
    scheduledFor,
    drawMode: mode,
    algorithmBias: mode === "algorithmic" ? bias : undefined,
    status: "published",
    numbers: result.numbers,
    totalPrizePool: result.totalPrizePool,
    rolloverAmount: result.rolloverAmount,
  });

  activeSubscriberProfiles().forEach((profile) => {
    const userScores = sortScoresDesc(scores.filter((score) => score.userId === profile.id));

    if (userScores.length >= 5) {
      drawSnapshots.unshift({
        id: createId("snapshot"),
        drawId,
        userId: profile.id,
        slots: userScores.slice(0, 5).map((score) => score.score) as [
          number,
          number,
          number,
          number,
          number,
        ],
      });
    }
  });

  result.winners.forEach((winner) => {
    const persisted: WinnerClaim = {
      ...winner,
      id: createId("winner"),
      drawId,
    };

    winners.unshift(persisted);
    const profile = getProfileById(winner.userId);

    if (profile) {
      addNotification({
        userId: profile.id,
        email: profile.email,
        subject: "You have a winning draw to verify",
        message:
          "Your latest draw result is ready. Upload your proof from the dashboard to begin verification.",
      });
    }
  });

  return { drawId, result };
}

export function getLatestSimulationResult(): DrawSimulationResult | null {
  return latestSimulationResult;
}

export function getAdminSnapshot(): AdminSnapshot {
  return {
    users: profiles,
    subscriptions,
    charities,
    draws,
    winners,
    notifications,
  };
}

export function getUserScoreSummary(userId: string) {
  return sortScoresDesc(scores.filter((score) => score.userId === userId));
}

export function listPublishedDraws() {
  return draws;
}

export function listRecentWinners() {
  return winners;
}

export function getCredentials() {
  return {
    admin: { email: "admin@fairwayfund.demo", password: "Admin123!" },
    subscriber: { email: "rhea@fairwayfund.demo", password: "Demo123!" },
  };
}

export function getCharityTotals() {
  return charities.map((charity) => {
    const subscriptionTotal = profiles.reduce((sum, profile) => {
      if (profile.selectedCharityId !== charity.id) {
        return sum;
      }

      const subscription = subscriptions.find((item) => item.userId === profile.id);

      if (!subscription || subscription.status !== "active") {
        return sum;
      }

      return (
        sum +
        calculateSubscriptionContribution(settings, subscription, profile).charityContribution
      );
    }, 0);

    const donationTotal = donations
      .filter((donation) => donation.charityId === charity.id)
      .reduce((sum, donation) => sum + donation.amount, 0);

    return {
      charity,
      total: subscriptionTotal + donationTotal,
    };
  });
}

export function updateSubscriptionStatus(userId: string, status: SubscriptionStatus) {
  const subscription = subscriptions.find((item) => item.userId === userId);

  if (!subscription) {
    throw new Error("Subscription not found.");
  }

  subscription.status = status;
  return subscription;
}

export function listSubscriptionEvents() {
  return subscriptionEvents;
}
