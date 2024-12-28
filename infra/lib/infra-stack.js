// Import the AWS CDK libraries
const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const s3 = require('aws-cdk-lib/aws-s3');
const s3deploy = require('@aws-cdk/aws-s3-deployment');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const iam = require('aws-cdk-lib/aws-iam');

class InfraStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create the S3 bucket with all public access blocked
    const bucket = new s3.Bucket(this, 'MyBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block all public access
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change to RETAIN for production
      autoDeleteObjects: true, // Deletes objects when the bucket is deleted (useful for development)
      enforceSSL: true,
    });

    // Create an Origin Access Control (OAC) for CloudFront to securely access the S3 bucket
    const oac = new cloudfront.CfnOriginAccessControl(this, 'MyOAC', {
      originAccessControlConfig: {
        name: 'MyOAC',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    });

    // Create a CloudFront distribution
    const distribution = new cloudfront.Distribution(
      this,
      'MyCloudFrontDistribution',
      {
        defaultBehavior: {
          origin: new origins.S3BucketOrigin(bucket, {
            originAccessControlId: oac.attrId, // Attach the OAC to the S3 origin
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS, // Enforce HTTPS
        },
      }
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

    const deployment = new s3deploy.BucketDeployment(this, 'DeployFiles', {
      sources: [s3deploy.Source.asset('../web/src')], // 'folder' contains your empty files at the right locations
      destinationBucket: bucket,
    });

    // Output the S3 bucket name and CloudFront distribution domain name
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: distribution.domainName,
    });
  }
}

module.exports = { InfraStack };
