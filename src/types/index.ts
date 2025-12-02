/**
 * Panel Extension Type Definitions
 *
 * Re-exports core types from @principal-ade/panel-framework-core
 */

// Re-export all core types from panel-framework-core
export type {
  // Core data types
  DataSlice,
  WorkspaceMetadata,
  RepositoryMetadata,
  FileTreeSource,
  ActiveFileSlice,

  // Event system
  PanelEventType,
  PanelEvent,

  // Panel interface
  PanelActions,
  PanelContextValue,
  PanelComponentProps,

  // Panel definition
  PanelMetadata,
  PanelLifecycleHooks,
  PanelDefinition,
  PanelModule,

  // Registry types
  PanelRegistryEntry,
  PanelLoader,
  PanelRegistryConfig,

  // Tool types (UTCP-compatible)
  PanelTool,
  PanelToolsMetadata,
  JsonSchema,
  PanelEventCallTemplate,
} from '@principal-ade/panel-framework-core';

import type {
  PanelEvent,
  PanelEventEmitter as BasePanelEventEmitter,
} from '@principal-ade/panel-framework-core';

/**
 * Extended PanelEventEmitter with wildcard subscription support.
 * The core PanelEventBus class implements these methods, but the
 * base interface doesn't include them yet.
 */
export interface PanelEventEmitter extends BasePanelEventEmitter {
  /** Subscribe to all events (wildcard) */
  onAll?<T>(handler: (event: PanelEvent<T>) => void): () => void;
  /** Unsubscribe from wildcard handler */
  offAll?<T>(handler: (event: PanelEvent<T>) => void): void;
}

// Agent configuration types
export type {
  AgentConfig,
  AgentInfo,
  AgentSkill,
  AgentCapabilities,
  AgentProvider,
  ResourceRef,
} from './agent-config';
