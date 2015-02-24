#SFX.js

> ***IMPORTANT NOTICE*** This project is no longer maintained and the Firefox Media API or Webkit Audio API have undergone development. SFX.js has not been changed to accomodate any changes and may no longer work.

##Sound Effects API

The idea behind the SFX API was to create a simple, easy to use library for using the Firefox Media API or Webkit Audio API. The program chooses which is applicable and makes the complex APIs much easier to use and adds un-native functionality. It can be seen in action at [Larco Labs Music](//music.larcolabs.appspot.com) in a purely Javascript audio player.

##Usage
Download [SFX.js](./SFX.js) and include it in your html.
```html
<script src='js/SFX.js'></script>
```

This code creates a SFX object, loads an audio file through it, and alerts the user when loaded. It will be automatically played.
```javascript

	var audio = new SFX();
	
	audio.open('audioFile.mp3',function(){
		alert('Loaded!');
	});
```

See, nice and easy! This will asynchronously load the audio file and play it through the appropriate media API native to the browser. You may play as many files at the same time as necessary through one SFX object, thus there is no need to make multiple.

##Methods
* The `open` command directs the SFX object to open the media file, which cannot be cross-origin unless the external server allows it in its Access-Control-Allow-Origin settings. Its parameters are first the URL for the media file, and second, an option onload function.
* The `kill` command forcefully stops all audio files, or if one is explicitly mentioned it will stop that one. To reference a specific audio file reference it by its location in the {func~node} array.
* The `togglePlay` command toggles play and pause for all audio files, or if one is explicitly mentioned it will toggle just that one. To reference a specific audio file reference it by its location in the `node` array.

##Variables
* The `nodes` array contains all of the audio source instances with extra parameters including
	* currentTime
	* paused bool
	* toggle play/pause
	* duration
	* analyzer
* The `context` variable is the actual instance for the media API, either the Firefox Media API or Webkit Audio API.

##Node Objects
The node objects are instances of an audio file being played. These contain what the parent API uses, however they have a few extra, added features.

* The `analyzer` variable contains a real time array of the FFT spectrum analysis for the audio file.
* The `paused` variable is simply a boolean indicating whether or not the audio is paused.
* The `duration` variable is the duration of the file in seconds.
* The `currentTime` variable returns the current time in the media and when set to any amount of seconds, the audio file will jump to that time in the media.
* The `togglePlay` function either plays or pauses the audio file based on its current state.

##Simple Demo
```html
<canvas id='stream' width='512' height='200'></canvas>
<script>
var sfx = new SFX();
sfx.open('audioFile.mp3',function(){
	// grab canvas
	var canvas = document.getElementById('stream');
	var ctx = canvas.getContext('2d');
	function update(){
		// get analyzer data
		var freqByteData = sfx.nodes[0].analyzer;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		// draw each spectrum bar
		var i=freqByteData.length;while(i--){
			var percent = freqByteData[i]*ratio;
			ctx.fillRect(i,canvas.height,1,-percent*8);
		};
		// call itself to run again
		requestAnimationFrame(update);
	};
	update();
});
</script>
```

##Change Log
3/24/2013
* First Stable Release