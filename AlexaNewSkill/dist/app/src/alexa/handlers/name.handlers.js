
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');

const get = require('lodash.get');

var AWS = require('aws-sdk');


//There are fake AWS data but it works locally.  It is impossible that it works without it!

AWS.config.update({
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    output: "json",
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var dynamodb = new AWS.DynamoDB();

module.exports = Alexa.CreateStateHandler(States.NAME, {

    'NameIntent': function() {



        var userName = this.event.request.intent.slots.firstname.value;
        this.attributes.name = userName;
        /*
        var params = {
            TableName : "users",
            KeySchema: [
                { AttributeName: "userID", KeyType: "HASH"},  //Partition key

            ],
            AttributeDefinitions: [
                { AttributeName: "userID", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        dynamodb.createTable(params, function(err, data) {
            if (err) {
                console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
            }
        });

*/


        var self = this;

        var params = {
            TableName:"users",
            Item:{
                "userID": this.event.session.user.userId,
                "name": userName

            },
            ConditionExpression: '#i <> :val',
            ExpressionAttributeNames: {'#i' : 'name'},
            ExpressionAttributeValues: {':val' : userName}
        };
        console.log(params);

        docClient.put(params, function(err, data) {

            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                self.handler.state = States.NONE;
                self.emit(':ask'," Hi "+userName+" I have all of your data", "what do you want to do?"
                );
            } else {
                self.handler.state = States.AGE;
                self.emit(':ask',"Could you please give me your age"
                );
            }
        });





/*



                var docClient = new AWS.DynamoDB.DocumentClient()

                var table = "users";



                var params = {
                    TableName: table,
                    Key:{
                        "userID": this.event.session.user.userId,
                        "name": userName
                    }
                };

                docClient.get(params, function(err, data) {
                    if (err) {
                        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                    }
                });




                var params = {
                    TableName:"users",
                    Item:{
                        "userID": this.event.session.user.userId,
                        "microtime": new Date().getTime(),
                        "name": userName
                    }
                };


                self =this;
                console.log("Adding a new item...");
                docClient.put(params, function(err, data) {

                    self.handler.state = States.NONE;

                    self.emit(':ask', "Your name is saved ");

                });

        */
    },



    'Unhandled': function () {
        const speechOutput = '';
        const reprompt = 'Please tell me, how old you are.'
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },

    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.handler.state = States.NONE;
        this.emit(':ask', SpeechOutputUtils.pickRandom(this.t('HELP')));
    },


    'AMAZON.StopIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.StopIntent');
    },

    'AMAZON.CancelIntent': function () {
        this.handler.state = States.NONE;
        this.emit('AMAZON.CancelIntent');
    }

});























