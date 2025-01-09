Permissions required to run the bootstrap script:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::*:role/cdk-*",
            "Effect": "Allow"
        },
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter"
            ],
            "Resource": [
                "arn:aws:ssm:us-west-1:030460844096:parameter/cdk-bootstrap/hnb659fds/version"
            ]
        }
    ]
}
```
