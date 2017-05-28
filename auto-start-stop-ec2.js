var aws = require('aws-sdk');
var ec2 = new aws.EC2();
var sns = new aws.SNS();
var report;

exports.handler = (event, context, callback) => {
    'use strict';

    report = sns_report(event.type, callback);

    let filter_status;
    switch (event.type) {
        case 'start':
            filter_status = 'stopped';
            break;
        case 'stop':
            filter_status = 'running';
            break;
        default:
            report('unexpected_argument');
            callback({ 'exception': 'unexpected_argument' });
            return;
    }

    ec2.describeInstances({
        'Filters': [
            {
                Name: 'tag:' + process.env.TAG_TITLE,
                Values: [process.env.TAG_VALUE]
            },
            {
                Name: 'instance-state-name',
                Values: [filter_status]
            }
        ]
    }, (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        if (data.Reservations.length === 0) {
            callback(null, { 'result': 'There is no instance to be operated.' });
            return;
        }

        let target_instance_ids = [];
        data.Reservations.forEach(reservation => {
            reservation.Instances.forEach(instance => {
                target_instance_ids.push(instance.InstanceId);
            });
        });

        if (event.type === 'start') {
            ec2.startInstances({ InstanceIds: target_instance_ids }, instance_operate_callback(callback));
        } else {
            ec2.stopInstances({ InstanceIds: target_instance_ids }, instance_operate_callback(callback));
        }
    });
};

function instance_operate_callback(lambda_callback) {
    return (err, data) => {
        if (err) {
            report('Error: ' + err.message);
            lambda_callback(err);
            return;
        }
        let operated_instances = data.StartingInstances || data.StoppingInstances;

        let message = '\n\n';
        operated_instances.forEach(instance => {
            message += '* ' + instance.InstanceId + '\n';
        });
        report(message);
    };
}

function sns_report(type, callback) {
    return (message) => {
        let report_contents = {
            'TopicArn': process.env.TOPIC_ARN,
            'Subject': process.env.SUBJECT + type,
        };

        report_contents.Message = process.env.MESSAGE_HEADER;
        report_contents.Message += message;

        sns.publish(report_contents, (err, response) => {
            if (err) {
                callback(err);
                return;
            }

            callback(null, response);
            return;
        });
    };
}
