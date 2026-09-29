import type { FeedbackItem, Release, ActionTicket, DatasetPreset } from '../types';

export const INITIAL_RELEASES: Release[] = [
  {
    id: 'rel-v2.4.0',
    version: 'v2.4.0',
    title: 'Checkout Flow Overhaul & One-Click Pay',
    releaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Redesigned checkout modal with instant Apple Pay / Google Pay integration and simplified 2-step verification.',
    targetAreas: ['Checkout & Billing', 'UI & Usability', 'Performance & Speed'],
    impactStatus: 'mixed',
    sentimentBefore: -0.42,
    sentimentAfter: +0.28,
    issueVolumeBefore: 42,
    issueVolumeAfter: 14,
    keyInsights: [
      'Checkout completion rate surged +34% after one-click pay rollout.',
      'Minor regression: 2-factor verification SMS timeouts reported by 12 international Enterprise users.',
      'Loading speed during peak payment processing reduced from 3.8s to 0.9s.'
    ],
    notes: 'Hotfix v2.4.1 scheduled to resolve 2FA international carrier carrier timeouts.'
  },
  {
    id: 'rel-v2.3.0',
    version: 'v2.3.0',
    title: 'OLED Pure Dark Mode & High Contrast Theme',
    releaseDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Added native dark mode toggle, sleek slate color palette, and reduced battery drain on mobile devices.',
    targetAreas: ['UI & Usability'],
    impactStatus: 'positive',
    sentimentBefore: +0.15,
    sentimentAfter: +0.84,
    issueVolumeBefore: 18,
    issueVolumeAfter: 3,
    keyInsights: [
      '94% positive sentiment across App Store and Play Store reviews.',
      'Battery drain reduction praised by power users.',
      'Top requested tweak: Option to schedule automatic dark mode based on sunset.'
    ],
    notes: 'Highly successful release; elevated overall app satisfaction.'
  },
  {
    id: 'rel-v2.2.0',
    version: 'v2.2.0',
    title: 'Subscription Tiers & Annual Billing Refresh',
    releaseDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Updated pricing tiers, automated invoice export, and revised seat management for team plans.',
    targetAreas: ['Checkout & Billing', 'Feature Request'],
    impactStatus: 'negative',
    sentimentBefore: +0.35,
    sentimentAfter: -0.58,
    issueVolumeBefore: 8,
    issueVolumeAfter: 55,
    keyInsights: [
      'Users confused by default annual billing toggle on checkout page.',
      'Multiple support tickets requesting immediate refund for accidental yearly charges.',
      'Action taken in v2.2.1: Made billing cycle selection explicit with clear radio button toggle.'
    ],
    notes: 'Required swift intervention to fix default toggle UX.'
  }
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-101',
    source: 'App Store',
    user: { name: 'Sarah Jenkins', segment: 'Pro' },
    text: 'The new v2.4 checkout update is insanely fast! I clicked Apple Pay and completed my order in under 2 seconds. Huge improvement over the old multi-page form.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    sentiment: 'positive',
    sentimentScore: 0.92,
    urgency: 'low',
    category: 'Checkout & Billing',
    keywords: ['checkout', 'Apple Pay', 'fast', 'v2.4', 'frictionless'],
    releaseId: 'rel-v2.4.0',
    status: 'reviewed',
    aiSummary: 'Praises v2.4 checkout speed and seamless Apple Pay integration.',
    suggestedAction: 'Highlight one-click checkout in upcoming product marketing.'
  },
  {
    id: 'fb-102',
    source: 'Zendesk',
    user: { name: 'David Chen', role: 'CTO at TechCorp', segment: 'Enterprise' },
    text: 'URGENT: Since updating to v2.4, our European team members are not receiving the 2FA SMS code during checkout. They get stuck on the verification screen and cannot complete invoices!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 1,
    sentiment: 'negative',
    sentimentScore: -0.88,
    urgency: 'critical',
    category: 'Bugs & Crashes',
    keywords: ['2FA', 'SMS timeout', 'European users', 'checkout bug', 'Enterprise'],
    releaseId: 'rel-v2.4.0',
    status: 'new',
    aiSummary: 'Critical issue where EU enterprise users experience 2FA SMS code delivery failure during payment.',
    suggestedAction: 'Prioritize SMS carrier fallback gateway in v2.4.1 hotfix.'
  },
  {
    id: 'fb-103',
    source: 'Twitter/X',
    user: { name: 'Alex Rivera (@arivera_dev)', segment: 'Pro' },
    text: 'Loving the OLED dark mode on @InsightLoop! My eyes thank you during late night analytics sessions. Best update this year 🌙⚡',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentimentScore: 0.89,
    urgency: 'low',
    category: 'UI & Usability',
    keywords: ['OLED', 'dark mode', 'design', 'v2.3'],
    releaseId: 'rel-v2.3.0',
    status: 'reviewed',
    aiSummary: 'Extremely positive response to OLED dark mode feature in v2.3.',
    suggestedAction: 'Share tweet on company social channels.'
  },
  {
    id: 'fb-104',
    source: 'Intercom',
    user: { name: 'Elena Rostova', segment: 'Free' },
    text: 'I was trying to export my monthly analytics CSV report but the button stays grayed out unless I refresh the page 3 times. Please fix this bug!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 2,
    sentiment: 'negative',
    sentimentScore: -0.65,
    urgency: 'high',
    category: 'Bugs & Crashes',
    keywords: ['CSV export', 'button disabled', 'refresh required', 'analytics'],
    releaseId: 'rel-v2.4.0',
    status: 'new',
    aiSummary: 'Reports UI bug where analytics CSV export button becomes unclickable without page refreshes.',
    suggestedAction: 'Fix state re-render trigger on export analytics component.'
  },
  {
    id: 'fb-105',
    source: 'Survey',
    user: { name: 'Michael Thorne', segment: 'Enterprise' },
    text: 'We really need a webhook integration or Slack notifications whenever a critical customer complaint is flagged by AI. Right now we have to manually check the dashboard.',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4,
    sentiment: 'mixed',
    sentimentScore: 0.15,
    urgency: 'medium',
    category: 'Feature Request',
    keywords: ['Slack integration', 'webhook', 'real-time alerts', 'notifications'],
    status: 'actioned',
    aiSummary: 'Feature request for real-time Slack/Webhook alerts on critical feedback detection.',
    suggestedAction: 'Add Slack/Zapier integration to Q4 product roadmap.'
  },
  {
    id: 'fb-106',
    source: 'Google Play',
    user: { name: 'Marcus Vance', segment: 'Free' },
    text: 'App crashes immediately after typing login credentials on Android 14. Unusable right now.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 1,
    sentiment: 'negative',
    sentimentScore: -0.95,
    urgency: 'critical',
    category: 'Security & Auth',
    keywords: ['Android 14', 'login crash', 'credentials', 'app launch'],
    releaseId: 'rel-v2.4.0',
    status: 'new',
    aiSummary: 'App crash on launch during login attempt specifically on Android 14 OS.',
    suggestedAction: 'Deploy patch for Android 14 biometric auth exception handler.'
  },
  {
    id: 'fb-107',
    source: 'Zendesk',
    user: { name: 'Amanda Lewis', role: 'Product Manager', segment: 'Pro' },
    text: 'I accidentally signed up for annual billing because the toggle was pre-selected to Annual without clear confirmation. I need a partial refund to switch back to monthly.',
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 2,
    sentiment: 'negative',
    sentimentScore: -0.74,
    urgency: 'high',
    category: 'Checkout & Billing',
    keywords: ['annual billing', 'accidental charge', 'refund', 'pricing toggle'],
    releaseId: 'rel-v2.2.0',
    status: 'resolved',
    aiSummary: 'Complains about dark pattern pre-selected annual billing toggle leading to accidental charge.',
    suggestedAction: 'Default toggle to monthly and add explicit pricing summary before swipe to confirm.'
  },
  {
    id: 'fb-108',
    source: 'App Store',
    user: { name: 'Jason Sterling', segment: 'Pro' },
    text: 'The search filters in the feedback memory page are fantastic! Being able to search by natural questions like "What are users saying about performance?" saves our team hours of manual tagging.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    sentiment: 'positive',
    sentimentScore: 0.94,
    urgency: 'low',
    category: 'UI & Usability',
    keywords: ['natural language search', 'feedback memory', 'time saver', 'AI search'],
    status: 'reviewed',
    aiSummary: 'Highlights value of natural language conversational query engine for product research.',
    suggestedAction: 'Gather testimonial for landing page case study.'
  },
  {
    id: 'fb-109',
    source: 'Intercom',
    user: { name: 'Priya Patel', segment: 'Enterprise' },
    text: 'Can we get automated monthly executive summary PDF exports? I need to share quarterly sentiment trends with our VP of Product.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 4,
    sentiment: 'positive',
    sentimentScore: 0.45,
    urgency: 'medium',
    category: 'Feature Request',
    keywords: ['PDF export', 'executive summary', 'quarterly report', 'VP sharing'],
    status: 'new',
    aiSummary: 'Request for scheduled PDF executive reports for senior leadership sharing.',
    suggestedAction: 'Design Executive Summary PDF generator feature.'
  },
  {
    id: 'fb-110',
    source: 'Twitter/X',
    user: { name: 'DevOps_Dan', segment: 'Pro' },
    text: 'Noticeable latency drop on @InsightLoop platform today! Querying 50k feedback items used to take 4 seconds, now it responds in under 300ms. Wicked fast 🚀',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentimentScore: 0.86,
    urgency: 'low',
    category: 'Performance & Speed',
    keywords: ['latency improvement', 'query speed', '300ms', 'performance'],
    releaseId: 'rel-v2.4.0',
    status: 'reviewed',
    aiSummary: 'Applauds 10x query performance indexing speedup in v2.4.',
    suggestedAction: 'Track database indexing metrics.'
  },
  {
    id: 'fb-111',
    source: 'CSV Upload',
    user: { name: 'Imported Survey Response #142', segment: 'Free' },
    text: 'Initial onboarding walkthrough is too long. Took 12 steps before I could actually create my first workspace dashboard.',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 3,
    sentiment: 'neutral',
    sentimentScore: -0.12,
    urgency: 'medium',
    category: 'Onboarding',
    keywords: ['onboarding', 'walkthrough', 'too long', '12 steps', 'friction'],
    status: 'actioned',
    aiSummary: 'Friction in initial user onboarding due to lengthy 12-step guided tour.',
    suggestedAction: 'Shorten onboarding to 3 core steps with skip option.'
  },
  {
    id: 'fb-112',
    source: 'Google Play',
    user: { name: 'Carlos Mendez', segment: 'Pro' },
    text: 'Font size on mobile app dark mode is slightly too small on 6.1-inch screens. Hard to read during night commute.',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 3,
    sentiment: 'mixed',
    sentimentScore: -0.15,
    urgency: 'low',
    category: 'UI & Usability',
    keywords: ['font size', 'mobile readability', 'dark mode font', 'accessibility'],
    releaseId: 'rel-v2.3.0',
    status: 'new',
    aiSummary: 'Minor legibility issue regarding font contrast and scaling in mobile dark mode.',
    suggestedAction: 'Add font size scaling slider in user preferences.'
  }
];

export const INITIAL_TICKETS: ActionTicket[] = [
  {
    id: 'TICK-801',
    title: 'Fix 2FA SMS Gateway Timeouts for EU Enterprise Users',
    description: 'Multiple Enterprise users in Europe report missing SMS 2FA verification codes during checkout in v2.4.0. Switch primary gateway to Twilio international fallback.',
    priority: 'P0 - Critical',
    status: 'in_progress',
    category: 'Bugs & Crashes',
    linkedFeedbackIds: ['fb-102'],
    impactedUsersCount: 142,
    assignedTo: 'Alex Chen (Infra Team)',
    targetReleaseId: 'rel-v2.4.0',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TICK-802',
    title: 'Resolve Android 14 Biometric Authentication Crash',
    description: 'Fix null reference exception in Android 14 biometric credential provider upon fresh app login.',
    priority: 'P0 - Critical',
    status: 'backlog',
    category: 'Security & Auth',
    linkedFeedbackIds: ['fb-106'],
    impactedUsersCount: 89,
    assignedTo: 'Mobile Core Team',
    targetReleaseId: 'rel-v2.4.0',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TICK-803',
    title: 'Implement Slack & Webhook Real-time Intelligence Alerts',
    description: 'Allow teams to trigger instant Slack notification when an emerging complaint cluster exceeds 5 critical tickets within an hour.',
    priority: 'P1 - High',
    status: 'in_review',
    category: 'Feature Request',
    linkedFeedbackIds: ['fb-105'],
    impactedUsersCount: 520,
    assignedTo: 'Integrations Squad',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'TICK-804',
    title: 'Streamline Workspace Onboarding Tour to 3 Interactive Steps',
    description: 'Reduce onboarding friction by replacing 12-step modal overlay with interactive contextual tooltips.',
    priority: 'P2 - Medium',
    status: 'resolved',
    category: 'Onboarding',
    linkedFeedbackIds: ['fb-111'],
    impactedUsersCount: 310,
    assignedTo: 'Growth Engineering',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const PRESET_DATASETS: DatasetPreset[] = [
  {
    id: 'fintech-app',
    name: 'Mobile Banking & Payments (Default)',
    description: 'Feedback stream covering v2.4 Checkout Redesign, 2FA carrier issues, dark mode praise, and Android login bugs.',
    badge: 'FinTech App',
    items: INITIAL_FEEDBACK,
    releases: INITIAL_RELEASES
  },
  {
    id: 'saas-crm',
    name: 'B2B SaaS CRM Platform',
    description: 'Enterprise feedback focusing on API rate limits, custom dashboard builder requests, SSO integrations, and team seat billing.',
    badge: 'Enterprise SaaS',
    items: [
      {
        id: 'crm-01',
        source: 'Intercom',
        user: { name: 'Robert Vance', role: 'Head of Ops', segment: 'Enterprise' },
        text: 'The new multi-workspace switching menu in v3.1 is super smooth! Saves us from re-logging in every time.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 5,
        sentiment: 'positive',
        sentimentScore: 0.88,
        urgency: 'low',
        category: 'UI & Usability',
        keywords: ['workspace switcher', 'multi-tenant', 'speed'],
        status: 'reviewed',
        aiSummary: 'Positive sentiment on multi-workspace switcher feature.'
      },
      {
        id: 'crm-02',
        source: 'Zendesk',
        user: { name: 'Karen Wright', role: 'DevOps Lead', segment: 'Enterprise' },
        text: 'API rate limits hit 429 errors during our daily 9 AM sync job. We need higher throughput tiers or webhook streaming.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 2,
        sentiment: 'negative',
        sentimentScore: -0.76,
        urgency: 'critical',
        category: 'Performance & Speed',
        keywords: ['429 rate limit', 'API sync', 'webhooks', 'Enterprise'],
        status: 'new',
        aiSummary: 'Critical API rate limit throttling during enterprise morning sync batch.'
      }
    ],
    releases: [
      {
        id: 'rel-crm-3.1',
        version: 'v3.1.0',
        title: 'Multi-Workspace Switcher & Webhook Engine',
        releaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Instant workspace context switcher and enterprise webhook dispatcher.',
        targetAreas: ['UI & Usability', 'Performance & Speed'],
        impactStatus: 'positive',
        sentimentBefore: +0.20,
        sentimentAfter: +0.72,
        issueVolumeBefore: 28,
        issueVolumeAfter: 6
      }
    ]
  },
  {
    id: 'ecommerce-store',
    name: 'E-Commerce Marketplace',
    description: 'Customer feedback covering express checkout, promo code failures, search relevance, and mobile cart persistence.',
    badge: 'E-Commerce',
    items: [
      {
        id: 'ecom-01',
        source: 'App Store',
        user: { name: 'Emily Thorne', segment: 'Pro' },
        text: 'Promo codes won’t apply when checking out with Apple Pay! It keeps stripping the 20% discount.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        rating: 1,
        sentiment: 'negative',
        sentimentScore: -0.85,
        urgency: 'high',
        category: 'Checkout & Billing',
        keywords: ['promo code', 'Apple Pay discount', 'cart bug'],
        status: 'new',
        aiSummary: 'Bug where promo code discount is reset when user switches to Apple Pay.'
      }
    ],
    releases: [
      {
        id: 'rel-ecom-1.8',
        version: 'v1.8.0',
        title: 'Express Checkout & Dynamic Coupons',
        releaseDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Dynamic coupon validation engine during checkout.',
        targetAreas: ['Checkout & Billing'],
        impactStatus: 'mixed',
        sentimentBefore: -0.10,
        sentimentAfter: +0.35,
        issueVolumeBefore: 30,
        issueVolumeAfter: 12
      }
    ]
  }
];
