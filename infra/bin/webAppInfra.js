#!/usr/bin/env node
const cdk = require('aws-cdk-lib');
const { WebAppStack } = require('../lib/WebAppStack');

/*** Setup ***/
const app = new cdk.App();
const props = WebAppStack.configureStackProps(app);
const id = props.env.context.resourceNames.stack;

/*** Create stack ***/
const stack = new WebAppStack(app, id, props);
