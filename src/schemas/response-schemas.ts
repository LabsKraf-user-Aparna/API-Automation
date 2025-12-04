/**
 * JSON Schema Definitions for API responses
 */

export const ImageSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    width: { type: 'integer' },
    height: { type: 'integer' },
    breeds: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          temperament: { type: 'string' },
          origin: { type: 'string' },
          country_codes: { type: 'string' },
          life_span: { type: 'string' },
          weight: {
            type: 'object',
            properties: {
              imperial: { type: 'string' },
              metric: { type: 'string' },
            },
          },
        },
      },
    },
    favourite: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string' },
        image_id: { type: 'string' },
        created_at: { type: 'string' },
      },
    },
    vote: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string' },
        image_id: { type: 'string' },
        created_at: { type: 'string' },
        value: { type: 'integer', enum: [0, 1] },
      },
    },
  },
  required: ['id', 'url', 'width', 'height'],
};

export const BreedSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    temperament: { type: 'string' },
    origin: { type: 'string' },
    country_codes: { type: 'string' },
    country_code: { type: 'string' },
    life_span: { type: 'string' },
    wikipedia_url: { type: 'string', format: 'uri' },
    weight: {
      type: 'object',
      properties: {
        imperial: { type: 'string' },
        metric: { type: 'string' },
      },
    },
  },
  required: ['id', 'name'],
};

export const CategorySchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
  },
  required: ['id', 'name'],
};

export const FavoriteResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    user_id: { type: 'string' },
    image_id: { type: 'string' },
    sub_id: { type: 'string' },
    created_at: { type: 'string' },
  },
  required: ['id', 'user_id', 'image_id'],
};

export const VoteResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    user_id: { type: 'string' },
    image_id: { type: 'string' },
    sub_id: { type: 'string' },
    created_at: { type: 'string' },
    value: { type: 'integer', enum: [0, 1] },
  },
  required: ['id', 'user_id', 'image_id', 'value'],
};

/**
 * Validate response against schema
 */
export function validateAgainstSchema(response: any, schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (schema.type === 'object') {
    if (typeof response !== 'object' || Array.isArray(response)) {
      errors.push(`Expected object but got ${typeof response}`);
      return { valid: false, errors };
    }

    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in response)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Check properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in response) {
          const propErrors = validateProperty(response[key], propSchema as any);
          errors.push(...propErrors);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateProperty(value: any, schema: any): string[] {
  const errors: string[] = [];

  if (schema.type === 'string' && typeof value !== 'string') {
    errors.push(`Expected string but got ${typeof value}`);
  } else if (schema.type === 'integer' && !Number.isInteger(value)) {
    errors.push(`Expected integer but got ${typeof value}`);
  } else if (schema.type === 'number' && typeof value !== 'number') {
    errors.push(`Expected number but got ${typeof value}`);
  } else if (schema.type === 'array' && !Array.isArray(value)) {
    errors.push(`Expected array but got ${typeof value}`);
  }

  return errors;
}
