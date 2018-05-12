var myAudio;
var indexSongNow;
var info;

var backG;
var backgNow;
var objects = [];

var mic;
var AmplitudeData;
var FftData;
var ampLevel;
var fftAnalyze;
var fftWave;

var rectChooseMulti;
var designMode = false;

function setup() {
	// first setting
	createCanvas(windowWidth, windowHeight).position(0, 0).drop(getFileLocal);
	colorMode(HSB);
	angleMode(DEGREES);
	imageMode(CENTER);
	rectMode(CENTER);
	textSize(20);
	textAlign(CENTER, CENTER);

	mic = new p5.AudioIn();
	AmpData = new p5.Amplitude();
	FftData = new p5.FFT(0.4, 512);

	// add object
	info = new InfoSong();
	rectChooseMulti = new rectChooseMultiObject();
	addGui();
	backgNow = floor(random(0, 47));
	VisualizeGui.backgs = backgNow;
	backG = loadImage("image/BackG"+backgNow+".jpg");

	// create Audio
	indexSongNow = floor(random(IdZing.length-1));
	VisualizeGui.songs = IdZing[indexSongNow].name;
	// addAudioFromID(IdZing[indexSongNow].id);
	createNewAudio("ChayNgayDi-SonTungMTP.mp3");
	info.setTitleFromFile("Chạy Ngay Đi - Sơn Tùng MTP.mp3");

	loadJSON('default theme/yourTheme.json',
				// loaded
				function(data){
					loadTheme(data, false);
					objects.push(new fftGraph(width/2, height/2, 258, 274, "connect"));
				},
				// error
				function(){
					var id = IdZing[indexSongNow].id;
					addAudioFromID(id);
				}
			);
}

function draw(){
	if((focused && VisualizeGui.checkFocus) || !VisualizeGui.checkFocus){
		animationBackground();
		autoChangeBackFunc();

		// get data to visualyze
		if(myAudio){
			ampLevel = AmpData.getLevel();
			fftWave = FftData.waveform();
			fftAnalyze = FftData.analyze();
			fftAnalyze.splice(64, 512-64);
				
			// run all objects
			for(var i = 0; i < objects.length; i++)
				objects[i].run();
		}

		// choose multi object
		if(rectChooseMulti.isActive && designMode){
			rectChooseMulti.show();
		}
	}
}

function keyPressed(){
	if(keyCode == 83) { // S key
		designMode = !designMode;
		VisualizeGui.showDesignMode = designMode;
	
	} else if(keyCode == LEFT_ARROW){
		if(myAudio.elt.currentTime >= 5)
			myAudio.play().time(myAudio.elt.currentTime-5);

	} else if(keyCode == RIGHT_ARROW){
		if(myAudio.elt.currentTime < myAudio.elt.duration-5)
			myAudio.play().time(myAudio.elt.currentTime+5);

	} else if(keyCode == 67) {	// C key
		if(myAudio){
			if(!myAudio.elt.controls)
				myAudio.showControls();
			else myAudio.hideControls();
		}
	}
}

function mousePressed(){
	if(designMode){
		for(var i = 0; i < objects.length; i++)
			objects[i].boxcontain.mouseChoose();

		// if choose multi object => when click mouse 
		// => need to check position of mouse
		// => is mouse position inside any 'choosed' object
		var foundObjectInChoose = false;
		for(var i = 0; i < objects.length; i++){
			if(objects[i].boxcontain.allowChangepos 
			&& objects[i].boxcontain.chooseMulti){
				foundObjectInChoose = true;
				break;
			}
		}

		if(!foundObjectInChoose)
			for(var i = 0; i < objects.length; i++)
				objects[i].boxcontain.setChooseMulti(false);

	} else {
		// check if mouse click on a button
		for(var i = 0; i < objects.length; i++){
			if(objects[i].objectType == 'ButtonShape')
				objects[i].clicked();
		}
	}
}

function mouseDragged(){
	if(designMode){
		for(var i = 0; i < objects.length; i++)
			objects[i].boxcontain.drag();
	
		if(keyIsDown(CONTROL) && rectChooseMulti.isActive){
			// save end pos while drag + ctrl
			rectChooseMulti.setEnd(mouseX, mouseY);
	
		} else {
			rectChooseMulti.setActive(true);
			// begin and end position will = first pos + ctrl
			rectChooseMulti.setBegin(mouseX, mouseY);
			rectChooseMulti.setEnd(mouseX, mouseY);
		}
	}
}

function mouseReleased(){
	if(rectChooseMulti.isActive && designMode){
		for(var i = 0; i < objects.length; i++){
			if(isPointInsideRect(objects[i].pos, rectChooseMulti.beginPoint, rectChooseMulti.endPoint))
				objects[i].boxcontain.setChooseMulti(true);
		}
		rectChooseMulti.setActive(false);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight, true);
}
