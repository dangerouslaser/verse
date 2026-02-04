/**
 * Kodi JSON-RPC Client
 *
 * Handles all communication with Kodi's JSON-RPC API
 */

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, unknown>;
  id: number;
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class KodiError extends Error {
  constructor(
    message: string,
    public code: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'KodiError';
  }
}

export class KodiClient {
  private endpoint: string;
  private requestId: number = 0;
  private username?: string;
  private password?: string;

  constructor(endpoint: string = '/jsonrpc', username?: string, password?: string) {
    this.endpoint = endpoint;
    this.username = username;
    this.password = password;
  }

  /**
   * Get authentication headers if credentials are provided
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // In development, the Vite proxy handles authentication
    // In production, we need to add the auth header ourselves
    const isDevelopment = import.meta.env.DEV;

    if (!isDevelopment && this.username && this.password) {
      const auth = btoa(`${this.username}:${this.password}`);
      headers['Authorization'] = `Basic ${auth}`;
    }

    return headers;
  }

  /**
   * Call a Kodi JSON-RPC method
   */
  async call<T>(
    method: string,
    params?: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.requestId,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP error! status: ${String(response.status)} - ${text}`);
      }

      const data = (await response.json()) as JsonRpcResponse<T>;

      if (data.error) {
        throw new KodiError(data.error.message, data.error.code, data.error.data);
      }

      if (!data.result) {
        throw new Error('No result in response');
      }

      return data.result;
    } catch (error) {
      // If the request was aborted (e.g., React Strict Mode double-mounting),
      // just rethrow the error without wrapping it
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }

      if (error instanceof KodiError) {
        throw error;
      }
      throw new Error(
        `Failed to call ${method}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Ping Kodi to check connection
   */
  async ping(): Promise<string> {
    return this.call<string>('JSONRPC.Ping');
  }

  /**
   * Get Kodi version information
   */
  async getVersion(): Promise<{
    major: number;
    minor: number;
    patch: number;
    tag: string;
  }> {
    const result = await this.call<{
      version: { major: number; minor: number; patch: number; tag: string };
    }>('Application.GetProperties', {
      properties: ['version'],
    });
    return result.version;
  }
}

// Export a singleton instance with credentials from environment variables
export const kodi = new KodiClient(
  import.meta.env.VITE_KODI_JSONRPC_PATH || '/jsonrpc',
  import.meta.env.VITE_KODI_USERNAME,
  import.meta.env.VITE_KODI_PASSWORD
);
