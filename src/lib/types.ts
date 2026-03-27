export type Role = "subscriber" | "admin";
export type SubscriptionPlan = "monthly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "lapsed"
  | "past_due"
  | "incomplete";
export type DrawMode = "random" | "algorithmic";
export type AlgorithmBias = "frequent" | "rare";
export type WinnerVerificationStatus = "pending" | "approved" | "rejected";
export type PayoutStatus = "pending" | "paid";

export interface CharityEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
}

export interface Charity {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  image: string;
  impactMetric: string;
  featured: boolean;
  events: CharityEvent[];
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  selectedCharityId: string;
  charityPercentage: number;
  country: string;
  createdAt: string;
  passwordHash?: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  renewalDate: string;
  startedAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionEvent {
  id: string;
  subscriptionId: string;
  type: string;
  createdAt: string;
  payloadSummary: string;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  score: number;
  playedAt: string;
  createdAt: string;
}

export interface DrawTicketSnapshot {
  id: string;
  drawId: string;
  userId: string;
  slots: [number, number, number, number, number];
}

export interface WinnerClaim {
  id: string;
  drawId: string;
  userId: string;
  matchCount: 3 | 4 | 5;
  amount: number;
  verificationStatus: WinnerVerificationStatus;
  payoutStatus: PayoutStatus;
  proofFilename?: string;
  proofUploadedAt?: string;
  proofUrl?: string;
  proofPublicId?: string;
}

export interface DrawRecord {
  id: string;
  title: string;
  monthLabel: string;
  scheduledFor: string;
  drawMode: DrawMode;
  algorithmBias?: AlgorithmBias;
  status: "simulation" | "published";
  numbers: [number, number, number, number, number];
  totalPrizePool: number;
  rolloverAmount: number;
}

export interface DonationRecord {
  id: string;
  charityId: string;
  userId?: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  createdAt: string;
  source: "subscription" | "independent";
}

export interface SystemSettings {
  monthlyPrice: number;
  yearlyPrice: number;
  minimumCharityPercentage: number;
  prizePoolPercentage: number;
}

export interface NotificationRecord {
  id: string;
  userId?: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface DrawSimulationResult {
  numbers: [number, number, number, number, number];
  totalPrizePool: number;
  tierPools: {
    5: number;
    4: number;
    3: number;
  };
  winners: WinnerClaim[];
  rolloverAmount: number;
  eligibleSubscribers: number;
}

export interface DashboardSnapshot {
  profile: Profile;
  subscription: SubscriptionRecord | undefined;
  selectedCharity: Charity | undefined;
  scores: ScoreEntry[];
  winnings: WinnerClaim[];
  nextDrawDate: string;
  drawsEntered: number;
}

export interface AdminSnapshot {
  users: Profile[];
  subscriptions: SubscriptionRecord[];
  charities: Charity[];
  draws: DrawRecord[];
  winners: WinnerClaim[];
  notifications: NotificationRecord[];
}

export interface SiteStats {
  activeSubscribers: number;
  totalPrizePool: number;
  charityRaised: number;
  charitiesSupported: number;
}
