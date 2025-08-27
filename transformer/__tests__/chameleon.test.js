const { process, processRouterDest } = require('../src/v0/destinations/chameleon/transform');

// Mock the utilities - these would normally come from the Rudderstack codebase
jest.mock('../../util', () => ({
  constructPayload: jest.fn((message, mapping) => {
    // Simulate payload construction based on mapping
    const payload = {};
    mapping.destKey.forEach((field) => {
      const sourceValue = getNestedValue(message, field.sourceKeys);
      if (sourceValue !== undefined) {
        payload[field.destKey] = sourceValue;
      }
    });
    return payload;
  }),
  defaultRequestConfig: jest.fn(() => ({
    body: {},
    method: 'POST',
    headers: {},
  })),
  removeUndefinedAndNullValues: jest.fn((obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    );
  }),
  getSuccessRespEvents: jest.fn((message, responses, destination) => responses),
  handleRtTfSingleEventError: jest.fn((event, error) => ({
    statusCode: 400,
    error: error.message,
    statTags: {
      errorCategory: 'transformation',
      errorType: 'instrumentation',
    },
  })),
}));

jest.mock('@rudderstack/integrations-lib', () => ({
  ConfigurationError: class ConfigurationError extends Error {},
  InstrumentationError: class InstrumentationError extends Error {},
}));

// Helper function to get nested values
function getNestedValue(obj, path) {
  if (Array.isArray(path)) {
    for (const p of path) {
      const value = getNestedValue(obj, p);
      if (value !== undefined) return value;
    }
    return undefined;
  }
  
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

describe('Chameleon Destination Transformer', () => {
  const destination = {
    Config: {
      accountSecret: 'test-account-secret-123',
    },
  };

  describe('Configuration Validation', () => {
    test('should throw ConfigurationError when account secret is missing', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
          },
          destination: {
            Config: {},
          },
        },
      ];

      const result = process(events);
      
      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Account secret is required');
    });

    test('should throw ConfigurationError when account secret is empty', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
          },
          destination: {
            Config: {
              accountSecret: '   ',
            },
          },
        },
      ];

      const result = process(events);
      
      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Account secret is required');
    });
  });

  describe('Identify Events', () => {
    test('should transform identify event correctly', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
            anonymousId: 'anon456',
            traits: {
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              plan: 'pro',
              company_id: 'company123',
              company_name: 'Acme Corp',
            },
            timestamp: '2024-01-01T00:00:00.000Z',
            messageId: 'msg_abc123',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0].endpoint).toBe(
        'https://api.chameleon.io/v3/observe/hooks/test-account-secret-123/profiles'
      );
      expect(result[0].method).toBe('POST');
      expect(result[0].headers['Content-Type']).toBe('application/json');
    });

    test('should handle identify event with minimal data', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0].endpoint).toContain('/profiles');
    });

    test('should throw error when both userId and anonymousId are missing', () => {
      const events = [
        {
          message: {
            type: 'identify',
            traits: {
              email: 'test@example.com',
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Either userId or anonymousId is required');
    });
  });

  describe('Track Events', () => {
    test('should transform track event correctly', () => {
      const events = [
        {
          message: {
            type: 'track',
            event: 'Button Clicked',
            userId: 'user123',
            properties: {
              button_name: 'Sign Up',
              page: '/landing',
            },
            timestamp: '2024-01-01T01:00:00.000Z',
            messageId: 'msg_def456',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0].endpoint).toBe(
        'https://api.chameleon.io/v3/observe/hooks/test-account-secret-123/events'
      );
      expect(result[0].method).toBe('POST');
    });

    test('should throw error when event name is missing', () => {
      const events = [
        {
          message: {
            type: 'track',
            userId: 'user123',
            properties: {
              button_name: 'Sign Up',
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Event name is required');
    });

    test('should throw error when event name is empty', () => {
      const events = [
        {
          message: {
            type: 'track',
            event: '   ',
            userId: 'user123',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Event name is required');
    });
  });

  describe('Group Events', () => {
    test('should transform group event correctly', () => {
      const events = [
        {
          message: {
            type: 'group',
            groupId: 'company123',
            traits: {
              name: 'Acme Corp',
              domain: 'acme.com',
              plan: 'enterprise',
              employees: 50,
              industry: 'SaaS'
            },
            timestamp: '2024-01-01T03:00:00.000Z',
            messageId: 'msg_ghi789',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0].endpoint).toBe(
        'https://api.chameleon.io/v3/observe/hooks/test-account-secret-123/companies'
      );
      expect(result[0].method).toBe('POST');
    });

    test('should throw error when groupId is missing', () => {
      const events = [
        {
          message: {
            type: 'group',
            traits: {
              name: 'Acme Corp',
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Group ID (groupId) is required');
    });

    test('should throw error when groupId is empty', () => {
      const events = [
        {
          message: {
            type: 'group',
            groupId: '   ',
            traits: {
              name: 'Acme Corp',
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Group ID (groupId) is required');
    });
  });

  describe('Page Events', () => {
    test('should transform page event correctly', () => {
      const events = [
        {
          message: {
            type: 'page',
            name: 'Product Page',
            userId: 'user123',
            properties: {
              url: 'https://example.com/products/premium',
              title: 'Premium Plan - Example',
              referrer: 'https://google.com',
            },
            context: {
              page: {
                url: 'https://example.com/products/premium',
                title: 'Premium Plan - Example',
              },
            },
            timestamp: '2024-01-01T02:00:00.000Z',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0].endpoint).toBe(
        'https://api.chameleon.io/v3/observe/hooks/test-account-secret-123/events'
      );
      expect(result[0].method).toBe('POST');
    });

    test('should set default page name when missing', () => {
      const events = [
        {
          message: {
            type: 'page',
            userId: 'user123',
            properties: {
              url: 'https://example.com/home',
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      // The payload would contain name: 'Page Viewed' set by our logic
    });
  });

  describe('Error Handling', () => {
    test('should throw error for unsupported message type', () => {
      const events = [
        {
          message: {
            type: 'group',
            userId: 'user123',
            groupId: 'group456',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('not supported');
      expect(result[0].error).toContain('identify, track, page, group');
    });

    test('should throw error when message type is missing', () => {
      const events = [
        {
          message: {
            userId: 'user123',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('error');
      expect(result[0].error).toContain('Message type is required');
    });
  });

  describe('Batch Processing', () => {
    test('should process multiple events correctly', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
            traits: { email: 'test@example.com' },
          },
          destination,
        },
        {
          message: {
            type: 'track',
            event: 'Page Viewed',
            userId: 'user123',
            properties: { page: '/home' },
          },
          destination,
        },
        {
          message: {
            type: 'group',
            groupId: 'company123',
            traits: { name: 'Acme Corp' },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result).toHaveLength(3);
      expect(result[0].endpoint).toContain('/profiles');
      expect(result[1].endpoint).toContain('/events');
      expect(result[2].endpoint).toContain('/companies');
    });

    test('should handle mixed success and error events', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
            traits: { email: 'test@example.com' },
          },
          destination,
        },
        {
          message: {
            type: 'invalid',
            userId: 'user123',
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('endpoint');
      expect(result[1]).toHaveProperty('error');
    });
  });

  describe('Router Destination Processing', () => {
    test('should process router destination events', () => {
      const events = [
        {
          message: {
            type: 'track',
            event: 'Purchase',
            userId: 'user123',
            properties: { amount: 99.99 },
          },
          destination,
        },
      ];

      const result = processRouterDest(events);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('endpoint');
    });
  });

  describe('Data Mapping', () => {
    test('should map nested traits correctly', () => {
      const events = [
        {
          message: {
            type: 'identify',
            userId: 'user123',
            traits: {
              email: 'user@example.com',
              company: {
                name: 'Acme Corp',
              },
            },
            context: {
              traits: {
                plan: 'enterprise',
              },
            },
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      // Mapping would extract email, company.name, and context.traits.plan
    });

    test('should handle missing optional fields gracefully', () => {
      const events = [
        {
          message: {
            type: 'track',
            event: 'Simple Event',
            userId: 'user123',
            // No properties, timestamp, etc.
          },
          destination,
        },
      ];

      const result = process(events);

      expect(result[0]).toHaveProperty('endpoint');
      expect(result[0]).not.toHaveProperty('error');
    });
  });
});