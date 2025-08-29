# Rudderstack Chameleon Destination

This destination enables sending data from Rudderstack to Chameleon via their webhook API endpoints.

## Supported Events

### Identify
Creates or updates user profiles in Chameleon.

**Rudderstack Event**:
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

**Sent to Chameleon**:
```json
{
  "uid": "user123", 
  "email": "user@example.com",
  "plan": "pro",
  "company_uid": "company456"
}
```

### Track  
Sends custom events to Chameleon for goal tracking and segmentation.

**Rudderstack Event**:
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

**Sent to Chameleon**:
```json
{
  "name": "Button Clicked",
  "uid": "user123",
  "button_name": "Sign Up", 
  "page": "/landing"
}
```


### Group
Creates or updates company/organization records in Chameleon.

**Rudderstack Event**:
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

**Sent to Chameleon**:
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
- **Account Secret**: Your Chameleon account secret for API authentication

### API Endpoints
The destination sends data to these Chameleon webhook endpoints:
- **Profiles**: `https://api.chameleon.io/v3/observe/hooks/profiles`
- **Events**: `https://api.chameleon.io/v3/observe/hooks/events`
- **Companies**: `https://api.chameleon.io/v3/observe/hooks/companies`

Authentication is handled via the `X-Account-Secret` header.

## Installation

1. Fork the `rudder-transformer` repository
2. Copy the `chameleon` directory to `src/v0/destinations/`
3. Submit PR to Rudderstack for official integration

## Testing

```bash
npm test
```

## Error Handling

The destination handles:
- Missing account secret → `ConfigurationError`
- Unsupported event types → `InstrumentationError`
- Missing required fields (userId/groupId/event name) → `InstrumentationError`
- Invalid payloads → Graceful degradation

## Data Limits

- Up to 768 bytes per scalar value
- Property names normalized to lowercase_underscore format
- Arrays and nested objects supported
- Event names normalized and case-insensitive