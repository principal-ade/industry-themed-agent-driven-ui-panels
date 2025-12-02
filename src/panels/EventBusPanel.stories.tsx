import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { EventBusPanel } from './EventBusPanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { PanelEvent } from '../types';

/**
 * EventBusPanel monitors all events flowing through the panel event bus.
 * It provides real-time streaming, filtering, pause/resume, and payload inspection.
 */
const meta = {
  title: 'Panels/EventBusPanel',
  component: EventBusPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Real-time event bus monitor showing all events flowing through the panel system. Supports filtering by type/source, pause/resume, and expandable payload inspection.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventBusPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default empty state - waiting for events
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <div style={{ height: '100%', width: '100%' }}>
          <EventBusPanel {...props} />
        </div>
      )}
    </MockPanelProvider>
  ),
};

/**
 * With simulated event stream
 */
export const WithEventStream: Story = {
  render: function WithEventStreamRender() {
    const eventsRef = useRef(createMockEvents());

    useEffect(() => {
      const events = eventsRef.current;
      const eventTypes = [
        { type: 'panel:toggle', source: 'user-action' },
        { type: 'panel:switch', source: 'gemini-assistant' },
        { type: 'file:opened', source: 'file-tree' },
        { type: 'repository:selected', source: 'repo-picker' },
        { type: 'gemini:message-complete', source: 'gemini-provider' },
        { type: 'panel:visibility-response', source: 'editor-layout' },
        { type: 'host:read-file', source: 'ai-agent' },
      ];

      // Emit initial burst of events
      eventTypes.forEach((evt, i) => {
        setTimeout(() => {
          events.emit({
            type: evt.type,
            source: evt.source,
            timestamp: Date.now(),
            payload: {
              example: 'data',
              index: i,
              nested: { value: Math.random() },
            },
          });
        }, i * 100);
      });

      // Continue emitting random events
      const interval = setInterval(() => {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        events.emit({
          type: randomEvent.type,
          source: randomEvent.source,
          timestamp: Date.now(),
          payload: {
            random: Math.random(),
            timestamp: new Date().toISOString(),
          },
        });
      }, 1500);

      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={eventsRef.current}
        />
      </div>
    );
  },
};

/**
 * High frequency event stream
 */
export const HighFrequencyStream: Story = {
  render: function HighFrequencyRender() {
    const eventsRef = useRef(createMockEvents());

    useEffect(() => {
      const events = eventsRef.current;
      const eventTypes = [
        'panel:toggle',
        'panel:switch',
        'file:opened',
        'file:closed',
        'repository:selected',
        'gemini:streaming',
        'ai:token',
      ];

      const interval = setInterval(() => {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        events.emit({
          type,
          source: `source-${Math.floor(Math.random() * 5)}`,
          timestamp: Date.now(),
          payload: { value: Math.random() },
        });
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={eventsRef.current}
        />
      </div>
    );
  },
};

/**
 * With pre-populated events
 */
export const PrePopulated: Story = {
  render: function PrePopulatedRender() {
    const eventsRef = useRef(createMockEvents());

    useEffect(() => {
      const events = eventsRef.current;
      const now = Date.now();

      // Emit a batch of events immediately
      const preEvents = [
        {
          type: 'panel:switch',
          source: 'user-action',
          payload: { slot: 'left', panel: 'file-tree' },
        },
        {
          type: 'repository:selected',
          source: 'repo-picker',
          payload: { repository: { full_name: 'owner/repo' } },
        },
        {
          type: 'file:opened',
          source: 'file-tree',
          payload: { path: 'src/index.ts', content: '// ...' },
        },
        {
          type: 'gemini:message-complete',
          source: 'gemini-provider',
          payload: { messageId: 'msg-123', tokens: 456 },
        },
        {
          type: 'panel:visibility-response',
          source: 'editor-layout',
          payload: {
            left: { panelId: 'file-tree', collapsed: false },
            middle: { panelId: 'editor' },
            right: { panelId: 'ai-chat', collapsed: false },
          },
        },
      ];

      preEvents.forEach((evt, i) => {
        events.emit({
          type: evt.type,
          source: evt.source,
          timestamp: now - (preEvents.length - i) * 1000,
          payload: evt.payload,
        });
      });
    }, []);

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={eventsRef.current}
        />
      </div>
    );
  },
};

/**
 * In a panel context with MockPanelProvider
 */
export const InPanelContext: Story = {
  render: () => {
    const customEvents = createMockEvents({
      onAll: (handler: (event: PanelEvent) => void) => {
        // Simulate some events
        setTimeout(() => {
          handler({
            type: 'panel:mounted',
            source: 'event-bus-panel',
            timestamp: Date.now(),
            payload: { panelId: 'event-bus' },
          });
        }, 500);
        return () => {};
      },
      offAll: () => {},
    });

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={customEvents}
        />
      </div>
    );
  },
};

/**
 * Narrow viewport (300px) - tests responsive layout
 */
export const NarrowViewport: Story = {
  render: function NarrowRender() {
    const eventsRef = useRef(createMockEvents());

    useEffect(() => {
      const events = eventsRef.current;
      const eventTypes = [
        { type: 'panel:toggle', source: 'user-action' },
        { type: 'panel:switch', source: 'gemini-assistant' },
        { type: 'file:opened', source: 'file-tree' },
        { type: 'repository:selected', source: 'repo-picker' },
      ];

      // Emit initial events
      eventTypes.forEach((evt, i) => {
        setTimeout(() => {
          events.emit({
            type: evt.type,
            source: evt.source,
            timestamp: Date.now(),
            payload: { example: 'data', index: i },
          });
        }, i * 200);
      });

      const interval = setInterval(() => {
        const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        events.emit({
          type: randomEvent.type,
          source: randomEvent.source,
          timestamp: Date.now(),
          payload: { random: Math.random() },
        });
      }, 2000);

      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{ width: '300px', height: '500px', border: '1px solid #333' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={eventsRef.current}
        />
      </div>
    );
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Extra narrow viewport (250px)
 */
export const ExtraNarrowViewport: Story = {
  render: function ExtraNarrowRender() {
    const eventsRef = useRef(createMockEvents());

    useEffect(() => {
      const events = eventsRef.current;
      ['panel:toggle', 'file:opened', 'gemini:message-complete'].forEach((type, i) => {
        setTimeout(() => {
          events.emit({
            type,
            source: 'test-source',
            timestamp: Date.now(),
            payload: { data: `value-${i}` },
          });
        }, i * 300);
      });
    }, []);

    return (
      <div style={{ width: '250px', height: '400px', border: '1px solid #333' }}>
        <EventBusPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={eventsRef.current}
        />
      </div>
    );
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};
