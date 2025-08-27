# Chameleon Destination

This destination allows you to send event data from RudderStack to [Chameleon](https://chameleon.io/).

## Getting Started

Once you have confirmed that the source platform supports sending events to Chameleon, please follow these steps:

1. From your [RudderStack dashboard](https://app.rudderstack.com/), add the source and select **Chameleon** from the list of destinations.

2. Assign a name to your destination and click **Continue**.

## Connection Settings

To successfully configure Chameleon as a destination, you need to configure the following settings:

### Account Secret

Enter your Chameleon account secret. You can find this in your Chameleon dashboard under integrations.

**This field is required.**

## Supported Events

Chameleon accepts the following event types:

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

### Page

The `page` call lets you record page views on your website along with the other relevant information about the page.

**Sample page call:**
```javascript
rudderanalytics.page("Home", {
  title: "Welcome to our site",
  url: "https://example.com/"
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

### Identify Events
- Maps to Chameleon user profiles endpoint: `/profiles`
- `userId` becomes `uid`
- `traits` mapped to user properties
- Company information extracted to `company_uid` and `company_name`

### Track Events  
- Maps to Chameleon events endpoint: `/events`
- `event` becomes `name`
- `properties` preserved as event properties
- User identification via `userId` or `anonymousId`

### Page Events
- Maps to Chameleon events endpoint: `/events` 
- Converted to track event with name "Page Viewed"
- URL and title extracted from properties or context

### Group Events
- Maps to Chameleon companies endpoint: `/companies`
- `groupId` becomes company `uid`
- `traits` mapped to company properties
- Common B2B fields like employees, domain, plan supported

## Supported Identifiers

- **User ID**: Maps to Chameleon `uid` (primary identifier)
- **Anonymous ID**: Supported for anonymous user tracking
- **Group ID**: Maps to Chameleon company `uid`

## Rate Limiting

This destination uses Chameleon's webhook endpoints which have standard rate limiting. Events are processed in real-time.

## Getting Help

If you come across any issues while configuring or using this destination, please feel free to [contact us](https://rudderstack.com/contact/) or start a conversation in our [Slack](https://resources.rudderstack.com/join-rudderstack-slack) community.