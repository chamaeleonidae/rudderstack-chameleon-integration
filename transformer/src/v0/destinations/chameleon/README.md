# Chameleon Destination

This destination allows you to send event data from RudderStack to [Chameleon](https://chameleon.io/).

## Getting Started

Once you have confirmed that the source platform supports sending events to Chameleon, please follow these steps:

1. From your [RudderStack dashboard](https://app.rudderstack.com/), add the source and select **Chameleon** from the list of destinations.

2. Assign a name to your destination and click **Continue**.

## Connection Settings

To successfully configure Chameleon as a destination, you need to configure the following settings:

### Account Secret

Enter your Chameleon account secret. You can generate this token from your [Chameleon dashboard](https://app.chameleon.io/settings/tokens) under Settings > API Tokens.

**This field is required and is used for API authentication via the X-Account-Secret header.**

## Supported Events

Chameleon accepts the following event types via its webhook API:

### Identify

The `identify` call lets you identify a user and associate them with their actions. It also lets you record any traits about them like their name, email, etc.

**Sample identify call:**
```javascript
rudderanalytics.identify("1hKOmRA4GRlm", {
  name: "Alex Keener",
  email: "alex@example.com",
  plan: "premium"
});
```

### Track  

The `track` call lets you record user events along with their associated properties.

**Sample track call:**
```javascript
rudderanalytics.track("Product Purchased", {
  product_id: "12345", 
  product_name: "Premium Plan",
  price: 99.99
});
```


### Group

The `group` call lets you associate an individual user with a group such as a company, organization, or account.

**Sample group call:**
```javascript
rudderanalytics.group("company_123", {
  name: "Acme Corp",
  plan: "enterprise",
  employees: 100
});
```

## Data Mapping

### Identify Events → User Profiles
- **Endpoint**: `https://api.chameleon.io/v3/observe/hooks/profiles`
- **Mapping**: `userId` → `uid`, `traits` → user properties
- **Company Linking**: `company_uid` and `company_name` from traits
- **Purpose**: Create/update user profiles in Chameleon

### Track Events → Custom Events
- **Endpoint**: `https://api.chameleon.io/v3/observe/hooks/events`  
- **Mapping**: `event` → `name`, `properties` → event properties
- **User Association**: Via `userId` (required) or `anonymousId`
- **Purpose**: Track events for goals, segmentation, and personalization

### Group Events → Companies
- **Endpoint**: `https://api.chameleon.io/v3/observe/hooks/companies`
- **Mapping**: `groupId` → `uid`, `traits` → company properties
- **Common Fields**: name, domain, plan, employees, industry
- **Purpose**: Create/update company/organization records

**Note**: Page events are not supported as Chameleon doesn't accept page tracking via their webhook API.

## Supported Identifiers

- **User ID**: Maps to Chameleon `uid` (primary identifier)
- **Anonymous ID**: Supported for anonymous user tracking
- **Group ID**: Maps to Chameleon company `uid`

## Technical Details

### Authentication
- **Method**: X-Account-Secret header
- **Token Source**: Chameleon Settings > API Tokens
- **Security**: Keep your account secret secure and private

### Data Processing
- **Delivery**: Real-time HTTP POST requests
- **Property Normalization**: Names converted to lowercase_underscore
- **Data Limits**: 768 bytes per scalar value (Chameleon limitation)
- **Error Handling**: Failed requests logged with specific error details

### Rate Limiting
Follows Chameleon's standard API rate limits for webhook endpoints. Events are processed synchronously for profiles/companies and asynchronously for events.

## Getting Help

If you come across any issues while configuring or using this destination, please feel free to [contact us](https://rudderstack.com/contact/) or start a conversation in our [Slack](https://resources.rudderstack.com/join-rudderstack-slack) community.