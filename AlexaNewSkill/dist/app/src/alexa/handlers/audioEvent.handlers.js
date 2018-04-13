const Alexa = require('alexa-sdk');
const StatesConst = require('./states.const');

var podcastData = require('../controllers/feed.controller');

// Binding audio handlers to PODCAST State since they are expected only in this mode.
module.exports = Alexa.CreateStateHandler(StatesConst.NONE, {
    'PlaybackStarted' : function () {
        console.log('******* PlaybackStarted (State NONE) *******');
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */
        return;
    },
    'PlaybackFinished' : function () {
        console.log('******* PlaybackFinished (State NONE) *******');
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */
        return;
    },
    'PlaybackStopped' : function () {
        console.log('******* PlaybackStopped (State NONE) *******');
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */
        return;
    },
    'PlaybackNearlyFinished' : function () {
        /*
         * AudioPlayer.PlaybackNearlyFinished Directive received.
         * Using this opportunity to enqueue the next audio
         * Storing details in dynamoDB using attributes.
         * Enqueuing the next audio file.
         */
        return;
    },
    'PlaybackFailed' : function () {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        console.log("Playback Failed : %j", this.event.request.error);
        this.context.succeed(true);
    }
});


function getToken() {
    // Extracting token received in the request.
    return this.event.request.token;
}

function getIndex() {
    // Extracting index from the token received in the request.
    var tokenValue = parseInt(this.event.request.token);
    return this.attributes['playOrder'].indexOf(tokenValue);
}

function getOffsetInMilliseconds() {
    // Extracting offsetInMilliseconds received in the request.
    return this.event.request.offsetInMilliseconds;
}