#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ADCWebInfraStack } = require('../lib/ADCWebInfraStack');
const { ADCUtils } = require('../lib/ADCUtils');

/*** Setup ***/

const app = new cdk.App();
const context = defineContext(app);

const props = defineStackProps(context, context);

/*** Create stack ***/
const stack = new ADCWebInfraStack(app, context.stackName, props);

/*** Supporting functions ***/
function defineContext(app) {
  const context = {
    aliasRecordName: app.node.tryGetContext('aliasRecordName'),
    bucketName: app.node.tryGetContext('bucketName'),
    cachePolicyName: app.node.tryGetContext('cachePolicyName'),
    deploymentName: app.node.tryGetContext('deploymentName'),
    distributionName: app.node.tryGetContext('distributionName'),
    domains: app.node.tryGetContext('domains'),
    host: app.node.tryGetContext('host') || '',
    stackName: app.node.tryGetContext('stackName'),
  };
  validateContext(context);
  return context;
}

function validateContext(context) {
  const undefValues = [];
  for (let key in context) {
    if (context[key] === undefined) {
      undefValues.push(key);
    }
  }
  if (undefValues.length > 0) {
    throw Error(
      `The following context values are undefined: ${undefValues.join(
        ', '
      )}. Please specify context values using the --context (or -c) switch when using cdk deploy.`
    );
  }
}

function defineStackProps(context, stackName) {
  const props = {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
      context: context,
      stackName: stackName,
    },
  };
  return props;
}
