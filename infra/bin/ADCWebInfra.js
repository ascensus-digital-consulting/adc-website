#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { ADCWebInfraStack } = require('../lib/ADCWebInfraStack');

/*** Setup ***/
const app = new cdk.App();
const props = ADCWebInfraStack.configureStackProps(app);

/*** Create stack ***/
const stack = new ADCWebInfraStack(
  app,
  props.env.context.resourceNames.stack,
  props
);
