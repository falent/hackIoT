"use strict";


const Alexa = require("alexa-sdk");

const SpeechOutput = require('./alexa/resources/speech-output');
const newSessionHandlers = require('./alexa/handlers/newSession.handlers');
const ageHandlers = require('./alexa/handlers/age.handlers');
const heightHandlers = require('./alexa/handlers/height.handlers');

var allHandlers = [
	newSessionHandlers,
	ageHandlers,
	heightHandlers
];

exports.handler = function(event, context, callback) {
	const alexa = Alexa.handler(event, context, callback); 
	alexa.resources = SpeechOutput;
	alexa.registerHandlers.apply(null, allHandlers);
	alexa.execute();
};




