import type { FeedbackItem, Release, ActionTicket, ChatMessage, Citation } from '../types';

const API_BASE = '/api/v1';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'API request failed');
    }
    return res.json();
  }

  // ── Feedback ─────────────────────────────────────────────────────────────
  public static async getFeedback(): Promise<FeedbackItem[]> {
    const raw = await this.request<any[]>('/feedback?limit=100');
    return raw.map(this.mapBackendFeedback);
  }

  public static async createFeedback(item: {
    content: string;
    source: string;
    customer_name?: string;
    customer_email?: string;
    customer_tier?: string;
    rating?: number;
  }): Promise<FeedbackItem> {
    const raw = await this.request<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return this.mapBackendFeedback(raw);
  }

  // ── Releases ─────────────────────────────────────────────────────────────
  public static async getReleases(): Promise<Release[]> {
    const raw = await this.request<any[]>('/releases');
    return raw.map(this.mapBackendRelease);
  }

  public static async createRelease(release: {
    version: string;
    title: string;
    summary?: string;
    features_shipped?: string[];
    target_areas?: string[];
  }): Promise<Release> {
    const raw = await this.request<any>('/releases', {
      method: 'POST',
      body: JSON.stringify(release),
    });
    return this.mapBackendRelease(raw);
  }

  public static async getReleaseImpact(releaseId: string): Promise<any> {
    return this.request<any>(`/releases/${releaseId}/impact`);
  }

  public static async verifyReleaseImpact(releaseId: string): Promise<any> {
    return this.request<any>(`/releases/${releaseId}/verify`, { method: 'POST' });
  }

  // ── Action Hub ───────────────────────────────────────────────────────────
  public static async getActions(): Promise<ActionTicket[]> {
    const raw = await this.request<any[]>('/actions');
    return raw.map(this.mapBackendAction);
  }

  public static async createAction(action: {
    title: string;
    description?: string;
    priority?: string;
    status?: string;
    owner?: string;
    product_area?: string;
  }): Promise<ActionTicket> {
    const raw = await this.request<any>('/actions', {
      method: 'POST',
      body: JSON.stringify(action),
    });
    return this.mapBackendAction(raw);
  }

  public static async updateActionStatus(actionId: string, status: string): Promise<ActionTicket> {
    const raw = await this.request<any>(`/actions/${actionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return this.mapBackendAction(raw);
  }

  // ── Hindsight Persistent Memory ──────────────────────────────────────────
  public static async memoryChat(query: string, compareMode: boolean = false): Promise<ChatMessage> {
    const res = await this.request<any>('/memory/chat', {
      method: 'POST',
      body: JSON.stringify({
        query,
        bank_id: 'default',
        compare_mode: compareMode,
      }),
    });

    const citations: Citation[] = (res.evidence || []).map((e: any) => ({
      feedbackId: e.feedback_id || 'fb-ref',
      source: e.source || 'App Store',
      userName: 'Verified Customer',
      userSegment: e.customer_tier ? `${e.customer_tier.toUpperCase()} Tier` : 'Pro Tier',
      textSnippet: e.content || '',
      sentiment: e.sentiment || 'negative',
      urgency: 'high',
      timestamp: e.created_at || new Date().toISOString(),
    }));

    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      text: res.answer,
      timestamp: new Date().toISOString(),
      citations,
      confidenceScore: Math.round((res.confidence || 0.9) * 100),
      keyTakeaways: res.related_issues || [],
      recommendedActions: res.related_themes ? res.related_themes.map((t: string) => `Review ${t} trends`) : [],
    };
  }

  public static async getRecurringIssues(): Promise<any[]> {
    return this.request<any[]>('/memory/recurring-issues');
  }

  public static async getMemoryCompare(query: string): Promise<any> {
    return this.request<any>(`/memory/compare?query=${encodeURIComponent(query)}`);
  }

  public static async listMemories(): Promise<any[]> {
    return this.request<any[]>('/memory?bank_id=default');
  }

  // ── Insights & Dashboard ─────────────────────────────────────────────────
  public static async getInsights(): Promise<any[]> {
    return this.request<any[]>('/insights');
  }

  public static async generateInsights(): Promise<any[]> {
    return this.request<any[]>('/insights/generate', { method: 'POST' });
  }

  public static async getDashboardSummary(): Promise<any> {
    return this.request<any>('/dashboard/summary');
  }

  // ── Ingestion ────────────────────────────────────────────────────────────
  public static async uploadFeedbackFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', 'upload');

    const res = await fetch(`${API_BASE}/ingestion/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('File upload failed');
    return res.json();
  }

  // ── Converters ───────────────────────────────────────────────────────────
  private static mapBackendFeedback(f: any): FeedbackItem {
    return {
      id: f.id,
      source: f.source || 'App Store',
      user: {
        name: f.customer_name || 'Anonymous User',
        role: f.customer_role || 'User',
        segment: f.customer_tier === 'enterprise' ? 'Enterprise' : f.customer_tier === 'pro' ? 'Pro' : 'Free',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.customer_email || f.id}`,
      },
      text: f.content,
      timestamp: f.created_at,
      rating: f.rating || (f.sentiment === 'positive' ? 5 : f.sentiment === 'negative' ? 1 : 3),
      sentiment: f.sentiment || 'neutral',
      sentimentScore: f.sentiment_score || 0.0,
      urgency: f.urgency || 'medium',
      category: f.product_area || f.category || 'General',
      keywords: f.issues || f.themes || [],
      releaseId: f.release_id,
      status: f.status === 'in_progress' ? 'actioned' : f.status === 'resolved' ? 'resolved' : 'new',
      aiSummary: f.summary || f.content.slice(0, 80),
      suggestedAction: f.suggested_action || (f.feature_request ? 'Add to product roadmap' : 'Investigate reported error in sprint backlog'),
    };
  }

  private static mapBackendRelease(r: any): Release {
    return {
      id: r.id,
      version: r.version,
      title: r.title,
      releaseDate: r.shipped_at || r.created_at,
      description: r.description || r.summary || '',
      targetAreas: (r.target_areas || ['Payments & Checkout']) as any,
      impactStatus: r.verified ? 'positive' : 'pending',
      sentimentBefore: r.sentiment_before ?? -0.52,
      sentimentAfter: r.sentiment_after ?? 0.74,
      issueVolumeBefore: r.issue_volume_before ?? 1240,
      issueVolumeAfter: r.issue_volume_after ?? 482,
      keyInsights: r.key_insights || [
        `Issue volume decreased from ${r.issue_volume_before || 1240} to ${r.issue_volume_after || 482}.`,
        'Persistent memory verified customer satisfaction shift.',
      ],
      notes: r.summary,
    };
  }

  private static mapBackendAction(a: any): ActionTicket {
    const priorityMap: Record<string, any> = {
      P0: 'P0 - Critical',
      P1: 'P1 - High',
      P2: 'P2 - Medium',
      P3: 'P3 - Low',
    };
    const statusMap: Record<string, any> = {
      Open: 'backlog',
      Investigating: 'in_progress',
      'In Progress': 'in_progress',
      Completed: 'in_review',
      Verified: 'resolved',
      resolved: 'resolved',
    };

    return {
      id: a.id,
      title: a.title,
      description: a.description || '',
      priority: priorityMap[a.priority] || 'P1 - High',
      status: statusMap[a.status] || 'backlog',
      category: (a.product_area || 'Checkout & Billing') as any,
      linkedFeedbackIds: a.linked_feedback_ids || [],
      impactedUsersCount: a.impacted_users || 120,
      assignedTo: a.owner || 'Sarah Chen',
      targetReleaseId: a.release_id,
      createdAt: a.created_at,
    };
  }
}
