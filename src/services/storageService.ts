import type { FeedbackItem, Release, ActionTicket, AIConfig } from '../types';
import { INITIAL_FEEDBACK, INITIAL_RELEASES, INITIAL_TICKETS, PRESET_DATASETS } from '../data/seedData';

const STORAGE_KEYS = {
  FEEDBACK: 'insightloop_feedback_v1',
  RELEASES: 'insightloop_releases_v1',
  TICKETS: 'insightloop_tickets_v1',
  CONFIG: 'insightloop_config_v1',
  ACTIVE_DATASET: 'insightloop_active_dataset_v1',
};

export class StorageService {
  public static getFeedback(): FeedbackItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      return data ? JSON.parse(data) : INITIAL_FEEDBACK;
    } catch {
      return INITIAL_FEEDBACK;
    }
  }

  public static saveFeedback(items: FeedbackItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save feedback to local storage', e);
    }
  }

  public static getReleases(): Release[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RELEASES);
      return data ? JSON.parse(data) : INITIAL_RELEASES;
    } catch {
      return INITIAL_RELEASES;
    }
  }

  public static saveReleases(releases: Release[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RELEASES, JSON.stringify(releases));
    } catch (e) {
      console.error('Failed to save releases to local storage', e);
    }
  }

  public static getTickets(): ActionTicket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TICKETS);
      return data ? JSON.parse(data) : INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  }

  public static saveTickets(tickets: ActionTicket[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed to save tickets to local storage', e);
    }
  }

  public static getAIConfig(): AIConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : {
        model: 'insightloop-ai-v2',
        useLocalEngine: true,
        autoProcessNewIngest: true,
      };
    } catch {
      return {
        model: 'insightloop-ai-v2',
        useLocalEngine: true,
        autoProcessNewIngest: true,
      };
    }
  }

  public static saveAIConfig(config: AIConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save AI config', e);
    }
  }

  public static loadPresetDataset(presetId: string): { feedback: FeedbackItem[]; releases: Release[] } {
    const preset = PRESET_DATASETS.find(p => p.id === presetId) || PRESET_DATASETS[0];
    this.saveFeedback(preset.items);
    this.saveReleases(preset.releases);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DATASET, presetId);
    return { feedback: preset.items, releases: preset.releases };
  }

  public static getActiveDatasetId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_DATASET) || 'fintech-app';
  }

  public static resetToDefaults(): { feedback: FeedbackItem[]; releases: Release[]; tickets: ActionTicket[] } {
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.RELEASES);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_DATASET);
    return {
      feedback: INITIAL_FEEDBACK,
      releases: INITIAL_RELEASES,
      tickets: INITIAL_TICKETS,
    };
  }

  public static exportFullDataJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      feedback: this.getFeedback(),
      releases: this.getReleases(),
      tickets: this.getTickets(),
      config: this.getAIConfig(),
    };
    return JSON.stringify(data, null, 2);
  }

  public static importFullDataJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.feedback)) {
        this.saveFeedback(parsed.feedback);
      }
      if (Array.isArray(parsed.releases)) {
        this.saveReleases(parsed.releases);
      }
      if (Array.isArray(parsed.tickets)) {
        this.saveTickets(parsed.tickets);
      }
      return true;
    } catch {
      return false;
    }
  }
}
