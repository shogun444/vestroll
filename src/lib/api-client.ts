/**
 * Unified API Client for VestRoll.
 * Handles fetch requests, error normalization (RFC 7807), and type-safe responses.
 */

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export class RequestError extends Error {
  public status: number;
  public details: ApiError;

  constructor(details: ApiError) {
    super(details.detail || details.title);
    this.name = "RequestError";
    this.status = details.status;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // If it's a Problem Details (RFC 7807) response, parse it correctly
    if (data && (data.title || data.detail)) {
      throw new RequestError(data as ApiError);
    }
    
    throw new RequestError({
      title: response.statusText || "Unknown Error",
      status: response.status,
      detail: "An unexpected error occurred while communicating with the server.",
    });
  }

  // The backend ApiResponse.success wraps data in a { success: true, message: string, data: T } envelope
  return (data?.data ?? data) as T;
}

export const apiClient = {
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(url: string, body?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },
};
