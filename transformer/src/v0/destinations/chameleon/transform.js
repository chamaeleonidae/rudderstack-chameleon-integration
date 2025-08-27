const { 
  ConfigurationError,
  InstrumentationError,
} = require('@rudderstack/integrations-lib');
const { 
  constructPayload, 
  defaultRequestConfig, 
  removeUndefinedAndNullValues,
  getSuccessRespEvents,
  handleRtTfSingleEventError,
} = require('../../util');
const { ConfigCategory, mappingConfig, getEndpoint } = require('./config');

/**
 * Build response for request
 * @param {Object} payload - Transformed payload
 * @param {String} endpoint - Destination endpoint
 * @param {Object} destination - Destination configuration
 * @returns {Object} Response object
 */
const buildResponse = (payload, endpoint, destination) => {
  const response = defaultRequestConfig();
  
  response.endpoint = endpoint;
  response.body.JSON = removeUndefinedAndNullValues(payload);
  response.method = 'POST';
  response.headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'RudderStack-Chameleon-Integration/1.0.0'
  };
  
  return response;
};

/**
 * Validate required configuration
 * @param {Object} destination - Destination configuration
 * @throws {ConfigurationError} When account secret is missing
 */
const validateConfig = (destination) => {
  const { accountSecret } = destination.Config;
  
  if (!accountSecret || accountSecret.trim() === '') {
    throw new ConfigurationError('Account secret is required');
  }
};

/**
 * Process identify events
 * @param {Object} message - Rudderstack event message
 * @param {Object} destination - Destination configuration  
 * @returns {Object} Response object
 */
const processIdentify = (message, destination) => {
  validateConfig(destination);
  
  const { accountSecret } = destination.Config;
  const payload = constructPayload(message, mappingConfig[ConfigCategory.IDENTIFY.name]);
  
  // Validate required fields
  if (!payload.uid && !message.anonymousId) {
    throw new InstrumentationError('Either userId or anonymousId is required for identify events');
  }
  
  const endpoint = getEndpoint(accountSecret, 'identify');
  return buildResponse(payload, endpoint, destination);
};

/**
 * Process track events  
 * @param {Object} message - Rudderstack event message
 * @param {Object} destination - Destination configuration
 * @returns {Object} Response object
 */
const processTrack = (message, destination) => {
  validateConfig(destination);
  
  const { accountSecret } = destination.Config;
  const payload = constructPayload(message, mappingConfig[ConfigCategory.TRACK.name]);
  
  // Validate required fields
  if (!payload.name || payload.name.trim() === '') {
    throw new InstrumentationError('Event name is required for track events');
  }
  
  const endpoint = getEndpoint(accountSecret, 'track');
  return buildResponse(payload, endpoint, destination);
};

/**
 * Process page events
 * @param {Object} message - Rudderstack event message  
 * @param {Object} destination - Destination configuration
 * @returns {Object} Response object
 */
const processPage = (message, destination) => {
  validateConfig(destination);
  
  const { accountSecret } = destination.Config;
  const payload = constructPayload(message, mappingConfig[ConfigCategory.PAGE.name]);
  
  // Set event name for page views if not provided
  if (!payload.name || payload.name.trim() === '') {
    payload.name = 'Page Viewed';
  }
  
  const endpoint = getEndpoint(accountSecret, 'page');
  return buildResponse(payload, endpoint, destination);
};

/**
 * Process group events
 * @param {Object} message - Rudderstack event message  
 * @param {Object} destination - Destination configuration
 * @returns {Object} Response object
 */
const processGroup = (message, destination) => {
  validateConfig(destination);
  
  const { accountSecret } = destination.Config;
  const payload = constructPayload(message, mappingConfig[ConfigCategory.GROUP.name]);
  
  // Validate required fields
  if (!payload.uid || payload.uid.trim() === '') {
    throw new InstrumentationError('Group ID (groupId) is required for group events');
  }
  
  const endpoint = getEndpoint(accountSecret, 'group');
  return buildResponse(payload, endpoint, destination);
};

/**
 * Process a single event
 * @param {Object} message - Event message
 * @param {Object} destination - Destination configuration
 * @returns {Object} Response object
 */
const processSingleEvent = (message, destination) => {
  const messageType = message.type?.toLowerCase();
  
  if (!messageType) {
    throw new InstrumentationError('Message type is required');
  }
  
  switch (messageType) {
    case 'identify':
      return processIdentify(message, destination);
    case 'track':
      return processTrack(message, destination);
    case 'page':
      return processPage(message, destination);
    case 'group':
      return processGroup(message, destination);
    default:
      throw new InstrumentationError(
        `Message type "${messageType}" is not supported. Supported types: identify, track, page, group`
      );
  }
};

/**
 * Main processing function for single events
 * @param {Array} events - Array of events to process
 * @returns {Array} Array of response objects
 */
const process = (events) => {
  const responses = [];
  
  events.forEach((event) => {
    try {
      const { message, destination } = event;
      const response = processSingleEvent(message, destination);
      responses.push(response);
    } catch (error) {
      const errRespEvent = handleRtTfSingleEventError(event, error, {});
      responses.push(errRespEvent);
    }
  });
  
  return responses;
};

/**
 * Router destination processing function
 * @param {Array} events - Array of events with routing information
 * @returns {Array} Array of response objects
 */
const processRouterDest = (events) => {
  const responses = [];
  
  events.forEach((event) => {
    try {
      const { message, destination } = event;
      const response = processSingleEvent(message, destination);
      
      // Add success response event
      const successResponseEvent = getSuccessRespEvents(
        message,
        [response],
        destination,
        true
      );
      
      responses.push(...successResponseEvent);
    } catch (error) {
      const errRespEvent = handleRtTfSingleEventError(event, error, {});
      responses.push(errRespEvent);
    }
  });
  
  return responses;
};

module.exports = { 
  process, 
  processRouterDest 
};