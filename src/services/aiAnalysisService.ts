import type { FeedbackItem, SentimentType, UrgencyLevel, CategoryType, Release } from '../types';

export interface AIAnalysisResult {
  sentiment: SentimentType;
  sentimentScore: number;
  urgency: UrgencyLevel;
  category: CategoryType;
  keywords: string[];
  aiSummary: string;
  suggestedAction: string;
  matchedReleaseId?: string;
}

export class AIAnalysisService {
  private static POSITIVE_WORDS = [
    'love', 'loved', 'loving', 'fast', 'smooth', 'amazing', 'great', 'awesome', 'best', 
    'excellent', 'helpful', 'speedy', 'fantastic', 'easy', 'perfect', 'clean', 'improved',
    'surged', 'useful', 'delight', 'thank'
  ];

  private static NEGATIVE_WORDS = [
    'crash', 'crashes', 'crashed', 'bug', 'broken', 'slow', 'stuck', 'error', 'failed',
    'terrible', 'worst', 'horrible', 'refund', 'freeze', 'freezes', 'cannot', 'cant', 
    'unable', 'hate', 'frustrated', 'annoying', 'urgent', 'fail', 'failing', 'disabled'
  ];

  private static CRITICAL_TRIGGER_WORDS = [
    'urgent', 'crash', 'crashes', 'cannot complete', 'cannot login', 'stuck', 'refund', 
    'blocking', 'broken', 'p0', 'unusable', 'security'
  ];

  public static analyzeText(text: string, releases: Release[] = []): AIAnalysisResult {
    const lowerText = text.toLowerCase();
    
    // 1. Calculate Sentiment Score
    let posCount = 0;
    let negCount = 0;

    this.POSITIVE_WORDS.forEach(w => {
      if (lowerText.includes(w)) posCount++;
    });

    this.NEGATIVE_WORDS.forEach(w => {
      if (lowerText.includes(w)) negCount++;
    });

    let sentimentScore = 0;
    let sentiment: SentimentType = 'neutral';

    if (posCount > negCount + 1) {
      sentimentScore = Math.min(0.98, 0.4 + (posCount * 0.15));
      sentiment = 'positive';
    } else if (negCount > posCount + 1) {
      sentimentScore = Math.max(-0.98, -0.4 - (negCount * 0.15));
      sentiment = 'negative';
    } else if (posCount > 0 && negCount > 0) {
      sentimentScore = (posCount - negCount) * 0.15;
      sentiment = 'mixed';
    } else {
      sentimentScore = 0.05;
      sentiment = 'neutral';
    }

    // 2. Determine Urgency
    let urgency: UrgencyLevel = 'low';
    const isCritical = this.CRITICAL_TRIGGER_WORDS.some(w => lowerText.includes(w));

    if (isCritical || (sentiment === 'negative' && negCount >= 3)) {
      urgency = 'critical';
    } else if (sentiment === 'negative' || negCount >= 1) {
      urgency = 'high';
    } else if (sentiment === 'mixed') {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    // 3. Category Detection
    let category: CategoryType = 'General';
    if (lowerText.includes('checkout') || lowerText.includes('pay') || lowerText.includes('billing') || lowerText.includes('pricing') || lowerText.includes('refund') || lowerText.includes('tier')) {
      category = 'Checkout & Billing';
    } else if (lowerText.includes('slow') || lowerText.includes('latency') || lowerText.includes('speed') || lowerText.includes('fast') || lowerText.includes('load')) {
      category = 'Performance & Speed';
    } else if (lowerText.includes('dark mode') || lowerText.includes('ui') || lowerText.includes('font') || lowerText.includes('screen') || lowerText.includes('design') || lowerText.includes('theme')) {
      category = 'UI & Usability';
    } else if (lowerText.includes('crash') || lowerText.includes('bug') || lowerText.includes('freeze') || lowerText.includes('error') || lowerText.includes('button')) {
      category = 'Bugs & Crashes';
    } else if (lowerText.includes('login') || lowerText.includes('2fa') || lowerText.includes('sms') || lowerText.includes('auth') || lowerText.includes('password')) {
      category = 'Security & Auth';
    } else if (lowerText.includes('onboard') || lowerText.includes('tour') || lowerText.includes('signup') || lowerText.includes('guide')) {
      category = 'Onboarding';
    } else if (lowerText.includes('feature') || lowerText.includes('request') || lowerText.includes('integration') || lowerText.includes('webhook') || lowerText.includes('export')) {
      category = 'Feature Request';
    }

    // 4. Keyword Extraction
    const words = text.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
    const keywords = Array.from(new Set(
      words.filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'were', 'your', 'about', 'would'].includes(w.toLowerCase()))
    )).slice(0, 6);

    // 5. Match with Release
    let matchedReleaseId: string | undefined = undefined;
    if (releases.length > 0) {
      const match = releases.find(rel => {
        const vTag = rel.version.toLowerCase();
        const vNum = rel.version.replace(/^v/, '').toLowerCase();
        return lowerText.includes(vTag) || lowerText.includes(vNum) || rel.targetAreas.includes(category);
      });
      if (match) {
        matchedReleaseId = match.id;
      }
    }

    // 6. Generate AI Summary & Action
    let aiSummary = '';
    let suggestedAction = '';

    if (sentiment === 'positive') {
      aiSummary = `User praises overall experience in ${category} (${keywords.slice(0, 3).join(', ')}).`;
      suggestedAction = `Leverage feedback for product marketing and customer success testimonials.`;
    } else if (sentiment === 'negative') {
      aiSummary = `Customer reports critical friction in ${category}. Primary issues: ${keywords.slice(0, 3).join(', ')}.`;
      suggestedAction = `Assign ticket to ${category} team for root cause investigation.`;
    } else if (sentiment === 'mixed') {
      aiSummary = `Mixed feedback on ${category}. Content includes both positive observations and usability friction.`;
      suggestedAction = `Review UX flow for edge cases in ${category}.`;
    } else {
      aiSummary = `Neutral inquiry regarding ${category}.`;
      suggestedAction = `Monitor user sentiment trends for recurring patterns.`;
    }

    return {
      sentiment,
      sentimentScore,
      urgency,
      category,
      keywords,
      aiSummary,
      suggestedAction,
      matchedReleaseId
    };
  }

  public static batchAnalyze(items: Partial<FeedbackItem>[], releases: Release[] = []): FeedbackItem[] {
    return items.map((raw, idx) => {
      const text = raw.text || '';
      const analysis = this.analyzeText(text, releases);

      return {
        id: raw.id || `ingest-${Date.now()}-${idx}`,
        source: raw.source || 'Manual',
        user: raw.user || { name: 'Anonymous User', segment: 'Pro' },
        text,
        timestamp: raw.timestamp || new Date().toISOString(),
        rating: raw.rating,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        urgency: analysis.urgency,
        category: analysis.category,
        keywords: analysis.keywords,
        releaseId: raw.releaseId || analysis.matchedReleaseId,
        status: raw.status || 'new',
        aiSummary: analysis.aiSummary,
        suggestedAction: analysis.suggestedAction,
      };
    });
  }
}
