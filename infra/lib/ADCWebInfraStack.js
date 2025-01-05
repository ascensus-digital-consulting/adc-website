const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const s3 = require('aws-cdk-lib/aws-s3');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const route53 = require('aws-cdk-lib/aws-route53');
const targets = require('aws-cdk-lib/aws-route53-targets');
const { Certificate } = require('aws-cdk-lib/aws-certificatemanager');

class ADCWebInfraStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Obtain context values from environment
    const context = props.env.context;

    // Create bucket
    const bucket = this.#bucket(context.bucketName);

    // Create distribution
    const cachePolicy = this.#cachePolicy(context.cachePolicyName);
    const metadataRewriteFunction = this.#metadataRewriteFunction(
      context.host,
      context.metadataRewriteFunctionName
    );
    const defaultBehavior = this.#defaultBehavior(
      bucket,
      cachePolicy,
      metadataRewriteFunction
    );
    const distributionProps = this.#distributionProps(
      defaultBehavior,
      context.domains
    );
    const distribution = this.#distribution(
      context.distributionName,
      distributionProps
    );

    // Create A record
    const zone = this.#hostedZone(context.hostedZoneId, context.zoneName);
    this.#aliasRecord(
      distribution,
      context.host,
      context.aliasRecordName,
      zone
    );

    // Deploy website code to S3
    this.#deployment(bucket, distribution, context.deploymentName);
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Create the Cloudfront function that rewrites (without quotes)
  // "metadata" to "metadata.json"
  //
  ////////////////////////////////////////////////////////////////////////
  #aliasProps(host, distribution, zone) {
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
  // Create DNS subdomain record for release
  //
  ////////////////////////////////////////////////////////////////////////
  #aliasRecord(distribution, host, name, zone) {
    const props = this.#aliasProps(host, distribution, zone);
    const aliasRecord = new route53.ARecord(this, name, props);
    return aliasRecord;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Create bucket to store website files
  //
  ////////////////////////////////////////////////////////////////////////
  #bucket(name) {
    const bucket = new s3.Bucket(this, name, {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
      versioned: true,
    });
    return bucket;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Configure cache policy for website (via Cloudfront)
  //
  ////////////////////////////////////////////////////////////////////////
  #cachePolicy(name) {
    const cachePolicy = new cloudfront.CachePolicy(this, name, {
      defaultTtl: cdk.Duration.minutes(30), // Set the default TTL to 30 minutes
      minTtl: cdk.Duration.minutes(30), // Set the minimum TTL to 30 minutes
      maxTtl: cdk.Duration.minutes(60), // Set the maximum TTL to 60 minutes
    });
    return cachePolicy;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Configure default behavior for Cloudfront distribution
  //
  ////////////////////////////////////////////////////////////////////////
  #defaultBehavior(bucket, cachePolicy, fn) {
    const behavior = {
      origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Enforce HTTPS
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD, // Allow only GET and HEAD methods
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD, // Cache GET and HEAD methods
      cachePolicy: cachePolicy,
      functionAssociations: [
        {
          function: fn,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };
    return behavior;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Deploy website files into S3
  //
  ////////////////////////////////////////////////////////////////////////
  #deployment(bucket, distribution, name) {
    const deployment = new s3deploy.BucketDeployment(this, name, {
      sources: [s3deploy.Source.asset('../web/src')], // 'folder' contains your empty files at the right locations
      destinationBucket: bucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
    return deployment;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Create the Cloudfront distribution
  //
  ////////////////////////////////////////////////////////////////////////
  #distribution(name, props) {
    const distribution = new cloudfront.Distribution(this, name, props);
    return distribution;
  }

  ////////////////////////////////////////////////////////////////////////
  //
  // Configure the properties for the Cloudfront distribution
  //
  ////////////////////////////////////////////////////////////////////////
  #distributionProps(behavior, domains) {
    const props = {
      defaultBehavior: behavior,
      domainNames: domains.split(','), // Add your domain names here
      defaultRootObject: 'index.html', // Set the default root object to index.html
      certificate: Certificate.fromCertificateArn(
        this,
        'ADCCertificateWeb',
        'arn:aws:acm:us-east-1:030460844096:certificate/43b0f99a-a402-4ff1-916c-687c79bcef1d' // Replace with your certificate ARN
      ),
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

  ////////////////////////////////////////////////////////////////////////
  //
  // Create the Cloudfront function that rewrites (without quotes)
  // "metadata" to "metadata.json"
  //
  ////////////////////////////////////////////////////////////////////////
  #metadataRewriteFunction(host, name) {
    const filePath = host
      ? 'lib/metadataRewriteWithAuthzFunction.js'
      : 'lib/metadataRewriteFunction.js';
    const fn = new cloudfront.Function(this, name, {
      code: cloudfront.FunctionCode.fromFile({
        filePath: filePath,
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
    });
    return fn;
  }
}

module.exports = { ADCWebInfraStack };
