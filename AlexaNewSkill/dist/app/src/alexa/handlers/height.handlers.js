const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
const dynamoDbUtils = require('../utils/dynamoDb.utils');

const get = require('lodash.get');


module.exports = Alexa.CreateStateHandler(States.HEIGHT, {

    'AddHeight': function() {
        const height = get(this.event, 'request.intent.slots.height.value', null);

        let reprompt = '';
        let speechOutput = ''

        if (height) {
            this.attributes.height = height;
        }

        speechOutput = 'Nice. ';
        reprompt = 'Now please step on the scale.';
        speechOutput += ' ' + reprompt;
        const directiveServiceCall = callDirectiveService(this.event, speechOutput)
                                        .catch((error) => {
                                            console.log(Messages.DIRECTIVEERRORMESSAGE + error);
                                        });

        Promise.all([directiveServiceCall, waitForSteppingOnScaleFake])
        .then((weight) => {
            const bmi = calculateBMI(weight, parseInt(this.attributes.height));
            speechOutput = 'Your BMI is ' + bmi;

            this.handler.state = States.NONE;
            this.response.speak(speechOutput);
            this.emit(':responseReady');
        }).catch((error) => {
            console.log(error);
            this.handler.state = States.NONE;
            this.response.speak('I am sorry. This did not work.');
            this.emit(':responseReady');
        });
        
    },


    'Unhandled': function () {
        const speechOutput = '';
        const reprompt = 'Please tell me, how tall you are, in centimeters.'
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

function callDirectiveService(event, message) {
    // Call Alexa Directive Service.
    const ds = new Alexa.services.DirectiveService();
    const requestId = event.request.requestId;
    const endpoint = event.context.System.apiEndpoint;
	const token = event.context.System.apiAccessToken;
	const directive = new Alexa.directives.VoicePlayerSpeakDirective(requestId, message);
    return ds.enqueue(directive, endpoint, token);
}

/** 
 * Fake version, everytime returning a weight of 91 after 6 seconds!
*/
function waitForSteppingOnScaleFake() {
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            clearTimout(wait);
            const weight = 91;
            resolve(weight);
        }, 6000);
    });
    return promiseA;
}

/**
 * Real version, reading from database.
 */
function waitForSteppingOnScale() {
    let promiseA = new Promise((resolve, reject) => {
        getUserWeightFromDatabase.call(this, (err, data) => {
            if (err) {
                return reject(error);
            }

            const weight = data['weight'];
            resolve(weight);
        });
    });
    return promiseA;
}

function calculateBMI(weight, height) {
    console.log('>>>>>> height', height);
    console.log('>>>>>> weight', weight);
    let bmi = weight / (height * height);
    console.log('>>>>>> bom (not rounded)', bmi);
    bmi = Math.round( bmi * 10) / 10;
    return bmi;
}


function getUserWeightFromDatabase(callback) {
    const DYNAMO_TABLE_NAME = 'your-table-name';
    const PRIMARY_KEY_VALUE = 'fake-id';

    dynamoDbUtils.get(
        DYNAMO_TABLE_NAME,
        PRIMARY_KEY_VALUE,
        callback
    );
}
