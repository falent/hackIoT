'use strict';

/**
 * Adapted from:
 * https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/master/lib/DynamoAttributesHelper.js
 * Apache License Version 2.0, January 2004
 */

const aws = require('aws-sdk');
aws.config.update({
    region: 'eu-west-1'
});
let doc;

module.exports = (function() {
    return {
        get: function(table, primaryKeyValue, callback) {
            if(!table) {
                callback('DynamoDB Table name is not set.', null);
            }

            if(!doc) {
                doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
            }

            const params = {
                Key: {
                    userId: primaryKeyValue
                },
                TableName: table,
                ConsistentRead: true
            };

            doc.get(params, function(err, data){
                if(err) {
                    console.log('get error: ' + JSON.stringify(err, null, 4));

                    if(err.code === 'ResourceNotFoundException') {
                        const dynamoClient = new aws.DynamoDB();
                        newTableParams.TableName = table;
                        dynamoClient.createTable(newTableParams, function (err, data) {
                            if(err) {
                                console.log('Error creating table: ' + JSON.stringify(err, null, 4));
                            }
                            console.log('Creating table ' + table + ':\n' + JSON.stringify(data));
                            callback(err, {});
                        });
                    } else {
                        callback(err, null);
                    }
                } else {
                    if(isEmptyObject(data)) {
                        callback(null, {});
                    } else {
                        callback(null, data.Item);
                    }
                }
            });
        },

        setAttributes: function(table, userId, data, callback) {
            const KEY_ATTRIBUTES = 'attributes';
            this.set(table, userId, KEY_ATTRIBUTES, data, callback);
        },

        set: function(table, userId, dataKey, data, callback) {
            if(!table) {
                callback('DynamoDB Table name is not set.', null);
            }

            if(!doc) {
                doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
            }

            const d = new Date();
            const isoDate = d.toISOString().substring(0, 10);

            const params = {
                Item: {
                    userId: userId,
                    today: {
                        total: 0,
                        today: isoDate,
                        drinks: []
                    }
                },
                TableName: table
            };
            params.Item[dataKey] = data;

            doc.put(params, function(err, data) {
                if(err) {
                    console.log('Error during DynamoDB put:' + err);
                }
                callback(err, data);
            });
        },

        update: function(table, userId, dataKey, data, callback) {
            if(!table) {
                callback('DynamoDB Table name is not set.', null);
            }

            if(!doc) {
                doc = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
            }

            const params = {
                Key: {
                    userId: userId
                },
                TableName: table,
                UpdateExpression: 'set ' + dataKey + ' = :u',
                ExpressionAttributeValues: {
                    ':u': data
                },
                ReturnValues: 'UPDATED_NEW'
            };
//            params.Item[dataKey] = data;

            doc.update(params, function(err, data) {
                if(err) {
                    console.log('Error during DynamoDB update:' + err);
                }
                callback(err, data);
            });
        }
    };
})();

function isEmptyObject(obj) {
    return !Object.keys(obj).length;
}

const newTableParams = {
    AttributeDefinitions: [
        {
            AttributeName: 'userId',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'userId',
            KeyType: 'HASH'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
};