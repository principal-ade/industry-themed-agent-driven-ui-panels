import { EventBusPanel } from './panels/EventBusPanel';
import { AgentToolsPanel } from './panels/AgentToolsPanel';
import type { PanelDefinition } from './types';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'industry-theme.event-bus-panel',
      name: 'Event Bus',
      icon: 'radio',
      version: '0.1.0',
      author: 'Industry Theme',
      description: 'Real-time event bus monitor showing all events flowing through the panel system',
      slices: [],
      tools: [],
    },
    component: EventBusPanel,
  },
  {
    metadata: {
      id: 'industry-theme.agent-tools-panel',
      name: 'Agent Tools',
      icon: 'wrench',
      version: '0.1.0',
      author: 'Industry Theme',
      description: 'Displays agent configuration, capabilities, and available tools with their schemas',
      slices: [],
      tools: [],
    },
    component: AgentToolsPanel,
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Agent Driven UI Panels loaded');
};

/**
 * Optional: Called once when the package is unloaded.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Agent Driven UI Panels unloading');
};

// Re-export panel components for direct imports
export { EventBusPanel } from './panels/EventBusPanel';
export { AgentToolsPanel } from './panels/AgentToolsPanel';

// Re-export agent config types
export type {
  AgentConfig,
  AgentInfo,
  AgentSkill,
  AgentCapabilities,
  AgentProvider,
  ResourceRef,
} from './types';
