const { getMappingConfig } = require('../../util');

const BASE_ENDPOINT = 'https://api.chameleon.io/v3/observe/hooks';

const ConfigCategory = {
  IDENTIFY: {
    name: 'ChameleonIdentify',
  },
  TRACK: {
    name: 'ChameleonTrack',
  },
  PAGE: {
    name: 'ChameleonPage',
  },
  GROUP: {
    name: 'ChameleonGroup',
  },
};

const mappingConfig = getMappingConfig(ConfigCategory, __dirname);

const getEndpoint = (accountSecret, type) => {
  const endpoints = {
    identify: 'profiles',
    track: 'events', 
    page: 'events',
    group: 'companies'
  };
  
  return `${BASE_ENDPOINT}/${accountSecret}/${endpoints[type]}`;
};

module.exports = {
  ConfigCategory,
  mappingConfig,
  getEndpoint,
};