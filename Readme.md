# Overview

AWS Lambda function for detecting EC2 instances without specific tag and sending report by SNS.

# Usage
1. make AWS SNS topic
2. make IAM role contains these IAM policies
    * AmazonSNSFullAccess
    * AmazonEC2ReadOnlyAccess
3. make AWS Lambda function
    * Node.js 6.10
    * Set these environment variables
        * SUBJECT - Title of message (e.g. subject of Email)
        * TAG_TITLE - specify target EC2 tag
        * MESSAGE_HEADER - header of message
        * TOPIC_ARN - SNS ARN (e.g. arn:aws:sns:ap-northeast-1:123456789012:topic)
4. run this script periodically by CloudWatch Events
