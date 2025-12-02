import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Activity, Pause, Play, Trash2, Filter, ChevronDown, ChevronRight, X } from 'lucide-react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps, PanelEvent, PanelEventEmitter } from '../types';

interface CapturedEvent {
  id: number;
  event: PanelEvent;
  expanded: boolean;
}

interface EventBusPanelContentProps extends PanelComponentProps {
  maxEvents?: number;
}

const EventBusPanelContent: React.FC<EventBusPanelContentProps> = ({
  events,
  maxEvents = 200,
}) => {
  const [capturedEvents, setCapturedEvents] = useState<CapturedEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const eventIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(isPaused);
  const [isNarrow, setIsNarrow] = useState(false);
  const { theme } = useTheme();

  // Track container width for responsive layout
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      setIsNarrow(width < 400);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Subscribe to all events
  useEffect(() => {
    // Cast to our extended type that includes onAll
    const extendedEvents = events as PanelEventEmitter;
    if (!extendedEvents?.onAll) return;

    const unsubscribe = extendedEvents.onAll((event: PanelEvent) => {
      if (isPausedRef.current) return;

      const id = ++eventIdRef.current;
      setCapturedEvents((prev) => {
        const newEvents = [...prev, { id, event, expanded: false }];
        // Keep only the last maxEvents
        if (newEvents.length > maxEvents) {
          return newEvents.slice(-maxEvents);
        }
        return newEvents;
      });
    });

    return unsubscribe;
  }, [events, maxEvents]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (!isPaused && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [capturedEvents, isPaused]);

  const toggleExpanded = useCallback((id: number) => {
    setCapturedEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e))
    );
  }, []);

  const clearEvents = useCallback(() => {
    setCapturedEvents([]);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType('');
    setFilterSource('');
  }, []);

  const hasActiveFilters = filterType || filterSource;

  // Filter events
  const filteredEvents = capturedEvents.filter((e) => {
    if (filterType && !e.event.type.toLowerCase().includes(filterType.toLowerCase())) {
      return false;
    }
    if (filterSource && !e.event.source.toLowerCase().includes(filterSource.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get unique event types and sources for filter hints
  const uniqueTypes = [...new Set(capturedEvents.map((e) => e.event.type))];
  const uniqueSources = [...new Set(capturedEvents.map((e) => e.event.source))];

  const getEventTypeColor = (type: string): string => {
    if (type.startsWith('panel:')) return theme.colors.primary;
    if (type.startsWith('file:')) return theme.colors.success;
    if (type.startsWith('repository:')) return theme.colors.info;
    if (type.startsWith('gemini:') || type.startsWith('ai:')) return theme.colors.warning;
    if (type.includes('error')) return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const formatTimestamp = (ts: number): string => {
    const date = new Date(ts);
    const time = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return isNarrow ? `${time.slice(3)}` : `${time}.${ms}`;
  };

  const formatPayload = (payload: unknown): string => {
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  };

  // Compact button style for narrow views
  const buttonStyle = {
    padding: isNarrow ? '6px 8px' : '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radii[1],
    background: theme.colors.surface,
    color: theme.colors.text,
    cursor: 'pointer',
    fontSize: theme.fontSizes[1],
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme.fonts.body,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isNarrow ? '8px 12px' : '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        <Activity size={isNarrow ? 16 : 20} color={theme.colors.primary} style={{ flexShrink: 0 }} />
        {!isNarrow && (
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes[3],
              fontWeight: theme.fontWeights.semibold,
              whiteSpace: 'nowrap',
            }}
          >
            Event Bus
          </h2>
        )}
        <span
          style={{
            marginLeft: 'auto',
            fontSize: theme.fontSizes[1],
            color: theme.colors.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {filteredEvents.length}{!isNarrow && ` / ${capturedEvents.length}`}
        </span>
      </div>

      {/* Controls */}
      <div
        style={{
          padding: isNarrow ? '6px 8px' : '8px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        {/* Pause/Resume */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            ...buttonStyle,
            border: `1px solid ${isPaused ? theme.colors.warning : theme.colors.border}`,
            background: isPaused ? theme.colors.warning : theme.colors.surface,
            color: isPaused ? theme.colors.background : theme.colors.text,
          }}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play size={14} /> : <Pause size={14} />}
          {!isNarrow && (isPaused ? 'Resume' : 'Pause')}
        </button>

        {/* Clear */}
        <button
          onClick={clearEvents}
          style={buttonStyle}
          title="Clear events"
        >
          <Trash2 size={14} />
          {!isNarrow && 'Clear'}
        </button>

        {/* Spacer */}
        <div style={{ flex: 1, minWidth: '8px' }} />

        {/* Filter Toggle (narrow) or Inline Filters (wide) */}
        {isNarrow ? (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              ...buttonStyle,
              border: `1px solid ${hasActiveFilters ? theme.colors.primary : theme.colors.border}`,
              background: hasActiveFilters ? `${theme.colors.primary}20` : theme.colors.surface,
            }}
            title="Toggle filters"
          >
            <Filter size={14} color={hasActiveFilters ? theme.colors.primary : theme.colors.textMuted} />
            {hasActiveFilters && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: theme.colors.primary
              }} />
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color={theme.colors.textMuted} />
            <input
              type="text"
              placeholder="Type..."
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              list="event-types"
              style={{
                padding: '4px 8px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                background: theme.colors.surface,
                color: theme.colors.text,
                fontSize: theme.fontSizes[1],
                width: '100px',
                minWidth: 0,
              }}
            />
            <datalist id="event-types">
              {uniqueTypes.map((type) => (
                <option key={type} value={type} />
              ))}
            </datalist>
            <input
              type="text"
              placeholder="Source..."
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              list="event-sources"
              style={{
                padding: '4px 8px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[1],
                background: theme.colors.surface,
                color: theme.colors.text,
                fontSize: theme.fontSizes[1],
                width: '100px',
                minWidth: 0,
              }}
            />
            <datalist id="event-sources">
              {uniqueSources.map((source) => (
                <option key={source} value={source} />
              ))}
            </datalist>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  ...buttonStyle,
                  padding: '4px 6px',
                }}
                title="Clear filters"
              >
                <X size={12} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expanded Filters (narrow view) */}
      {isNarrow && showFilters && (
        <div
          style={{
            padding: '8px',
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: theme.colors.backgroundSecondary,
          }}
        >
          <input
            type="text"
            placeholder="Filter by type..."
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            list="event-types-narrow"
            style={{
              padding: '6px 8px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              background: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSizes[1],
              width: '100%',
            }}
          />
          <datalist id="event-types-narrow">
            {uniqueTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
          <input
            type="text"
            placeholder="Filter by source..."
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            list="event-sources-narrow"
            style={{
              padding: '6px 8px',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              background: theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.fontSizes[1],
              width: '100%',
            }}
          />
          <datalist id="event-sources-narrow">
            {uniqueSources.map((source) => (
              <option key={source} value={source} />
            ))}
          </datalist>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                ...buttonStyle,
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <X size={12} />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Event List */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isNarrow ? '4px' : '8px',
          fontFamily: theme.fonts.monospace,
          fontSize: theme.fontSizes[1],
        }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: theme.colors.textMuted,
            }}
          >
            {capturedEvents.length === 0
              ? 'Waiting for events...'
              : 'No events match your filter'}
          </div>
        ) : (
          filteredEvents.map((captured) => (
            <div
              key={captured.id}
              style={{
                marginBottom: '4px',
                borderRadius: theme.radii[1],
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                overflow: 'hidden',
              }}
            >
              {/* Event Header */}
              <div
                onClick={() => toggleExpanded(captured.id)}
                style={{
                  padding: isNarrow ? '6px 8px' : '8px 12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  flexWrap: isNarrow ? 'wrap' : 'nowrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {captured.expanded ? (
                    <ChevronDown size={14} color={theme.colors.textMuted} />
                  ) : (
                    <ChevronRight size={14} color={theme.colors.textMuted} />
                  )}
                  <span style={{ color: theme.colors.textMuted, fontSize: theme.fontSizes[0] }}>
                    {formatTimestamp(captured.event.timestamp)}
                  </span>
                </div>
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: isNarrow ? 'column' : 'row',
                  alignItems: isNarrow ? 'flex-start' : 'center',
                  gap: isNarrow ? '2px' : '6px',
                }}>
                  <span
                    style={{
                      color: getEventTypeColor(captured.event.type),
                      fontWeight: theme.fontWeights.medium,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%',
                    }}
                    title={captured.event.type}
                  >
                    {captured.event.type}
                  </span>
                  {!isNarrow && <span style={{ color: theme.colors.textMuted }}>from</span>}
                  <span
                    style={{
                      color: theme.colors.info,
                      fontSize: isNarrow ? theme.fontSizes[0] : theme.fontSizes[1],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={captured.event.source}
                  >
                    {isNarrow ? `← ${captured.event.source}` : captured.event.source}
                  </span>
                </div>
              </div>

              {/* Expanded Payload */}
              {captured.expanded && (
                <div
                  style={{
                    padding: isNarrow ? '6px 8px' : '8px 12px',
                    borderTop: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    overflow: 'auto',
                    maxHeight: '200px',
                  }}
                >
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSizes[0],
                    }}
                  >
                    {formatPayload(captured.event.payload)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Status Bar */}
      {isPaused && (
        <div
          style={{
            padding: isNarrow ? '6px 12px' : '8px 16px',
            borderTop: `1px solid ${theme.colors.warning}`,
            background: `${theme.colors.warning}20`,
            color: theme.colors.warning,
            fontSize: theme.fontSizes[1],
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          ⏸ {isNarrow ? 'Paused' : 'Event capture paused'}
        </div>
      )}
    </div>
  );
};

/**
 * EventBusPanel - Real-time event bus monitor
 *
 * Displays all events flowing through the PanelEventBus, with:
 * - Real-time streaming event list
 * - Pause/Resume capture
 * - Filter by event type and source
 * - Expandable payload inspection
 * - Color-coded event types
 * - Responsive layout for narrow panels
 */
export const EventBusPanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <EventBusPanelContent {...props} />
    </ThemeProvider>
  );
};
