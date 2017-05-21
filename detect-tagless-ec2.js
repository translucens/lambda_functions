var aws = require('aws-sdk');
var ec2 = new aws.EC2();
var sns = new aws.SNS();

exports.handler = (event, context, callback) => {
    'use strict';

    ec2.describeInstances({}, (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        let reporting_instances = [];

        data.Reservations.forEach(reservation => {
            reservation.Instances.forEach(instance => {
                if (!instance.Tags.some(tagkv => {
                    return (tagkv.Key === process.env.TAG_TITLE && tagkv.Value)
                })) {
                    reporting_instances.push(instance);
                }
            });
        });

        if (reporting_instances.length === 0) {
            callback(null, { 'result': 'There is no instance to be reported.' });
            return;
        }

        let report_contents = {
            'TopicArn': process.env.TOPIC_ARN,
            'Subject': process.env.SUBJECT,
        };
        report_contents.Message = process.env.MESSAGE_HEADER;
        report_contents.Message += '\n\n';
        reporting_instances.forEach(instance => {
            let nameTag = instance.Tags.find(tagkv => { return tagkv.Key === 'Name' });
            report_contents.Message += nameTag ? nameTag.Value : '(Unnamed)';
            report_contents.Message += '\t' + instance.InstanceId +
                '\t(' + instance.InstanceType + ': ' + instance.State.Name + ')\n';
        });

        sns.publish(report_contents, (err, response) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, response);
            return;
        });

    });
};
