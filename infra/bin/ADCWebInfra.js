#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ADCWebInfraStack } = require('../lib/ADCWebInfraStack');

/*** Setup ***/
const app = new cdk.App();
const context = defineContext(app);
const names = context.resourceNames;
const props = defineStackProps(context);

/*** Create stack ***/
const stack = new ADCWebInfraStack(app, names.stack, props);

////////////////////////////////////////////////////////////////////////
//
// Obtain all required context values provided with the cdk command
//
////////////////////////////////////////////////////////////////////////
function defineContext(app) {
  const context = {
    resourceNames: {
      aliasRecord: app.node.tryGetContext('aliasRecordName'),
      bucket: app.node.tryGetContext('bucketName'),
      cachePolicy: app.node.tryGetContext('cachePolicyName'),
      deployment: app.node.tryGetContext('deploymentName'),
      distribution: app.node.tryGetContext('distributionName'),
      stack: app.node.tryGetContext('stackName'),
      viewerRequestHandler: app.node.tryGetContext('viewerRequestHandlerName'),
    },
    domains: app.node.tryGetContext('domains'),
    host: app.node.tryGetContext('host') || '',
    hostedZoneId: app.node.tryGetContext('hostedZoneId'),
    zoneName: app.node.tryGetContext('zoneName'),
  };
  validateContext(context);
  return context;
}

////////////////////////////////////////////////////////////////////////
//
// Validate that all of the required values are defined
//
////////////////////////////////////////////////////////////////////////
function validateContext(context) {
  const undefContextValues = Object.entries(context).filter(
    (entry) => entry[1] === undefined
  );
  const undefNameValues = Object.entries(context.resourceNames).filter(
    (entry) => entry[1] === undefined
  );
  const undefAllValues = undefContextValues
    .concat(undefNameValues)
    .map((entry) => entry[0]);

  if (undefAllValues.length > 0) {
    throw Error(
      `The following context values are undefined: ${undefAllValues.join(
        ', '
      )}. Please specify context values using the --context (or -c) switch when using cdk deploy.`
    );
  }
}

////////////////////////////////////////////////////////////////////////
//
// Define the properties to provide to the stack
//
////////////////////////////////////////////////////////////////////////
function defineStackProps(context, stackName) {
  const props = {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
      context: context,
      stackName: context.resourceNames.stack,
    },
  };
  return props;
}
