# TheCatAPI - Automation Test Framework

A comprehensive end-to-end API automation framework for testing TheCatAPI using Playwright and TypeScript.

## 📋 Overview

This framework provides:

- **Complete API Test Coverage**: Tests for Images, Breeds, and Categories endpoints
- **Reusable Components**: API client, assertions, and utilities for easy test creation
- **Schema Validation**: JSON schema validation for responses
- **Error Handling**: Comprehensive error scenario testing
- **Best Practices**: Follow industry best practices for API testing

## 🏗️ Project Structure

```
API_automation/
├── tests/
│   ├── images.search.spec.ts          # Tests for image search endpoint
│   ├── images.getbyid.spec.ts         # Tests for getting images by ID
│   ├── breeds.spec.ts                 # Tests for breeds endpoint
│   ├── categories.spec.ts             # Tests for categories endpoint
│   └── error-handling.spec.ts         # Error handling and edge cases
│
├── src/
│   ├── config/
│   │   └── api.config.ts              # API configuration and endpoints
│   ├── utils/
│   │   ├── api-client.ts              # HTTP client for API requests
│   │   └── assertions.ts              # Reusable assertion helpers
│   ├── fixtures/
│   │   └── test-data.ts               # Test data and fixtures
│   └── schemas/
│       └── response-schemas.ts        # JSON schemas for validation
│
├── context/
│   └── apiContext.txt                 # Project context
│
├── package.json                       # Dependencies and scripts
├── playwright.config.ts               # Playwright configuration
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (recommend 18+)
- npm or yarn

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **(Optional) Set up environment variables**:

   Create a `.env` file in the root directory:

   ```env
   CAT_API_KEY=your_api_key_here
   DEBUG_API=false
   ```

   Without an API key, you can still run tests with the DEMO-API-KEY (limited to 10 images).

### Running Tests

Run all tests:

```bash
npm test
```

Run tests in headed mode (see browser):

```bash
npm run test:headed
```

Run tests with UI mode:

```bash
npm run test:ui
```

Run tests in debug mode:

```bash
npm run test:debug
```

View HTML report:

```bash
npm run test:report
```

## 📊 Test Suites

### 1. Images Search Tests (`images.search.spec.ts`)

Tests for `GET /v1/images/search` endpoint:

- TC-001: Default image retrieval
- TC-002: Multiple images with limit
- TC-003: Pagination with page parameter
- TC-004: Filter by breed ID
- TC-005: Filter by category ID
- TC-006: Filter with has_breeds flag
- TC-007: RAND order parameter
- TC-008-010: Edge cases and multiple filters

**Coverage**: Query parameters, pagination, filtering

### 2. Images Get by ID Tests (`images.getbyid.spec.ts`)

Tests for `GET /v1/images/{imageId}` endpoint:

- TC-201: Retrieve image by valid ID
- TC-202: 404 for invalid ID
- TC-203: Breed information retrieval
- TC-204: Image dimensions validation
- TC-205: URL validation
- TC-206-208: Edge cases and data consistency

**Coverage**: Individual resource retrieval, data validation, consistency

### 3. Breeds Tests (`breeds.spec.ts`)

Tests for `GET /v1/breeds` endpoints:

- TC-301: List all breeds
- TC-302: Limit parameter
- TC-303: Pagination
- TC-304: Get breed by ID
- TC-305: Required fields validation
- TC-306-310: Weight info, error handling, data consistency

**Coverage**: Breed listing, filtering, individual breed retrieval

### 4. Categories Tests (`categories.spec.ts`)

Tests for `GET /v1/categories` endpoint:

- TC-401: List all categories
- TC-402: Required fields
- TC-403: Data consistency
- TC-404-410: Pagination, unique IDs, data types, integration

**Coverage**: Category listing, data validation, integration with images

### 5. Error Handling Tests (`error-handling.spec.ts`)

Tests for error scenarios and edge cases:

- TC-501-512: Invalid inputs, malformed requests, concurrent requests, security

**Coverage**: Error responses, boundary conditions, concurrent operations

## 🛠️ Using the Framework

### Creating a New Test

```typescript
import { test } from '@playwright/test';
import { APIClient } from '../src/utils/api-client';
import { ApiAssertions } from '../src/utils/assertions';
import { ENDPOINTS } from '../src/config/api.config';

test.describe('My API Tests', () => {
  let apiClient: APIClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new APIClient(request);
  });

  test('Should test something', async () => {
    // Arrange
    const endpoint = ENDPOINTS.IMAGES.SEARCH;

    // Act
    const response = await apiClient.get(endpoint, { limit: 5 });

    // Assert
    ApiAssertions.assertSuccess(response);
    ApiAssertions.assertArrayLength(response, 5);
  });
});
```

### Using the API Client

```typescript
// GET request
const response = await apiClient.get('/images/search', { limit: 10 });

// GET with custom API key
const response = await apiClient.get('/images/search', {}, 'custom-key');

// POST request
const response = await apiClient.post('/favourites', {
  image_id: 'abc123',
  sub_id: 'my-app'
});

// DELETE request
const response = await apiClient.delete('/favourites/123');
```

### Using Assertions

```typescript
// Check status code
ApiAssertions.assertStatusCode(response, 200);

// Check success (2xx)
ApiAssertions.assertSuccess(response);

// Check response type
ApiAssertions.assertIsArray(response);
ApiAssertions.assertIsObject(response);

// Check array length
ApiAssertions.assertArrayLength(response, 5);

// Check field value
ApiAssertions.assertFieldValue(response, 'id', 'abc123');

// Check field type
ApiAssertions.assertFieldType(response, 'url', 'string');

// Check field contains value
ApiAssertions.assertFieldContains(response, 'url', 'cdn');

// Validate schema
ApiAssertions.assertMatchesSchema(response, {
  id: 'string',
  url: 'string',
  width: 'number',
});

// Check required fields
ApiAssertions.assertHasFields(response, ['id', 'url', 'width']);

// Error response
ApiAssertions.assertErrorResponse(response, 404);
```

### Using Schema Validation

```typescript
import { ImageSchema, validateAgainstSchema } from '../src/schemas/response-schemas';

const response = await apiClient.get('/images/search');
const { valid, errors } = validateAgainstSchema(response.body[0], ImageSchema);

if (!valid) {
  console.error('Validation errors:', errors);
}
```

## 📝 API Contract Summary

### TheCatAPI Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/images/search` | GET | Search for cat images |
| `/v1/images/{imageId}` | GET | Get a specific image |
| `/v1/breeds` | GET | List all cat breeds |
| `/v1/breeds/{breedId}` | GET | Get specific breed |
| `/v1/categories` | GET | List all categories |
| `/v1/favourites` | GET/POST/DELETE | Manage favorites |
| `/v1/votes` | GET/POST/DELETE | Manage votes |

### Query Parameters (Images Search)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | 1-100 | 1 | Number of images to return |
| `page` | 0-n | 0 | Page number for pagination |
| `order` | ASC/DESC/RAND | RAND | Sort order |
| `has_breeds` | 0/1 | 0 | Only images with breed info |
| `breed_ids` | String | - | Comma-separated breed IDs |
| `category_ids` | String | - | Comma-separated category IDs |
| `sub_id` | String | - | Filter by sub_id |

### Response Schema

**Image Object**:
```typescript
{
  id: string;
  url: string;
  width: number;
  height: number;
  breeds: Array<{
    id: string;
    name: string;
    temperament: string;
    origin: string;
    country_codes: string;
    life_span: string;
    weight: { imperial: string; metric: string };
  }>;
  favourite?: { id: number; user_id: string; ... };
  vote?: { id: number; value: 0|1; ... };
}
```

## 🔐 Authentication

The API supports two authentication methods:

1. **Header Authentication** (Recommended):
   ```
   x-api-key: YOUR_API_KEY
   ```

2. **Query Parameter Authentication**:
   ```
   ?api_key=YOUR_API_KEY
   ```

Get your free API key at: https://thecatapi.com/

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:report
```

This opens an interactive report showing:
- Test results
- Duration
- Error details
- Screenshots/traces

## 🐛 Debugging

### Enable API logging

Set environment variable:
```bash
DEBUG_API=true npm test
```

### Run single test
```bash
npx playwright test images.search.spec.ts -g "TC-001"
```

### Use Inspector
```bash
npm run test:debug
```

## 🔧 Configuration

Edit `src/config/api.config.ts` to:
- Change base URL
- Update API key
- Modify timeout
- Add custom headers

## 🌐 Common Issues

### Tests fail with 429 (Rate Limited)

- You've exceeded the free tier limit (10,000 requests/month)
- Use an API key with higher limits
- Reduce parallel workers in `playwright.config.ts`

### Tests fail with 401 (Unauthorized)

- Invalid or missing API key
- Set `CAT_API_KEY` environment variable

### Tests timeout

- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify API is accessible

## 📚 Best Practices Implemented

1. **Separation of Concerns**: API client, assertions, config are separate
2. **Reusability**: Common functions and utilities reduce duplication
3. **Test Naming**: Clear test IDs and descriptive names
4. **Async/Await**: Modern JavaScript with proper async handling
5. **Error Handling**: Comprehensive error scenarios
6. **Schema Validation**: JSON schema validation for responses
7. **Logging**: Debug logging for troubleshooting
8. **Configuration**: Externalized config for different environments

## 🚢 CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: html-report
          path: playwright-report/
```

## 📝 Test Execution Summary

- **Total Test Cases**: 52
- **Test Suites**: 5
- **Endpoints Covered**: 7 main endpoints
- **Coverage Areas**:
  - Happy path scenarios
  - Parameter validation
  - Error handling
  - Data consistency
  - Schema validation
  - Edge cases
  - Concurrent requests

## 🤝 Contributing

To add new tests:

1. Create test file in `tests/` directory
2. Use `APIClient` for requests
3. Use `ApiAssertions` for validations
4. Follow naming convention: `TC-XXX: Description`
5. Update this README with test details

## 📄 License

ISC

## 📞 Support

- API Documentation: https://developers.thecatapi.com/
- Discord: https://discord.com/invite/SRaRFcQ7Yw
- Forum: https://forum.thatapiguy.com/

## 🎯 Next Steps

1. **Get API Key**: https://thecatapi.com/ → Pricing → Get Free Access
2. **Run Tests**: `npm test`
3. **View Report**: `npm run test:report`
4. **Add Tests**: Create your own test files
5. **Integrate**: Add to your CI/CD pipeline

---

**Happy Testing! 🐱**
