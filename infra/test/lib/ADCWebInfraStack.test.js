const { Capture, Match, Template } = require('aws-cdk-lib/assertions');
const cdk = require('aws-cdk-lib');
const sns = require('aws-cdk-lib/aws-sns');
const { ADCWebInfraStack } = require('../../lib/ADCWebInfraStack');

describe('stack configuration', () => {
  let template;
  const context = {
    resourceNames: {
      aliasRecord: 'ADCWebTestARecord',
      bucket: 'ADCWebTestBucket',
      cachePolicy: 'ADCWebTestCachePolicy',
      deployment: 'ADCWebTestDeployment',
      distribution: 'ADCWebTestDistribution',
      stack: 'ADCWebTestStack',
      viewerRequestHandler: 'ADCWebTestViewerRequestHandler',
    },
    domains: 'test1.domain.test,test2.domain.test',
    host: 'test1',
    hostedZoneId: 'AAAAA11111BBBBB22222',
    zoneName: 'domain.test',
  };
  const names = context.resourceNames;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new ADCWebInfraStack(app, names.stack, {
      env: { context: context },
    });
    template = Template.fromStack(stack);
  });

  describe('bucket configuration', () => {
    test('bucket is created with policy', () => {
      template.hasResource('AWS::S3::Bucket', {});
      template.hasResource('AWS::S3::BucketPolicy', {});
    });

    test('bucket has all public access disabled', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('bucket has deletion policies set to delete', () => {
      template.hasResource('AWS::S3::Bucket', {
        UpdateReplacePolicy: 'Delete',
        DeletionPolicy: 'Delete',
      });
    });
  });

  describe('distribution configuration', () => {
    test('distribution is created', () => {
      template.hasResource('AWS::CloudFront::CachePolicy', {});
      template.hasResource('AWS::CloudFront::Distribution', {});
      template.hasResource('AWS::CloudFront::Function', {});
      template.hasResource('AWS::CloudFront::OriginAccessControl', {});
    });

    test('distribution has domain aliases configured', () => {
      const domains = context.domains.split(',');
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Aliases: domains,
        },
      });
    });

    test('distribution has allowed http methods configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            AllowedMethods: ['GET', 'HEAD'],
          },
        },
      });
    });

    test('distribution has a cache policy id configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            CachePolicyId: {
              Ref: Match.stringLikeRegexp(`${names.cachePolicy}.*`),
            },
          },
        },
      });
    });

    test('distribution has caching for different http methods configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            CachedMethods: ['GET', 'HEAD'],
          },
        },
      });
    });

    test('distribution has cache compression configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            Compress: true,
          },
        },
      });
    });

    test('distribution has viewer request handler configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            FunctionAssociations: [
              {
                EventType: 'viewer-request',
                FunctionARN: {
                  'Fn::GetAtt': [
                    Match.stringLikeRegexp(`${names.viewerRequestHandler}.*`),
                    'FunctionARN',
                  ],
                },
              },
            ],
          },
        },
      });
    });

    test('distribution has target origin configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            TargetOriginId: Match.stringLikeRegexp(
              `${names.stack}${names.distribution}Origin.*`
            ),
          },
        },
      });
    });

    test('distribution redirects from http to https', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultCacheBehavior: {
            ViewerProtocolPolicy: 'redirect-to-https',
          },
        },
      });
    });

    test('distribution has default object configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          DefaultRootObject: 'index.html',
        },
      });
    });

    test('distribution is enabled', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Enabled: true,
        },
      });
    });

    test('distribution has http version configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          HttpVersion: 'http2',
        },
      });
    });

    test('distribution defines bucket for storage', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              DomainName: {
                'Fn::GetAtt': [
                  Match.stringLikeRegexp(`${names.bucket}.*`),
                  'RegionalDomainName',
                ],
              },
              Id: Match.stringLikeRegexp(
                `${names.stack}${names.distribution}Origin.*`
              ),
            },
          ],
        },
      });
    });

    test('distribution has oac configured for access to the s3 bucket', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          Origins: [
            {
              OriginAccessControlId: {
                'Fn::GetAtt': [
                  Match.stringLikeRegexp(
                    `${names.distribution}Origin.*S3OriginAccessControl.*`
                  ),
                  'Id',
                ],
              },
              S3OriginConfig: {
                OriginAccessIdentity: '',
              },
            },
          ],
        },
      });
    });

    test('distribution has certificate configured', () => {
      template.hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: {
          ViewerCertificate: {
            AcmCertificateArn: Match.anyValue(),
            MinimumProtocolVersion: 'TLSv1.2_2021',
            SslSupportMethod: 'sni-only',
          },
        },
      });
    });
  });

  describe('alias configuration', () => {
    test('alias record has correct record type configured', () => {
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        AliasTarget: {
          DNSName: {
            'Fn::GetAtt': [
              Match.stringLikeRegexp(`${names.distribution}.*`),
              'DomainName',
            ],
          },
        },
      });
    });

    test('alias record has hosted zone configured', () => {
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        HostedZoneId: context.hostedZoneId,
      });
    });

    test('alias record has record name configured', () => {
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        Name: `${context.domains.split(',')[0]}.`,
      });
    });

    test('alias record has record type configured', () => {
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        Type: 'A',
      });
    });
  });

  describe('deployment configuration', () => {
    test('deployment is created', () => {
      template.hasResource('AWS::IAM::Policy', {});
      template.hasResource('AWS::IAM::Role', {});
      template.hasResource('AWS::Lambda::Function', {});
      template.hasResource('AWS::Lambda::LayerVersion', {});
    });
  });
});
