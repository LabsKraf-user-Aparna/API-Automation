/**
 * Test Suite: Categories API
 * Tests for GET /v1/categories endpoints
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';
import { TEST_CATEGORIES } from '../src/fixtures/test-data';
import { CategorySchema, validateAgainstSchema } from '../src/schemas/response-schemas';

test.describe('Categories API', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('TC-401: Should retrieve list of all categories', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);
    expect(response.body.length).toBeGreaterThan(0);

    // Validate first category schema
    const { valid, errors } = validateAgainstSchema(response.body[0], CategorySchema);
    expect(valid).toBe(true);
    if (!valid) {
      console.error('Schema validation errors:', errors);
    }

    console.log(`✓ Successfully retrieved ${response.body.length} categories`);
  });

  test('TC-402: Should contain category with ID and name', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    const firstCategory = response.body[0];

    expect(firstCategory).toHaveProperty('id');
    expect(firstCategory).toHaveProperty('name');
    expect(typeof firstCategory.id).toBe('number');
    expect(typeof firstCategory.name).toBe('string');

    console.log(`✓ Categories contain required fields: id and name`);
  });

  test('TC-403: Should have consistent category data across requests', async () => {
    // Act
    const response1 = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);
    const response2 = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response1);
    ApiAssertions.assertSuccess(response2);
    expect(response1.body).toEqual(response2.body);

    console.log(`✓ Category data is consistent across requests`);
  });

  test('TC-404: Should support limit parameter for categories', async () => {
    // Arrange
    const limit = 3;

    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, { limit });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertArrayLength(response, limit);

    console.log(`✓ Retrieved ${limit} categories with limit parameter`);
  });

  test('TC-405: Should have unique category IDs', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    const ids = response.body.map((cat: any) => cat.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);

    console.log(`✓ All ${ids.length} category IDs are unique`);
  });

  test('TC-406: Should contain known category IDs', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    const categoryIds = response.body.map((cat: any) => cat.id);

    // Check if known categories exist
    expect(categoryIds).toContain(TEST_CATEGORIES.HATS);

    console.log(`✓ Known category IDs are present in response`);
  });

  test('TC-407: Should return non-empty category names', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    response.body.forEach((category: any) => {
      expect(category.name).toBeTruthy();
      expect(typeof category.name).toBe('string');
      expect(category.name.length).toBeGreaterThan(0);
    });

    console.log(`✓ All categories have non-empty names`);
  });

  test('TC-408: Should support pagination for categories', async () => {
    // Arrange
    const page = 0;
    const limit = 2;

    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST, { page, limit });

    // Assert
    ApiAssertions.assertSuccess(response);
    expect(response.body.length).toBeLessThanOrEqual(limit);

    console.log(`✓ Category pagination works correctly`);
  });

  test('TC-409: Should have valid data types for all categories', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    response.body.forEach((category: any) => {
      expect(typeof category.id).toBe('number');
      expect(Number.isInteger(category.id)).toBe(true);
      expect(typeof category.name).toBe('string');
    });

    console.log(`✓ All categories have correct data types`);
  });

  test('TC-410: Should be able to use category ID in image search', async () => {
    // Arrange
    const categoryId = TEST_CATEGORIES.HATS;

    // Act
    const categoryResponse = await apiClient.get(ENDPOINTS.CATEGORIES.LIST);
    const categoryExists = categoryResponse.body.some(
      (cat: any) => cat.id === categoryId
    );

    // Assert
    expect(categoryExists).toBe(true);

    // Now use the category in search
    const imageResponse = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      category_ids: categoryId,
      limit: 5,
    });

    ApiAssertions.assertSuccess(imageResponse);
    ApiAssertions.assertIsArray(imageResponse);

    console.log(`✓ Category ID can be used in image search successfully`);
  });
});
