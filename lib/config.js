/**
 * Create and export configuration variables
 */

// Continaer for all the environments
const environments = {};

// Staging (default environment)
environments.staging = {
  envName: 'Staging',
  httpPort: 3000,
  httpsPort: 3001,
  hashingSecret: 'abcdefg',
  maxChecks: 5
};

// Production environment
environments.production = {
  envName: 'Production',
  httpPort: 5000,
  httpsPort: 5001,
  hashingSecret: 'abcdefg',
  maxChecks: 5
};

// Determine which env was passed as command-lint argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// Check that the current environemtn is one of the environment above.
var environmentToExport = typeof(environments[currentEnvironment]) === 'object' ? environments[currentEnvironment] : environments.staging;

// Export module
module.exports = environmentToExport;