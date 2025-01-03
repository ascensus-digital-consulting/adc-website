const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const s3 = require('aws-cdk-lib/aws-s3');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const route53 = require('aws-cdk-lib/aws-route53');
const targets = require('aws-cdk-lib/aws-route53-targets');
const { Certificate } = require('aws-cdk-lib/aws-certificatemanager');

/*** */
class ADCWebInfraStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Obtain context values
    const host = props.env.context.host;
    const bucketName = props.env.context.bucketName;
    const distributionName = props.env.context.distributionName;
    const deploymentName = props.env.context.deploymentName;
    const aliasRecordName = props.env.context.aliasRecordName;
    const cachePolicyName = props.env.context.cachePolicyName;
    const domains = props.env.context.domains;
    const versionRewriteFunctionName =
      props.env.context.versionRewriteFunctionName;
    const hostedZoneId = props.env.context.hostedZoneId;
    const zoneName = props.env.context.zoneName;

    // Create bucket
    const bucket = this.bucket(bucketName);

    // Create distribution
    const versionRewriteFunction = this.#metadataRewriteFunction(
      versionRewriteFunctionName
    );
    const cachePolicy = this.#cachePolicy(cachePolicyName);
    const distribution = this.#distribution(
      distributionName,
      cachePolicy,
      domains,
      bucket,
      versionRewriteFunction
    );

    // Create A record
    const zone = this.#hostedZone(hostedZoneId, zoneName);
    this.#aliasRecord(aliasRecordName, host, distribution, zone);

    // Deploy website code to S3
    this.#deployment(deploymentName, bucket, distribution);
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Create the Cloudfront function that rewrites (without quotes)
  // "metadata" to "metadata.json"
  //
  ////////////////////////////////////////////////////////////////////////
  #metadataRewriteFunction(versionRewriteFunctionName) {
    const versionRewriteFunction = new cloudfront.Function(
      this,
      versionRewriteFunctionName,
      {
        code: cloudfront.FunctionCode.fromFile({
          filePath: 'lib/versionRewriteFunction.js',
        }),
      }
    );
    return versionRewriteFunction;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // ...
  //
  ////////////////////////////////////////////////////////////////////////
  bucket(bucketName) {
    const bucket = new s3.Bucket(this, bucketName, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });
    return bucket;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // ...
  //
  ////////////////////////////////////////////////////////////////////////
  #cachePolicy(cachePolicyName) {
    const cachePolicy = new cloudfront.CachePolicy(this, cachePolicyName, {
      defaultTtl: cdk.Duration.minutes(30), // Set the default TTL to 30 minutes
      minTtl: cdk.Duration.minutes(30), // Set the minimum TTL to 30 minutes
      maxTtl: cdk.Duration.minutes(60), // Set the maximum TTL to 60 minutes
    });
    return cachePolicy;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // ...
  //
  ////////////////////////////////////////////////////////////////////////
  #distribution(
    distributionName,
    cachePolicy,
    domains,
    bucket,
    versionRewriteFunction
  ) {
    const defaultBehavior = {
      origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Enforce HTTPS
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD, // Allow only GET and HEAD methods
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD, // Cache GET and HEAD methods
      cachePolicy: cachePolicy,
      functionAssociations: [
        {
          function: versionRewriteFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };
    const props = {
      defaultBehavior: defaultBehavior,
      domainNames: domains.split(','), // Add your domain names here
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
    return distribution;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // ...
  //
  ////////////////////////////////////////////////////////////////////////
  #deployment(deploymenName, bucket, distribution) {
    const deployment = new s3deploy.BucketDeployment(this, deploymenName, {
      sources: [s3deploy.Source.asset('../web/src')], // 'folder' contains your empty files at the right locations
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
    return deployment;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // ...
  //
  ////////////////////////////////////////////////////////////////////////
  #aliasRecord(aliasRecordName, host, distribution, zone) {
    // const hostedZoneId = 'Z02235921WTFRIR8NQIBR'; // get from props or SSM lookup (Z****)
    // const zoneName = 'ascensus.digital'; // get from props or SSM lookup (mydomain.com)
    const props = this.#createAliasProps(host, distribution, zone);
    const aliasRecord = new route53.ARecord(this, aliasRecordName, props);
    return aliasRecord;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Create the Cloudfront function that rewrites (without quotes)
  // "metadata" to "metadata.json"
  //
  ////////////////////////////////////////////////////////////////////////
  #createAliasProps(host, distribution, zone) {
    const props = {
      target: route53.RecordTarget.fromAlias(
        new targets.CloudFrontTarget(distribution)
      ),
      zone: zone,
      deleteExisting: true,
      recordName: host,
    };
    return props;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Configure the Route53 hosted zone for DNS updates
  //
  ////////////////////////////////////////////////////////////////////////
  #hostedZone(hostedZoneId, zoneName) {
    const zone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'ADCImportedZone',
      {
        hostedZoneId,
        zoneName,
      }
    );
    return zone;
  }
}

module.exports = { ADCWebInfraStack };
