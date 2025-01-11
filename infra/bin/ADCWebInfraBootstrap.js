#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { ADCWebInfraBootstrapStack } from '../lib/ADCWebInfraBootstrapStack';

const app = new App();
const stack = new ADCWebInfraBootstrapStack(app, 'ADCWebInfraBootstrapStack');
