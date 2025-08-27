# Rudderstack-Chameleon Integration Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the bidirectional Rudderstack-Chameleon integration.

## Phase 1: Rudderstack Transformer (Priority 1)

### 1.1 Fork Rudderstack Repository

```bash
# Fork rudder-transformer repository on GitHub
# https://github.com/rudderlabs/rudder-transformer

# Clone your fork
git clone https://github.com/YOUR_USERNAME/rudder-transformer.git
cd rudder-transformer

# Create feature branch
git checkout -b feature/chameleon-destination
```

### 1.2 Add Transformer Files

Copy files from `./transformer/src/v0/destinations/chameleon/` to the forked repository:

```
rudder-transformer/
└── src/
    └── v0/
        └── destinations/
            └── chameleon/
                ├── config.js
                ├── transform.js
                └── data/
                    ├── ChameleonIdentify.json
                    ├── ChameleonTrack.json
                    └── ChameleonPage.json
```

### 1.3 Register Destination

Add to `src/v0/destinations/index.js`:

```javascript
const chameleon = require('./chameleon/transform');
// ... existing imports

module.exports = {
  // ... existing destinations
  chameleon,
};
```

### 1.4 Testing

Create test files in `__tests__/chameleon.test.js`:

```javascript
const { process } = require('../src/v0/destinations/chameleon/transform');

describe('Chameleon Destination', () => {
  const destination = {
    Config: {
      accountSecret: 'test-account-secret-123'
    }
  };

  describe('Identify Events', () => {
    test('should transform identify event correctly', () => {
      const events = [{
        message: {
          type: 'identify',
          userId: 'user123',
          traits: { email: 'test@example.com', plan: 'pro' }
        },
        destination
      }];

      const result = process(events);
      
      expect(result[0].endpoint).toContain('/profiles');
      expect(result[0].body.JSON.uid).toBe('user123');
      expect(result[0].body.JSON.email).toBe('test@example.com');
    });
  });

  describe('Track Events', () => {
    test('should transform track event correctly', () => {
      const events = [{
        message: {
          type: 'track',
          event: 'Button Clicked',
          userId: 'user123',
          properties: { button_name: 'Sign Up' }
        },
        destination
      }];

      const result = process(events);
      
      expect(result[0].endpoint).toContain('/events');
      expect(result[0].body.JSON.name).toBe('Button Clicked');
      expect(result[0].body.JSON.uid).toBe('user123');
    });
  });
});
```

### 1.5 Submit PR to Rudderstack

1. Run tests: `npm test`
2. Commit changes with clear message
3. Push to your fork
4. Create PR to `rudderlabs/rudder-transformer`
5. Include integration documentation

## Phase 2: Chameleon Dashboard Integration (Priority 2)

### 2.1 Dashboard Component

Add `IntegrationsRudderstack.jsx` to `chamaeleonidae/dashboard/src/pages/integrations/`:

```javascript
// File already created in ./dashboard/IntegrationsRudderstack.jsx
```

### 2.2 Integration Info

Update `dashboard/src/lib/integrationsInfo.jsx`:

```javascript
// Add the configuration from ./dashboard/integrationsInfo-addition.jsx
```

### 2.3 Route Configuration

Add route in `dashboard/src/AppRoutes/routes/integrations.jsx`:

```javascript
import IntegrationsRudderstack from "pages/integrations/IntegrationsRudderstack";

// Add to routes array:
{
  path: "/integrations/rudderstack",
  element: <IntegrationsRudderstack />,
}
```

### 2.4 Backend Support

The integration uses **existing webhook infrastructure**, so no backend changes needed:

- ✅ Webhook endpoints already exist
- ✅ Authentication already handled  
- ✅ Data processing already implemented

## Phase 3: Testing & Validation

### 3.1 Unit Testing

**Transformer Tests:**
```bash
cd rudder-transformer
npm install
npm test -- chameleon
```

**Dashboard Tests:**
```bash  
cd chamaeleonidae/dashboard
npm test -- IntegrationsRudderstack
```

### 3.2 Integration Testing

**Setup Test Environment:**

1. Create Rudderstack workspace
2. Add Chameleon as destination using transformer
3. Create test Chameleon account
4. Generate webhook token

**Test Scenarios:**

| Event Type | Test Data | Expected Result |
|------------|-----------|----------------|
| `identify` | User with email, traits | Profile created/updated in Chameleon |
| `track` | Custom event with properties | Event appears in Chameleon |
| `page` | Page view with URL | Page view event in Chameleon |
| Invalid | Missing account secret | Error response |

### 3.3 End-to-End Validation

**Data Flow Test:**
1. Send event from source → Rudderstack
2. Verify transformation in Rudderstack  
3. Check webhook delivery to Chameleon
4. Confirm data appears in Chameleon dashboard

**Bi-directional Test:**
1. Configure Chameleon outbound webhooks  
2. Send data: Rudderstack → Chameleon → Customer.io
3. Verify complete data pipeline

## Phase 4: Documentation

### 4.1 Help Articles

Create help articles:
- `rudderstack-integration-user-guide.md`
- Setup instructions for customers
- Troubleshooting guide

### 4.2 API Documentation  

Update Chameleon API docs:
- Add Rudderstack to webhook partners
- Document any Rudderstack-specific mappings

## Phase 5: Deployment Plan

### 5.1 Staging Deployment

1. Deploy dashboard changes to staging
2. Test with Rudderstack sandbox environment
3. Validate all webhook endpoints
4. Performance testing under load

### 5.2 Production Rollout

1. **Soft Launch**: Enable for beta customers only
2. **Monitor**: Track integration health, error rates  
3. **Gradual Rollout**: Enable for all customers
4. **Full Launch**: Marketing announcement

### 5.3 Monitoring & Alerts

Set up monitoring for:
- Webhook delivery success rates
- Transformation error rates  
- API response times
- Customer adoption metrics

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Rudderstack PR rejection | Engage early, follow contribution guidelines |
| Webhook rate limiting | Implement exponential backoff |
| Data schema changes | Versioned transformations |
| Customer data loss | Comprehensive testing, rollback plan |

### Operational Risks

| Risk | Mitigation |
|------|------------|
| Support burden | Clear documentation, troubleshooting guides |  
| Integration maintenance | Automated testing, monitoring |
| Customer expectations | Clear feature communication |

## Success Metrics

- **Technical**: 99%+ webhook delivery success
- **Adoption**: X% of eligible customers enable integration
- **Support**: <5% support ticket rate
- **Performance**: <500ms average response time

## Next Steps

1. **Week 1-2**: Implement transformer, submit Rudderstack PR
2. **Week 3**: Implement dashboard integration  
3. **Week 4**: Testing and validation
4. **Week 5**: Documentation and staging deployment
5. **Week 6**: Production rollout

Ready to begin implementation!