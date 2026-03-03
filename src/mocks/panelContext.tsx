import React from 'react';
import type {
  PanelComponentProps,
  PanelContextValue,
  PanelActions,
  PanelEventEmitter,
  PanelEvent,
  PanelEventType,
} from '../types';

/**
 * Mock Panel Context for Storybook
 *
 * Note: As of panel-framework-core 0.5.x, PanelContextValue uses a generic type
 * parameter for typed data slices instead of a Map-based system. Panels that need
 * specific data slices should define their own typed context interface.
 */
export const createMockContext = <TData = {}>(
  overrides?: Partial<PanelContextValue<TData>>
): PanelContextValue<TData> => {
  const defaultContext: PanelContextValue<TData> = {
    currentScope: {
      type: 'repository',
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'my-project',
        path: '/Users/developer/my-project',
      },
    },
    refresh: async (
      scope?: 'workspace' | 'repository',
      slice?: string
    ): Promise<void> => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Context refresh called', { scope, slice });
    },
  } as PanelContextValue<TData>;

  return { ...defaultContext, ...overrides };
};

/**
 * Mock Panel Actions for Storybook
 */
export const createMockActions = (
  overrides?: Partial<PanelActions>
): PanelActions => ({
  openFile: (filePath: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening file:', filePath);
  },
  openGitDiff: (filePath: string, status) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Opening git diff:', filePath, status);
  },
  navigateToPanel: (panelId: string) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Navigating to panel:', panelId);
  },
  notifyPanels: (event) => {
    // eslint-disable-next-line no-console
    console.log('[Mock] Notifying panels:', event);
  },
  ...overrides,
});

/**
 * Mock Event Emitter for Storybook
 */
export const createMockEvents = (
  overrides?: Partial<PanelEventEmitter>
): PanelEventEmitter => {
  const handlers = new Map<
    PanelEventType,
    Set<(event: PanelEvent<unknown>) => void>
  >();
  const wildcardHandlers = new Set<(event: PanelEvent<unknown>) => void>();

  const emitter: PanelEventEmitter = {
    emit: (event) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Emitting event:', event);
      // Type-specific handlers
      const eventHandlers = handlers.get(event.type);
      if (eventHandlers) {
        eventHandlers.forEach((handler) => handler(event));
      }
      // Wildcard handlers
      wildcardHandlers.forEach((handler) => handler(event));
    },
    on: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Subscribing to event:', type);
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type)!.add(handler as (event: PanelEvent<unknown>) => void);

      // Return cleanup function
      return () => {
        // eslint-disable-next-line no-console
        console.log('[Mock] Unsubscribing from event:', type);
        handlers
          .get(type)
          ?.delete(handler as (event: PanelEvent<unknown>) => void);
      };
    },
    off: (type, handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Removing event handler:', type);
      handlers
        .get(type)
        ?.delete(handler as (event: PanelEvent<unknown>) => void);
    },
    onAll: (handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Subscribing to all events');
      wildcardHandlers.add(handler as (event: PanelEvent<unknown>) => void);
      return () => {
        // eslint-disable-next-line no-console
        console.log('[Mock] Unsubscribing from all events');
        wildcardHandlers.delete(handler as (event: PanelEvent<unknown>) => void);
      };
    },
    offAll: (handler) => {
      // eslint-disable-next-line no-console
      console.log('[Mock] Removing wildcard handler');
      wildcardHandlers.delete(handler as (event: PanelEvent<unknown>) => void);
    },
  };

  return { ...emitter, ...overrides };
};

/**
 * Mock Panel Props Provider
 * Wraps components with mock context for Storybook
 */
export const MockPanelProvider: React.FC<{
  children: (props: PanelComponentProps) => React.ReactNode;
  contextOverrides?: Partial<PanelContextValue>;
  actionsOverrides?: Partial<PanelActions>;
  eventsOverrides?: Partial<PanelEventEmitter>;
}> = ({ children, contextOverrides, actionsOverrides, eventsOverrides }) => {
  const context = createMockContext(contextOverrides);
  const actions = createMockActions(actionsOverrides);
  const events = createMockEvents(eventsOverrides);

  return <>{children({ context, actions, events })}</>;
};
