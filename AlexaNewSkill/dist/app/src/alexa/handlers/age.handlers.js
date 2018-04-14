const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');

const get = require('lodash.get');


module.exports = Alexa.CreateStateHandler(States.AGE, {

    'AddAge': function() {
        const age = get(this.event, 'request.intent.slots.age.value', null);

        let reprompt = '';
        let speechOutput = ''

        if (age) {
            this.attributes.age = age;
            speechOutput = 'So you are ' + age + ' years old? But you look like ' + (age - 5) + '.';
            reprompt = 'Ok, now please tell me. How tall are you? Tell me in centimeters.';
            speechOutput += ' ' + reprompt;
        } else {
            return this.emitWithState('Unhandled');
        }

        this.handler.state = States.HEIGHT;
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
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
