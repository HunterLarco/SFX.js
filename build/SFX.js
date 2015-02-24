/* SFX.js 1.0.0
 * -----------------
 *
 * (c) 2013-2015 Hunter Larco <larcolabs.com>
 * SFX.js may be freely distributed under the MIT license.
 * For all details and documentation:
 * <https://github.com/HunterLarco/Color.js>
*/

var SFX = function(){
	/* ---- private methods ---- */
	var playBuffer = (function(startTime,onload){
		var onload = onload || new Function();
		var startTime = startTime || 0;
		var source = context.createBufferSource();       // creates a sound source
		var audioAnalysis = context.createAnalyser();
    source.playbackRate.value = 1;
    source.buffer = buffer;                          // tell the source which sound to play
		//
		audioAnalysis.smoothingTimeConstant = 0.6;
		audioAnalysis.fftSize = 1024;
		//
		source.connect(audioAnalysis);                        // connect the source to the analyzer
		//
    audioAnalysis.connect(context.destination);           // connect gainNode to the context's destination (the speakers)
		// fade in-out
		source.gain.value = 0.6;
    source.noteGrainOn(0,startTime,buffer.duration-startTime);                           // play the source now (delay,start,end)
		// set global nodes (adds currentTime, paused bool, toggle play/pause, duration, and analyzer to source node)
		source.__defineGetter__('analyzer',(function(){
			var freqByteData = new Uint8Array(this._analyzerDataNode.frequencyBinCount);
			this._analyzerDataNode.getByteFrequencyData(freqByteData);
			return freqByteData;
		}).bind(source));
		source._analyzerDataNode = audioAnalysis;
		source.duration = buffer.duration;
		source.__defineGetter__('currentTime',(function(){ // current time getter
			if(this.togglePlay.state!=false){
				var ctime = this.togglePlay.state;
			}else{
				var ctime = (new Date().getTime()-this.togglePlay.last)/1000+this.togglePlay.elapsed;
			};
			return ctime>this.duration?this.duration:ctime;
		}).bind(source));
		source.__defineSetter__('currentTime',(function(time){ // setter for current time stops current and restarts buffer at new time (a hack)
			var source = this.environ.nodes[this.target];
			source.noteOff(0);
			if(!source.paused){
				this.environ.nodes.splice(this.target,1);
				buffer = source.buffer;
				playBuffer(time);
			}else{
				source.togglePlay.state = time;
			};
		}).bind({environ:this,target:this.nodes.length}));
		source.togglePlay = (function(){
			var source = this.environ.nodes[this.target];
			if(source.togglePlay.state===false){
				source.togglePlay.state = source.currentTime;
				source.paused = true;
				source.noteOff(0);
			}else{
				this.environ.nodes.splice(this.target,1);
				buffer = source.buffer;
				playBuffer(source.togglePlay.state);
			};
		}).bind({environ:this,target:this.nodes.length});
		/* source.togglePlay.last records the real time when the music started
		 * source.togglePlay.elapsed records the time in the music where the song was forced to start
		 * the two are used together to get the current time of the playing song
		 * this is done like so: (new Date().getTime()-source.togglePlay.last)/1000+source.togglePlay.elapsed
		 * by the way that is in seconds
		 */
		source.paused = false;
		source.togglePlay.state = false;
		source.togglePlay.last = new Date().getTime();
		source.togglePlay.elapsed = startTime;
		this.nodes.push(source);
		try{onload();}catch(e){};
	}).bind(this);
	/* ---- public variables ---- */
	var context = new (window.AudioContext || window.webkitAudioContext)();
	this.__defineGetter__('context',function(){return context;});
	var buffer = new ArrayBuffer();
	this.__defineGetter__('buffer',function(){return buffer;});
	this.nodes = new Array();
	/* ---- public methods ---- */
	this.togglePlay = (function(identifier){ // toggles play or pause for a song or all songs if not specified
		var identifier = identifier || null;
		if(identifier===null){
			for(var i=0;i<this.nodes.length;i++){
				this.nodes[i].togglePlay();
			};
		}else{
			this.nodes[identifier].togglePlay();
		};
	}).bind(this);
	this.kill = (function(identifier){ // force stops a song or all songs if not specified
		var identifier = identifier || null;
		if(identifier===null){
			for(var i=0;i<this.nodes.length;i++){
				this.nodes[i].disconnect();
			};
			this.nodes = [];
		}else{
			this.nodes[identifier].disconnect();
			this.nodes.splice(identifier,1);
		};
	}).bind(this);
	this.open = (function(song,onload){ // plays a song
		var request = new XMLHttpRequest();
    request.open('GET', song, true);
    request.responseType = 'arraybuffer';
    // Decode asynchronously
    request.onload = (function(event){
			buffer = event.target.response;
      context.decodeAudioData(buffer, (function(b){
        buffer = b;
        playBuffer(null,onload);
      }).bind(this), function(event){
				console.error('UNKNOWN ERROR: SFX cannot open '+song+';'+event.message);
			});
    }).bind(this);
    request.send();
	}).bind(this);
};