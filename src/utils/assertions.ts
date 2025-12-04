/**
 * Assertion Helpers
 * Reusable assertions for API responses
 */

import { expect } from '@playwright/test';
import { ApiResponse } from './api-client';

export class ApiAssertions {
  /**
   * Assert HTTP status code
   */
  static assertStatusCode(response: ApiResponse, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
    console.log(`✓ Status code is ${expectedStatus}`);
  }

  /**
   * Assert response is successful (2xx)
   */
  static assertSuccess(response: ApiResponse) {
    expect(response.ok).toBe(true);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    console.log(`✓ Response is successful (${response.status})`);
  }

  /**
   * Assert response is an array
   */
  static assertIsArray(response: ApiResponse) {
    expect(Array.isArray(response.body)).toBe(true);
    console.log(`✓ Response is an array`);
  }

  /**
   * Assert response is an object
   */
  static assertIsObject(response: ApiResponse) {
    expect(typeof response.body).toBe('object');
    expect(Array.isArray(response.body)).toBe(false);
    console.log(`✓ Response is an object`);
  }

  /**
   * Assert response body contains required fields
   */
  static assertHasFields(response: ApiResponse, fields: string[]) {
    const body = Array.isArray(response.body) ? response.body[0] : response.body;

    fields.forEach(field => {
      expect(body).toHaveProperty(field);
    });

    console.log(`✓ Response contains all required fields: ${fields.join(', ')}`);
  }

  /**
   * Assert array length
   */
  static assertArrayLength(response: ApiResponse, length: number, operator: 'equals' | 'greaterThan' | 'lessThan' = 'equals') {
    expect(Array.isArray(response.body)).toBe(true);

    if (operator === 'equals') {
      expect(response.body.length).toBe(length);
    } else if (operator === 'greaterThan') {
      expect(response.body.length).toBeGreaterThanOrEqual(length);
    } else if (operator === 'lessThan') {
      expect(response.body.length).toBeLessThanOrEqual(length);
    }

    console.log(`✓ Array length: ${response.body.length}`);
  }

  /**
   * Assert field value
   */
  static assertFieldValue(response: ApiResponse, fieldPath: string, expectedValue: any) {
    const value = this.getNestedValue(response.body, fieldPath);
    expect(value).toBe(expectedValue);
    console.log(`✓ Field ${fieldPath} equals ${expectedValue}`);
  }

  /**
   * Assert field contains value
   */
  static assertFieldContains(response: ApiResponse, fieldPath: string, expectedValue: string) {
    const value = this.getNestedValue(response.body, fieldPath);
    expect(String(value)).toContain(expectedValue);
    console.log(`✓ Field ${fieldPath} contains ${expectedValue}`);
  }

  /**
   * Assert field type
   */
  static assertFieldType(response: ApiResponse, fieldPath: string, expectedType: string) {
    const value = this.getNestedValue(response.body, fieldPath);
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    expect(actualType).toBe(expectedType);
    console.log(`✓ Field ${fieldPath} is of type ${expectedType}`);
  }

  /**
   * Assert error response
   */
  static assertErrorResponse(response: ApiResponse, expectedStatus?: number) {
    expect(response.ok).toBe(false);

    if (expectedStatus) {
      expect(response.status).toBe(expectedStatus);
    }

    console.log(`✓ Got expected error response (${response.status})`);
  }

  /**
   * Assert response matches schema
   */
  static assertMatchesSchema(response: ApiResponse, schema: Record<string, string>) {
    const body = Array.isArray(response.body) ? response.body[0] : response.body;

    Object.entries(schema).forEach(([field, type]) => {
      expect(body).toHaveProperty(field);
      const actualType = Array.isArray(body[field]) ? 'array' : typeof body[field];
      expect(actualType).toBe(type);
    });

    console.log(`✓ Response matches schema`);
  }

  /**
   * Get nested value using dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}
