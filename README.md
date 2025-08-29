# Rudderstack-Chameleon Integration

This repository contains a Rudderstack destination for sending data to Chameleon.

## Architecture

### Rudderstack Destination
- **Repository**: Fork of `rudderlabs/rudder-transformer`
- **Location**: `/src/v0/destinations/chameleon/`
- **Purpose**: Transform Rudderstack events and send to Chameleon's webhook API
- **Events Supported**: `identify`, `track`, `group`
- **Authentication**: `X-Account-Secret` header

### API Integration
- **Base URL**: `https://api.chameleon.io/v3/observe/hooks/`
- **Endpoints**:
  - `POST /profiles` - Create/update user profiles
  - `POST /events` - Track custom events  
  - `POST /companies` - Create/update companies
- **Data Flow**: Rudderstack → Chameleon (one-way)

## Implementation Status

- [x] Destination transformer implemented
- [x] All supported event types (identify, track, group)
- [x] Comprehensive test suite
- [x] Documentation complete
- [x] Production-ready for Rudderstack PR submission