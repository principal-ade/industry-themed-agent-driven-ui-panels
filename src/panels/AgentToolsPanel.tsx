import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench,
  ChevronDown,
  ChevronRight,
  FileText,
  Cpu,
  Tag,
} from 'lucide-react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps, PanelTool } from '../types';
import type { AgentConfig } from '../types/agent-config';

interface AgentToolsPanelContentProps extends PanelComponentProps {
  /** Agent configuration to display */
  agentConfig?: AgentConfig;
}

/**
 * Renders a capability badge
 */
const CapabilityBadge: React.FC<{ name: string; enabled: boolean; compact?: boolean }> = ({
  name,
  enabled,
  compact,
}) => {
  const { theme } = useTheme();
  if (!enabled) return null;

  const formatName = (n: string) =>
    n.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  return (
    <span
      style={{
        padding: compact ? '1px 6px' : '2px 8px',
        fontSize: theme.fontSizes[0],
        borderRadius: theme.radii[1],
        background: `${theme.colors.primary}20`,
        color: theme.colors.primary,
        border: `1px solid ${theme.colors.primary}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {formatName(name)}
    </span>
  );
};

/**
 * Renders the JSON schema in a readable format
 */
const SchemaView: React.FC<{ schema: Record<string, unknown>; label: string }> = ({
  schema,
  label,
}) => {
  const { theme } = useTheme();

  if (!schema || Object.keys(schema).length === 0) {
    return (
      <div style={{ color: theme.colors.textMuted, fontStyle: 'italic', fontSize: theme.fontSizes[0] }}>
        No {label.toLowerCase()} schema defined
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          fontSize: theme.fontSizes[0],
          color: theme.colors.textMuted,
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <pre
        style={{
          margin: 0,
          padding: '6px 8px',
          background: theme.colors.background,
          borderRadius: theme.radii[1],
          border: `1px solid ${theme.colors.border}`,
          fontSize: theme.fontSizes[0],
          fontFamily: theme.fonts.monospace,
          color: theme.colors.textSecondary,
          overflow: 'auto',
          maxHeight: '150px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {JSON.stringify(schema, null, 2)}
      </pre>
    </div>
  );
};

/**
 * Renders a single tool item
 */
const ToolItem: React.FC<{ tool: PanelTool; index: number; isNarrow: boolean }> = ({
  tool,
  index,
  isNarrow,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  return (
    <div
      style={{
        borderRadius: theme.radii[1],
        border: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
        overflow: 'hidden',
      }}
    >
      {/* Tool Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: isNarrow ? '8px 10px' : '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '6px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {expanded ? (
          <ChevronDown size={14} color={theme.colors.textMuted} style={{ marginTop: '2px', flexShrink: 0 }} />
        ) : (
          <ChevronRight size={14} color={theme.colors.textMuted} style={{ marginTop: '2px', flexShrink: 0 }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
          }}>
            <span
              style={{
                fontFamily: theme.fonts.monospace,
                fontWeight: theme.fontWeights.medium,
                color: theme.colors.text,
                fontSize: isNarrow ? theme.fontSizes[1] : theme.fontSizes[2],
                wordBreak: 'break-word',
              }}
            >
              {tool.name}
            </span>
            <span
              style={{
                fontSize: theme.fontSizes[0],
                color: theme.colors.textMuted,
                background: theme.colors.backgroundSecondary,
                padding: '1px 5px',
                borderRadius: theme.radii[0],
                flexShrink: 0,
              }}
            >
              #{index + 1}
            </span>
          </div>
          <div
            style={{
              fontSize: isNarrow ? theme.fontSizes[0] : theme.fontSizes[1],
              color: theme.colors.textSecondary,
              marginTop: '4px',
              lineHeight: 1.4,
            }}
          >
            {tool.description}
          </div>

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                marginTop: '6px',
                flexWrap: 'wrap',
              }}
            >
              {tool.tags.slice(0, isNarrow ? 3 : undefined).map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '1px 5px',
                    fontSize: theme.fontSizes[0],
                    background: theme.colors.backgroundSecondary,
                    color: theme.colors.textMuted,
                    borderRadius: theme.radii[0],
                  }}
                >
                  <Tag size={8} />
                  {tag}
                </span>
              ))}
              {isNarrow && tool.tags.length > 3 && (
                <span
                  style={{
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                  }}
                >
                  +{tool.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          style={{
            padding: isNarrow ? '8px 10px' : '12px',
            borderTop: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <SchemaView
            schema={tool.inputs as Record<string, unknown>}
            label="Input Schema"
          />
          <SchemaView
            schema={tool.outputs as Record<string, unknown>}
            label="Output Schema"
          />
        </div>
      )}
    </div>
  );
};

type TabId = 'prompt' | 'tools';

const AgentToolsPanelContent: React.FC<AgentToolsPanelContentProps> = ({
  agentConfig,
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('prompt');

  // Track container width for responsive layout
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      setIsNarrow(width < 350);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Default/empty state
  const config: AgentConfig = agentConfig || {
    id: 'no-agent',
    name: 'No Agent Loaded',
    description: 'Connect an agent to view its tools and configuration.',
    tools: [],
  };

  const tools = config.tools || [];
  const capabilities = config.capabilities || {};
  const enabledCapabilities = Object.entries(capabilities).filter(
    ([, enabled]) => enabled
  );

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
          padding: isNarrow ? '12px' : '16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        {/* Agent Identity - Icon, Name/Version */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isNarrow ? '8px' : '12px',
        }}>
          <div
            style={{
              width: isNarrow ? '32px' : '40px',
              height: isNarrow ? '32px' : '40px',
              borderRadius: theme.radii[2],
              background: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isNarrow ? '16px' : '20px',
              flexShrink: 0,
              color: theme.colors.background,
            }}
          >
            {config.icon || <Cpu size={isNarrow ? 16 : 20} color={theme.colors.background} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: isNarrow ? theme.fontSizes[3] : theme.fontSizes[4],
                fontWeight: theme.fontWeights.semibold,
                wordBreak: 'break-word',
              }}
            >
              {config.name}
            </h2>
            {config.version && (
              <span
                style={{
                  fontSize: theme.fontSizes[0],
                  color: theme.colors.textMuted,
                }}
              >
                v{config.version}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: isNarrow ? theme.fontSizes[1] : theme.fontSizes[2],
            color: theme.colors.textSecondary,
            lineHeight: 1.4,
          }}
        >
          {config.description}
        </p>

        {/* Capabilities */}
        {enabledCapabilities.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '10px',
              flexWrap: 'wrap',
            }}
          >
            {enabledCapabilities.map(([name, enabled]) => (
              <CapabilityBadge key={name} name={name} enabled={!!enabled} compact={isNarrow} />
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.colors.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveTab('prompt')}
          style={{
            flex: 1,
            padding: isNarrow ? '8px 12px' : '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'prompt' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
            color: activeTab === 'prompt' ? theme.colors.text : theme.colors.textMuted,
            fontSize: isNarrow ? theme.fontSizes[1] : theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: theme.fonts.body,
          }}
        >
          <FileText size={14} />
          Prompt
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          style={{
            flex: 1,
            padding: isNarrow ? '8px 12px' : '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tools' ? `2px solid ${theme.colors.primary}` : '2px solid transparent',
            color: activeTab === 'tools' ? theme.colors.text : theme.colors.textMuted,
            fontSize: isNarrow ? theme.fontSizes[1] : theme.fontSizes[2],
            fontWeight: theme.fontWeights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: theme.fonts.body,
          }}
        >
          <Wrench size={14} />
          Tools
          <span
            style={{
              fontSize: theme.fontSizes[0],
              color: theme.colors.textMuted,
              background: theme.colors.backgroundSecondary,
              padding: '1px 5px',
              borderRadius: theme.radii[0],
            }}
          >
            {tools.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {activeTab === 'prompt' && (
          <div
            style={{
              padding: isNarrow ? '12px' : '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Instructions / System Prompt */}
            {config.instructions ? (
              <div
                style={{
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.textSecondary,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: theme.fonts.body,
                }}
              >
                {config.instructions}
              </div>
            ) : (
              <div
                style={{
                  padding: '20px 12px',
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSizes[1],
                }}
              >
                No system prompt defined
              </div>
            )}

            {/* System Prompt Reference */}
            {config.systemPromptRef && (
              <div
                style={{
                  padding: isNarrow ? '8px 12px' : '10px 16px',
                  background: theme.colors.surface,
                  borderRadius: theme.radii[1],
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: theme.fontSizes[1],
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSizes[0],
                    color: theme.colors.textMuted,
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Source
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.monospace,
                    color: theme.colors.text,
                    wordBreak: 'break-all',
                  }}
                >
                  {config.systemPromptRef.uri}
                </div>
                {config.systemPromptRef.label && (
                  <div
                    style={{
                      marginTop: '4px',
                      color: theme.colors.textMuted,
                    }}
                  >
                    {config.systemPromptRef.label}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div
            style={{
              padding: isNarrow ? '8px' : '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {tools.length === 0 ? (
              <div
                style={{
                  padding: '20px 12px',
                  textAlign: 'center',
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSizes[1],
                }}
              >
                No tools defined
              </div>
            ) : (
              tools.map((tool, index) => (
                <ToolItem key={tool.name} tool={tool} index={index} isNarrow={isNarrow} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer with ID */}
      <div
        style={{
          padding: isNarrow ? '6px 12px' : '8px 16px',
          borderTop: `1px solid ${theme.colors.border}`,
          fontSize: theme.fontSizes[0],
          color: theme.colors.textMuted,
          fontFamily: theme.fonts.monospace,
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={config.id}
      >
        {config.id}
      </div>
    </div>
  );
};

/**
 * AgentToolsPanel - Displays agent configuration and available tools
 *
 * Shows:
 * - Agent identity (name, description, version, icon)
 * - Capabilities badges
 * - Link to system prompt
 * - Instructions preview
 * - List of tools with expandable input/output schemas
 * - Responsive layout for narrow panels
 */
export const AgentToolsPanel: React.FC<AgentToolsPanelContentProps> = (props) => {
  return (
    <ThemeProvider>
      <AgentToolsPanelContent {...props} />
    </ThemeProvider>
  );
};
