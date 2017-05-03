import 'socket.io-file';
// require("jquery");
// CUSTOM CSS
// require("./js/jquery-3.1.1.min.js");

var border_s = ["dotted","dashed","solid","double",
				"groove","ridge","inset","outset"];

var border_w = ["1px","2px","3px","4px","5px","6px","7px",
				"8px","9px","10px","11px","12px","13px","14px",
				"15px","16px","17px","18px","19px","20px"];

var icecreamColors = ['#22BFDE','#F06791','#DEB237','#9CC068','#777777']
var mellowColors = ['#45A3AF','#210A8E', '#663795','#DB5700'];
var partyColors = ['#F400BA', 'EBF80E', 'FF0048', '09F7CF', '04106E'];
var greens = ['#70E26C','#7AC960','#78B259','#509E63','#3C896C'];

window.chatWindowColors = ['#ccffff','#b3ffff','#99ffff','#80ffff','#66ffff']; 

window.songBarColors = partyColors;

var oFReader = new FileReader(),
    rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;

oFReader.onload = function(oFREvent) {
    localStorage.setItem('b', oFREvent.target.result);
    switchBackground();
};

var loadImageFile = function(testEl) {
	if (! testEl.files.length) { return; }
	var oFile = testEl.files[0];
	if (!rFilter.test(oFile.type)) { alert("You must select a valid image file!"); return; }
	oFReader.readAsDataURL(oFile);
}



window.styleMenuTrig = function(ev){
	if(!menuState){
		document.getElementById("styleMenu").style.display = "inline-block";
	}else{
		document.getElementById("styleMenu").style.display = "none";
	}
	menuState = !menuState;
}



// turn this into jquery function??
var menuState = 0;


$(document).ready(function () {


	$( "#bgColorPicker" ).change(function () {
		console.log("changing bg color to", this.value);
		document.getElementById("body").style.backgroundColor = this.value;
		document.getElementById("styleMenu").style.backgroundColor = this.value;
	});
	$( "#accentColorPicker" ).change(function () {
		console.log("changing accent color to", this.value);
		var btnGroup = document.getElementsByClassName("button");
		for(var i = 0; i < btnGroup.length; i++) {
		    btnGroup[i].style.backgroundColor = this.value;
		}
	});
	$( "#fontColorPicker" ).change(function () {
		console.log("changing font color to", this.value);
		document.getElementById("body").style.color = this.value;
	});
	$( "#fontSize" ).change(function () {
		console.log("changing font size to ", this.value);
		document.getElementById("body").style.fontSize = this.value;

		var btnGroup = document.getElementsByClassName("button");
		for(var i = 0; i < btnGroup.length; i++) {
		    btnGroup[i].style.fontSize = this.value;
		}
	});
	$( "#fontDropDown" ).change(function () {
		console.log("changing font  to ", this.value);
		document.getElementById("body").style.fontFamily = this.value;

		var btnGroup = document.getElementsByClassName("button");
		for(var i = 0; i < btnGroup.length; i++) {
		    btnGroup[i].style.fontFamily = this.value;
		}
	});

	$( "#borderSize" ).change(function () {
		console.log("changing border size to", this.value);
		var d = document.getElementById("body").querySelectorAll("div");
		for(var i = 0; i < d.length; i++){
			d[i].style.borderWidth = border_w[this.value];
		}
	});

	$( "#borderStyle" ).change(function () {
		console.log("changing border style to", this.value);
		var v = "inset";
		var d = document.getElementById("body").querySelectorAll("div");
		for(var i = 0; i < d.length; i++){
			console.log(border_s[this.value], v)
			d[i].style.borderStyle = border_s[this.value];
		}
	});

	$( "#bgImage" ).change(function () {
		loadImageFile(this);
	});

	// lets us escape out of style menu
	$(document).keyup(function(e) {
		if (e.keyCode === 27){
			document.getElementById("styleMenu").style.display = "none";
			menuState = !menuState;
		}
	});

	var switchBackground = function () {
	  $('body').css('background-image', "url(" + localStorage.getItem('b') + ')');
	}

});

