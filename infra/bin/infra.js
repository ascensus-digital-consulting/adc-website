#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { InfraStack } = require('../lib/infra-stack');

const app = new cdk.App();
const stack = new InfraStack(app, 'InfraStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
