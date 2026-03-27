import {
  AlgorithmBias,
  DrawSimulationResult,
  Profile,
  ScoreEntry,
  SubscriptionRecord,
  SystemSettings,
  WinnerClaim,
} from "@/lib/types";
import { createId } from "@/lib/utils";

function toTicket(scores: ScoreEntry[]): [number, number, number, number, number] {
  const ordered = [...scores]
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, 5)
    .map((entry) => entry.score);

  return [
    ordered[0],
    ordered[1],
    ordered[2],
    ordered[3],
    ordered[4],
  ] as [number, number, number, number, number];
}

function randomSlot() {
  return Math.floor(Math.random() * 45) + 1;
}

function weightedSlot(values: number[], bias: AlgorithmBias) {
  const counts = new Map<number, number>();

  values.forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  const entries = Array.from(counts.entries());
  const weighted = entries.flatMap(([value, count]) => {
    const weight = bias === "frequent" ? count : Math.max(1, values.length - count + 1);
    return Array.from({ length: weight }, () => value);
  });

  return weighted[Math.floor(Math.random() * weighted.length)] ?? randomSlot();
}

export function generateDrawNumbers(
  tickets: Array<[number, number, number, number, number]>,
  bias?: AlgorithmBias,
) {
  if (!bias || tickets.length === 0) {
    return [randomSlot(), randomSlot(), randomSlot(), randomSlot(), randomSlot()] as [
      number,
      number,
      number,
      number,
      number,
    ];
  }

  return [0, 1, 2, 3, 4].map((index) => {
    return weightedSlot(
      tickets.map((ticket) => ticket[index]),
      bias,
    );
  }) as [number, number, number, number, number];
}

export function calculateSubscriptionContribution(
  settings: SystemSettings,
  subscription: SubscriptionRecord,
  profile: Profile,
) {
  const price =
    subscription.plan === "monthly" ? settings.monthlyPrice : settings.yearlyPrice;

  return {
    price,
    prizeContribution: Math.round((price * settings.prizePoolPercentage) / 100),
    charityContribution: Math.round((price * profile.charityPercentage) / 100),
  };
}

export function simulateDraw({
  settings,
  activeProfiles,
  activeSubscriptions,
  scores,
  bias,
  rolloverAmount,
}: {
  settings: SystemSettings;
  activeProfiles: Profile[];
  activeSubscriptions: SubscriptionRecord[];
  scores: ScoreEntry[];
  bias?: AlgorithmBias;
  rolloverAmount: number;
}): DrawSimulationResult {
  const eligibleProfiles = activeProfiles.filter((profile) => {
    const userScores = scores.filter((score) => score.userId === profile.id);
    return userScores.length >= 5;
  });

  const tickets = eligibleProfiles.map((profile) => {
    return toTicket(scores.filter((score) => score.userId === profile.id));
  });

  const numbers = generateDrawNumbers(tickets, bias);

  const totalPrizePool =
    rolloverAmount +
    activeSubscriptions.reduce((sum, subscription) => {
      const profile = activeProfiles.find((item) => item.id === subscription.userId);

      if (!profile) {
        return sum;
      }

      return sum + calculateSubscriptionContribution(settings, subscription, profile).prizeContribution;
    }, 0);

  const tierPools = {
    5: Math.round(totalPrizePool * 0.4),
    4: Math.round(totalPrizePool * 0.35),
    3: Math.round(totalPrizePool * 0.25),
  };

  const winners = eligibleProfiles
    .map((profile) => {
      const slots = toTicket(scores.filter((score) => score.userId === profile.id));
      const matchCount = slots.reduce((sum, score, index) => {
        return sum + (score === numbers[index] ? 1 : 0);
      }, 0);

      if (matchCount < 3) {
        return null;
      }

      return {
        id: createId("winner"),
        drawId: "pending",
        userId: profile.id,
        matchCount: matchCount as 3 | 4 | 5,
        amount: 0,
        verificationStatus: "pending",
        payoutStatus: "pending",
      } satisfies WinnerClaim;
    })
    .filter(Boolean) as WinnerClaim[];

  ([5, 4, 3] as const).forEach((tier) => {
    const tierWinners = winners.filter((winner) => winner.matchCount === tier);
    const share = tierWinners.length ? Math.floor(tierPools[tier] / tierWinners.length) : 0;

    tierWinners.forEach((winner) => {
      winner.amount = share;
    });
  });

  const rolloverForNextMonth =
    winners.filter((winner) => winner.matchCount === 5).length === 0 ? tierPools[5] : 0;

  return {
    numbers,
    totalPrizePool,
    tierPools,
    winners,
    rolloverAmount: rolloverForNextMonth,
    eligibleSubscribers: eligibleProfiles.length,
  };
}
