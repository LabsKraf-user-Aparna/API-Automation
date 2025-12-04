/**
 * Test Suite: Images API - Get by ID Endpoint
 * Tests for GET /v1/images/{imageId}
 */

import { test, expect } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';
import { TEST_IMAGES, TEST_BREEDS } from '../src/fixtures/test-data';
import { ImageSchema, validateAgainstSchema } from '../src/schemas/response-schemas';

test.describe('Images API - Get by ID Endpoint', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('TC-201: Should retrieve a specific image by valid ID', async () => {
    // Arrange
    const imageId = TEST_IMAGES.VALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertIsObject(response);
    ApiAssertions.assertHasFields(response, ['id', 'url', 'width', 'height']);

    // Verify the image ID matches
    expect(response.body.id).toBe(imageId);

    // Validate schema
    const { valid, errors } = validateAgainstSchema(response.body, ImageSchema);
    expect(valid).toBe(true);
    if (!valid) {
      console.error('Schema validation errors:', errors);
    }

    console.log(`✓ Successfully retrieved image with ID: ${imageId}`);
  });

  test('TC-202: Should return 404 for non-existent image ID', async () => {
    // Arrange
    const imageId = TEST_IMAGES.INVALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertErrorResponse(response, 404);

    console.log(`✓ Correctly returned 404 for invalid image ID`);
  });

  test('TC-203: Should return image with breed information when available', async () => {
    // Arrange
    const imageId = TEST_IMAGES.VALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    expect(response.body).toHaveProperty('breeds');
    expect(Array.isArray(response.body.breeds)).toBe(true);

    // If breeds exist, validate breed schema
    if (response.body.breeds.length > 0) {
      const breed = response.body.breeds[0];
      ApiAssertions.assertHasFields(
        { status: 200, statusText: 'OK', ok: true, headers: {}, body: breed },
        ['id', 'name']
      );
    }

    console.log(`✓ Image contains breed information`);
  });

  test('TC-204: Should return image dimensions', async () => {
    // Arrange
    const imageId = TEST_IMAGES.VALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertFieldType(response, 'width', 'number');
    ApiAssertions.assertFieldType(response, 'height', 'number');

    // Verify dimensions are positive
    expect(response.body.width).toBeGreaterThan(0);
    expect(response.body.height).toBeGreaterThan(0);

    console.log(
      `✓ Image dimensions are valid: ${response.body.width}x${response.body.height}`
    );
  });

  test('TC-205: Should return valid image URL', async () => {
    // Arrange
    const imageId = TEST_IMAGES.VALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertFieldType(response, 'url', 'string');

    // Validate URL format
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i;
    expect(response.body.url).toMatch(urlRegex);

    console.log(`✓ Image URL is valid: ${response.body.url}`);
  });

  test('TC-206: Should handle empty image ID gracefully', async () => {
    // Arrange
    const imageId = '';
    const endpoint = `/images/${imageId}`;

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    // Should either return 400/404 or redirect
    expect([400, 404, 301, 302, 307, 308]).toContain(response.status);

    console.log(`✓ API handles empty image ID with status ${response.status}`);
  });

  test('TC-207: Should contain image URL in response', async () => {
    // Arrange
    const imageId = TEST_IMAGES.VALID_IMAGE_ID;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act
    const response = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertHasFields(response, ['url']);
    expect(response.body.url).toBeTruthy();
    expect(typeof response.body.url).toBe('string');

    console.log(`✓ Image URL field is properly populated`);
  });

  test('TC-208: Should maintain consistency between search and get by ID', async () => {
    // Arrange - First get an image ID from search
    const searchResponse = await apiClient.get(ENDPOINTS.IMAGES.SEARCH, {
      limit: 1,
    });

    if (searchResponse.body.length === 0) {
      console.log('⊘ No images available for testing');
      return;
    }

    const imageId = searchResponse.body[0].id;
    const endpoint = ENDPOINTS.IMAGES.GET_BY_ID.replace(':imageId', imageId);

    // Act - Get the same image by ID
    const getByIdResponse = await apiClient.get(endpoint);

    // Assert
    ApiAssertions.assertSuccess(getByIdResponse);
    expect(getByIdResponse.body.id).toBe(imageId);
    expect(getByIdResponse.body.url).toBe(searchResponse.body[0].url);

    console.log(`✓ Image data is consistent between endpoints`);
  });
});
