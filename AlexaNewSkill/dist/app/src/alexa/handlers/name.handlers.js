
const Alexa = require('alexa-sdk');
const States = require('./states.const');
const SpeechOutputUtils = require('../utils/speech-output.utils');
var User = require('../models/user');



module.exports = Alexa.CreateStateHandler(States.NAME, {

    'NameIntent': function() {
        var myName = this.event.request.intent.slots.firstname.value;
        var userID = this.event.session.user.userId;
        console.log(userID);
        
       
        User.findOneAndUpdate(
        		{userId:  userID}, 
        		{$set:{name:myName}},  
        		{upsert: true, new: true, runValidators: true}, 
        		function(err, doc){
        			if(err){
        				console.log("Something wrong when updating data!");
        			}

        			console.log(doc);
        		});
        

           
        this.emit(':tell', SpeechOutputUtils.pickRandom(this.t('WELCOME_OLD_USER', myName)));
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
