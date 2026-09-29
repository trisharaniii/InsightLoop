export type FeedbackSource = 
  | 'App Store' 
  | 'Google Play' 
  | 'Zendesk' 
  | 'Intercom' 
  | 'Twitter/X' 
  | 'Survey' 
  | 'CSV Upload' 
  | 'Manual';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type CategoryType = 
  | 'Checkout & Billing' 
  | 'Performance & Speed' 
  | 'UI & Usability' 
  | 'Bugs & Crashes' 
  | 'Feature Request' 
  | 'Onboarding' 
  | 'Security & Auth' 
  | 'General';

export type FeedbackStatus = 'new' | 'reviewed' | 'actioned' | 'resolved';

export interface FeedbackUser {
  name: string;
  avatarUrl?: string;
  role?: string;
  segment?: 'Free' | 'Pro' | 'Enterprise' | 'Beta Tester';
}

export interface FeedbackItem {
  id: string;
  source: FeedbackSource;
  user: FeedbackUser;
  text: string;
  timestamp: string; // ISO date
  rating?: number; // 1-5
  sentiment: SentimentType;
  sentimentScore: number; // -1.0 to +1.0
  urgency: UrgencyLevel;
  category: CategoryType;
  keywords: string[];
  releaseId?: string; // Linked release e.g. "rel-v2.4.0"
  status: FeedbackStatus;
  aiSummary: string;
  suggestedAction?: string;
}

export type ReleaseImpactStatus = 'positive' | 'negative' | 'mixed' | 'neutral' | 'pending';

export interface Release {
  id: string;
  version: string; // e.g. "v2.4.0"
  title: string; // e.g. "Checkout Flow Redesign & One-Click Pay"
  releaseDate: string; // ISO date
  description: string;
  targetAreas: CategoryType[];
  impactStatus: ReleaseImpactStatus;
  sentimentBefore: number; // Average sentiment score (-1 to +1) 14 days before
  sentimentAfter: number;  // Average sentiment score (-1 to +1) 14 days after
  issueVolumeBefore: number; // Complaint count before
  issueVolumeAfter: number;  // Complaint count after
  keyInsights?: string[];
  notes?: string;
}

export type TicketPriority = 'P0 - Critical' | 'P1 - High' | 'P2 - Medium' | 'P3 - Low';
export type TicketStatus = 'backlog' | 'in_progress' | 'in_review' | 'resolved';

export interface ActionTicket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: CategoryType;
  linkedFeedbackIds: string[];
  impactedUsersCount: number;
  assignedTo?: string;
  targetReleaseId?: string;
  createdAt: string;
}

export interface Citation {
  feedbackId: string;
  source: FeedbackSource;
  userName: string;
  userSegment?: string;
  textSnippet: string;
  sentiment: SentimentType;
  urgency: UrgencyLevel;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
  keyTakeaways?: string[];
  recommendedActions?: string[];
  confidenceScore?: number; // 0 to 100%
  relatedReleaseId?: string;
}

export interface FilterState {
  search: string;
  source: string;
  sentiment: string;
  urgency: string;
  category: string;
  releaseId: string;
  dateRange: 'all' | '7d' | '30d' | '90d';
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  items: FeedbackItem[];
  releases: Release[];
}

export interface AIConfig {
  apiKey?: string;
  model: 'insightloop-ai-v2' | 'gpt-4o' | 'claude-3-5-sonnet' | 'custom-local';
  customEndpoint?: string;
  useLocalEngine: boolean;
  autoProcessNewIngest: boolean;
}
