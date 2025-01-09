#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const {
  ADCWebInfraBootstrapStack,
} = require('../lib/ADCWebInfraBootstrapStack');

const app = new cdk.App();
const stack = new ADCWebInfraBootstrapStack(app, 'ADCWebInfraBootstrapStack');
