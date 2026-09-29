import React, { useState } from 'react';
import { Search, Bell, Calendar, ChevronDown, User } from 'lucide-react';

interface NavbarProps {
  onGlobalSearchChange: (query: string) => void;
  globalSearch: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGlobalSearchChange,
  globalSearch,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header style={{
      height: 49,
      background: '#101416',
      borderBottom: '1px solid #2B3437',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 40,
      flexShrink: 0,
    }}>
      {/* Workspace label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: '#737D7A' }}>Workspace</span>
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#F2F0E9',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          cursor: 'pointer',
        }}>
          Mobile Banking &amp; Payments
          <ChevronDown size={12} style={{ color: '#737D7A' }} />
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 18, background: '#2B3437', flexShrink: 0 }} />

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
        <Search size={13} style={{
          position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
          color: '#737D7A', pointerEvents: 'none',
        }} />
        <input
          type="text"
          placeholder="Search feedback, themes, customers…"
          value={globalSearch}
          onChange={e => onGlobalSearchChange(e.target.value)}
          style={{
            width: '100%',
            paddingLeft: 30,
            paddingRight: 10,
            height: 30,
            fontSize: 12,
            background: '#171C1F',
            border: '1px solid #2B3437',
            borderRadius: 5,
            color: '#F2F0E9',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Date range pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 5,
        border: '1px solid #2B3437',
        background: '#171C1F',
        cursor: 'pointer',
        fontSize: 11,
        color: '#A8B0AE',
        flexShrink: 0,
      }}>
        <Calendar size={12} />
        <span>Last 30 days</span>
        <ChevronDown size={11} style={{ color: '#737D7A' }} />
      </div>

      {/* AI Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 5,
        border: '1px solid #2B3437',
        background: '#171C1F',
        fontSize: 11,
        color: '#A8B0AE',
        flexShrink: 0,
        cursor: 'default',
      }}
      className="hide-mobile"
      >
        <span className="dot-live" />
        <span>Memory synced</span>
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          style={{
            background: 'none',
            border: '1px solid #2B3437',
            borderRadius: 5,
            padding: '5px',
            cursor: 'pointer',
            color: '#A8B0AE',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Bell size={14} />
          <span style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: '#C96D67',
          }} />
        </button>

        {notifOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 6,
            width: 280,
            background: '#1D2427',
            border: '1px solid #2B3437',
            borderRadius: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 50,
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #2B3437' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#F2F0E9' }}>Notifications</span>
            </div>
            {[
              { text: 'Payment failure complaints up 184%', time: '2h ago', type: 'critical' },
              { text: '17 new critical issues detected', time: '4h ago', type: 'warning' },
              { text: 'AI Memory sync complete', time: '6h ago', type: 'ok' },
            ].map((n, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                borderBottom: i < 2 ? '1px solid #2B3437' : 'none',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                cursor: 'pointer',
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: n.type === 'critical' ? '#C96D67' : n.type === 'warning' ? '#D1A45B' : '#6FAF8F',
                  flexShrink: 0,
                  marginTop: 3,
                }} />
                <div>
                  <div style={{ fontSize: 12, color: '#F2F0E9', lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: '#737D7A', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User avatar */}
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 5,
        background: '#232B2E',
        border: '1px solid #2B3437',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#A8B0AE',
        flexShrink: 0,
      }}>
        <User size={14} />
      </div>
    </header>
  );
};
