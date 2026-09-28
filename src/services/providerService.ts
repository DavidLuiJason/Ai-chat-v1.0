import { Provider, AIAccount, AuthType, ConnectionStatus } from '../types/index.ts';

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    vendor: 'Google',
    description: 'Server-side integration via @google/genai SDK with multimodal execution and high context window.',
    supportedModes: ['api', 'file_exchange', 'external'],
    supportedAuth: ['server_environment', 'api_key'],
    iconKey: 'google-ai-studio',
    authInstructions: 'Connects using GEMINI_API_KEY from runtime server secrets or a user-provided API key.',
    isCustom: false,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google DeepMind',
    description: 'Direct Gemini API integration with fast reasoning and structured JSON output capability.',
    supportedModes: ['api', 'web_session', 'file_exchange'],
    supportedAuth: ['api_key', 'google_oauth'],
    iconKey: 'gemini',
    authInstructions: 'Enter your Google Gemini API key or authenticate via Google OAuth.',
    isCustom: false,
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    description: 'OpenAI GPT-4o / o1 model integration for code synthesis, research, and analysis.',
    supportedModes: ['api', 'web_session', 'file_exchange', 'external'],
    supportedAuth: ['api_key', 'provider_session'],
    iconKey: 'chatgpt',
    authInstructions: 'Requires an OpenAI API key (sk-...) or authenticated provider session.',
    isCustom: false,
  },
  {
    id: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    description: 'Anthropic Claude 3.7 Sonnet & Opus for architectural reasoning, analysis, and report generation.',
    supportedModes: ['api', 'web_session', 'file_exchange', 'external'],
    supportedAuth: ['api_key'],
    iconKey: 'claude',
    authInstructions: 'Requires an Anthropic API key (sk-ant-...) configured with appropriate permissions.',
    isCustom: false,
  },
  {
    id: 'grok',
    name: 'Grok',
    vendor: 'xAI',
    description: 'xAI Grok models with high-speed analytical reasoning and direct decision making.',
    supportedModes: ['api', 'web_session', 'external'],
    supportedAuth: ['api_key'],
    iconKey: 'grok',
    authInstructions: 'Requires an xAI Grok API key (xai-...) with API access.',
    isCustom: false,
  },
];

const SEQUENCE_STORAGE_KEY = 'aichat_provider_sequences_v2';

/**
 * Gets the next automatic account number for a provider.
 * Follows the strict rule:
 * - "ChatGPT 1", "ChatGPT 2", "ChatGPT 3"...
 * - NEVER reuse account numbers even if previous accounts are deleted!
 * - Number is an identity, NOT a quality ranking.
 */
export function getNextSequentialNumber(providerId: string): number {
  try {
    const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    const sequences: Record<string, number> = raw ? JSON.parse(raw) : {};
    const currentMax = sequences[providerId] || 0;
    const nextNum = currentMax + 1;
    sequences[providerId] = nextNum;
    localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(sequences));
    return nextNum;
  } catch (err) {
    console.error('Error generating sequence number:', err);
    return 1;
  }
}

/**
 * Strict rule: NEVER reuse account numbers even if previous accounts are deleted.
 * Number is an identity, NOT a quality ranking.
 */
export const getNextAccountNumber = getNextSequentialNumber;

export function peekNextSequentialNumber(providerId: string): number {
  try {
    const raw = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    const sequences: Record<string, number> = raw ? JSON.parse(raw) : {};
    const currentMax = sequences[providerId] || 0;
    return currentMax + 1;
  } catch {
    return 1;
  }
}

export function generateCanonicalName(providerName: string, identityNumber: number): string {
  return `${providerName} ${identityNumber}`;
}

export interface VerificationResult {
  success: boolean;
  status: ConnectionStatus;
  error?: string;
  model?: string;
  verifiedAt?: string;
}

/**
 * Real provider verification. Never fakes success.
 */
export async function verifyProviderConnection(params: {
  providerId: string;
  authType: AuthType;
  apiKey?: string;
}): Promise<VerificationResult> {
  const { providerId, authType, apiKey } = params;

  try {
    const res = await fetch('/api/providers/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, authType, apiKey }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        status: data.code === 'AUTH_REQUIRED' ? 'AUTHENTICATION_REQUIRED' : 'CONNECTION_ERROR',
        error: data.error || 'Connection verification failed',
      };
    }

    return {
      success: true,
      status: 'CONNECTED',
      model: data.model,
      verifiedAt: data.verifiedAt,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'UNAVAILABLE',
      error: err?.message || 'Network error attempting to verify provider.',
    };
  }
}

/**
 * Ping an account to check its live availability based on genuine API response.
 */
export async function pingAccountAvailability(account: AIAccount): Promise<{
  isOperational: boolean;
  status: 'RESPONDING' | 'UNRESPONSIVE' | 'AUTHENTICATION_REQUIRED' | 'UNAVAILABLE';
  latencyMs: number;
  details: string;
}> {
  const start = performance.now();

  if (account.connectionStatus !== 'CONNECTED') {
    return {
      isOperational: false,
      status: 'AUTHENTICATION_REQUIRED',
      latencyMs: 0,
      details: 'Account is not in CONNECTED state.',
    };
  }

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'PING: Health check',
        customApiKey: account.apiKey,
      }),
    });

    const duration = Math.round(performance.now() - start);

    if (res.ok) {
      return {
        isOperational: true,
        status: 'RESPONDING',
        latencyMs: duration,
        details: `Live response confirmed in ${duration}ms via provider adapter.`,
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        isOperational: false,
        status: 'UNRESPONSIVE',
        latencyMs: duration,
        details: errData?.error || 'Provider returned error during health check.',
      };
    }
  } catch (err: any) {
    const duration = Math.round(performance.now() - start);
    return {
      isOperational: false,
      status: 'UNAVAILABLE',
      latencyMs: duration,
      details: `Network failure connecting to provider endpoint: ${err?.message}`,
    };
  }
}

/**
 * Real AI generation call for active workforce execution.
 */
export async function executeProviderPrompt(params: {
  account: AIAccount;
  prompt: string;
  systemInstruction?: string;
}): Promise<{ text: string; error?: string }> {
  const { account, prompt, systemInstruction } = params;

  if (account.connectionStatus !== 'CONNECTED') {
    return {
      text: '',
      error: `Cannot generate: ${account.canonicalName} is ${account.connectionStatus}. Real credentials required.`,
    };
  }

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction,
        customApiKey: account.apiKey,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        text: '',
        error: data.error || 'Provider generation failed.',
      };
    }

    return { text: data.text || '' };
  } catch (err: any) {
    return {
      text: '',
      error: err?.message || 'Network error communicating with AI model.',
    };
  }
}
