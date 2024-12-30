#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ADCWebInfraStack } = require('../lib/ADCWebInfraStack');
const { ADCUtils } = require('../lib/ADCUtils');

const app = new cdk.App();
const host = app.node.tryGetContext('host');
const stackName = `InfraWeb${ADCUtils.capitalize(host)}Stack`;
const stack = new ADCWebInfraStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
    host: host,
  },
  stackName: stackName,
});
