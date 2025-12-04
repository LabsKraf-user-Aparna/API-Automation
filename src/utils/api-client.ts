/**
 * API Client Utility
 * Handles all HTTP requests to TheCatAPI
 */

import { APIRequestContext, expect } from '@playwright/test';
import { API_CONFIG } from '../config/api.config';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
  endpoint: string;
  headers?: Record<string, string>;
  data?: Record<string, any>;
  params?: Record<string, any>;
  apiKey?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  ok: boolean;
}

export class APIClient {
  private request: APIRequestContext;
  private baseURL: string;
  private apiKey: string;
  private defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, apiKey?: string) {
    this.request = request;
    this.baseURL = API_CONFIG.baseURL;
    this.apiKey = apiKey || API_CONFIG.apiKey;
    this.defaultHeaders = {
      ...API_CONFIG.headers,
      'x-api-key': this.apiKey,
    };
  }

  /**
   * Make an HTTP request
   */
  async makeRequest(options: RequestOptions): Promise<ApiResponse> {
    const { method, endpoint, headers = {}, data, params, apiKey } = options;

    const url = this.buildUrl(endpoint, params, apiKey);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    console.log(`[API] ${method} ${url}`);

    try {
      const response = await this.request.fetch(url, {
        method,
        headers: requestHeaders,
        data: data ? JSON.stringify(data) : undefined,
      });

      const responseBody = await this.parseResponseBody(response);

      const apiResponse: ApiResponse = {
        status: response.status(),
        statusText: response.statusText(),
        headers: response.headers(),
        body: responseBody,
        ok: response.ok(),
      };

      console.log(`[API] Response Status: ${apiResponse.status}`);
      if (process.env.DEBUG_API) {
        console.log(`[API] Response Body:`, JSON.stringify(apiResponse.body, null, 2));
      }

      return apiResponse;
    } catch (error) {
      console.error(`[API] Request failed:`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(endpoint: string, params?: Record<string, any>, apiKey?: string): Promise<ApiResponse> {
    return this.makeRequest({
      method: 'GET',
      endpoint,
      params,
      apiKey,
    });
  }

  /**
   * POST request
   */
  async post(endpoint: string, data?: Record<string, any>, apiKey?: string): Promise<ApiResponse> {
    return this.makeRequest({
      method: 'POST',
      endpoint,
      data,
      apiKey,
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string, data?: Record<string, any>, apiKey?: string): Promise<ApiResponse> {
    return this.makeRequest({
      method: 'DELETE',
      endpoint,
      data,
      apiKey,
    });
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>, apiKey?: string): string {
    const baseUrl = `${this.baseURL}${endpoint}`;
    const queryParams = new URLSearchParams();

    if (apiKey) {
      queryParams.append('api_key', apiKey);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Parse response body (JSON or text)
   */
  private async parseResponseBody(response: any): Promise<any> {
    const contentType = response.headers()['content-type'] || '';

    if (contentType.includes('application/json')) {
      return response.json().catch(() => ({}));
    }

    return response.text();
  }
}
