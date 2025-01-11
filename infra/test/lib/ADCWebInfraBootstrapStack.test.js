const { Capture, Match, Template } = require('aws-cdk-lib/assertions');
const cdk = require('aws-cdk-lib');
const sns = require('aws-cdk-lib/aws-sns');
const {
  ADCWebInfraBootstrapStack,
} = require('../../lib/ADCWebInfraBootstrapStack');

describe('stack configuration', () => {
  let template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ADCWebInfraBootstrapStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  test('role is configured correctly', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'ADC_DeployWebApp',
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              },
              StringLike: {
                'token.actions.githubusercontent.com:sub':
                  'repo:ascensus-digital-consulting/*',
              },
            },
            Effect: 'Allow',
            Principal: {
              Federated:
                'arn:aws:iam::030460844096:oidc-provider/token.actions.githubusercontent.com',
            },
          },
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Principal: {
              AWS: 'arn:aws:iam::030460844096:user/christopher.marsh',
            },
          },
        ],
      },
      Policies: [
        {
          PolicyDocument: {
            Statement: [
              {
                Action: 'sts:AssumeRole',
                Effect: 'Allow',
                Resource: 'arn:aws:iam::*:role/cdk-*',
                Sid: 'AllowCDK',
              },
            ],
            Version: '2012-10-17',
          },
          PolicyName: 'ADCDeployWebAppPolicy',
        },
      ],
    });
  });
});
