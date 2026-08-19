import { eachDayOfInterval, format, parseISO, subMonths } from 'date-fns'

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const now = new Date()

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function seeded(seed: number) {
  let state = seed
  return function next() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const MS_PER_DAY = 86_400_000

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function dayErrorCount(date: Date) {
  const dayIndex = Math.floor(date.getTime() / MS_PER_DAY)
  const rand = seeded((dayIndex * 1103515245 + 12345) >>> 0)
  const base = 24 + Math.sin(dayIndex / 3.3) * 8
  const spike = dayIndex % 13 === 0 ? 22 : 0
  return Math.max(0, Math.round(base + spike + (rand() - 0.4) * 12))
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildGeneralErrors(
  startISO: string,
  endISO: string
): import('@shared/ui/lib/dashboard-types').GeneralErrors {
  const days = eachDayOfInterval({
    start: parseISO(startISO),
    end: parseISO(endISO),
  })
  const series = days.map((date) => ({
    date: date.toISOString(),
    total: dayErrorCount(date),
  }))
  const total = series.reduce((sum, point) => sum + point.total, 0)
  const backend = Math.round(total * 0.46)
  const frontend = Math.round(total * 0.39)
  const crashes = total - backend - frontend
  return { total, backend, frontend, crashes, series }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildChurn(
  startISO: string,
  endISO: string
): import('@shared/ui/lib/dashboard-types').SubscriberChurn {
  const days = Math.max(
    1,
    Math.round(
      (parseISO(endISO).getTime() - parseISO(startISO).getTime()) / MS_PER_DAY
    )
  )
  const rand = seeded(457 + days)
  const series = Array.from({ length: 12 }, (_, i) => ({
    date: subMonths(now, 11 - i).toISOString(),
    rate: Math.round((6.4 - i * 0.16 + (rand() - 0.5) * 1.1) * 10) / 10,
  }))
  const rate = series[series.length - 1].rate
  const previousRate = series[series.length - 2].rate
  const base = 854
  return {
    rate,
    previousRate,
    base,
    cancelled: Math.round((base * rate) / 100),
    series,
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildRetention(): import('@shared/ui/lib/dashboard-types').RetentionOverview {
  const cohorts = Array.from({ length: 8 }, (_, i) => {
    const monthsAgo = 7 - i
    const date = subMonths(now, monthsAgo)
    const cohort = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const rand = seeded((i + 3) * 7331)
    const size = Math.round(180 + rand() * 3600)
    const elapsed = Math.min(monthsAgo + 1, 8)
    const periods = Array.from({ length: elapsed }, (_, m) => {
      const retentionRate =
        m === 0 ? 1 : Math.max(0.08, 0.46 - m * 0.05 + (rand() - 0.5) * 0.1)
      return Math.round(size * retentionRate)
    })
    return { cohort, size, periods }
  })
  return {
    cohorts,
    retention7d: 10.6,
    retention30d: 18.7,
    freePaid: { free30d: 14.8, paid30d: 80.3 },
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
const ONBOARDING_STEPS = [
  'Signed up',
  'Verified email',
  'Connected a platform',
  'Created a profile',
  'Set a schedule',
  'Imported content',
  'Created a draft',
  'Scheduled a post',
  'Invited a teammate',
  'Published first post',
]

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildOnboarding(): import('@shared/ui/lib/dashboard-types').OnboardingFunnel {
  const rand = seeded(6201)
  let users = 5240
  const steps = ONBOARDING_STEPS.map((label, i) => {
    if (i > 0) {
      const drop = 0.07 + rand() * 0.12 + (i === 1 ? 0.05 : 0)
      users = Math.round(users * (1 - drop))
    }
    return { label, users }
  })
  return { steps }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildFeatureUsage(
  startISO: string,
  endISO: string
): import('@shared/ui/lib/dashboard-types').FeatureUsageOverview {
  const days = Math.max(
    1,
    Math.round(
      (parseISO(endISO).getTime() - parseISO(startISO).getTime()) / MS_PER_DAY
    )
  )
  const defs = [
    { key: 'platform-view', name: 'Platform view', base: 1420, ret: 71 },
    { key: 'posting-profiles', name: 'Posting Profiles', base: 980, ret: 64 },
    { key: 'drafts', name: 'Drafts', base: 760, ret: 58 },
    { key: 'feeds', name: 'Feeds', base: 540, ret: 49 },
  ]
  const features = defs.map((d, i) => {
    const r = seeded((i + 1) * 911 + days)
    return {
      key: d.key,
      name: d.name,
      uses: Math.round(d.base * (days / 30) * (0.9 + r() * 0.2)),
      retention: d.ret,
    }
  })
  return { features, useWindowMinutes: 30 }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildAvgTime(
  _startISO: string,
  _endISO: string
): import('@shared/ui/lib/dashboard-types').AvgTimeOnPlatform {
  return {
    rows: [
      { period: 'day', freeMinutes: 7, paidMinutes: 23 },
      { period: 'week', freeMinutes: 31, paidMinutes: 118 },
      { period: 'month', freeMinutes: 96, paidMinutes: 412 },
    ],
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildLoadTimes(): import('@shared/ui/lib/dashboard-types').AppLoadTimes {
  return {
    ios: { shortestMs: 410, longestMs: 6240, averageMs: 1180 },
    web: { shortestMs: 540, longestMs: 8920, averageMs: 1640 },
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function buildFinances(): import('@shared/ui/lib/dashboard-types').Finances {
  return {
    month: format(now, 'MMMM yyyy'),
    apple: {
      subscribersOutOfTrial: 504,
      subscribersInTrial: 108,
      mrrOutOfTrial: 22010,
      mrrInTrial: 4180,
      todaysRevenue: { gross: 1840, commission: 1288, taxes: 1146 },
      newSubscribers: 86,
      newTrials: 142,
      monthRevenue: { gross: 41200, commission: 28840, taxes: 25670 },
    },
    lemonsqueezy: {
      subscribersOutOfTrial: 336,
      subscribersInTrial: 72,
      mrrOutOfTrial: 14690,
      mrrInTrial: 2790,
      todaysRevenue: { gross: 1120, commission: 1064, taxes: 968 },
      newSubscribers: 57,
      newTrials: 88,
      monthRevenue: { gross: 26800, commission: 25460, taxes: 23165 },
    },
    activeTrials: 180,
    cancellations: 15,
    totalPaidUsers: 840,
    freeUsers: 5426,
    paidRetention: 60.5,
    ltv: 184,
    avgRevenuePerUser: 34,
    net: {
      revenue: { gross: 68000, commission: 54300, taxes: 48835 },
      awsCost: 4180,
      mercuryCost: 180,
      creatorPayoutsThisMonth: 9400,
      creatorPayoutsNextMonth: 11200,
    },
    mrrSeries: financeSeries(71, 36700, 1180),
    revenueSeries: financeSeries(72, 68000, 2400),
    subscriberSeries: financeSeries(73, 840, 34),
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function financeSeries(
  seed: number,
  end: number,
  trend: number
): import('@shared/ui/lib/dashboard-types').FinancePoint[] {
  const rand = seeded(seed)
  return Array.from({ length: 12 }, (_, i) => {
    const fromEnd = 11 - i
    const value = Math.round(
      end - fromEnd * trend + (rand() - 0.5) * trend * 1.4
    )
    const previous = Math.round(
      (end - fromEnd * trend) * 0.84 + (rand() - 0.5) * trend * 1.2
    )
    return { date: subMonths(now, fromEnd).toISOString(), value, previous }
  })
}
