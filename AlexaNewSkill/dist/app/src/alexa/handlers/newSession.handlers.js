// newSession.handlers.js

const speechOutputUtils = require('../utils/speech-output.utils');
//var User = require('../models/user');
const States = require('./states.const');

const inNewSessionStartableIntents = [
    'GetWeightIntent'
];


const duringAudioAllowedIntents = [
    'ReadPodcasts',
    'AMAZON.PauseIntent',
    'AMAZON.NextIntent',
    'AMAZON.PreviousIntent',
    'AMAZON.StopIntent',
    'AMAZON.CancelIntent',
    'AMAZON.HelpIntent',
    'AMAZON.ResumeIntent',
    'AMAZON.LoopOnIntent',
    'AMAZON.LoopOffIntent',
    'AMAZON.ShuffleOffIntent'


];



module.exports = {

    'NewSession': function() {

        console.log("Oto nowa sesja");
        console.log(this.event.session.sessionId);
        // Intent Request:
        if (this.event.request.type === 'IntentRequest') {
            const intentName = this.event.request.intent.name;

            // Podcast/Audio is playing:
            if ((this.event.context.AudioPlayer && this.event.context.AudioPlayer.offsetInMilliseconds > 0) ||
                (this.event.attributes && this.event.attributes.STATE === States.MUSIC)) {

                if (duringAudioAllowedIntents.indexOf(intentName) > -1) {
                    this.handler.state = States.MUSIC;
                    return this.emitWithState(intentName);
                } else {
                    this.handler.state = States.MUSIC;
                    return this.emitWithState('Unhandled');
                }
            }

            // Intent can be started directly in new session:
            if (inNewSessionStartableIntents.indexOf(intentName) > -1) {
                return this.emit(intentName);
            }
        }
        // else: Launch Request
        this.emit('LaunchIntent');
    },

    'LaunchIntent': function() {

        /*We are checking a name of our user

        var userID = this.event.session.user.userId;
        console.log(userID);
        var self = this;

        User.findOne({ userId: userID }, function(err, user) {
            if (err ||!user){
                self.emit(':ask',
                    speechOutputUtils.pickRandom(self.t('NEW_USER_WELLCOME')));
            }
            else {
                console.log(user);
                self.emit(':ask',
                    speechOutputUtils.pickRandom(self.t('WELCOME_OLD_USER', user.name))
                );
            }

        });
        */

       let reprompt = '';
       let speechOutput = "What is your name?"

       reprompt = 'What is your name?';
       speechOutput += ' ' + reprompt;

       this.handler.state = States.NAME;
       this.response.speak(speechOutput).listen(reprompt);
       this.emit(':responseReady');






    },

    // Custom Intents:

    'NameIntent': function() {
        console.log('[NewSessionHandlers] Template');
        this.handler.state = States.NAME;
        this.emitWithState('NameIntent');
    },

    'PlayMusic': function() {
        this.handler.state = States.MUSIC;
        this.emitWithState('PlayMusic');
    },
    // Unhandled Intent:
    // Built-In Intents:

    'AMAZON.HelpIntent': function () {
        this.response.speak(speechOutputUtils.pickRandom(this.t('HELP')).listen(this.t('REPEAT')));
        this.emit(':responseReady');

    },

    'AMAZON.StopIntent': function () {
        this.response.speak(speechOutputUtils.pickRandom(this.t('STOP_ANSWER')));
        this.emit(':responseReady');

    },

    'AMAZON.CancelIntent': function () {
        this.response.speak(speechOutputUtils.pickRandom(this.t('CANCEL_ANSWER')));
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(speechOutputUtils.pickRandom(this.t('UNDEFINED'))).listen(this.t('REPEAT'));
        this.emit(':responseReady');

    }


};


