# Rudderstack Chameleon Transformer

This transformer enables sending data from Rudderstack to Chameleon's webhook endpoints.

## Supported Events

### Identify
Maps user identification data to Chameleon user profiles.

**Input**: Rudderstack identify event
```json
{
  "type": "identify",
  "userId": "user123",
  "traits": {
    "email": "user@example.com",
    "plan": "pro",
    "company_id": "company456"
  }
}
```

**Output**: Chameleon profile webhook
```json
{
  "uid": "user123", 
  "email": "user@example.com",
  "traits": {
    "plan": "pro"
  },
  "company_uid": "company456"
}
```

### Track  
Maps custom events to Chameleon event tracking.

**Input**: Rudderstack track event
```json
{
  "type": "track",
  "event": "Button Clicked",
  "userId": "user123",
  "properties": {
    "button_name": "Sign Up",
    "page": "/landing"
  }
}
```

**Output**: Chameleon event webhook
```json
{
  "name": "Button Clicked",
  "uid": "user123",
  "properties": {
    "button_name": "Sign Up", 
    "page": "/landing"
  }
}
```

### Page
Maps page views to Chameleon event tracking.

**Input**: Rudderstack page event
```json
{
  "type": "page",
  "name": "Home Page",
  "userId": "user123",
  "properties": {
    "url": "https://example.com/",
    "title": "Welcome"
  }
}
```

**Output**: Chameleon event webhook  
```json
{
  "name": "Page Viewed",
  "uid": "user123",
  "url": "https://example.com/",
  "title": "Welcome",
  "properties": {
    "url": "https://example.com/",
    "title": "Welcome"
  }
}
```

### Group
Maps group data to Chameleon company records.

**Input**: Rudderstack group event
```json
{
  "type": "group",
  "groupId": "company123",
  "traits": {
    "name": "Acme Corp",
    "domain": "acme.com",
    "plan": "enterprise",
    "employees": 50,
    "industry": "SaaS"
  }
}
```

**Output**: Chameleon company webhook
```json
{
  "uid": "company123",
  "name": "Acme Corp",
  "domain": "acme.com",
  "plan": "enterprise",
  "number_of_employees": 50,
  "industry": "SaaS"
}
```

## Configuration

### Required Settings
- **Account Secret**: Your Chameleon account secret for webhook authentication

### Webhook Endpoints
The transformer sends data to these Chameleon endpoints:
- **Profiles**: `https://api.chameleon.io/v3/observe/hooks/{accountSecret}/profiles`
- **Events**: `https://api.chameleon.io/v3/observe/hooks/{accountSecret}/events`
- **Companies**: `https://api.chameleon.io/v3/observe/hooks/{accountSecret}/companies`

## Installation

1. Fork the `rudder-transformer` repository
2. Copy the `chameleon` directory to `src/v0/destinations/`
3. Submit PR to Rudderstack for official integration

## Testing

```bash
npm test
```

## Error Handling

The transformer handles:
- Missing account secret → `ConfigurationError`
- Unsupported message types → `InstrumentationError`
- Missing required fields (userId/groupId/event name) → `InstrumentationError`
- Invalid payloads → Graceful degradation

## Limits

- Follows Chameleon's data limits (768 bytes per scalar value)
- Property names normalized to lowercase and underscored
- Arrays and nested objects supported