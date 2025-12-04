/**
 * API Test Data and Fixtures
 */

export const IMAGE_RESPONSE_SCHEMA = {
  id: 'string',
  url: 'string',
  width: 'number',
  height: 'number',
  breeds: 'array',
  favourite: 'object',
  vote: 'object',
};

export const BREED_RESPONSE_SCHEMA = {
  id: 'string',
  name: 'string',
  temperament: 'string',
  origin: 'string',
  country_codes: 'string',
  life_span: 'string',
  weight: 'object',
};

export const CATEGORY_RESPONSE_SCHEMA = {
  id: 'number',
  name: 'string',
  icon: 'string',
};

export const FAVORITE_REQUEST_SCHEMA = {
  image_id: 'string',
  sub_id: 'string',
};

export const FAVORITE_RESPONSE_SCHEMA = {
  id: 'number',
  user_id: 'string',
  image_id: 'string',
  created_at: 'string',
};

export const VOTE_REQUEST_SCHEMA = {
  image_id: 'string',
  sub_id: 'string',
  value: 'number',
};

export const VOTE_RESPONSE_SCHEMA = {
  id: 'number',
  user_id: 'string',
  image_id: 'string',
  created_at: 'string',
  value: 'number',
};

/**
 * Test Data Constants
 */
export const TEST_IMAGES = {
  VALID_IMAGE_ID: '0XYvRd7oD',
  INVALID_IMAGE_ID: 'invalid_id_12345',
};

export const TEST_BREEDS = {
  BENGAL: 'beng',
  ABYSSINIAN: 'abys',
  MAINE_COON: 'mcoon',
  BRITISH_SHORTHAIR: 'bsh',
};

export const TEST_CATEGORIES = {
  HATS: 1,
  SPACE: 5,
  FUNNY: 14,
  SUNGLASSES: 4,
};

/**
 * Query Parameter Test Cases
 */
export const QUERY_PARAM_TEST_CASES = {
  // Limit parameter tests
  LIMIT_MIN: { limit: 1 },
  LIMIT_MID: { limit: 5 },
  LIMIT_MAX: { limit: 100 },
  LIMIT_ZERO: { limit: 0 },
  LIMIT_EXCEED: { limit: 101 },

  // Order parameter tests
  ORDER_ASC: { order: 'ASC' },
  ORDER_DESC: { order: 'DESC' },
  ORDER_RAND: { order: 'RAND' },

  // Page parameter tests
  PAGE_ZERO: { page: 0 },
  PAGE_ONE: { page: 1 },
  PAGE_LARGE: { page: 100 },

  // Combination tests
  COMBINATION_1: { limit: 10, page: 0, order: 'RAND' },
  COMBINATION_2: { limit: 25, page: 1, has_breeds: 1 },
};

/**
 * Error Test Cases
 */
export const ERROR_TEST_CASES = {
  INVALID_BREED_ID: { breed_ids: 'invalid_breed_xyz' },
  INVALID_CATEGORY_ID: { category_ids: '99999' },
  INVALID_LIMIT: { limit: 'abc' },
  INVALID_PAGE: { page: 'abc' },
  UNAUTHORIZED: {
    apiKey: 'invalid_api_key_12345',
  },
};
