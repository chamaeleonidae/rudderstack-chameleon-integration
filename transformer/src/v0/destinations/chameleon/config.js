const { getMappingConfig } = require('../../util');

const BASE_ENDPOINT = 'https://api.chameleon.io/v3/observe/hooks';

const ConfigCategory = {
  IDENTIFY: {
    name: 'ChameleonIdentify',
  },
  TRACK: {
    name: 'ChameleonTrack',
  },
  GROUP: {
    name: 'ChameleonGroup',
  },
};

const mappingConfig = getMappingConfig(ConfigCategory, __dirname);

const getEndpoint = (type) => {
  const endpoints = {
    identify: 'profiles',
    track: 'events',
    group: 'companies'
  };
  
  return `${BASE_ENDPOINT}/${endpoints[type]}`;
};

module.exports = {
  ConfigCategory,
  mappingConfig,
  getEndpoint,
};