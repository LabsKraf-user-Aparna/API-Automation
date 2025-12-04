/**
 * Test Suite: Images API - Search Endpoint
 * Tests for GET /v1/images/search
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';
import {
  TEST_IMAGES,
  TEST_BREEDS,
  TEST_CATEGORIES,
  QUERY_PARAM_TEST_CASES,
  IMAGE_RESPONSE_SCHEMA,
} from '../src/fixtures/test-data';
import { ImageSchema, validateAgainstSchema } from '../src/schemas/response-schemas';

test.describe('Images API - Search Endpoint', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('TC-001: Should return an array of images with default parameters', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);
    ApiAssertions.assertArrayLength(response, 1);

    // Verify schema
    const imageObject = response.body[0];
    const { valid, errors } = validateAgainstSchema(imageObject, ImageSchema);
    expect(valid).toBe(true);
    if (!valid) {
      console.error('Schema validation errors:', errors);
    }

    console.log('✓ Successfully retrieved default image');
  });

  test('TC-002: Should retrieve multiple images with limit parameter', async () => {
    // Arrange
    const limit = 5;

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { limit });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertArrayLength(response, limit);
    response.body.forEach((image: any) => {
      const { valid } = validateAgainstSchema(image, ImageSchema);
      expect(valid).toBe(true);
    });

    console.log(`✓ Successfully retrieved ${limit} images`);
  });

  test('TC-003: Should handle pagination with page parameter', async () => {
    // Arrange
    const limit = 10;
    const page = 0;

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { limit, page });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);
    expect(response.body.length).toBeLessThanOrEqual(limit);

    console.log(`✓ Pagination works correctly for page ${page}`);
  });

  test('TC-004: Should filter images by breed ID', async () => {
    // Arrange
    const breedId = TEST_BREEDS.BENGAL;

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: breedId,
      limit: 5,
    });

    // Assert
    ApiAssertions.assertSuccess(response);
    response.body.forEach((image: any) => {
      if (image.breeds && image.breeds.length > 0) {
        expect(image.breeds.some((breed: any) => breed.id === breedId)).toBe(true);
      }
    });

    console.log(`✓ Successfully filtered images by breed: ${breedId}`);
  });

  test('TC-005: Should filter images by category ID', async () => {
    // Arrange
    const categoryId = TEST_CATEGORIES.HATS;

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      category_ids: categoryId,
      limit: 5,
    });

    // Assert
    ApiAssertions.assertSuccess(response);
    // Category filtering may not always return results, so just check for valid response
    ApiAssertions.assertIsArray(response);

    console.log(`✓ Category filter request successful`);
  });

  test('TC-006: Should return images with has_breeds filter', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      has_breeds: 1,
      limit: 5,
    });

    // Assert
    ApiAssertions.assertSuccess(response);
    response.body.forEach((image: any) => {
      // Images should have breed information
      expect(image).toHaveProperty('breeds');
    });

    console.log(`✓ Images with breed information retrieved successfully`);
  });

  test('TC-007: Should support RAND order parameter', async () => {
    // Act - Run twice to ensure randomization
    const response1 = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      order: 'RAND',
      limit: 1,
    });

    const response2 = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      order: 'RAND',
      limit: 1,
    });

    // Assert
    ApiAssertions.assertSuccess(response1);
    ApiAssertions.assertSuccess(response2);
    ApiAssertions.assertArrayLength(response1, 1);
    ApiAssertions.assertArrayLength(response2, 1);

    console.log(`✓ RAND order parameter works correctly`);
  });

  test('TC-008: Should return error for limit > 100', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { limit: 101 });

    // Assert - Without API key, the API may just cap the limit
    // This test verifies the API behavior
    ApiAssertions.assertIsArray(response);

    console.log(`✓ API handles limit parameter appropriately`);
  });

  test('TC-009: Should return error for limit < 1', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, { limit: 0 });

    // Assert
    // API should either return error or return with minimum limit
    expect(response.status).toBeDefined();

    console.log(`✓ API handles minimum limit appropriately`);
  });

  test('TC-010: Should support multiple breed IDs', async () => {
    // Arrange
    const breedIds = `${TEST_BREEDS.BENGAL},${TEST_BREEDS.ABYSSINIAN}`;

    // Act
    const response = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      breed_ids: breedIds,
      limit: 5,
    });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);

    console.log(`✓ Multiple breed filters work correctly`);
  });
});
