// Add this to the integrationsInfo array in dashboard/src/lib/integrationsInfo.jsx

{
  id: "rudderstack",
  name: "Rudderstack",
  description: "Sync data between Chameleon and all of your other Rudderstack-connected tools",
  href: "https://help.chameleon.io/en/articles/rudderstack-integration-user-guide", // TODO: Create this help article
  enabled: (rudderstack = null) => (rudderstack ? rudderstack.dest_enabled : null),
  hasSyncError: () => undefined, // integrations that don't check for syncError should return undefined
  routePath: "/integrations/rudderstack",
  Component: () => wrapRouteElement(IntegrationsRudderstack, { pageTitle: "Rudderstack" }),
  categories: [CATEGORIES.all.id, CATEGORIES.dataAndAnalytics.id, CATEGORIES.crmAndAutomation.id],
}