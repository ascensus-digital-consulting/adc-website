#!/bin/bash

# Assume IAM role
assumeRoleResult=$(aws sts assume-role --role-arn 'arn:aws:iam::030460844096:role/ADC_DeployWebApp' --role-session-name ADC_DeployWebApp-Session)

# Make credentials available to CDK
export AWS_ACCESS_KEY_ID=$(echo "$assumeRoleResult" | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo "$assumeRoleResult" | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo "$assumeRoleResult" | jq -r '.Credentials.SessionToken')

# Create IAM resources
cdk deploy \
  -c aliasRecordName=ADCWebStageARecord \
  -c bucketName=ADCWebStageBucket \
  -c cachePolicyName=ADCWebStageCachePolicy \
  -c deploymentName=ADCWebStageDeployment \
  -c distributionName=ADCWebStageDistribution \
  -c domains=stage.ascensus.digital \
  -c environment=dev \
  -c stackName=ADCWebStageStack \
  -c host=stage \
  -c viewerRequestHandlerName=ADCWebStageViewerRequestHandler \
  -c hostedZoneId=Z02235921WTFRIR8NQIBR \
  -c zoneName=ascensus.digital
