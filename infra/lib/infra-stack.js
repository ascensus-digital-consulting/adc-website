const cdk = require('aws-cdk-lib');
const iam = require('aws-cdk-lib/aws-iam');
const kms = require('aws-cdk-lib/aws-kms');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const { Construct } = require('constructs');

class InfraStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const s3Bucket = new s3.Bucket(this, 'exampleBucket', {
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      bucketName: `example-bucket-adc-${new Date().getTime()}`,
      versioned: true,
      // encryptionKey: new kms.Key(this, 's3BucketKMSKey'),
    });

    s3Bucket.grantRead(new iam.AccountRootPrincipal());

    const cloudfrontDist = new cloudfront.Distribution(
      this,
      'exampleDistribution',
      {
        defaultBehavior: {
          origin: new cloudfront.Origins.S3Origin(s3Bucket),
        },
        defaultRootObject: 'index.html',
        enableLogging: true,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      }
    );
  }
}

module.exports = { InfraStack };
