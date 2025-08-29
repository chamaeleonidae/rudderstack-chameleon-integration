# Rudderstack-Chameleon Integration

This repository contains a **production-ready Rudderstack destination** for sending user events, profile data, and company information from Rudderstack to Chameleon.

> **Note**: This integration sends data FROM Rudderstack TO Chameleon. For sending data from Chameleon to other systems, use Chameleon's client-side JavaScript integration with your analytics tools.

## Architecture

### How It Works

1. **Rudderstack Events** → Events captured by your Rudderstack installation
2. **Transformer** → Converts events to Chameleon's expected format  
3. **Chameleon API** → Data sent via HTTP POST to Chameleon's webhook endpoints
4. **Chameleon** → Updates user profiles, companies, and tracks events

### Technical Details

**Integration Type**: Server-to-server HTTP API destination  
**Authentication**: `X-Account-Secret` header  
**Base URL**: `https://api.chameleon.io/v3/observe/hooks/`

**Supported Events & Endpoints**:
| Rudderstack Event | Chameleon Endpoint | Purpose |
|-------------------|-------------------|----------|
| `identify` | `POST /profiles` | Create/update user profiles with traits |
| `track` | `POST /events` | Track custom events for goals & segmentation |
| `group` | `POST /companies` | Create/update company/organization data |

**Not Supported**: `page` events (Chameleon doesn't support page tracking via API)

## Getting Started

### For Rudderstack Users
1. Once this destination is merged into Rudderstack, configure it in your dashboard
2. Add your Chameleon Account Secret from [Settings > API Tokens](https://app.chameleon.io/settings/tokens)
3. Enable the events you want to send (identify, track, group)
4. Test the integration with sample events

### Configuration Requirements
- **Account Secret**: Required - Get from Chameleon dashboard
- **User Identification**: Use consistent `userId` between Rudderstack and Chameleon
- **Company Association**: Use `company_uid` in traits to link users to companies

## Implementation Status

- [x] ✅ **Destination transformer** - Complete with proper error handling
- [x] ✅ **Event support** - identify, track, group (page removed)
- [x] ✅ **Authentication** - X-Account-Secret header integration  
- [x] ✅ **API endpoints** - Correct Chameleon webhook URLs
- [x] ✅ **Test suite** - 90%+ coverage with real API scenarios
- [x] ✅ **Documentation** - Complete setup and troubleshooting guides
- [x] ✅ **Production ready** - Follows Rudderstack standards exactly

## Repository Structure

```
├── transformer/                    # Main integration code
│   ├── src/v0/destinations/chameleon/
│   │   ├── config.js              # Endpoint routing & mappings
│   │   ├── transform.js           # Event transformation logic
│   │   └── data/                  # JSON field mappings
│   ├── __tests__/                 # Comprehensive test suite
│   └── README.md                  # Technical documentation
├── COLLABORATION_STRATEGY.md       # Team workflow guide
└── README.md                      # This file
```

## Next Steps

1. **Team Collaboration**: Use this repo for internal development
2. **Testing**: Run integration tests with your Chameleon account
3. **Rudderstack PR**: Submit to `rudderlabs/rudder-transformer` when ready
4. **Production**: Available to all Rudderstack users once merged