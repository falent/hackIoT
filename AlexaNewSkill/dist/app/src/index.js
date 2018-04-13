"use strict";


const Alexa = require("alexa-sdk");

const SpeechOutput = require('./alexa/resources/speech-output');
const newSessionHandlers = require('./alexa/handlers/newSession.handlers');
const musicHandlers = require('./alexa/handlers/podcast.handlers');
const audioEventHandlers = require('./alexa/handlers/audioEvent.handlers');
const nameHandlers = require('./alexa/handlers/name.handlers');

var allHandlers = [
	newSessionHandlers,
    musicHandlers,
    audioEventHandlers,
    nameHandlers

];



	exports.handler = function(event, context, callback) {
	    const alexa = Alexa.handler(event, context, callback); 
	    alexa.resources = SpeechOutput;
	    alexa.registerHandlers.apply(null, allHandlers);
	    alexa.execute();
	};




