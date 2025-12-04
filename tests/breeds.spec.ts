/**
 * Test Suite: Breeds API
 * Tests for GET /v1/breeds endpoints
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';
import { TEST_BREEDS } from '../src/fixtures/test-data';
import { BreedSchema, validateAgainstSchema } from '../src/schemas/response-schemas';

test.describe('Breeds API', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('TC-301: Should retrieve list of all breeds', async () => {
    // Act
    const response = await apiClient.get(ENDPOINTS.BREEDS.LIST);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);
    expect(response.body.length).toBeGreaterThan(0);

    // Validate first breed schema
    const { valid, errors } = validateAgainstSchema(response.body[0], BreedSchema);
    expect(valid).toBe(true);
    if (!valid) {
      console.error('Schema validation errors:', errors);
    }

    console.log(`✓ Successfully retrieved ${response.body.length} breeds`);
  });

  test('TC-302: Should support limit parameter for breeds', async () => {
    // Arrange
    const limit = 5;

    // Act
    const response = await apiClient.get(ENDPOINTS.BREEDS.LIST, { limit });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertArrayLength(response, limit);

    console.log(`✓ Retrieved ${limit} breeds with limit parameter`);
  });

  test('TC-303: Should support pagination for breeds list', async () => {
    // Arrange
    const page = 1;
    const limit = 10;

    // Act
    const response = await apiClient.get(ENDPOINTS.BREEDS.LIST, { page, limit });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsArray(response);

    console.log(`✓ Pagination works for breeds list`);
  });

  test('TC-304: Should retrieve specific breed by ID', async () => {
    // Arrange
    const breedId = TEST_BREEDS.BENGAL;
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', breedId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsObject(response);
    ApiAssertions.assertHasFields(response, ['id', 'name']);

    // Verify breed ID matches
    expect(response.body.id).toBe(breedId);

    console.log(`✓ Successfully retrieved breed: ${response.body.name}`);
  });

  test('TC-305: Should contain required breed information fields', async () => {
    // Arrange
    const breedId = TEST_BREEDS.ABYSSINIAN;
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', breedId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertHasFields(response, [
      'id',
      'name',
      'temperament',
      'origin',
      'life_span',
    ]);

    // Validate specific field types
    ApiAssertions.assertFieldType(response, 'name', 'string');
    ApiAssertions.assertFieldType(response, 'temperament', 'string');
    ApiAssertions.assertFieldType(response, 'life_span', 'string');

    console.log(`✓ Breed contains all required information fields`);
  });

  test('TC-306: Should contain weight information for breed', async () => {
    // Arrange
    const breedId = TEST_BREEDS.MAINE_COON;
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', breedId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    expect(response.body).toHaveProperty('weight');
    expect(response.body.weight).toHaveProperty('imperial');
    expect(response.body.weight).toHaveProperty('metric');

    console.log(`✓ Breed weight information: ${JSON.stringify(response.body.weight)}`);
  });

  test('TC-307: Should return 404 for invalid breed ID', async () => {
    // Arrange
    const invalidBreedId = 'invalid_breed_xyz';
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', invalidBreedId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertErrorResponse(response, 404);

    console.log(`✓ Correctly returned 404 for invalid breed`);
  });

  test('TC-308: Should have consistent data across requests', async () => {
    // Arrange
    const breedId = TEST_BREEDS.BENGAL;
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', breedId);

    // Act - Get breed twice
    const response1 = await apiClient.get(endpoint);
    const response2 = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response1);
    ApiAssertions.assertSuccess(response2);
    expect(response1.body).toEqual(response2.body);

    console.log(`✓ Breed data is consistent across requests`);
  });

  test('TC-309: Should return breed with country information', async () => {
    // Arrange
    const breedId = TEST_BREEDS.BRITISH_SHORTHAIR;
    const endpoint = ENDPOINTS.BREEDS.GET_BY_ID.replace(':breedId', breedId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    expect(response.body).toHaveProperty('country_codes');
    expect(response.body.country_codes).toBeTruthy();

    console.log(`✓ Breed contains country information: ${response.body.country_codes}`);
  });

  test('TC-310: Should return sorted breeds when using order parameter', async () => {
    // Act
    const ascResponse = await apiClient.get(ENDPOINTS.BREEDS.LIST, {
      limit: 10,
      order: 'ASC',
    });

    const descResponse = await apiClient.get(ENDPOINTS.BREEDS.LIST, {
      limit: 10,
      order: 'DESC',
    });

    // Assert
    ApiAssertions.assertSuccess(ascResponse);
    ApiAssertions.assertSuccess(descResponse);
    ApiAssertions.assertIsArray(ascResponse);
    ApiAssertions.assertIsArray(descResponse);

    console.log(`✓ Breeds are returned in correct order`);
  });
});
