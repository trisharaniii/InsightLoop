import { useState, useEffect } from 'react';
import type {
  FeedbackItem,
  Release,
  ActionTicket,
  FilterState,
  TicketStatus,
} from './types';
import { StorageService } from './services/storageService';
import { ApiService } from './services/apiService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';

// Pages
import { Overview } from './components/Dashboard/Overview';
import { FeedbackExplorer } from './components/FeedbackExplorer/FeedbackExplorer';
import { AIMemory } from './components/AIQueryAssistant/AIMemory';
import { InsightsPage } from './components/Insights/InsightsPage';
import { ReleaseImpact } from './components/ReleaseTracker/ReleaseImpact';
import { ActionHub } from './components/ActionHub/ActionHub';
import { DataSourcesPage } from './components/DataSources/DataSourcesPage';
import { IngestPage } from './components/DataSources/IngestPage';

// Modals (keep existing functional ones)
import { AddReleaseModal } from './components/ReleaseTracker/AddReleaseModal';
import { CreateTicketModal } from './components/ActionHub/CreateTicketModal';
import { FeedbackDetailModal } from './components/FeedbackExplorer/FeedbackDetailModal';

export function App() {
  const [feedbackMemory, setFeedbackMemory] = useState<FeedbackItem[]>(() => StorageService.getFeedback());
  const [releases, setReleases] = useState<Release[]>(() => StorageService.getReleases());
  const [tickets, setTickets] = useState<ActionTicket[]>(() => StorageService.getTickets());

  // Hydrate from live backend on mount
  useEffect(() => {
    async function hydrateFromBackend() {
      try {
        const [backendFb, backendReleases, backendActions] = await Promise.all([
          ApiService.getFeedback().catch(() => null),
          ApiService.getReleases().catch(() => null),
          ApiService.getActions().catch(() => null),
        ]);

        if (backendFb && backendFb.length > 0) {
          setFeedbackMemory(backendFb);
        }
        if (backendReleases && backendReleases.length > 0) {
          setReleases(backendReleases);
        }
        if (backendActions && backendActions.length > 0) {
          setTickets(backendActions);
        }
      } catch (e) {
        console.info('Backend unreachable, using local storage cache.');
      }
    }
    hydrateFromBackend();
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [globalSearch, setGlobalSearch] = useState('');

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    source: '',
    sentiment: '',
    urgency: '',
    category: '',
    releaseId: '',
    dateRange: 'all',
  });

  // Modal state
  const [isNewReleaseOpen, setIsNewReleaseOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [draftTicket, setDraftTicket] = useState({ title: '', description: '', category: 'Checkout & Billing', feedbackIds: [] as string[] });

  // Sync global search into filters
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: globalSearch }));
    if (globalSearch) setActiveTab('explorer');
  }, [globalSearch]);

  const handleAddTicket = async (t: ActionTicket) => {
    const updated = [t, ...tickets];
    setTickets(updated);
    StorageService.saveTickets(updated);
    try {
      await ApiService.createAction({
        title: t.title,
        description: t.description,
        priority: t.priority?.split(' ')[0] || 'P1',
        status: t.status,
        product_area: t.category,
        owner: t.assignedTo,
      });
    } catch (e) {
      console.warn('Backend action sync skipped:', e);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: TicketStatus) => {
    const updated = tickets.map(t => t.id === id ? { ...t, status } : t);
    setTickets(updated);
    StorageService.saveTickets(updated);
    try {
      await ApiService.updateActionStatus(id, status);
    } catch (e) {
      console.warn('Backend status update skipped:', e);
    }
  };

  const handleAddRelease = async (rel: Release) => {
    const updated = [rel, ...releases];
    setReleases(updated);
    StorageService.saveReleases(updated);
    try {
      await ApiService.createRelease({
        version: rel.version,
        title: rel.title,
        summary: rel.description,
        features_shipped: rel.keyInsights,
        target_areas: rel.targetAreas,
      });
    } catch (e) {
      console.warn('Backend release sync skipped:', e);
    }
  };

  const handleIngestItems = async (items: FeedbackItem[]) => {
    const updated = [...items, ...feedbackMemory];
    setFeedbackMemory(updated);
    StorageService.saveFeedback(updated);
    for (const item of items) {
      try {
        await ApiService.createFeedback({
          content: item.text,
          source: item.source,
          customer_name: item.user?.name,
          customer_tier: item.user?.segment?.toLowerCase(),
          rating: item.rating,
        });
      } catch (e) {
        // Continue
      }
    }
  };

  const openCreateTicket = (title: string, desc: string) => {
    setDraftTicket({ title, description: desc, category: 'Checkout & Billing', feedbackIds: [] });
    setIsCreateTicketOpen(true);
  };

  const handleCreateTicketFromFeedback = (item: FeedbackItem) => {
    setDraftTicket({
      title: `Resolve: ${item.aiSummary.slice(0, 60)}`,
      description: `"${item.text}"\n\nSuggested: ${item.suggestedAction}`,
      category: item.category,
      feedbackIds: [item.id],
    });
    setIsCreateTicketOpen(true);
  };

  const criticalCount = feedbackMemory.filter(f => f.urgency === 'critical').length;
  const openCount = tickets.filter(t => t.status !== 'resolved').length;

  return (
    <div style={{ background: '#101416', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        globalSearch={globalSearch}
        onGlobalSearchChange={setGlobalSearch}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          criticalCount={criticalCount}
          unresolvedTicketCount={openCount}
          releaseCount={releases.length}
        />

        <main style={{ flex: 1, overflowY: 'auto', background: '#101416' }}>
          {activeTab === 'overview' && (
            <Overview
              feedbackItems={feedbackMemory}
              releases={releases}
              onNavigate={(tab) => setActiveTab(tab as TabType)}
            />
          )}

          {activeTab === 'explorer' && (
            <FeedbackExplorer
              feedbackItems={feedbackMemory}
              releases={releases}
              filters={filters}
              onFilterChange={partial => setFilters(prev => ({ ...prev, ...partial }))}
              onResetFilters={() => setFilters({ search: '', source: '', sentiment: '', urgency: '', category: '', releaseId: '', dateRange: 'all' })}
              onCreateTicket={handleCreateTicketFromFeedback}
            />
          )}

          {activeTab === 'memory' && (
            <AIMemory
              feedbackMemory={feedbackMemory}
              releases={releases}
              onSelectFeedback={(id) => {
                const item = feedbackMemory.find(f => f.id === id);
                if (item) setSelectedFeedback(item);
              }}
              onCreateTicket={openCreateTicket}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsPage
              onCreateAction={openCreateTicket}
            />
          )}

          {activeTab === 'releases' && (
            <ReleaseImpact
              releases={releases}
              feedbackItems={feedbackMemory}
              onSelectFeedback={setSelectedFeedback}
              onOpenNewReleaseModal={() => setIsNewReleaseOpen(true)}
            />
          )}

          {activeTab === 'action-hub' && (
            <ActionHub
              tickets={tickets}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onOpenCreateModal={() => {
                setDraftTicket({ title: '', description: '', category: 'Checkout & Billing', feedbackIds: [] });
                setIsCreateTicketOpen(true);
              }}
              onSelectFeedback={(id) => {
                const item = feedbackMemory.find(f => f.id === id);
                if (item) setSelectedFeedback(item);
              }}
            />
          )}

          {activeTab === 'data-sources' && <DataSourcesPage />}

          {activeTab === 'ingest' && (
            <IngestPage
              releases={releases}
              onIngestItems={handleIngestItems}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {isNewReleaseOpen && (
        <AddReleaseModal
          onClose={() => setIsNewReleaseOpen(false)}
          onAddRelease={handleAddRelease}
        />
      )}

      {isCreateTicketOpen && (
        <CreateTicketModal
          initialTitle={draftTicket.title}
          initialDescription={draftTicket.description}
          initialCategory={draftTicket.category}
          initialFeedbackIds={draftTicket.feedbackIds}
          onClose={() => setIsCreateTicketOpen(false)}
          onCreateTicket={handleAddTicket}
        />
      )}

      {selectedFeedback && (
        <FeedbackDetailModal
          item={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          releases={releases}
          onCreateTicket={handleCreateTicketFromFeedback}
        />
      )}
    </div>
  );
}

export default App;
