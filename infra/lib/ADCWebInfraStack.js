const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const s3 = require('aws-cdk-lib/aws-s3');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const iam = require('aws-cdk-lib/aws-iam');
const route53 = require('aws-cdk-lib/aws-route53');
const targets = require('aws-cdk-lib/aws-route53-targets');
const { Certificate } = require('aws-cdk-lib/aws-certificatemanager');
const { ADCInfraNames } = require('./ADCInfraNames');

class ADCWebInfraStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const host = props.env.host;
    const names = new ADCInfraNames(host);

    const bucketName = names.bucketName;
    const distributionName = names.distributionName;
    const deploymentName = names.deploymentName;
    const aliasRecordName = names.aliasRecordName;
    const cachePolicyName = names.cachePolicyName;
    const domains = this.#defineDomains(host);

    const bucket = this.#createBucket(bucketName);
    const cachePolicy = this.#createCachePolicy(cachePolicyName);
    const distribution = this.#createDistribution(
      distributionName,
      cachePolicy,
      domains,
      bucket
    );
    this.#createDeployment(deploymentName, bucket);
    this.#createAliasRecord(aliasRecordName, host, distribution);

    // Output the S3 bucket name and CloudFront distribution domain name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: distribution.domainName,
    });
  }

  #createBucket(bucketName) {
    const bucket = new s3.Bucket(this, bucketName, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    return bucket;
  }

  #createCachePolicy(cachePolicyName) {
    const cachePolicy = new cloudfront.CachePolicy(this, cachePolicyName, {
      defaultTtl: cdk.Duration.minutes(30), // Set the default TTL to 30 minutes
      minTtl: cdk.Duration.minutes(30), // Set the minimum TTL to 30 minutes
      maxTtl: cdk.Duration.minutes(60), // Set the maximum TTL to 60 minutes
    });

    return cachePolicy;
  }

  #createDistribution(distributionName, cachePolicy, domains, bucket) {
    const defaultBehavior = {
      origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Enforce HTTPS
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD, // Allow only GET and HEAD methods
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD, // Cache GET and HEAD methods
      cachePolicy: cachePolicy,
    };
    const props = {
      defaultBehavior: defaultBehavior,
      domainNames: domains, // Add your domain names here
      defaultRootObject: 'index.html', // Set the default root object to index.html
      certificate: Certificate.fromCertificateArn(
        this,
        'ADCCertificateWeb',
        'arn:aws:acm:us-east-1:030460844096:certificate/43b0f99a-a402-4ff1-916c-687c79bcef1d' // Replace with your certificate ARN
      ),
    };
    const distribution = new cloudfront.Distribution(
      this,
      distributionName,
      props
    );

    // Grant the CloudFront OAC permissions to read from the S3 bucket
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [`${bucket.bucketArn}/*`],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    return distribution;
  }

  #createDeployment(deploymenName, bucket) {
    const deployment = new s3deploy.BucketDeployment(this, deploymenName, {
      sources: [s3deploy.Source.asset('../web/src')], // 'folder' contains your empty files at the right locations
      destinationBucket: bucket,
    });

    return deployment;
  }

  #createAliasRecord(aliasRecordName, host, distribution) {
    const hostedZoneId = 'Z02235921WTFRIR8NQIBR'; // get from props or SSM lookup (Z****)
    const zoneName = 'ascensus.digital'; // get from props or SSM lookup (mydomain.com)
    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'ADCImportedZone',
      {
        hostedZoneId,
        zoneName,
      }
    );

    const props = {
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone: zone,
      deleteExisting: true,
    };

    if (host) {
      props.recordName = host;
    }

    const aliasRecord = new route53.ARecord(this, aliasRecordName, props);

    return aliasRecord;
  }

  #defineDomains(host) {
    const domains = [];
    if (!host) {
      domains.push('www.ascensus.digital', 'ascensus.digital');
    } else {
      domains.push(`${host}.ascensus.digital`);
    }
    return domains;
  }
}

module.exports = { ADCWebInfraStack };
