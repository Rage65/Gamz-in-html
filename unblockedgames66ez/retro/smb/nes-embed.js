var nesCanvas;
var isFocused = false;
var romData;
var gameName;


var SCREEN_WIDTH = 256;
var SCREEN_HEIGHT = 240;
var FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_WIDTH;

var canvas_ctx, image;
var framebuffer_u8, framebuffer_u32;

var AUDIO_BUFFERING = 512;
var SAMPLE_COUNT = 4*1024;
var SAMPLE_MASK = SAMPLE_COUNT - 1;
var audio_samples_L = new Float32Array(SAMPLE_COUNT);
var audio_samples_R = new Float32Array(SAMPLE_COUNT);
var audio_write_cursor = 0, audio_read_cursor = 0;

var nes = new jsnes.NES({
	onFrame: function(framebuffer_24){
		for(var i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
	},
	onAudioSample: function(l, r){
		audio_samples_L[audio_write_cursor] = l;
		audio_samples_R[audio_write_cursor] = r;
		audio_write_cursor = (audio_write_cursor + 1) & SAMPLE_MASK;
	},
});

function onAnimationFrame(){
	window.requestAnimationFrame(onAnimationFrame);
	
	image.data.set(framebuffer_u8);
	canvas_ctx.putImageData(image, 0, 0);
}

function audio_remain(){
	return (audio_write_cursor - audio_read_cursor) & SAMPLE_MASK;
}

function audio_callback(event){
	var dst = event.outputBuffer;
	var len = dst.length;
	
	// Attempt to avoid buffer underruns.
	if(audio_remain() < AUDIO_BUFFERING) nes.frame();
	
	var dst_l = dst.getChannelData(0);
	var dst_r = dst.getChannelData(1);
	for(var i = 0; i < len; i++){
		var src_idx = (audio_read_cursor + i) & SAMPLE_MASK;
		dst_l[i] = audio_samples_L[src_idx];
		dst_r[i] = audio_samples_R[src_idx];
	}
	
	audio_read_cursor = (audio_read_cursor + len) & SAMPLE_MASK;
}

var keys = [38/*Arrow Up*/,
			40/*Arrow Down*/, 
			37/*Arrow Left*/,
			39/*Arrow Right*/, 
			88/*A(X)*/, 
			90/*B(Z)*/, 
			16/*SEL(Shift)*/, 
			13/*START(Enter)*/];
var controlerP1 = [false, false, false, false, false, false, false, false];
var keys2 = [73/*Arrow Up*/,	//if keys are so good, why isn't there keys2?
			75/*Arrow Down*/, 
			74/*Arrow Left*/,
			76/*Arrow Right*/, 
			65/*A(A)*/, 
			81/*B(Q)*/, 
			20/*SEL(CAPS)*/, 
			9/*START(TAB)*/];
var controlerP2 = [false, false, false, false, false, false, false, false];
var metaKeys = [keys, keys2];

var cntrlHeld = false;

function keyDown(event){
	event.preventDefault();
	if (bondMode){
		for (let i = 0; i < keys.length; i++){ 
			if (keys[i] == -1){ keys[i] = event.keyCode; }
		}
		//save keys
		window.localStorage.setItem("keys", JSON.stringify({keys:keys, keys2:keys2}));
		bondMode = false;
		bondN = 0;
		drawController();
	}
	if (bondMode2){
		for (let i = 0; i < keys2.length; i++){ 
			if (keys2[i] == -1){ keys2[i] = event.keyCode; }
		}
		//save keys
		window.localStorage.setItem("keys", JSON.stringify({keys:keys, keys2:keys2}));
		bondMode2 = false;
		bondN = 0;
		drawController();
	}
	if (event.keyCode == 82 && cntrlHeld){
		resetSystem();
	}
	if (event.keyCode == 17){//cntrl
		cntrlHeld = true; 
	}	
	for (let i = 0; i < keys.length; i++){
		if (event.keyCode == keys[i]){
			controlerP1[i] = true;
		}
		if (event.keyCode == keys2[i]){
			controlerP2[i] = true;
		}
	}
}

function keyUp(event){
	if (event.keyCode == 17){//cntrl
		cntrlHeld = false; 
	}
	for (let i = 0; i < keys.length; i++){
		if (event.keyCode == keys[i]){
			controlerP1[i] = false;
		}
		if (event.keyCode == keys2[i]){
			controlerP2[i] = false;
		}
	}
}

function keyboard(){	
	if (romData != null){
		setNVRAM();
	}
	
	var player = 1;
	if (controlerP1[0]){ nes.buttonDown(player, jsnes.Controller.BUTTON_UP);  }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_UP); }
	if (controlerP1[1]){ nes.buttonDown(player, jsnes.Controller.BUTTON_DOWN); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_DOWN); }
	if (controlerP1[2]){ nes.buttonDown(player, jsnes.Controller.BUTTON_LEFT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_LEFT); }
	if (controlerP1[3]){ nes.buttonDown(player, jsnes.Controller.BUTTON_RIGHT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_RIGHT); }
	if (controlerP1[4]){ nes.buttonDown(player, jsnes.Controller.BUTTON_A); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_A); }
	if (controlerP1[5]){ nes.buttonDown(player, jsnes.Controller.BUTTON_B); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_B); }
	if (controlerP1[6]){ nes.buttonDown(player, jsnes.Controller.BUTTON_SELECT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_SELECT); }
	if (controlerP1[7]){ nes.buttonDown(player, jsnes.Controller.BUTTON_START); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_START); }
	
	player = 2;
	if (controlerP2[0]){ nes.buttonDown(player, jsnes.Controller.BUTTON_UP); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_UP); }
	if (controlerP2[1]){ nes.buttonDown(player, jsnes.Controller.BUTTON_DOWN); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_DOWN); }
	if (controlerP2[2]){ nes.buttonDown(player, jsnes.Controller.BUTTON_LEFT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_LEFT); }
	if (controlerP2[3]){ nes.buttonDown(player, jsnes.Controller.BUTTON_RIGHT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_RIGHT); }
	if (controlerP2[4]){ nes.buttonDown(player, jsnes.Controller.BUTTON_A); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_A); }
	if (controlerP2[5]){ nes.buttonDown(player, jsnes.Controller.BUTTON_B); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_B); }
	if (controlerP2[6]){ nes.buttonDown(player, jsnes.Controller.BUTTON_SELECT); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_SELECT); }
	if (controlerP2[7]){ nes.buttonDown(player, jsnes.Controller.BUTTON_START); }
	else { nes.buttonUp(player, jsnes.Controller.BUTTON_START); }
	
	metaKeys = [keys, keys2];
	drawController();
	
}

function nes_init(canvas_id){
	var canvas = document.getElementById(canvas_id);
	canvas_ctx = canvas.getContext("2d");
	image = canvas_ctx.getImageData(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	canvas_ctx.fillStyle = "black";
	canvas_ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
	
	// Allocate framebuffer array.
	var buffer = new ArrayBuffer(image.data.length);
	framebuffer_u8 = new Uint8ClampedArray(buffer);
	framebuffer_u32 = new Uint32Array(buffer);
	
	// Setup audio.
	var audio_ctx = new window.AudioContext();
	var script_processor = audio_ctx.createScriptProcessor(AUDIO_BUFFERING, 0, 2);
	script_processor.onaudioprocess = audio_callback;
	script_processor.connect(audio_ctx.destination);
}

function nes_boot(rom_data){
	if (rom_data != null){
		if (!init){	
			nes_init("nes-canvas");
			init = true;
		}
		nesCanvas.focus();
		nes.loadROM(rom_data);
		window.requestAnimationFrame(onAnimationFrame);
		getNVRAM();
	}
}

function nes_load_url(canvas_id, path){	
	var req = new XMLHttpRequest();
	req.open("GET", path);
	req.overrideMimeType("text/plain; charset=x-user-defined");
	req.onerror = () => console.log(`Error loading ${path}: ${req.statusText}`);
	
	req.onload = function() {
		if (this.status === 200) {
			romData = this.responseText;
			gameName = path;
			//console.log(romData);
			nes_boot(romData);
		} else if (this.status === 0) {
			// Aborted, so ignore error
		} else {
			req.onerror();
		}
	};
	
	req.send();
}
function readLocalGame(file) {
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
		if (romData != event.target.result){
			console.log('yes is different');
		}
		else{ console.log('no is same'); }
		romData = event.target.result;
		gameName = file.name;
		//console.log(romData);
		nes_boot(romData);
  });
  reader.readAsText(file, "x-user-defined");
}

function getNVRAM(){
	let data = window.localStorage.getItem(gameName);
	if (data != null){
		data = JSON.parse(data);
		for (let i = 0; i < 8192; i++){
			nes.cpu.mem[24576 + i] = data.mem[i]; 
		}
	}
}
function setNVRAM(){
	window.localStorage.setItem(gameName, JSON.stringify({ mem: nes.cpu.mem.slice(24576, 32768)}));//2K of NVRAM
}

function resetSystem(){
	nes.reset();
	if (romData != null){
		nes_boot(romData);
	}
	nesCanvas.focus();
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

window.setInterval(keyboard, 16);

//resizing the canvas
window.onload = function(){
	//keys
	let kBuff = window.localStorage.getItem("keys");
	if (kBuff != null){
		kBuff = JSON.parse(kBuff);
		keys = kBuff.keys;
		keys2 = kBuff.keys2;
	}
	
	//canvas
	nesCanvas = document.getElementById("nes-canvas");
	document.addEventListener("mousedown", clickPage);
	document.addEventListener("mousemove", movePage);
	document.addEventListener("mouseup", releasePage);
	ctxL = document.getElementById("cLeft").getContext("2d");
	ctxR = document.getElementById("cRight").getContext("2d");
	ctxL2 = document.getElementById("cLeft2").getContext("2d");
	ctxR2 = document.getElementById("cRight2").getContext("2d");
	
	document.getElementById("cLeft").addEventListener("mousemove", canvasLeftMouse);
	document.getElementById("cRight").addEventListener("mousemove", canvasRightMouse);
	document.getElementById("cLeft").addEventListener("click", clickLeft);
	document.getElementById("cRight").addEventListener("click", clickRight);
	document.getElementById("cLeft2").addEventListener("mousemove", canvasLeftMouse2);
	document.getElementById("cRight2").addEventListener("mousemove", canvasRightMouse2);
	document.getElementById("cLeft2").addEventListener("click", clickLeft2);
	document.getElementById("cRight2").addEventListener("click", clickRight2);
	
	//settings:
	let buffer = window.localStorage.getItem("setting1");
	if (buffer == null){ setCont1(true); }
	else { showCont1 = BooleanS(buffer); setCont1(showCont1); }
	let buffer2 = window.localStorage.getItem("setting2");
	if (buffer2 == null){ setCont2(false); }
	else { showCont2 = BooleanS(buffer2); setCont2(showCont2); }
	let buffer3 = window.localStorage.getItem("setting3");
	if (buffer3 == null){ setDisplayInput(false); }
	else { displayInput = BooleanS(buffer3); setDisplayInput(displayInput); }
	let buffer4 = window.localStorage.getItem("setting4");
	if (buffer4 == null){ setShowKeyBindings(true); }
	else { showKeyBindings = BooleanS(buffer4); setShowKeyBindings(showKeyBindings); }
	let buffer5 = window.localStorage.getItem("setting4");
	buffer5 = false;	//never start fullscreen
	fullscreen = buffer5;
	//if (buffer5 == null){ setFullScreen(false); }
	//else { fullscreen = BooleanS(buffer5); setFullScreen(showKeyBindings); }
	//files
	
	var fileSelector = document.getElementById('file-selector');
	document.getElementById("loadButton").addEventListener("click", loadGame);
	fileSelector.addEventListener('change', getFile);
	resize();
	
	//mobile control labels
	if (navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)) {
		keys = keys2 = [38/*Arrow Up*/,
			40/*Arrow Down*/, 
			37/*Arrow Left*/,
			39/*Arrow Right*/, 
			65/*A(X)*/, 
			66/*B(Z)*/, 
			254/*SEL(Shift)*/, 
			255/*START(Enter)*/];
	}
	
}
function BooleanS(val){
	if (val == "true"){ return true; }
	return false;
}

function getFile(event){
	let fileList = event.target.files;
	if (fileList.length > 0){
		readLocalGame(fileList[0]);
	}
}
const dropArea = document.getElementById('drop-area');

dropArea.addEventListener('dragover', (event) => {
  event.stopPropagation();
  event.preventDefault();
  // Style the drag-and-drop as a "copy file" operation.
  event.dataTransfer.dropEffect = 'copy';
});

dropArea.addEventListener('drop', (event) => {
	event.stopPropagation();
	event.preventDefault();
	let fileList = event.dataTransfer.files;
	if (fileList.length > 0){
		readLocalGame(fileList[0]);
	}
});

var init = false;
function loadGame(event){
	document.getElementById("file-selector").click();

}

window.onresize = function(){
	resize();
}

function resize(){
	var body = document.body;
    var html = document.documentElement;
	let cLeft = document.getElementById("cLeft");
	let cRight = document.getElementById("cRight");
	let cLeft2 = document.getElementById("cLeft2");
	let cRight2 = document.getElementById("cRight2");
	cLeft2.width = cLeft2.height = cRight2.width = cRight2.height =
	cLeft.width = cLeft.height = cRight.width = cRight.height = 600;
	
	let height = html.clientHeight;
	let width = html.clientWidth;
	
	let ratio = 0.90;
	if (width >= height){
		nesCanvas.style.height = (height * ratio).toString() + "px";
		nesCanvas.style.width = (height * ratio * (16/15)).toString() + "px";
		cRight2.style.width = 
		cRight2.style.height = 
		cLeft2.style.width = 
		cLeft2.style.height =
		cRight.style.width = 
		cRight.style.height = 
		cLeft.style.width = 
		cLeft.style.height = ((width - (height * ratio * (16/15))) * 0.45).toString() + "px";
		cLeft2.style.float = cLeft.style.float = "left";
		cRight2.style.float = cRight.style.float = "right";
		cLeft2.style.marginLeft = cLeft.style.marginLeft = "0px";
		document.getElementById("controlerBlock").style.top = ((nesCanvas.clientHeight / 2) - (cLeft.clientHeight / 2)).toString() + "px";
		document.getElementById("settings").style.top = "102%";
		document.getElementById("panel").style.top = "-20px";
	}
	else{
		nesCanvas.style.width = (width * ratio).toString() + "px";
		nesCanvas.style.height = (width * ratio * (15/16)).toString() + "px";
		cRight2.style.width = 
		cRight2.style.height = 
		cLeft2.style.width = 
		cLeft2.style.height =
		cRight.style.width = 
		cRight.style.height = 
		cLeft.style.width = 
		cLeft.style.height = (width * 0.45).toString() + "px";
		cLeft2.style.float = cRight2.style.float = 
		cLeft.style.float = cRight.style.float = "left";
		cLeft2.style.marginLeft = cLeft.style.marginLeft = "3.5%";
		document.getElementById("controlerBlock").style.top = ((nesCanvas.clientHeight * 1.2)).toString() + "px";
		document.getElementById("settings").style.top = ((nesCanvas.clientHeight * 1.2)).toString() + "px";
		document.getElementById("panel").style.top = ((nesCanvas.clientHeight * 1)).toString() + "px";
	}
	document.getElementById("cNewLine").style.marginTop = (cLeft.clientHeight * 1.1).toString() + "px";
	drawController();
}

//focus
var mDown = false;
function clickPage(e){
	//console.log(e);
	mDown = true;
	var rect = nesCanvas.getBoundingClientRect();
	if (e.pageX - rect.left > 0 && e.pageX - rect.left < rect.width &&
		e.pageY - rect.top > 0 && e.pageY - rect.top < rect.height){
		 isFocused = true;
		 let point = [(e.pageX - rect.left) / rect.width * 256, (e.pageY - rect.top) / rect.height * 256]
		 nesZapper(point);
	}
	else { isFocused = false; }
}
function movePage(e){
	var rect = nesCanvas.getBoundingClientRect();
	if (e.pageX - rect.left > 0 && e.pageX - rect.left < rect.width &&
		e.pageY - rect.top > 0 && e.pageY - rect.top < rect.height){
		 let point = [(e.pageX - rect.left) / rect.width * 256, (e.pageY - rect.top) / rect.height * 256]
		 //moveZapper(point);
	}
}
function releasePage(e){
	mDown = false;
	var rect = nesCanvas.getBoundingClientRect();
	if (e.pageX - rect.left > 0 && e.pageX - rect.left < rect.width &&
		e.pageY - rect.top > 0 && e.pageY - rect.top < rect.height){
		 unzap();
	}
}
function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
    document.documentElement.msRequestFullscreen();
  }
}
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

//controllers
var buttonRectsL = [[225, 100, 150, 125], [225, 375, 150, 125], [100, 225, 125, 150], [375, 225, 125, 150]];
	//add event where it shows blue over rect
	//then add a click event where it waits for next key to bind
var buttonRectsR = [[325, 100, 200, 200], [75, 100, 200, 200], [50, 400, 200, 100], [325, 400, 200, 100]];

var ctxL;
var ctxR;
var ctxL2;
var ctxR2;
var bondMode = false;
var bondMode2 = false;
var bondN = 0;

var buttonHover = [false, false, false, false, false, false, false, false];
var buttonHover2 = [false, false, false, false, false, false, false, false];

function drawController(){
	if (ctxL == undefined){ return; }
	drawControllerTechnical(ctxL, ctxR, bondMode, controlerP1, buttonHover, 0);
	drawControllerTechnical(ctxL2, ctxR2, bondMode2, controlerP2, buttonHover2, 1);
}

function drawControllerTechnical(canvas1, canvas2, bond, bHigh, bHover, C){	
	try{
		canvas1.roundRect(0, 0, 0, 0, 0);
	}
	catch{
		drawControllerFF(canvas1, canvas2, bond, bHigh, bHover, C);
		return;
	}
	 
	 
	canvas2.strokeStyle = canvas1.strokeStyle = "#dcd7d4";
	canvas2.lineWidth = canvas1.lineWidth = 25;
	//background:
	if (bond && bondN < 4){ 
		canvas2.fillStyle = canvas1.fillStyle = "#b6dcfb"; 
	}
	else { canvas2.fillStyle = canvas1.fillStyle = "black"; }
	canvas1.beginPath();
	canvas1.roundRect(25, 25, 700, 550, 25);
	canvas1.stroke();
	canvas1.fill();
	
	if (bond && bondN >= 4){ canvas2.fillStyle = canvas1.fillStyle = "#b6dcfb"; }
	else { canvas2.fillStyle = canvas1.fillStyle = "black"; }
	canvas2.beginPath();
	canvas2.roundRect(-100, 25, 675, 550, 25);
	canvas2.stroke();
	canvas2.fill();
	canvas2.fillStyle = canvas1.fillStyle = "black";
	
	//dpad
	canvas1.beginPath();
	canvas1.roundRect(100, 225, 400, 150, 25);
	canvas1.roundRect(225, 100, 150, 400, 25);
	canvas1.stroke();
	canvas1.fill();
	//A/B buttons
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.roundRect(325, 100, 200, 200, 25);
	canvas2.fill();
	canvas2.fillStyle = "#ad0101";
	canvas2.beginPath();
	canvas2.arc(425, 200, 80, 0, 2 * Math.PI);
	canvas2.fill();
	
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.roundRect(75, 100, 200, 200, 25);
	canvas2.fill();
	canvas2.fillStyle = "#ad0101";
	canvas2.beginPath();
	canvas2.beginPath();
	canvas2.arc(175, 200, 80, 0, 2 * Math.PI);
	canvas2.fill();
	//start
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.roundRect(25, 375, 525, 150, 25);
	canvas2.fill();
	canvas2.fillStyle = "black";
	
	canvas2.beginPath();
	canvas2.roundRect(325, 400, 200, 100, 25);
	canvas2.fill();
	//select
	canvas2.beginPath();
	canvas2.roundRect(50, 400, 200, 100, 25);
	canvas2.fill();
	
	//displayInput
	if (displayInput){
		for (let i = 0; i < bHigh.length; i++){
			if (bHigh[i] && i < 4){
				canvas1.fillStyle = "#00FFFF88";
				canvas1.fillRect(buttonRectsL[i][0], buttonRectsL[i][1], buttonRectsL[i][2], buttonRectsL[i][3]);
			}
			else if (bHigh[i] && i >= 4){
				canvas2.fillStyle = "#00FFFF88";
				canvas2.fillRect(buttonRectsR[i-4][0], buttonRectsR[i-4][1], buttonRectsR[i-4][2], buttonRectsR[i-4][3]);
			}
		}
	}
	//highlight hover
	for (let i = 0; i < bHover.length; i++){
		if (bHover[i] && i < 4){
			canvas1.fillStyle = "#00FFFF88";
			canvas1.fillRect(buttonRectsL[i][0], buttonRectsL[i][1], buttonRectsL[i][2], buttonRectsL[i][3]);
		}
		else if (bHover[i] && i >= 4){
			canvas2.fillStyle = "#00FFFF88";
			canvas2.fillRect(buttonRectsR[i-4][0], buttonRectsR[i-4][1], buttonRectsR[i-4][2], buttonRectsR[i-4][3]);
		}
	}
	
	//text
	canvas2.fillStyle = canvas1.fillStyle = "#0d8bf2";//"#ffdb4d";
	canvas2.textAlign = canvas1.textAlign = "center";
	canvas2.font = canvas1.font = "70px system-ui";
	for (let i = 0; i < 4; i++){
		if (showKeyBindings || metaKeys[C][i] == -1){
			canvas1.fillText(getKeyChar(metaKeys[C][i]), 
			buttonRectsL[i][0] + (buttonRectsL[i][2] / 2), buttonRectsL[i][1] + (buttonRectsL[i][3] / 2) + 20);
		}
	}
	for (let i = 0; i < 4; i++){
		if (showKeyBindings || metaKeys[C][i+4] == -1){
			canvas2.fillText(getKeyChar(metaKeys[C][i+4]), 
			buttonRectsR[i][0] + (buttonRectsR[i][2] / 2), buttonRectsR[i][1] + (buttonRectsR[i][3] / 2) + 20);
		}
	}
	
}

function drawControllerFF(canvas1, canvas2, bond, bHigh, bHover, C){//without rounded rects
canvas2.strokeStyle = canvas1.strokeStyle = "#dcd7d4";
	canvas2.lineWidth = canvas1.lineWidth = 25;
	//background:
	if (bond && bondN < 4){ 
		canvas2.fillStyle = canvas1.fillStyle = "#b6dcfb"; 
	}
	else { canvas2.fillStyle = canvas1.fillStyle = "black"; }
	canvas1.beginPath();
	canvas1.rect(25, 25, 700, 550, 25);
	canvas1.stroke();
	canvas1.fill();
	
	if (bond && bondN >= 4){ canvas2.fillStyle = canvas1.fillStyle = "#b6dcfb"; }
	else { canvas2.fillStyle = canvas1.fillStyle = "black"; }
	canvas2.beginPath();
	canvas2.rect(-100, 25, 675, 550, 25);
	canvas2.stroke();
	canvas2.fill();
	canvas2.fillStyle = canvas1.fillStyle = "black";
	
	//dpad
	canvas1.beginPath();
	canvas1.rect(100, 225, 400, 150, 25);
	canvas1.rect(225, 100, 150, 400, 25);
	canvas1.stroke();
	canvas1.fill();
	//A/B buttons
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.rect(325, 100, 200, 200, 25);
	canvas2.fill();
	canvas2.fillStyle = "#ad0101";
	canvas2.beginPath();
	canvas2.arc(425, 200, 80, 0, 2 * Math.PI);
	canvas2.fill();
	
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.rect(75, 100, 200, 200, 25);
	canvas2.fill();
	canvas2.fillStyle = "#ad0101";
	canvas2.beginPath();
	canvas2.beginPath();
	canvas2.arc(175, 200, 80, 0, 2 * Math.PI);
	canvas2.fill();
	//start
	canvas2.fillStyle = "#dcd7d4";
	canvas2.beginPath();
	canvas2.rect(25, 375, 525, 150, 25);
	canvas2.fill();
	canvas2.fillStyle = "black";
	
	canvas2.beginPath();
	canvas2.rect(325, 400, 200, 100, 25);
	canvas2.fill();
	//select
	canvas2.beginPath();
	canvas2.rect(50, 400, 200, 100, 25);
	canvas2.fill();
	
	//displayInput
	if (displayInput){
		for (let i = 0; i < bHigh.length; i++){
			if (bHigh[i] && i < 4){
				canvas1.fillStyle = "#00FFFF88";
				canvas1.fillRect(buttonRectsL[i][0], buttonRectsL[i][1], buttonRectsL[i][2], buttonRectsL[i][3]);
			}
			else if (bHigh[i] && i >= 4){
				canvas2.fillStyle = "#00FFFF88";
				canvas2.fillRect(buttonRectsR[i-4][0], buttonRectsR[i-4][1], buttonRectsR[i-4][2], buttonRectsR[i-4][3]);
			}
		}
	}
	//highlight hover
	for (let i = 0; i < bHover.length; i++){
		if (bHover[i] && i < 4){
			canvas1.fillStyle = "#00FFFF88";
			canvas1.fillRect(buttonRectsL[i][0], buttonRectsL[i][1], buttonRectsL[i][2], buttonRectsL[i][3]);
		}
		else if (bHover[i] && i >= 4){
			canvas2.fillStyle = "#00FFFF88";
			canvas2.fillRect(buttonRectsR[i-4][0], buttonRectsR[i-4][1], buttonRectsR[i-4][2], buttonRectsR[i-4][3]);
		}
	}
	
	//text
	if (showKeyBindings){
		canvas2.fillStyle = canvas1.fillStyle = "#0d8bf2";
		canvas2.textAlign = canvas1.textAlign = "center";
		canvas2.font = canvas1.font = "70px system-ui";
		for (let i = 0; i < 4; i++){
			canvas1.fillText(getKeyChar(metaKeys[C][i]), 
				buttonRectsL[i][0] + (buttonRectsL[i][2] / 2), buttonRectsL[i][1] + (buttonRectsL[i][3] / 2) + 20);
		}
		for (let i = 0; i < 4; i++){
			canvas2.fillText(getKeyChar(metaKeys[C][i+4]), 
				buttonRectsR[i][0] + (buttonRectsR[i][2] / 2), buttonRectsR[i][1] + (buttonRectsR[i][3] / 2) + 20);
		}
	}
}

function canvasLeftMouse(e){
	drawController();
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsL.length; i++){
		buttonHover[i] = false;
		if (inRect(point, buttonRectsL[i])){
			buttonHover[i] = true;
		}
	}
}
function clickLeft(e){
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsL.length; i++){
		if (inRect(point, buttonRectsL[i])){
			bondMode = true;
			bondN = i;
			keys[bondN] = -1;
			drawController();
		}
	}
}
function canvasRightMouse(e){
	drawController();
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsR.length; i++){
		buttonHover[i+4] = false;
		if (inRect(point, buttonRectsR[i])){
			buttonHover[i+4] = true;
		}
	}
}
function clickRight(e){
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsR.length; i++){
		if (inRect(point, buttonRectsR[i])){
			bondMode = true;
			bondN = i+4;
			keys[bondN] = -1;
			drawController();
		}
	}
}

function canvasLeftMouse2(e){
	drawController();
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsL.length; i++){
		buttonHover2[i] = false;
		if (inRect(point, buttonRectsL[i])){
			buttonHover2[i] = true;
		}
	}
}
function clickLeft2(e){
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsL.length; i++){
		if (inRect(point, buttonRectsL[i])){
			bondMode2 = true;
			bondN = i;
			keys2[bondN] = -1;
			drawController();
		}
	}
}
function canvasRightMouse2(e){
	drawController();
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsR.length; i++){
		buttonHover2[i+4] = false;
		if (inRect(point, buttonRectsR[i])){
			buttonHover2[i+4] = true;
		}
	}
}
function clickRight2(e){
	let point = [(e.offsetX / e.target.clientWidth) * 600, (e.offsetY / e.target.clientHeight) * 600];
	for (let i = 0; i < buttonRectsR.length; i++){
		if (inRect(point, buttonRectsR[i])){
			bondMode2 = true;
			bondN = i+4;
			keys2[bondN] = -1;
			drawController();
		}
	}
}

//mobile controls
document.getElementById("cLeft").addEventListener("touchstart", canvasTouchLeft_start, false);
document.getElementById("cLeft").addEventListener("touchmove", canvasTouchLeft_move, false);
document.getElementById("cLeft").addEventListener("touchcancel", canvasTouchLeft_end, false);
document.getElementById("cLeft").addEventListener("touchend", canvasTouchLeft_end, false);

document.getElementById("cRight").addEventListener("touchstart", canvasTouchRight_start, false);
document.getElementById("cRight").addEventListener("touchmove", canvasTouchRight_move, false);
document.getElementById("cRight").addEventListener("touchcancel", canvasTouchRight_end, false);
document.getElementById("cRight").addEventListener("touchend", canvasTouchRight_end, false);

document.getElementById("cLeft2").addEventListener("touchstart", canvasTouchLeft2_start, false);
document.getElementById("cLeft2").addEventListener("touchmove", canvasTouchLeft2_move, false);
document.getElementById("cLeft2").addEventListener("touchcancel", canvasTouchLeft2_end, false);
document.getElementById("cLeft2").addEventListener("touchend", canvasTouchLeft2_end, false);

document.getElementById("cRight2").addEventListener("touchstart", canvasTouchRight2_start, false);
document.getElementById("cRight2").addEventListener("touchmove", canvasTouchRight2_move, false);
document.getElementById("cRight2").addEventListener("touchcancel", canvasTouchRight2_end, false);
document.getElementById("cRight2").addEventListener("touchend", canvasTouchRight2_end, false);

function canvasTouchLeft_start(e){
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++){
		var rect = e.touches[i].target.getBoundingClientRect();
		let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
			(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsL.length; j++){
			if (inRect(point, buttonRectsL[j])){
				controlerP1[j] = true;
			}
		}
	}
}
function canvasTouchLeft_move(e){
	e.preventDefault();		
	for (let j = 0; j < buttonRectsL.length; j++){
		controlerP1[j] = false;
		for (let i = 0; i < e.touches.length; i++){
			var rect = e.touches[i].target.getBoundingClientRect();
			let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
				(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
			//run event
			if (inRect(point, buttonRectsL[j])){
				controlerP1[j] = true;
			}
		}
	}
}
function canvasTouchLeft_end(e){
	for (let i = 0; i < e.changedTouches.length; i++){
		var rect = e.changedTouches[i].target.getBoundingClientRect();
		let point = [(e.changedTouches[i].clientX - rect.left) / e.changedTouches[i].target.clientWidth * 600, 
			(e.changedTouches[i].clientY - rect.top) / e.changedTouches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsL.length; j++){
			if (inRect(point, buttonRectsL[j])){
				controlerP1[j] = false;
			}
		}
	}
}

function canvasTouchRight_start(e){
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++){
		var rect = e.touches[i].target.getBoundingClientRect();
		let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
			(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsR.length; j++){
			if (inRect(point, buttonRectsR[j])){
				controlerP1[j+4] = true;
			}
		}
	}
}
function canvasTouchRight_move(e){
	e.preventDefault();		
	for (let j = 0; j < buttonRectsR.length; j++){
		controlerP1[j+4] = false;
		for (let i = 0; i < e.touches.length; i++){
			var rect = e.touches[i].target.getBoundingClientRect();
			let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
				(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
			//run event
			if (inRect(point, buttonRectsR[j])){
				controlerP1[j+4] = true;
			}
		}
	}
}
function canvasTouchRight_end(e){
	for (let i = 0; i < e.changedTouches.length; i++){
		var rect = e.changedTouches[i].target.getBoundingClientRect();
		let point = [(e.changedTouches[i].clientX - rect.left) / e.changedTouches[i].target.clientWidth * 600, 
			(e.changedTouches[i].clientY - rect.top) / e.changedTouches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsR.length; j++){
			if (inRect(point, buttonRectsR[j])){
				controlerP1[j+4] = false;
			}
		}
	}
}

function canvasTouchLeft2_start(e){
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++){
		var rect = e.touches[i].target.getBoundingClientRect();
		let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
			(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsL.length; j++){
			if (inRect(point, buttonRectsL[j])){
				controlerP2[j] = true;
			}
		}
	}
}
function canvasTouchLeft2_move(e){
	e.preventDefault();		
	for (let j = 0; j < buttonRectsL.length; j++){
		controlerP2[j] = false;
		for (let i = 0; i < e.touches.length; i++){
			var rect = e.touches[i].target.getBoundingClientRect();
			let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
				(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
			//run event
			if (inRect(point, buttonRectsL[j])){
				controlerP2[j] = true;
			}
		}
	}
}
function canvasTouchLeft2_end(e){
	for (let i = 0; i < e.changedTouches.length; i++){
		var rect = e.changedTouches[i].target.getBoundingClientRect();
		let point = [(e.changedTouches[i].clientX - rect.left) / e.changedTouches[i].target.clientWidth * 600, 
			(e.changedTouches[i].clientY - rect.top) / e.changedTouches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsL.length; j++){
			if (inRect(point, buttonRectsL[j])){
				controlerP2[j] = false;
			}
		}
	}
}

function canvasTouchRight2_start(e){
	e.preventDefault();
	for (let i = 0; i < e.touches.length; i++){
		var rect = e.touches[i].target.getBoundingClientRect();
		let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
			(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsR.length; j++){
			if (inRect(point, buttonRectsR[j])){
				controlerP2[j+4] = true;
			}
		}
	}
}
function canvasTouchRight2_move(e){
	e.preventDefault();		
	for (let j = 0; j < buttonRectsR.length; j++){
		controlerP2[j+4] = false;
		for (let i = 0; i < e.touches.length; i++){
			var rect = e.touches[i].target.getBoundingClientRect();
			let point = [(e.touches[i].clientX - rect.left) / e.touches[i].target.clientWidth * 600, 
				(e.touches[i].clientY - rect.top) / e.touches[i].target.clientHeight * 600];
			//run event
			if (inRect(point, buttonRectsR[j])){
				controlerP2[j+4] = true;
			}
		}
	}
}
function canvasTouchRight2_end(e){
	for (let i = 0; i < e.changedTouches.length; i++){
		var rect = e.changedTouches[i].target.getBoundingClientRect();
		let point = [(e.changedTouches[i].clientX - rect.left) / e.changedTouches[i].target.clientWidth * 600, 
			(e.changedTouches[i].clientY - rect.top) / e.changedTouches[i].target.clientHeight * 600];
		//run event
		for (let j = 0; j < buttonRectsR.length; j++){
			if (inRect(point, buttonRectsR[j])){
				controlerP2[j+4] = false;
			}
		}
	}
}

//zapper
function nesZapper(point){
	nes.zapperMove(Math.round(point[0]), Math.round(point[1]));
	nes.zapperFireDown();
}

function unzap(){
	nes.zapperFireUp();
}

function moveZapper(point){
	nes.zapperMove(Math.round(point[0]), Math.round(point[1]));
}

//settings:
var showCont1 = true;
var showCont2 = false;
var displayInput = false;
var showKeyBindings = true;
var fullscreen = false;
//window.localStorage
function openSettings(){
	document.getElementById("setOverlay").style.display = "block";
}
function closeSettings(){
	document.getElementById("setOverlay").style.display = "none";
}
function onSetChange(v){
	if (v == 0){
		setCont1(document.getElementById("setting1").checked);
	}
	else if (v == 1){
		setCont2(document.getElementById("setting2").checked);
	}
	else if (v == 2){
		setDisplayInput(document.getElementById("setting3").checked);
	}
	else if (v == 3){
		setShowKeyBindings(document.getElementById("setting4").checked);
	}
	else if (v == 4){
		setFullScreen(document.getElementById("setting5").checked);
	}
}

function setCont1(val){
	showCont1 = val;
	if (showCont1){
		document.getElementById("setting1").checked = true;
		document.getElementById("cLeft").style.display = 
		document.getElementById("cRight").style.display = "inline-block";
	}
	else{
		document.getElementById("setting1").checked = false;
		document.getElementById("cLeft").style.display = 
		document.getElementById("cRight").style.display = "none";
	}
	resize();
	window.localStorage.setItem("setting1", val.toString());
}
function setCont2(val){
	showCont2 = val;
	if (showCont2){
		document.getElementById("setting2").checked = true;
		document.getElementById("cLeft2").style.display = 
		document.getElementById("cRight2").style.display = "inline-block";
	}
	else{
		document.getElementById("setting2").checked = false;
		document.getElementById("cLeft2").style.display = 
		document.getElementById("cRight2").style.display = "none";
	}
	resize();
	window.localStorage.setItem("setting2", val.toString());
}
function setDisplayInput(val){
	displayInput = val;
	if (displayInput){
		document.getElementById("setting3").checked = true;
	}
	else{
		document.getElementById("setting3").checked = false;
	}
	window.localStorage.setItem("setting3", val.toString());
}
function setShowKeyBindings(val){
	showKeyBindings = val;
	if (showKeyBindings){
		document.getElementById("setting4").checked = true;
	}
	else{
		document.getElementById("setting4").checked = false;
	}
	window.localStorage.setItem("setting4", val.toString());
}
function setFullScreen(val){
	fullscreen = val;
	if (fullscreen){
		document.getElementById("setting5").checked = true;
		openFullscreen();
	}
	else{
		document.getElementById("setting5").checked = false;
		closeFullscreen();
	}
	window.localStorage.setItem("setting5", val.toString());
}

function inRect(point, rect){
	if (point[0] >= rect[0] && point[0] <= rect[0] + rect[2] &&
		point[1] >= rect[1] && point[1] <= rect[1] + rect[3]){
		return true;
	}
	return false;
}
function getKeyChar(n){
	if (n == -1){ return "Bind Key"; }
	else if (n == 38){ return "↑"; }
	else if (n == 39){ return "→"; }
	else if (n == 40){ return "↓"; }
	else if (n == 37){ return "←"; }
	
	return keyboardMap[n];
}
var keyboardMap = [
  "", // [0]
  "", // [1]
  "", // [2]
  "CANCEL", // [3]
  "", // [4]
  "", // [5]
  "HELP", // [6]
  "", // [7]
  "BACK_SPACE", // [8]
  "TAB", // [9]
  "", // [10]
  "", // [11]
  "CLEAR", // [12]
  "ENTER", // [13]
  "ENTER_SPECIAL", // [14]
  "", // [15]
  "SHIFT", // [16]
  "CONTROL", // [17]
  "ALT", // [18]
  "PAUSE", // [19]
  "CAPS", // [20]
  "KANA", // [21]
  "EISU", // [22]
  "JUNJA", // [23]
  "FINAL", // [24]
  "HANJA", // [25]
  "", // [26]
  "ESCAPE", // [27]
  "CONVERT", // [28]
  "NONCONVERT", // [29]
  "ACCEPT", // [30]
  "MODECHANGE", // [31]
  "SPACE", // [32]
  "PAGE_UP", // [33]
  "PAGE_DOWN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SELECT", // [41]
  "PRINT", // [42]
  "EXECUTE", // [43]
  "PRINTSCREEN", // [44]
  "INSERT", // [45]
  "DELETE", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  ":", // [58]
  ";", // [59]
  "<", // [60]
  "=", // [61]
  ">", // [62]
  "?", // [63]
  "@", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "META", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "CONTEXT_MENU", // [93]
  "", // [94]
  "SLEEP", // [95]
  "NUM0", // [96]
  "NUM1", // [97]
  "NUM2", // [98]
  "NUM3", // [99]
  "NUM4", // [100]
  "NUM5", // [101]
  "NUM6", // [102]
  "NUM7", // [103]
  "NUM8", // [104]
  "NUM9", // [105]
  "*", // [106]
  "+", // [107]
  "SEPARATOR", // [108]
  "-", // [109]
  ".", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "F13", // [124]
  "F14", // [125]
  "F15", // [126]
  "F16", // [127]
  "F17", // [128]
  "F18", // [129]
  "F19", // [130]
  "F20", // [131]
  "F21", // [132]
  "F22", // [133]
  "F23", // [134]
  "F24", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "WIN_OEM_FJ_JISHO", // [146]
  "WIN_OEM_FJ_MASSHOU", // [147]
  "WIN_OEM_FJ_TOUROKU", // [148]
  "WIN_OEM_FJ_LOYA", // [149]
  "WIN_OEM_FJ_ROYA", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "!", // [161]
  "\"", // [162]
  "#", // [163]
  "$", // [164]
  "%", // [165]
  "&", // [166]
  "_", // [167]
  "(", // [168]
  ")", // [169]
  "*", // [170]
  "+", // [171]
  "PIPE", // [172]
  "HYPHEN_MINUS", // [173]
  "{", // [174]
  "}", // [175]
  "~", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  ";", // [186]
  "=", // [187]
  ",", // [188]
  "-", // [189]
  ".", // [190]
  "/", // [191]
  "`", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "[", // [219]
  "\\", // [220]
  "]", // [221]
  "'", // [222]
  "", // [223]
  "META", // [224]
  "ALTGR", // [225]
  "", // [226]
  "WIN_ICO_HELP", // [227]
  "WIN_ICO_00", // [228]
  "", // [229]
  "WIN_ICO_CLEAR", // [230]
  "", // [231]
  "", // [232]
  "WIN_OEM_RESET", // [233]
  "WIN_OEM_JUMP", // [234]
  "WIN_OEM_PA1", // [235]
  "WIN_OEM_PA2", // [236]
  "WIN_OEM_PA3", // [237]
  "WIN_OEM_WSCTRL", // [238]
  "WIN_OEM_CUSEL", // [239]
  "WIN_OEM_ATTN", // [240]
  "WIN_OEM_FINISH", // [241]
  "WIN_OEM_COPY", // [242]
  "WIN_OEM_AUTO", // [243]
  "WIN_OEM_ENLW", // [244]
  "WIN_OEM_BACKTAB", // [245]
  "ATTN", // [246]
  "CRSEL", // [247]
  "EXSEL", // [248]
  "EREOF", // [249]
  "PLAY", // [250]
  "ZOOM", // [251]
  "", // [252]
  "PA1", // [253]
  "SEL", // [254]
  "START" // [255]
];