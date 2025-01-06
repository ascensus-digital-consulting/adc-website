const { Capture, Match, Template } = require('aws-cdk-lib/assertions');
const cdk = require('aws-cdk-lib');
const sns = require('aws-cdk-lib/aws-sns');
const { ADCWebInfraStack } = require('../../lib/ADCWebInfraStack');

describe('ADCWebInfraStack', () => {
  test('synthesizes the way we expect', () => {
    const app = new cdk.App();

    const context = {
      resourceNames: {
        aliasRecord: 'aliasRecordName',
        bucket: 'bucketName',
        cachePolicy: 'cachePolicyName',
        deployment: 'deploymentName',
        distribution: 'distributionName',
        stack: 'stackName',
        viewerRequestHandler: 'viewerRequestHandlerName',
      },
      domains: 'domains',
      host: 'host',
      hostedZoneId: 'hostedZoneId',
      zoneName: 'zoneName',
    };

    // Create the StateMachineStack.
    const stack = new ADCWebInfraStack(app, 'ADCWebInfraStack', {
      env: { context: context },
    });

    // Prepare the stack for assertions.
    const template = Template.fromStack(stack);
  });
});
