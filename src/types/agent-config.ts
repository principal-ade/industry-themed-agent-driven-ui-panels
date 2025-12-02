/**
 * Agent Configuration Types
 *
 * A hybrid schema combining conventions from multiple AI agent standards:
 *
 * ## References
 *
 * ### A2A Protocol - Agent Card (Google + 50 companies)
 * - Spec: https://a2a-protocol.org/latest/specification/
 * - Location: /.well-known/agent.json
 * - Provides: id, name, description, version, skills, capabilities
 * - Survey: https://arxiv.org/html/2508.03095v1
 *
 * ### Microsoft Declarative Agent Manifest v1.5
 * - Spec: https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-manifest-1.5
 * - JSON Schema: https://aka.ms/json-schemas/copilot/declarative-agent/v1.5/schema.json
 * - Provides: instructions (system prompt), capabilities, actions
 *
 * ### Model Context Protocol (MCP)
 * - Spec: https://modelcontextprotocol.io/specification/2025-06-18
 * - TypeScript Schema: https://github.com/modelcontextprotocol/specification/blob/main/schema/schema.ts
 * - Provides: tools with name, description, inputSchema, outputSchema
 *
 * ### OpenAI Function Calling / Structured Outputs
 * - Docs: https://platform.openai.com/docs/guides/function-calling
 * - Cookbook: https://cookbook.openai.com/examples/function_calling_with_an_openapi_spec
 * - Provides: JSON Schema for tool inputs/outputs, strict mode
 *
 * ### Agents.md Standard (2025)
 * - Info: https://www.remio.ai/post/what-is-agents-md-a-complete-guide-to-the-new-ai-coding-agent-standard-in-2025
 * - Provides: Agent manifest with identity, behavioral rules, capability interfaces
 *
 * ### Agent Communication Protocol (ACP)
 * - Spec: https://agentcommunicationprotocol.dev/core-concepts/agent-manifest
 * - Provides: Agent manifest with identity, capabilities, metadata, runtime status
 *
 * @version 0.1.0
 * @lastUpdated 2024-12-01
 */

import type { PanelTool } from '@principal-ade/panel-framework-core';
import type { ReactNode } from 'react';

/**
 * Skill definition following A2A Protocol Agent Card specification.
 *
 * @see https://a2a-protocol.org/latest/specification/
 *
 * Skills represent discrete capabilities an agent can perform.
 * They are similar to MCP tools but with A2A-specific metadata.
 */
export interface AgentSkill {
  /** Unique identifier for the skill */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what the skill does */
  description: string;

  /**
   * JSON Schema defining expected input parameters.
   * @see https://json-schema.org/
   */
  inputSchema?: Record<string, unknown>;

  /**
   * JSON Schema defining the output format.
   * @see https://json-schema.org/
   */
  outputSchema?: Record<string, unknown>;

  /** Tags for categorization and discovery */
  tags?: string[];
}

/**
 * Agent capabilities following A2A Protocol conventions.
 *
 * @see https://a2a-protocol.org/latest/specification/
 *
 * Capabilities declare support for optional protocol features.
 * Extend this interface for domain-specific capabilities.
 */
export interface AgentCapabilities {
  /** Whether the agent supports streaming responses */
  streaming?: boolean;

  /** Whether the agent supports push notifications */
  pushNotifications?: boolean;

  /** Whether the agent can execute code */
  codeExecution?: boolean;

  /** Whether the agent can generate images */
  imageGeneration?: boolean;

  /** Whether the agent can browse the web */
  webBrowsing?: boolean;

  /** Whether the agent can access files */
  fileAccess?: boolean;

  /** Additional custom capabilities */
  [key: string]: boolean | undefined;
}

/**
 * Provider/vendor information following A2A Protocol.
 *
 * @see https://a2a-protocol.org/latest/specification/
 */
export interface AgentProvider {
  /** Provider/organization name */
  name: string;

  /** Provider website URL */
  url?: string;

  /** URL to provider logo */
  logo?: string;
}

/**
 * Reference to an external resource (system prompt, documentation, etc.)
 *
 * Supports multiple URI schemes for flexibility:
 * - `file://` or relative path: Local file
 * - `http://` or `https://`: Remote URL
 * - `panel://`: Panel framework resource
 * - `mcp://`: MCP resource URI
 */
export interface ResourceRef {
  /** URI or path to the resource */
  uri: string;

  /** MIME type of the resource (e.g., "text/markdown", "text/plain") */
  mimeType?: string;

  /** Human-readable label */
  label?: string;
}

/**
 * Agent Configuration - Hybrid schema combining multiple standards.
 *
 * This interface combines the best practices from:
 * - A2A Protocol Agent Card (identity, skills, capabilities)
 * - Microsoft Declarative Agent Manifest (instructions/system prompt)
 * - MCP Tool Manifest (tools with JSON schemas)
 *
 * ## Usage
 *
 * ```typescript
 * const agentConfig: AgentConfig = {
 *   id: 'my-org.coding-assistant',
 *   name: 'Coding Assistant',
 *   description: 'An AI assistant for software development tasks',
 *   version: '1.0.0',
 *   instructions: 'You are a helpful coding assistant...',
 *   systemPromptRef: { uri: './prompts/system.md', mimeType: 'text/markdown' },
 *   tools: [...],
 *   capabilities: { streaming: true, codeExecution: true },
 * };
 * ```
 */
export interface AgentConfig {
  // ─────────────────────────────────────────────────────────────────────────────
  // Identity (A2A Protocol Agent Card)
  // @see https://a2a-protocol.org/latest/specification/
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Unique identifier for the agent.
   * Recommended format: "{namespace}.{agent-name}" (e.g., "my-org.assistant")
   */
  id: string;

  /**
   * Human-readable name of the agent.
   * @maxLength 100 (Microsoft recommendation)
   */
  name: string;

  /**
   * Description of what the agent does.
   * @maxLength 1000 (Microsoft recommendation)
   */
  description: string;

  /**
   * Semantic version of the agent configuration.
   * @see https://semver.org/
   */
  version?: string;

  /**
   * Provider/vendor information.
   * @see https://a2a-protocol.org/latest/specification/
   */
  provider?: AgentProvider;

  // ─────────────────────────────────────────────────────────────────────────────
  // Instructions (Microsoft Declarative Agent Manifest)
  // @see https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/declarative-agent-manifest-1.5
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Short instructions or guidelines on how the agent should behave.
   * This is typically a summary; use systemPromptRef for the full prompt.
   * @maxLength 8000 (Microsoft recommendation)
   */
  instructions?: string;

  /**
   * Reference to the full system prompt resource.
   * The actual prompt content is stored externally and loaded on demand.
   */
  systemPromptRef?: ResourceRef;

  /**
   * Example conversation starters to help users understand agent capabilities.
   * @maxLength 12 items (Microsoft recommendation)
   */
  conversationStarters?: string[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Tools (MCP / UTCP / OpenAI Function Calling)
  // @see https://modelcontextprotocol.io/specification/2025-06-18
  // @see https://platform.openai.com/docs/guides/function-calling
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Tools available to the agent.
   * Uses the PanelTool type from panel-framework-core which is UTCP-compatible.
   * @see https://modelcontextprotocol.io/specification/2025-06-18
   */
  tools?: PanelTool[];

  /**
   * Skills following A2A Protocol convention.
   * Skills are similar to tools but with A2A-specific metadata.
   * Use this if integrating with A2A-compatible systems.
   * @see https://a2a-protocol.org/latest/specification/
   */
  skills?: AgentSkill[];

  // ─────────────────────────────────────────────────────────────────────────────
  // Capabilities (A2A Protocol)
  // @see https://a2a-protocol.org/latest/specification/
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Capabilities supported by this agent.
   * Declares optional features the agent can perform.
   */
  capabilities?: AgentCapabilities;

  // ─────────────────────────────────────────────────────────────────────────────
  // Metadata
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Icon for the agent.
   * Can be a ReactNode (e.g., Lucide icon), URL string, or emoji string.
   */
  icon?: ReactNode;

  /**
   * Tags for categorization and discovery.
   */
  tags?: string[];

  /**
   * Additional metadata for extensibility.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Minimal agent info for display in lists/cards.
 * Subset of AgentConfig for lightweight views.
 */
export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  version?: string;
  icon?: ReactNode;
  toolCount?: number;
  capabilities?: AgentCapabilities;
}
