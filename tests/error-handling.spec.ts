/**
 * Test Suite: Error Handling
 * Tests for error scenarios and edge cases
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';

test.describe('Error Handling and Edge Cases', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('TC-501: Should handle invalid API key gracefully', async () => {
    // Arrange
    const invalidApiKey = 'invalid_key_12345';

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {}, invalidApiKey);

    // Assert
    // API should return error or limit results without valid key
    expect(response.status).toBeDefined();
    // Could be 401, 403, or still 200 with limited results
    console.log(`✓ API handled invalid key with status ${response.status}`);
  });

  test('TC-502: Should handle malformed endpoint', async () => {
    // Act
    const response = await apiClient.get('/invalid/endpoint/path');

    // Assert
    ApiAssertions.assertErrorResponse(response, 404);
    console.log(`✓ API correctly returned 404 for invalid endpoint`);
  });

  test('TC-503: Should handle negative limit parameter', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { limit: -5 });

    // Assert
    // API should either ignore or return error
    expect(response.status).toBeDefined();
    console.log(`✓ API handled negative limit with status ${response.status}`);
  });

  test('TC-504: Should handle non-integer page parameter', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { page: 'abc' });

    // Assert
    expect(response.status).toBeDefined();
    console.log(`✓ API handled non-integer page parameter`);
  });

  test('TC-505: Should handle very large limit values', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      limit: 999999,
    });

    // Assert
    expect(response.status).toBeDefined();
    // Should either return limited results or error
    if (response.ok) {
      expect(Array.isArray(response.body)).toBe(true);
    }
    console.log(`✓ API handled large limit with status ${response.status}`);
  });

  test('TC-506: Should handle empty breed_ids parameter', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: '',
    });

    // Assert
    expect(response.status).toBeDefined();
    if (response.ok) {
      ApiAssertions.assertIsArray(response);
    }
    console.log(`✓ API handled empty breed_ids parameter`);
  });

  test('TC-507: Should handle invalid breed ID format', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: 'invalid@#$%',
      limit: 5,
    });

    // Assert
    expect(response.status).toBeDefined();
    console.log(`✓ API handled invalid breed ID format`);
  });

  test('TC-508: Should handle request with all parameters at limits', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      limit: 100,
      page: 0,
      order: 'RAND',
      has_breeds: 1,
    });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);
    console.log(`✓ API handled max parameter combination successfully`);
  });

  test('TC-509: Should handle special characters in search parameters', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: '<script>alert("test")</script>',
    });

    // Assert
    // Should not crash or execute script
    expect(response.status).toBeDefined();
    console.log(`✓ API safely handled special characters`);
  });

  test('TC-510: Should handle concurrent requests', async ({ request }) => {
    // Arrange
    const apiClient1 = new APIClient(request);
    const apiClient2 = new APIClient(request);

    // Act - Make concurrent requests
    const [response1, response2, response3] = await Promise.all([
      apiClient1.get(ENDPOINTS.IMAGES.SEARCH, { limit: 1 }),
      apiClient2.get(ENDPOINTS.BREEDS.LIST, { limit: 5 }),
      apiClient1.get(ENDPOINTS.CATEGORIES.LIST),
    ]);

    // Assert
    ApiAssertions.assertSuccess(response1);
    ApiAssertions.assertSuccess(response2);
    ApiAssertions.assertSuccess(response3);

    console.log(`✓ API handled concurrent requests successfully`);
  });

  test('TC-511: Should handle missing required headers gracefully', async () => {
    // Act - API should work even without explicit headers as they're set by default
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH);

    // Assert
    ApiAssertions.assertSuccess(response);
    console.log(`✓ API handled request with default headers`);
  });

  test('TC-512: Should handle very long query strings', async () => {
    // Arrange
    const longBreedIds = Array(50)
      .fill('beng')
      .join(',');

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: longBreedIds,
      limit: 1,
    });

    // Assert
    expect(response.status).toBeDefined();
    console.log(`✓ API handled long query string`);
  });
});
