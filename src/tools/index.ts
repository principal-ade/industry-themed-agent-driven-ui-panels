/**
 * Panel Tools
 *
 * UTCP-compatible tools for this panel extension.
 * These tools can be invoked by AI agents and emit events that panels listen for.
 *
 * IMPORTANT: This file should NOT import any React components to ensure
 * it can be imported server-side without pulling in React dependencies.
 * Use the './tools' subpath export for server-safe imports.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

/**
 * All tools exported as an array.
 * The Event Bus Panel is a passive monitor and does not expose tools.
 */
export const agentDrivenUIPanelTools: PanelTool[] = [];

/**
 * Panel tools metadata for registration with PanelToolRegistry.
 */
export const agentDrivenUIPanelToolsMetadata: PanelToolsMetadata = {
  id: 'industry-theme.agent-driven-ui-panels',
  name: 'Agent Driven UI Panels',
  description: 'Tools provided by the agent driven UI panels extension',
  tools: agentDrivenUIPanelTools,
};
