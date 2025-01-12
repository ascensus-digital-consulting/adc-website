#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { WebAppBootstrapStack } from '../lib/WebAppBootstrapStack';

const app = new App();
const stack = new WebAppBootstrapStack(app, 'ADCWebInfraBootstrapStack');
