# Overview

AWS Lambda functions for EC2 management
* detecting EC2 instances without the specific tag and sending a report by SNS.
* starting and stopping EC2 instances automatically

# Usage
1. make AWS SNS topic
2. make IAM role contains these IAM policies
    * AmazonSNSFullAccess
    * AmazonEC2ReadOnlyAccess (detect missing tag)
    * AmazonEC2FullAccess (auto start/stop)
3. make AWS Lambda function
    * Node.js 6.10
    * Set these environment variables
        * SUBJECT - Title of message (e.g. subject of Email)
        * TAG_TITLE - specify target EC2 tag
        * MESSAGE_HEADER - header of message
        * TOPIC_ARN - SNS ARN (e.g. arn:aws:sns:ap-northeast-1:123456789012:topic)
        * (auto start/stop only) TAG_VALUE - target EC2 tag value
4. run this script periodically or other triggers by CloudWatch Events
    * auto start/stop requires constant input like `{"type": "start"}` or `{"type": "stop"}`
