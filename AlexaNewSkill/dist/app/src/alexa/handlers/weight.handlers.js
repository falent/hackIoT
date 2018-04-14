
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
//var User = require('../models/user');



module.exports = Alexa.CreateStateHandler(States.WEIGHT, {

    'WeightIntent': function() {

        var userID = this.event.session.user.userId;

        /*

        console.log(userID);


        var self = this;

        User.findOne({ userId: userID }, function(err, user) {
            if (err ||!user){
                self.emit(':ask',
                    SpeechOutputUtils.pickRandom(self.t('NEW_USER_WELLCOME')));
            }
            else {
                console.log(user);
                self.emit(':ask',
                    SpeechOutputUtils.pickRandom(self.t('WELCOME_OLD_USER', user.weight))
                );
            }

        });


    */
           
        this.emit(':ask', "Your weight is 80");
    },


    'PlayMusic': function() {
        this.handler.state = StatesConst.NONE;
        this.emitWithState('PlayMusic');
    },



    'Unhandled': function () {
        this.handler.state = States.NONE;
        this.emit('Unhandled'); // emit in newSession handlers
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
