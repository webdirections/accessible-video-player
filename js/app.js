//requires page to use https://player.vimeo.com/api/player.js

//synchronised-media.js

//synchronises content that is marked up with data-startTime="hh:mm:ss" to the currentTime of video playing so that we annotate any such media with classes to allow them to be styled

//the content can have one or more of

//captions
//transcript
//keypoints
//slideText blocks

//each of these can contain one or more blocks of captions transcripts etc, associated with a specific chunk of media

function initMedia() {
	//seeing whether setting a timeout then firing init media works!
	
	setTimeout(synchedMedia.init, 2000)
	
}

var synchedMedia = {
		player: null,
		imScrolling: false, //is the plater causing the transcript to scroll?
		videoElement: null,
		transcriptBlocks: null, //an array of all the blocks of class transcript
		transcriptFragments: [], //array of pair of times in seconds, with the trancription element associated with that time,
		captionBlocks: null, //an array of all the blocks of class captions
		captionFragments: [], //array of pair of times in seconds, with the caption element associated with that time,
		captionElement: null, //element that contains the captions
		keypointBlocks: null, //element that contains the keypoints
		keypointFragments: [], //array of pair of times in seconds, with the keypoint element associated with that time
		slideTextBlocks: [], //an array of all the blocks of class slide
		slideTextFragments: [], //array of pair of times in seconds, with the slidetext element associated with that time,
		currentTranscript: null, //the current transcript element at the current time
		currentCaption: null, //the current caption element
		currentKeypoint: null, //the current keypoint element
		currentSlideText: null, //the current element showing block of text of the slide showing now
		currentSlideTextLive: null, //the element for showing the block of text of the current slide (for ARIA) 
		captionToggle: null, //element for toggling captions on and off
		scrollToggle: null, //element for toggling auto-scroll on and off
		streamAdjustment: 1, //because livestreams run a little slow, we adjust the cations etc by this factor
		startTimeOffset: 0,  //offset to adjust for start time of video in stream in seconds
		autoScroll: true, //scroll transcript etc into view on timeChange?
		
		init: function(){

			if (!document.querySelector('.transcript-block')) { return } //not in the right sort of page
			
			//if (document.querySelector(".page-template-default")) {
				//don't need to offset captions
				//synchedMedia.startTimeOffset = 0
			//}
			
			synchedMedia.initTranscriptBlocks();
			synchedMedia.initCaptionBlocks();
			synchedMedia.initKeypointBlocks();
			synchedMedia.initSlideTextBlocks();

			synchedMedia.videoElement = document.querySelector("#video");
			synchedMedia.captionElement = document.querySelector("#captions");

			synchedMedia.initVideoElement();
			synchedMedia.initControls();
		},

		initVideoElement: function(){
		//initialize the video element

			synchedMedia.player = new Vimeo.Player(synchedMedia.videoElement);
			synchedMedia.player.on("timeupdate", synchedMedia.timeChanged)

		},

		initControls: function(){
		//initialize controls like toggle captions
		synchedMedia.captionToggle = document.querySelector("#captionToggle");

			if (synchedMedia.captionToggle) {
				synchedMedia.captionToggle.addEventListener("click", synchedMedia.toggleCaptions, false)
			}
			
			synchedMedia.scrollToggle = document.querySelector("#scrollToggle");

			if (synchedMedia.scrollToggle) {
				synchedMedia.scrollToggle.addEventListener("click", synchedMedia.toggleScroll, false)
			}
		},

		getFragmentStartTimeInSecs: function(fragmentElement){
			//get the starttime in seconds from the caption element
			//can be called with any element that has a data-startTime attribute

			var time = fragmentElement.dataset.starttime;
			var timeArray = time.split(":");

			var timeInSecs = parseInt(timeArray[0])*3600 + parseInt(timeArray[1])*60 + parseInt(timeArray[2])
			//format is hh:mm:secs
			
// 			console.log(timeInSecs, (timeInSecs * synchedMedia.streamAdjustment) + synchedMedia.startTimeOffset)

			return (timeInSecs * synchedMedia.streamAdjustment) + synchedMedia.startTimeOffset
		},

		getBlockStartTimeInSecs: function(blockElement){
			//get the starttime in seconds from the block
			//can be called with any element that has a data-blockStartTime attribute

			var time = blockElement.dataset.blockstarttime;

			if(!time) {
				var timeArray = '00:00:00'
			}
			else {
				var timeArray = time.split(":");
			}

			var timeInSecs = parseInt(timeArray[0])*3600 + parseInt(timeArray[1])*60 + parseInt(timeArray[2])
			//format is hh:mm:secs

			return timeInSecs;
			
			//return (timeInSecs * synchedMedia.streamAdjustment) + synchedMedia.startTimeOffset
		},

		initTranscriptBlocks: function(){

			var transcriptFragments = synchedMedia.initBlocks(".transcript-block")
			synchedMedia.transcriptFragments = transcriptFragments;
		},


		initCaptionBlocks: function(){

			var captionFragments = synchedMedia.initBlocks(".caption-block")
			synchedMedia.captionFragments = captionFragments;

		},

		initKeypointBlocks: function(){

			var keypointFragments = synchedMedia.initBlocks(".keypoint-block")
			synchedMedia.keypointFragments = keypointFragments;

		},

		initSlideTextBlocks: function(){

			var slideTextFragments = synchedMedia.initBlocks(".slidetext-block")
			synchedMedia.slideTextFragments = slideTextFragments;

			synchedMedia.currentSlideTextLive = document.querySelector("#currentSlideText")
		},

		initCaptionFragments: function(parentBlock){
			//each caption block has an start time
			//fragment start times are from 0
			//so we add the block start time to the fragment start times to get an absolute time in the broadcast

			captionsStartTime = synchedMedia.getBlockStartTimeInSecs(parentBlock);

			var captionFragments = parentBlock.querySelectorAll("[data-startTime]");
			var captionTime = 0;

			for (var i=0; i < captionFragments.length; i++) {
				captionTime = synchedMedia.getFragmentStartTimeInSecs(captionFragments[i]) + captionsStartTime;
				//adjust for the start time of the block
				synchedMedia.captionFragments.push([captionTime, captionFragments[i]])
			};

		},

		initBlocks: function(blockSelector){

			var blocks = document.querySelectorAll(blockSelector)
			var fragments = []
			for (var i=0; i < blocks.length; i++) {
				fragments = fragments.concat(synchedMedia.initBlockFragments(blocks[i]))
			};

			return fragments

		},

		initBlockFragments: function(parentBlock){
			//each block has an start time
			//fragment start times are from 0
			//so we add the block start time to the fragment start times to get an absolute time in the broadcast

			blockStartTime = synchedMedia.getBlockStartTimeInSecs(parentBlock);

			var fragments = parentBlock.querySelectorAll("[data-startTime]");
			var startTime = 0;
			var returnFragments = []

			for (var i=0; i < fragments.length; i++) {
				startTime = synchedMedia.getFragmentStartTimeInSecs(fragments[i]) + blockStartTime;
				//adjust for the start time of the block
				returnFragments.push([startTime, fragments[i]])
			};

			return returnFragments

		},


		timeChanged: function(time){
			//called when the time changes for the video element

			var currentTime = time.seconds //evt.target.currentTime;

			synchedMedia.highlightCurrentTranscript(currentTime);
			synchedMedia.highlightCurrentCaption(currentTime);
			synchedMedia.highlightCurrentKeypoint(currentTime);
			synchedMedia.highlightCurrentSlideText(currentTime);
// 			synchedMedia.updateCurrentSlideText(currentTime);


		},

		highlightCurrentTranscript: function(time){
			//highlight the current transcript

			var transcriptAtTime = synchedMedia.getTranscriptAtTimeinSecs(time);

			if (transcriptAtTime && synchedMedia.currentTranscript != transcriptAtTime) {
				if (synchedMedia.currentTranscript){
					synchedMedia.currentTranscript.classList.remove("currentTranscript");
				}
				transcriptAtTime.classList.add("currentTranscript");
				synchedMedia.currentTranscript = transcriptAtTime;
				
				if (synchedMedia.autoScroll) {
					transcriptAtTime.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
				}
			}

		},


		highlightCurrentCaption: function(time){
			//highlight the current caption

			var captionAtTime = synchedMedia.getCaptionAtTimeinSecs(time);

			if (captionAtTime && (synchedMedia.currentCaption != captionAtTime)) {

				if(synchedMedia.currentCaption){
					synchedMedia.currentCaption.classList.remove("currentCaption");
				}

				captionAtTime.classList.add("currentCaption");
				synchedMedia.currentCaption = captionAtTime;
			}

		},


		highlightCurrentKeypoint: function(time){
			//highlight the current caption

			var keypointAtTime = synchedMedia.getKeypointAtTimeinSecs(time);

			if (keypointAtTime && (synchedMedia.currentKeypoint != keypointAtTime)) {

				if(synchedMedia.currentKeypoint){
					synchedMedia.currentKeypoint.classList.remove("currentKeypoint");
				}

				keypointAtTime.classList.add("currentKeypoint");
				synchedMedia.currentKeypoint = keypointAtTime;
				
				if (synchedMedia.autoScroll) {
					keypointAtTime.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
				}
			}

		},


		highlightCurrentSlideText: function(time){
			//highlight the current caption

			var slideTextAtTime = synchedMedia.getSlideTextAtTimeinSecs(time);

			if (slideTextAtTime && (synchedMedia.currentSlideText != slideTextAtTime)) {
				if (synchedMedia.currentSlideText){
					synchedMedia.currentSlideText.classList.remove("currentSlideText");
				}

				slideTextAtTime.classList.add("currentSlideText");
				synchedMedia.currentSlideText = slideTextAtTime;
				synchedMedia.currentSlideTextLive.innerHTML = slideTextAtTime.innerHTML;

			}

		},


		scrollCaptionIntoView: function(caption){
			//also works for keypoints and transcripts too
			synchedMedia.imScrolling = true;
			caption.scrollIntoView({ behavior: 'smooth' });
			synchedMedia.imScrolling = false

		},


		isScrolledIntoView: function(element) {
		    var elemTop = element.getBoundingClientRect().top;
		    var elemBottom = element.getBoundingClientRect().bottom;

		    var isVisible = (elemTop >= 0) && (elemBottom <= element.offsetParent.clientHeight);

		    return isVisible;
		},


		captionsScrolling: function() {
			//called when the
		},

		getTranscriptAtTimeinSecs: function(time){
			//returns the transcript element at the given time in seconds
			//quicker to do a btree search on time, but CBF right now

			//check current transcript first
			//is it before the current time? and is the next sibling if any after the current time?
			//then it's still current
			//

			if (synchedMedia.currentTranscript) {

				var currentTranscriptFragmentTime = synchedMedia.getFragmentStartTimeInSecs(synchedMedia.currentTranscript)
				var nextTranscriptFragment = synchedMedia.currentTranscript.nextElementSibling

				if (nextTranscriptFragment) {
					var nextTrancriptFragmentTime = synchedMedia.getFragmentStartTimeInSecs(nextTranscriptFragment)
				}

				else {

					var nextTrancriptFragmentTime = time
					//hack to select the current fragment if it's the last one

				}

				if ((currentTranscriptFragmentTime > time) && (nextTrancriptFragmentTime < time))  {
						return synchedMedia.currentTranscript
						//still current transcript fragment, so return it
				}

			}

			//otherwise find the current one

			for (var i=0; i < synchedMedia.transcriptFragments.length; i++) {
				if(synchedMedia.transcriptFragments[i][0] > time) {

					if (i > 0) {
						return synchedMedia.transcriptFragments[i-1][1];
					}

					else {
						return null //none match
					}
				}
			};

		},

		getCaptionAtTimeinSecs: function(time){
			//returns the caption element at the given time in seconds
			//quicker to do a btree search on time, but CBF right now

			//check current caption first
			//is it before the current time? and is the next sibling if any after the current time?
			//then it's still current
			//

			if (synchedMedia.currentCaption) {

				var currentCaptionFragmentTime = synchedMedia.getFragmentStartTimeInSecs(synchedMedia.currentCaption)
				var nextCaptionFragment = synchedMedia.currentCaption.nextElementSibling

				if (nextCaptionFragment) {
					var nextCaptionFragmentTime = synchedMedia.getFragmentStartTimeInSecs(nextCaptionFragment)
				}

				else {

					var nextCaptionFragmentTime = time
					//hack to select the current fragment if it's the last one

				}

				if ((currentCaptionFragmentTime > time) && (nextCaptionFragmentTime < time))  {
						return synchedMedia.currentCaption
						//still current caption, so return it
				}

			}

			//otherwise find the current one


			for (var i=0; i < synchedMedia.captionFragments.length; i++) {
				if(synchedMedia.captionFragments[i][0] > time) {

					if (i > 0) {
						return synchedMedia.captionFragments[i-1][1];
					}

					else {
						return null //none match
					}
				}
			};

		},

		getKeypointAtTimeinSecs: function(time){
			//returns the keypoint element at the given time in seconds
			//quicker to do a btree search on time, but CBF right now

						//check current Keypoint first
			//is it before the current time? and is the next sibling if any after the current time?
			//then it's still current
			//

			if (synchedMedia.currentKeypoint) {

				var currentKeypointFragmentTime = synchedMedia.getFragmentStartTimeInSecs(synchedMedia.currentKeypoint)
				var nextKeypointFragment = synchedMedia.currentKeypoint.nextElementSibling

				if (nextKeypointFragment) {
					var nextTrancriptFragmentTime = synchedMedia.getFragmentStartTimeInSecs(nextKeypointFragment)
				}

				else {

					var nextTrancriptFragmentTime = time
					//hack to select the current fragment if it's the last one

				}

				if ((currentKeypointFragmentTime > time) && (nextTrancriptFragmentTime < time))  {
						return synchedMedia.currentKeypoint
						//still current Keypoint fragment, so return it
				}

			}

			//otherwise find the current one

			for (var i=0; i < synchedMedia.keypointFragments.length; i++) {
				if(synchedMedia.keypointFragments[i][0] > time) {

					if (i > 0) {
						return synchedMedia.keypointFragments[i-1][1];
					}

					else {
						return null //none match
					}
				}
			};


		},

		getSlideTextAtTimeinSecs: function(time){
			//returns the keypoint element at the given time in seconds
			//quicker to do a btree search on time, but CBF right now

			//check current caption first
			//is it before the current time? and is the next sibling if any after the current time?
			//then it's still current
			//

			if (synchedMedia.currentSlideText) {

				var currentSlideTextFragmentTime = synchedMedia.getFragmentStartTimeInSecs(synchedMedia.currentSlideText)
				var nextSlideTextFragment = synchedMedia.currentSlideText.nextElementSibling

				if (nextSlideTextFragment) {
					var nextSlideTextFragmentTime = synchedMedia.getFragmentStartTimeInSecs(nextSlideTextFragment)
				}

				else {

					var nextSlideTextFragmentTime = time
					//hack to select the current fragment if it's the last one

				}

				if ((currentSlideTextFragmentTime > time) && (nextSlideTextFragmentTime < time))  {
						return synchedMedia.currentSlideText
						//still current fragment, so return it
				}

			}

			for (var i=0; i < synchedMedia.slideTextFragments.length; i++) {
				if(synchedMedia.slideTextFragments[i][0] > time) {

					if (i > 0) {
						return synchedMedia.slideTextFragments[i-1][1];
					}

					else {
						return null //none match
					}
				}
			};

		},

		toggleCaptions: function(evt){
		//called when captionToggle clicked
			synchedMedia.captionElement.toggleAttribute("hidden")
		},
		
		toggleScroll: function(evt){
		//called when scrollToggle clicked
			synchedMedia.autoScroll = !synchedMedia.autoScroll
		}


}

// window.addEventListener("DOMContentLoaded", synchedMedia.init, false)
window.addEventListener("DOMContentLoaded", initMedia, false)