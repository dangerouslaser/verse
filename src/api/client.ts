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

  constructor(endpoint: string = '/jsonrpc') {
    this.endpoint = endpoint;
  }

  /**
   * Call a Kodi JSON-RPC method
   */
  async call<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: ++this.requestId,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${String(response.status)}`);
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

// Export a singleton instance
export const kodi = new KodiClient();
