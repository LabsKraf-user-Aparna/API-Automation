/**
 * API Configuration file
 * Contains base URLs and API endpoints for TheCatAPI
 */

export const API_CONFIG = {
  baseURL: 'https://api.thecatapi.com/v1',
  apiKey: process.env.CAT_API_KEY || 'DEMO-API-KEY',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * API Endpoints
 */
export const ENDPOINTS = {
  IMAGES: {
    SEARCH: '/images/search',
    GET_BY_ID: '/images/:imageId',
  },
  BREEDS: {
    LIST: '/breeds',
    GET_BY_ID: '/breeds/:breedId',
  },
  CATEGORIES: {
    LIST: '/categories',
  },
  FAVOURITES: {
    LIST: '/favourites',
    CREATE: '/favourites',
    DELETE: '/favourites/:favouriteId',
  },
  VOTES: {
    LIST: '/votes',
    CREATE: '/votes',
    DELETE: '/votes/:voteId',
  },
};

/**
 * Query Parameters defaults
 */
export const QUERY_PARAMS = {
  LIMIT: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 1,
  },
  PAGE: {
    MIN: 0,
    MAX: 2147483647,
    DEFAULT: 0,
  },
  ORDER: ['ASC', 'DESC', 'RAND'],
  HAS_BREEDS: [0, 1],
};

/**
 * Test Data Constants
 */
export const TEST_DATA = {
  BREED_IDS: {
    BENGAL: 'beng',
    ABYSSINIAN: 'abys',
    MAINE_COON: 'mcoon',
  },
  CATEGORY_IDS: {
    HATS: 1,
    SPACE: 5,
    FUNNY: 14,
  },
  VALID_MIME_TYPES: ['jpg', 'png', 'gif'],
  VALID_SIZES: ['full', 'med', 'small'],
};
