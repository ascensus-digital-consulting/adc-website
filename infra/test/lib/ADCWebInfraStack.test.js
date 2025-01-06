const { Capture, Match, Template } = require('aws-cdk-lib/assertions');
const cdk = require('aws-cdk-lib');
const sns = require('aws-cdk-lib/aws-sns');
const { ADCWebInfraStack } = require('../../lib/ADCWebInfraStack');

describe('ADCWebInfraStack', () => {
  let template;

  beforeAll(() => {
    const context = {
      resourceNames: {
        aliasRecord: 'ADCWevTestAliasRecordName',
        bucket: 'ADCWevTestBucketName',
        cachePolicy: 'ADCWevTestCachePolicyName',
        deployment: 'ADCWevTestDeploymentName',
        distribution: 'ADCWevTestDistributionName',
        stack: 'ADCWevTestStackName',
        viewerRequestHandler: 'vADCWevTestViewerRequestHandlerName',
      },
      domains: 'test1.domain.test, test2.domain.test',
      host: 'test1',
      hostedZoneId: 'AAAAA11111BBBBB22222',
      zoneName: 'domain.test',
    };
    const app = new cdk.App();
    const stack = new ADCWebInfraStack(app, 'ADCWebInfraStack', {
      env: { context: context },
    });
    template = Template.fromStack(stack);
  });

  test('bucket is created', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {});
    template.hasResourceProperties('AWS::S3::BucketPolicy', {});
  });

  test('distribution is created', () => {
    template.hasResourceProperties('AWS::CloudFront::CachePolicy', {});
    template.hasResourceProperties('AWS::CloudFront::Distribution', {});
    template.hasResourceProperties('AWS::CloudFront::Function', {});
    template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {});
  });

  test('deployment is created', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {});
    template.hasResourceProperties('AWS::IAM::Role', {});
    template.hasResourceProperties('AWS::Lambda::Function', {});
    template.hasResourceProperties('AWS::Lambda::LayerVersion', {});
  });

  test('dns record is created', () => {
    template.hasResourceProperties('AWS::Route53::RecordSet', {});
  });
});
