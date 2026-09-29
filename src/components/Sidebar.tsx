import React, { useState } from 'react';
import {
  LayoutGrid,
  MessageSquare,
  Brain,
  Lightbulb,
  GitCompare,
  Kanban,
  Database,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type TabType =
  | 'overview'
  | 'explorer'
  | 'memory'
  | 'insights'
  | 'releases'
  | 'action-hub'
  | 'data-sources'
  | 'ingest';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  criticalCount: number;
  unresolvedTicketCount: number;
  releaseCount: number;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeVariant?: 'critical' | 'warning' | 'accent';
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid size={15} /> },
  { id: 'explorer', label: 'Feedback', icon: <MessageSquare size={15} /> },
  { id: 'memory', label: 'AI Memory', icon: <Brain size={15} /> },
  { id: 'insights', label: 'Insights', icon: <Lightbulb size={15} /> },
  { id: 'releases', label: 'Release Impact', icon: <GitCompare size={15} /> },
  { id: 'action-hub', label: 'Action Hub', icon: <Kanban size={15} /> },
];

const SECONDARY_NAV: NavItem[] = [
  { id: 'data-sources', label: 'Data Sources', icon: <Database size={15} /> },
  { id: 'ingest', label: 'Ingest Feedback', icon: <Upload size={15} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  criticalCount,
  unresolvedTicketCount,
  releaseCount,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const primaryNav: NavItem[] = PRIMARY_NAV.map(item => {
    if (item.id === 'explorer' && criticalCount > 0) {
      return { ...item, badge: criticalCount, badgeVariant: 'critical' as const };
    }
    if (item.id === 'action-hub' && unresolvedTicketCount > 0) {
      return { ...item, badge: unresolvedTicketCount, badgeVariant: 'warning' as const };
    }
    if (item.id === 'releases') {
      return { ...item, badge: releaseCount, badgeVariant: 'accent' as const };
    }
    return item;
  });

  const getBadgeStyle = (variant?: string) => {
    switch (variant) {
      case 'critical': return { background: 'rgba(201,109,103,0.15)', color: '#C96D67', border: '1px solid rgba(201,109,103,0.25)' };
      case 'warning': return { background: 'rgba(209,164,91,0.15)', color: '#D1A45B', border: '1px solid rgba(209,164,91,0.25)' };
      case 'accent': return { background: 'rgba(95,175,163,0.12)', color: '#5FAFA3', border: '1px solid rgba(95,175,163,0.22)' };
      default: return {};
    }
  };

  return (
    <aside
      style={{
        width: collapsed ? 52 : 208,
        background: '#101416',
        borderRight: '1px solid #2B3437',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 49px)',
      }}
    >
      {/* Logo area + collapse toggle */}
      <div style={{
        padding: collapsed ? '12px 8px' : '14px 12px',
        borderBottom: '1px solid #2B3437',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Simple loop mark */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="9" stroke="#5FAFA3" strokeWidth="1.5" fill="none" />
              <circle cx="11" cy="11" r="4" fill="#5FAFA3" fillOpacity="0.3" />
              <circle cx="11" cy="11" r="1.5" fill="#5FAFA3" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#F2F0E9', letterSpacing: '-0.2px' }}>
              InsightLoop
            </span>
          </div>
        )}
        {collapsed && (
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="9" stroke="#5FAFA3" strokeWidth="1.5" fill="none" />
            <circle cx="11" cy="11" r="4" fill="#5FAFA3" fillOpacity="0.3" />
            <circle cx="11" cy="11" r="1.5" fill="#5FAFA3" />
          </svg>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '3px',
              color: '#737D7A',
              cursor: 'pointer',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px',
            color: '#737D7A',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Primary Nav */}
      <nav style={{ padding: '10px 8px', flex: 1 }}>
        {!collapsed && (
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#737D7A',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '4px 6px 8px',
          }}>
            Navigation
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {primaryNav.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px' : '7px 12px',
                }}
              >
                <span style={{ color: isActive ? '#5FAFA3' : '#737D7A', flexShrink: 0, display: 'flex' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, fontSize: 13, color: isActive ? '#F2F0E9' : '#A8B0AE' }}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && (
                      <span style={{
                        ...getBadgeStyle(item.badgeVariant),
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: 3,
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#2B3437', margin: '10px 0' }} />

        {!collapsed && (
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#737D7A',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '4px 6px 8px',
          }}>
            Data
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SECONDARY_NAV.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`nav-item${isActive ? ' active' : ''}`}
                style={{
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '8px' : '7px 12px',
                }}
              >
                <span style={{ color: isActive ? '#5FAFA3' : '#737D7A', flexShrink: 0, display: 'flex' }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span style={{ fontSize: 13, color: isActive ? '#F2F0E9' : '#A8B0AE' }}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div style={{ padding: '8px', borderTop: '1px solid #2B3437' }}>
        <button
          onClick={() => onTabChange('overview')}
          title={collapsed ? 'Settings' : undefined}
          className="nav-item"
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px' : '7px 12px',
          }}
        >
          <span style={{ color: '#737D7A', display: 'flex' }}>
            <Settings size={15} />
          </span>
          {!collapsed && (
            <span style={{ fontSize: 13, color: '#A8B0AE' }}>Settings</span>
          )}
        </button>
      </div>
    </aside>
  );
};
