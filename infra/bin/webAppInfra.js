#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { WebAppStack } = require('../lib/WebAppStack');

/*** Setup ***/
const scope = new cdk.App();
const props = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
    context: {
      stackId: scope.node.tryGetContext('stackId'),
      host: scope.node.tryGetContext('host') || '',
      zoneName: scope.node.tryGetContext('zoneName'),
    },
  },
};
const id = `${props.env.context.stackId}Stack`;

/*** Create stack ***/
const stack = new WebAppStack(scope, id, props);
