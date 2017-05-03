import 'socket.io-file';

var anim_id;


var animation_adduser = function(){
	$("#animation_container").hide();
	$("#animation_container").css("top","125px");
	$("#animation_container").show();
	document.getElementById("anim_label").innerHTML = "choose a room";

	clearInterval(anim_id);				// stopp animation
	animation_start();	   
}

var animation_room = function(){
	$("#animation_container").hide();
	$("#animation_container").css("top","155px");
	$("#animation_container").show();
	document.getElementById("anim_label").innerHTML = "find some songs.. ";

	clearInterval(anim_id);				// stopp animation
	animation_start();	   
}
	
var animation_file = function(){
	$("#animation_container").hide();
	$("#animation_container").css("top","185px");
	$("#animation_container").show();
	document.getElementById("anim_label").innerHTML = "and play them for your friends!!";

	clearInterval(anim_id);				// stopp animation
	animation_start();	   
}
	
var animation_stop = function() {
	$("#animation_container").hide();
	clearInterval(anim_id);
}


var animation_start = function() {
    var elem = document.getElementById("animation"); 
    var pos = 0;
    anim_id = setInterval(frame, 20);
    var goingLeft;
    function frame() {
    	if(pos == -20){
    		goingLeft = 1;
    	}
    	if(pos == 0){
    		goingLeft = 0;
    	}
        if (goingLeft) {
            pos++;
            elem.style.left = pos + 'px'
        } else {
            pos--; 
            // elem.style.top = pos + 'px'; 
            elem.style.left = pos + 'px'; 
        }
    }
}