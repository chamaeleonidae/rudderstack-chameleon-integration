# Rudderstack-Chameleon Integration Testing Scenarios

## Test Environment Setup

### Prerequisites
- Rudderstack workspace with transformer access
- Chameleon test account  
- Valid webhook tokens
- Test data sets

### Configuration
```json
{
  "rudderstack_config": {
    "writeKey": "test-write-key-123",
    "dataPlaneUrl": "https://test-data-plane.rudderstack.com"
  },
  "chameleon_config": {
    "accountSecret": "test-account-secret-456", 
    "webhookEndpoints": {
      "profiles": "https://api.chameleon.io/v3/observe/hooks/test-account-secret-456/profiles",
      "events": "https://api.chameleon.io/v3/observe/hooks/test-account-secret-456/events",
      "companies": "https://api.chameleon.io/v3/observe/hooks/test-account-secret-456/companies"
    }
  }
}
```

## Unit Test Scenarios

### Transformer Tests

#### 1. Identify Event Transformation

**Input:**
```javascript
{
  message: {
    type: 'identify',
    userId: 'user_123',
    anonymousId: 'anon_456',
    traits: {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe', 
      plan: 'enterprise',
      company_id: 'company_789',
      company_name: 'Acme Corp'
    },
    timestamp: '2024-01-01T00:00:00.000Z',
    messageId: 'msg_abc123'
  },
  destination: {
    Config: { accountSecret: 'test-secret' }
  }
}
```

**Expected Output:**
```javascript
{
  endpoint: 'https://api.chameleon.io/v3/observe/hooks/test-secret/profiles',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'RudderStack-Chameleon-Integration/1.0.0'
  },
  body: {
    JSON: {
      uid: 'user_123',
      email: 'john.doe@example.com',
      anonymousId: 'anon_456',
      traits: {
        firstName: 'John',
        lastName: 'Doe',
        plan: 'enterprise'
      },
      company_uid: 'company_789',
      company_name: 'Acme Corp',
      timestamp: '2024-01-01T00:00:00.000Z',
      messageId: 'msg_abc123'
    }
  }
}
```

#### 2. Track Event Transformation

**Input:**
```javascript
{
  message: {
    type: 'track',
    event: 'Product Purchased',
    userId: 'user_123',
    properties: {
      product_id: 'prod_456',
      product_name: 'Premium Plan',
      price: 99.99,
      currency: 'USD',
      category: 'subscription'
    },
    timestamp: '2024-01-01T01:00:00.000Z'
  },
  destination: {
    Config: { accountSecret: 'test-secret' }
  }
}
```

**Expected Output:**
```javascript
{
  endpoint: 'https://api.chameleon.io/v3/observe/hooks/test-secret/events',
  method: 'POST',
  body: {
    JSON: {
      name: 'Product Purchased',
      uid: 'user_123',
      properties: {
        product_id: 'prod_456',
        product_name: 'Premium Plan',
        price: 99.99,
        currency: 'USD',
        category: 'subscription'
      },
      timestamp: '2024-01-01T01:00:00.000Z'
    }
  }
}
```

#### 3. Page Event Transformation

**Input:**
```javascript
{
  message: {
    type: 'page',
    name: 'Product Page',
    userId: 'user_123',
    properties: {
      url: 'https://example.com/products/premium',
      title: 'Premium Plan - Example',
      referrer: 'https://google.com'
    }
  },
  destination: {
    Config: { accountSecret: 'test-secret' }
  }
}
```

**Expected Output:**
```javascript
{
  endpoint: 'https://api.chameleon.io/v3/observe/hooks/test-secret/events',
  body: {
    JSON: {
      name: 'Page Viewed',
      uid: 'user_123',
      url: 'https://example.com/products/premium',
      title: 'Premium Plan - Example',
      properties: {
        url: 'https://example.com/products/premium',
        title: 'Premium Plan - Example',
        referrer: 'https://google.com'
      }
    }
  }
}
```

### Error Handling Tests

#### 1. Missing Account Secret

**Input:**
```javascript
{
  message: { type: 'identify', userId: 'user_123' },
  destination: { Config: {} }
}
```

**Expected:** `ConfigurationError: Account secret is required`

#### 2. Unsupported Message Type

**Input:**
```javascript
{
  message: { type: 'group', userId: 'user_123' },
  destination: { Config: { accountSecret: 'test' } }
}
```

**Expected:** `InstrumentationError: Message type "group" is not supported`

#### 3. Missing Message Type

**Input:**
```javascript
{
  message: { userId: 'user_123' },
  destination: { Config: { accountSecret: 'test' } }
}
```

**Expected:** `InstrumentationError: Message type is required`

## Integration Test Scenarios

### End-to-End Data Flow

#### Test Case 1: User Journey Tracking

**Scenario:** New user signs up and makes first purchase

**Steps:**
1. Send `identify` event with user details
2. Send `page` event for signup page view
3. Send `track` event for signup completion  
4. Send `track` event for purchase

**Validation Points:**
- User profile created in Chameleon
- All events appear in user timeline
- Properties correctly mapped
- Timestamps preserved

#### Test Case 2: Anonymous to Identified User

**Scenario:** Anonymous user becomes identified

**Steps:**
1. Send `track` event with only `anonymousId`
2. Send `identify` event linking `userId` and `anonymousId`  
3. Send additional `track` events with `userId`

**Validation Points:**
- Anonymous events linked to identified user
- User profile merged correctly
- Event history preserved

### Performance Testing

#### Load Test Scenarios

| Scenario | Events/Second | Duration | Expected Result |
|----------|---------------|----------|----------------|
| Light Load | 10 events/sec | 5 minutes | 100% success rate |
| Medium Load | 100 events/sec | 10 minutes | >99% success rate |  
| Heavy Load | 1000 events/sec | 5 minutes | >95% success rate |
| Spike Test | 5000 events/sec | 1 minute | Graceful degradation |

#### Data Volume Tests

| Test Case | Volume | Description |
|-----------|--------|-------------|
| Large Properties | 10KB per event | Test property size limits |
| Many Properties | 100 properties | Test property count limits |
| Nested Objects | 5 levels deep | Test object nesting |
| Array Values | 1000 items | Test array handling |

### Error Recovery Testing

#### Network Issues

1. **Intermittent Connection**
   - Simulate network drops during webhook delivery
   - Verify retry mechanisms work
   - Check data integrity

2. **Slow Responses** 
   - Add artificial delays to Chameleon endpoints
   - Test timeout handling
   - Verify no data loss

3. **Rate Limiting**
   - Exceed Chameleon rate limits
   - Verify exponential backoff
   - Test queuing behavior

#### Data Quality Issues

1. **Invalid Data Types**
   - Send strings where numbers expected
   - Test type coercion
   - Verify error messages

2. **Missing Required Fields**
   - Omit userId from events
   - Test validation logic
   - Verify graceful failure

3. **Malformed JSON**
   - Send invalid JSON payloads
   - Test parsing error handling
   - Verify system stability

## Dashboard Testing

### UI Component Tests

#### 1. Integration Toggle

**Test Cases:**
- Enable/disable integration toggle
- Loading states during API calls
- Error states for failed requests
- Success confirmation messages

#### 2. Webhook URLs Display

**Test Cases:**
- Correct URL generation with tokens
- Copy-to-clipboard functionality
- Token masking/revealing
- URL regeneration

#### 3. Configuration Validation

**Test Cases:**
- Required field validation
- Format validation (URLs, tokens)
- Real-time validation feedback
- Form submission handling

### Accessibility Testing

- Screen reader compatibility
- Keyboard navigation
- Color contrast compliance  
- Focus management

## User Acceptance Testing

### Customer Scenarios

#### 1. First-Time Setup

**User Story:** "As a new Chameleon customer, I want to connect Rudderstack to send user data to Chameleon"

**Test Steps:**
1. Navigate to integrations page
2. Find and select Rudderstack integration
3. Follow setup instructions
4. Test data flow
5. Verify data appears in Chameleon

**Success Criteria:**
- Clear setup instructions
- Data flows within 5 minutes
- No technical errors

#### 2. Troubleshooting

**User Story:** "As a customer, when my integration stops working, I want to quickly identify and fix the issue"

**Test Steps:**
1. Simulate common issues (invalid token, rate limits)
2. Check error messaging in dashboard
3. Follow troubleshooting guide
4. Resolve issue

**Success Criteria:**
- Clear error messages
- Actionable troubleshooting steps
- Issue resolved within 15 minutes

## Monitoring & Alerting Tests

### Health Check Endpoints

Test monitoring endpoints return correct status:
- Integration health status
- Webhook delivery rates  
- Error rates by type
- Performance metrics

### Alert Scenarios

Verify alerts trigger correctly for:
- High error rates (>5%)
- Webhook delivery failures
- Performance degradation
- Configuration issues

## Test Data Sets

### Realistic User Data

```json
{
  "users": [
    {
      "userId": "user_001",
      "traits": {
        "email": "sarah.johnson@techstartup.com",
        "firstName": "Sarah", 
        "lastName": "Johnson",
        "title": "Product Manager",
        "company": "TechStartup Inc",
        "plan": "enterprise",
        "mrr": 299,
        "signupDate": "2024-01-15"
      }
    }
  ],
  "events": [
    {
      "event": "Feature Used",
      "properties": {
        "feature_name": "Advanced Analytics", 
        "usage_count": 5,
        "session_duration": 1200
      }
    }
  ]
}
```

### Edge Case Data

```json
{
  "edge_cases": {
    "special_characters": "中文测试üñíçødé🚀",
    "large_number": 999999999999999999,
    "empty_values": {
      "null_value": null,
      "empty_string": "",
      "empty_object": {},
      "empty_array": []
    },
    "deeply_nested": {
      "level1": {
        "level2": {
          "level3": {
            "value": "deep_value"
          }
        }
      }
    }
  }
}
```

## Test Automation

### Continuous Integration

```yaml
# .github/workflows/test-integration.yml
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run Transformer Tests
        run: npm test -- chameleon
      - name: Run Dashboard Tests  
        run: npm test -- IntegrationsRudderstack
      - name: Integration Test
        run: npm run test:integration
```

### Test Scripts

```bash
#!/bin/bash
# scripts/test-integration.sh

echo "Starting integration tests..."

# Setup test environment
docker-compose -f docker-compose.test.yml up -d

# Run test scenarios
npm run test:unit
npm run test:integration  
npm run test:e2e

# Cleanup
docker-compose -f docker-compose.test.yml down

echo "Tests completed!"
```

Ready for comprehensive testing across all scenarios!