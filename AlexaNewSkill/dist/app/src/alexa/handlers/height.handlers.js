const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var calcBmi = require('bmi-calc')

var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    output: "json",
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});

var docClient = new AWS.DynamoDB.DocumentClient();



module.exports = Alexa.CreateStateHandler(States.HEIGHT, {

    'AddAge': function() {
        console.log("hey!!!!!!!!!!!!!!!!!!!!!!!!!!");
        const hight = this.event.request.intent.slots.age.value;
        this.attributes.howTall = hight;
        this.emit(':ask',"Your are so tall "+hight+" Go to scale! Do you want to know your weight?");
        
    },


    'Unhandled': function () {
        const speechOutput = '';
        const reprompt = 'Please tell me, how tall you are, in centimeters.'
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },

    // Built-In Intents:

    'AMAZON.YesIntent': function () {

        var myWeight = 88;
        var self = this;

        var params = {
            TableName:"users",
            Item:{
                "userID": self.event.session.user.userId,
                "name": self.attributes.name,
                "age": self.attributes.age,
                "tall": self.attributes.howTall,
                "weight": myWeight
            },
            ConditionExpression: '#i = :val',
            ExpressionAttributeNames: {'#i' : 'name'},
            ExpressionAttributeValues: {':val' : self.attributes.name}
        };
        console.log(params);

        docClient.put(params, function(err, data) {

            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                self.emit(':ask',"Something went wrong!?");

            } else {

                console.log( calcBmi(myWeight, self.attributes.howTall) );
                var myValues = calcBmi(myWeight, self.attributes.howTall);


                self.emit(':ask',"Your weight is "+myWeight+" Your BMI is "+myValues.value+" it means "+myValues.name);
            }
        });


    },

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



