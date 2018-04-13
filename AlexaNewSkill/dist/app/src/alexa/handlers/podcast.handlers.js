// podcast.handlers

const Alexa = require('alexa-sdk');
const StatesConst = require('./states.const');
const striptags = require('striptags');

var podcastData = require('../controllers/feed.controller');
const audioTitles = [];


//define numberOfPodcasts how many of title user can choose
const numberOfPodcasts = 3;
var LastReadPodcast = numberOfPodcasts;
/**
 * All Intent Handlers for state : PODCAST
 */
module.exports = Alexa.CreateStateHandler(StatesConst.PODCAST, {

    'ReadPodcasts' : function () {

        for (i = 0; i < podcastData.length; i++) {
            var onlyTitles= podcastData[i]['title'].replace(/\[(.*?)\]/g, '');
            audioTitles.push(" <break time='0.2s'/>"+(i+1)+"<break time='0.2s'/> "+onlyTitles+" ");
        }

        this.emit(':askWithCard', this.t('CHOOSE_PODCAST', audioTitles.slice(0, numberOfPodcasts).toString()), this.t('CHOOSE_PODCAST', audioTitles.slice(0, numberOfPodcasts).toString()), this.t('PODCAST_CARD', ""), striptags(this.t('CHOOSE_PODCAST', audioTitles.slice(0, numberOfPodcasts).toString())));
	},
	
	'ReadMorePodcasts' : function () {
		LastReadPodcast=LastReadPodcast+3;
		var start =LastReadPodcast-3;
		let choosenSpeachOutput = 'CHOOSE_PODCAST_MORE';
		if (LastReadPodcast>=audioTitles.length){
			var leatest = audioTitles.length % numberOfPodcasts;
			start = audioTitles.length-leatest;
			LastReadPodcast=audioTitles.length;
			choosenSpeachOutput = 'CHOOSE_PODCAST_NOMORE';
		}


	    console.log(choosenSpeachOutput);
        this.emit(':askWithCard', 
        		this.t(choosenSpeachOutput, audioTitles.slice(start, LastReadPodcast).toString()),
        		this.t(choosenSpeachOutput, audioTitles.slice(start, LastReadPodcast).toString()),
        		this.t('PODCAST_CARD', ""),
        		striptags(this.t(choosenSpeachOutput, audioTitles.slice(start, LastReadPodcast).toString()))
        		);

	},

    'LastPodcastIntent' : function () {
        const numberSlot = {
            value: 1    
        };
        if (!this.event.request.intent.slots) {
            this.event.request.intent['slots'] = {};
        }
        this.event.request.intent.slots['num'] = numberSlot;
        this.emitWithState('NumberIntent');
    },

    'NumberIntent': function () {
        const number = this.event.request.intent.slots.num.value;
        if (isNaN(number)) {
            number = 1;
        }
        this.attributes['LastBlogNumber'] = number-1;

        if (!this.attributes['playOrder']) {
            // Initialize Attributes if undefined.
            this.attributes['playOrder'] = Array.apply(null, {length: podcastData.length}).map(Number.call, Number);
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            this.handler.state = StatesConst.PODCAST;
        }

        this.attributes['index'] = number - 1;
        this.attributes['offsetInMilliseconds'] = 0;
        this.attributes['playbackIndexChanged'] = true;
        controller.play.call(this);
    },
    'NumberIntentFromBlog': function () {
        var number = this.attributes['blogNumber'];
        this.attributes['LastBlogNumber'] = number-1;
		console.log(this.attributes['blogNumber']);
        if (isNaN(number)) {
            number = 1;
        }

        if (!this.attributes['playOrder']) {
            // Initialize Attributes if undefined.
            this.attributes['playOrder'] = Array.apply(null, {length: podcastData.length}).map(Number.call, Number);
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            this.handler.state = StatesConst.PODCAST;
        }

        this.attributes['index'] = number - 1;
        this.attributes['offsetInMilliseconds'] = 0;
        this.attributes['playbackIndexChanged'] = true;
        controller.play.call(this);
    },

    'PlayAudio' : function () {

        if (!this.attributes['playOrder']) {
            // Initialize Attributes if undefined.
            this.attributes['playOrder'] = Array.apply(null, {length: podcastData.length}).map(Number.call, Number);
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['loop'] = true;
            this.attributes['shuffle'] = false;
            this.attributes['playbackIndexChanged'] = true;
            this.handler.state = StatesConst.PODCAST;
        }
        controller.play.call(this);
    },

    // Unhandled Intent:

    'Unhandled': function () {
        const message = this.t('UNDEFINED');
        this.response.listen(message).audioPlayerStop();
        return this.emit(':responseReady');
    },

    'SessionEndedRequest' : function () {
        this.emitWithState('AMAZON.CancelIntent');
    },
    
    // Built-In Intents:

    'AMAZON.HelpIntent' : function () {
        this.emit(':ask', this.t('HELP_PODCAST'));
    },

    'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
    'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },

    'AMAZON.PauseIntent' : function () {
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.StopIntent' : function () {
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.CancelIntent' : function () {
        this.attributes['offsetInMilliseconds'] = 0;
        this.handler.state = StatesConst.NONE;

        const message = this.t('STOP_ANSWER');
        this.response.speak(message).audioPlayerStop();
        return this.emit(':responseReady');
    }

});

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = StatesConst.PODCAST;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }

            var token = String(this.attributes['playOrder'][this.attributes['index']]);
            var playBehavior = 'REPLACE_ALL';
            var podcast = podcastData[this.attributes['playOrder'][this.attributes['index']]];
            var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes['enqueuedToken'] = null;

            if (canThrowCard.call(this)) {
                var cardTitle = this.t('PODCAST_CARD', podcast.title);
                var cardContent = this.t('PODCAST_CARD_CONTENT', podcast.title);
                this.response.cardRenderer(cardTitle, cardContent, null);
            }

            this.response.speak(this.t('PODCAST_HELP_EXIT')).audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */

             var message = 'Danke';
             this.response.speak(message).audioPlayerStop();
             return this.emit(':responseReady');
        },
        playNext: function () {
/*          
 * This code makes sense only if we can save UserID into DynamoDB. Of course we should get podcast index from DynamoDB
 * I leave it as a comment because maybe in the future they want to save userID and we can improve this feature very
 * fast and easily :)
 * 
 * 			var index = this.attributes['LastBlogNumber'];
            index += 1;
            this.attributes['LastBlogNumber']=index;
            // Check for last audio file.
            var end = index+1;
            console.log(end);
            if (end >= podcastData.length) {

                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = StatesConst.PODCAST;
                    const message = this.t('PODCAST_END_PLAYLIST', (podcastData.length-1));
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);*/
        	
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');        	
        	
        },
        playPrevious: function () {

/*
 * This code makes sense only if we can save UserID into DynamoDB. Of course we should get podcast index from DynamoDB
 * I leave it as a comment because maybe in the future they want to save userID and we can improve this feature very
 * fast and easily :)
 * 
 *          var index = this.attributes['LastBlogNumber'];

            index -= 1;
            this.attributes['LastBlogNumber']=index;
            // Check for last audio file.
            if (index <= -1) {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = StatesConst.PODCAST;

                    const message = this.t('PODCAST_BEGINN_PLAYLIST', (podcastData.length-1));
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);  */      	
        	
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');              	        	
        	
        },
        loopOn: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        },
        loopOff: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        },
        shuffleOn: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        },
        shuffleOff: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        },
        startOver: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        },
        reset: function () {
            // Right now this function is not implemented in our case.
            this.response.speak(this.t('NOT_IMPLEMENTED_FUNCTION')).audioPlayerStop();
            this.emit(':responseReady');  
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' && this.attributes['playbackIndexChanged']) {
        this.attributes['playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
    }
}

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: podcastData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}
