# Rudderstack-Chameleon Integration

This directory contains the implementation of the bidirectional Rudderstack-Chameleon integration.

## Architecture

### Phase 1: Outbound (Rudderstack Transformer)
- **Repository**: Fork of `rudder-transformer`
- **Location**: `/src/v0/destinations/chameleon/`
- **Purpose**: Transform Rudderstack events → Chameleon webhook format
- **Events Supported**: `identify`, `track`, `page`

### Phase 2: Inbound (Existing Webhook Infrastructure)
- **Endpoints**: Existing Chameleon webhook endpoints
  - `https://api.chameleon.io/v3/observe/hooks/{account_secret}/profiles`
  - `https://api.chameleon.io/v3/observe/hooks/{account_secret}/companies`
  - `https://api.chameleon.io/v3/observe/hooks/{account_secret}/events`
- **Purpose**: Receive data from Rudderstack → Chameleon system

### Phase 3: Dashboard Configuration
- **File**: `IntegrationsRudderstack.jsx`
- **Pattern**: Similar to Customer.io integration
- **Features**: Toggle destinations, show webhook URLs

## Implementation Status

- [x] Architecture designed
- [x] Existing patterns analyzed
- [ ] Transformer implementation
- [ ] Dashboard integration
- [ ] Testing and documentation