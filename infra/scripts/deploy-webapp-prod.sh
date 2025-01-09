#!/bin/bash

# Assume IAM role
assumeRoleResult=$(aws sts assume-role --role-arn 'arn:aws:iam::030460844096:role/ADC_DeployWebApp' --role-session-name ADC_DeployWebApp-Session)

# Make credentials available to CDK
export AWS_ACCESS_KEY_ID=$(echo "$assumeRoleResult" | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo "$assumeRoleResult" | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo "$assumeRoleResult" | jq -r '.Credentials.SessionToken')

# Create IAM resources
cdk deploy \
  -c aliasRecordName=ADCWebProdARecord \
  -c bucketName=ADCWebProdBucket \
  -c cachePolicyName=ADCWebProdCachePolicy \
  -c deploymentName=ADCWebProdDeployment \
  -c distributionName=ADCWebProdDistribution \
  -c domains=ascensus.digital,www.ascensus.digital \
  -c environment=dev \
  -c stackName=ADCWebProdStack \
  -c host= \
  -c viewerRequestHandlerName=ADCWebProdViewerRequestHandler \
  -c hostedZoneId=Z02235921WTFRIR8NQIBR \
  -c zoneName=ascensus.digital
