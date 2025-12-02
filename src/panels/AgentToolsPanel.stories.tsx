import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bot, MessageSquare, Zap } from 'lucide-react';
import { AgentToolsPanel } from './AgentToolsPanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { AgentConfig } from '../types';

/**
 * AgentToolsPanel displays agent configuration, capabilities, and available tools.
 */
const meta = {
  title: 'Panels/AgentToolsPanel',
  component: AgentToolsPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Displays agent identity, capabilities, system prompt link, and a list of tools with expandable input/output schemas.',
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
} satisfies Meta<typeof AgentToolsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample agent configurations for stories
const codingAssistantConfig: AgentConfig = {
  id: 'principal-ade.coding-assistant',
  name: 'Coding Assistant',
  description:
    'An AI-powered coding assistant that helps with software development tasks including code review, refactoring, and documentation.',
  version: '2.1.0',
  icon: <Bot size={20} />,
  provider: {
    name: 'Principal ADE',
    url: 'https://principal-ade.dev',
  },
  instructions:
    'You are a helpful coding assistant. Help users write clean, maintainable code. Follow best practices and suggest improvements when appropriate. Be concise but thorough in explanations.',
  systemPromptRef: {
    uri: './prompts/coding-assistant.md',
    mimeType: 'text/markdown',
    label: 'Full System Prompt',
  },
  capabilities: {
    streaming: true,
    codeExecution: true,
    fileAccess: true,
  },
  conversationStarters: [
    'Help me refactor this function',
    'Review my code for issues',
    'Explain how this algorithm works',
  ],
  tools: [
    {
      name: 'read_file',
      description: 'Read the contents of a file from the current repository',
      inputs: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path to the file within the repository',
          },
        },
        required: ['path'],
      },
      outputs: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'The file content' },
          mimeType: { type: 'string', description: 'Detected MIME type' },
        },
      },
      tags: ['file', 'read', 'content'],
    },
    {
      name: 'write_file',
      description: 'Write content to a file in the repository',
      inputs: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'The path where the file should be written',
          },
          content: {
            type: 'string',
            description: 'The content to write to the file',
          },
          createDirectories: {
            type: 'boolean',
            description: 'Create parent directories if they do not exist',
          },
        },
        required: ['path', 'content'],
      },
      outputs: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          bytesWritten: { type: 'number' },
        },
      },
      tags: ['file', 'write', 'modify'],
    },
    {
      name: 'search_code',
      description: 'Search for code patterns across the repository using regex',
      inputs: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'Regex pattern to search for',
          },
          fileGlob: {
            type: 'string',
            description: 'Glob pattern to filter files (e.g., "**/*.ts")',
          },
          maxResults: {
            type: 'number',
            description: 'Maximum number of results to return',
          },
        },
        required: ['pattern'],
      },
      outputs: {
        type: 'object',
        properties: {
          matches: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                file: { type: 'string' },
                line: { type: 'number' },
                content: { type: 'string' },
              },
            },
          },
          totalCount: { type: 'number' },
        },
      },
      tags: ['search', 'code', 'regex'],
    },
    {
      name: 'run_tests',
      description: 'Execute test suite and return results',
      inputs: {
        type: 'object',
        properties: {
          testPattern: {
            type: 'string',
            description: 'Pattern to match test files',
          },
          watch: {
            type: 'boolean',
            description: 'Run in watch mode',
          },
        },
      },
      outputs: {
        type: 'object',
        properties: {
          passed: { type: 'number' },
          failed: { type: 'number' },
          skipped: { type: 'number' },
          coverage: { type: 'number' },
        },
      },
      tags: ['test', 'execute'],
    },
  ],
  tags: ['coding', 'development', 'ai-assistant'],
};

const minimalAgentConfig: AgentConfig = {
  id: 'minimal.agent',
  name: 'Minimal Agent',
  description: 'A minimal agent with no tools or capabilities.',
};

const chatAgentConfig: AgentConfig = {
  id: 'chat.assistant',
  name: 'Chat Assistant',
  description: 'A simple conversational assistant for general questions.',
  version: '1.0.0',
  icon: <MessageSquare size={20} />,
  capabilities: {
    streaming: true,
  },
  instructions: 'You are a friendly chat assistant. Answer questions helpfully and conversationally.',
  tools: [
    {
      name: 'web_search',
      description: 'Search the web for information',
      inputs: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
      outputs: {
        type: 'object',
        properties: {
          results: { type: 'array' },
        },
      },
      tags: ['search', 'web'],
    },
  ],
};

/**
 * Default state - no agent loaded
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => (
        <div style={{ height: '100%', width: '100%' }}>
          <AgentToolsPanel {...props} />
        </div>
      )}
    </MockPanelProvider>
  ),
};

/**
 * Full-featured coding assistant
 */
export const CodingAssistant: Story = {
  render: () => (
    <div style={{ height: '100%', width: '100%' }}>
      <AgentToolsPanel
        context={createMockContext()}
        actions={createMockActions()}
        events={createMockEvents()}
        agentConfig={codingAssistantConfig}
      />
    </div>
  ),
};

/**
 * Minimal agent with no tools
 */
export const MinimalAgent: Story = {
  render: () => (
    <div style={{ height: '100%', width: '100%' }}>
      <AgentToolsPanel
        context={createMockContext()}
        actions={createMockActions()}
        events={createMockEvents()}
        agentConfig={minimalAgentConfig}
      />
    </div>
  ),
};

/**
 * Simple chat assistant
 */
export const ChatAssistant: Story = {
  render: () => (
    <div style={{ height: '100%', width: '100%' }}>
      <AgentToolsPanel
        context={createMockContext()}
        actions={createMockActions()}
        events={createMockEvents()}
        agentConfig={chatAgentConfig}
      />
    </div>
  ),
};

/**
 * Agent with many tools
 */
export const ManyTools: Story = {
  render: () => {
    const manyToolsConfig: AgentConfig = {
      ...codingAssistantConfig,
      id: 'power-user.agent',
      name: 'Power User Agent',
      description: 'An agent with many tools for power users.',
      icon: <Zap size={20} />,
      tools: [
        ...codingAssistantConfig.tools!,
        {
          name: 'git_status',
          description: 'Get the current git status',
          inputs: { type: 'object', properties: {} },
          outputs: {
            type: 'object',
            properties: {
              branch: { type: 'string' },
              staged: { type: 'array' },
              unstaged: { type: 'array' },
            },
          },
          tags: ['git', 'status'],
        },
        {
          name: 'git_commit',
          description: 'Create a git commit',
          inputs: {
            type: 'object',
            properties: {
              message: { type: 'string', description: 'Commit message' },
            },
            required: ['message'],
          },
          outputs: {
            type: 'object',
            properties: {
              sha: { type: 'string' },
            },
          },
          tags: ['git', 'commit'],
        },
        {
          name: 'lint_code',
          description: 'Run linter on specified files',
          inputs: {
            type: 'object',
            properties: {
              files: { type: 'array', items: { type: 'string' } },
              fix: { type: 'boolean' },
            },
          },
          outputs: {
            type: 'object',
            properties: {
              errors: { type: 'number' },
              warnings: { type: 'number' },
            },
          },
          tags: ['lint', 'quality'],
        },
        {
          name: 'format_code',
          description: 'Format code using configured formatter',
          inputs: {
            type: 'object',
            properties: {
              files: { type: 'array', items: { type: 'string' } },
            },
          },
          outputs: {
            type: 'object',
            properties: {
              filesChanged: { type: 'number' },
            },
          },
          tags: ['format', 'prettier'],
        },
      ],
    };

    return (
      <div style={{ height: '100%', width: '100%' }}>
        <AgentToolsPanel
          context={createMockContext()}
          actions={createMockActions()}
          events={createMockEvents()}
          agentConfig={manyToolsConfig}
        />
      </div>
    );
  },
};

/**
 * Narrow viewport (300px) - tests responsive layout
 */
export const NarrowViewport: Story = {
  render: () => (
    <div style={{ width: '300px', height: '600px', border: '1px solid #333' }}>
      <AgentToolsPanel
        context={createMockContext()}
        actions={createMockActions()}
        events={createMockEvents()}
        agentConfig={codingAssistantConfig}
      />
    </div>
  ),
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
  render: () => (
    <div style={{ width: '250px', height: '500px', border: '1px solid #333' }}>
      <AgentToolsPanel
        context={createMockContext()}
        actions={createMockActions()}
        events={createMockEvents()}
        agentConfig={codingAssistantConfig}
      />
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', background: '#1a1a1a' }}>
        <Story />
      </div>
    ),
  ],
};
