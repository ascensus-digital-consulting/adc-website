const cdk = require('aws-cdk-lib');
const { Stack } = cdk;
const iam = require('aws-cdk-lib/aws-iam');

class ADCWebInfraBootstrapStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create managed policy with the permissions to deploy a web app
    const policy = this.#configurePolicy();

    // Create the role to assume when deploying a web app
    new iam.Role(this, 'ADCDeployWebAppRole', {
      roleName: 'ADC_DeployWebApp',
      assumedBy: new iam.CompositePrincipal(
        new iam.FederatedPrincipal(
          'arn:aws:iam::030460844096:oidc-provider/token.actions.githubusercontent.com',
          {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            },
            StringLike: {
              'token.actions.githubusercontent.com:sub':
                'repo:ascensus-digital-consulting/*',
            },
          },
          'sts:AssumeRoleWithWebIdentity'
        ),
        new iam.ArnPrincipal('arn:aws:iam::030460844096:user/christopher.marsh')
      ),
      managedPolicies: [policy],
    });
  }

  #configurePolicy() {
    return new iam.ManagedPolicy(this, 'ADCDeployWebAppPolicy', {
      managedPolicyName: 'ADC_DeployWebApp',
      statements: [
        new iam.PolicyStatement({
          sid: 'AllowCDK',
          actions: ['sts:AssumeRole'],
          resources: ['arn:aws:iam::*:role/cdk-*'],
          effect: iam.Effect.ALLOW,
        }),
      ],
    });
  }
}

module.exports = { ADCWebInfraBootstrapStack };
