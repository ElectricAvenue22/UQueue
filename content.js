//queue up video button css style 
const buttonCss = `font-weight: 800;
    font-size: 19px;
    background-color: red;
    color: white;
    z-index: 2000;
    opacity: 0.9;
    width: 32px;
    height: 32px;
    cursor: pointer;`

//skip button css style 			
const skipButtonCss = `font-weight: 800;
    font-size: 19px;
    background-color: red;
    color: white;
    z-index: 2000;
    opacity: 0.15;
	width: 50px;
    height: 32px;
	position: absolute;
	left: 0px;
	top: 0px;
    cursor: pointer;`

const timeInterval = 1000; //update interval between button checks 
const playerload = 1000; //time we wait before attempting to add skip button to player, required so the player is loaded before we add it 

addButtons(); //add buttons on page load 

//every time out interval check for new buttons 
function timeOutEvent(){
    addButtons();
    window.setTimeout(timeOutEvent, timeInterval);
}

window.setTimeout(timeOutEvent, timeInterval);

//Adds the '+' buttons to all the currently visible youtube videos 
function addButtons() {
    let links = document.getElementsByTagName('ytd-thumbnail');
    for (i in links) {
		if(links[i].id == null) continue; 
		let children = links[i].childNodes;
		let foundChild = false; 
		for (child in children){
			if(children[child].id == 'queueButton'){
				children[child].setAttribute("href", links[i].getElementsByTagName('a')[0].href);
				foundChild = true; 
				break; 
			}
		}
		//A button does not yet exist so add one 
	    if (!foundChild) {
            let node = document.createElement("button");
            let bImage = document.createTextNode("+");
            node.appendChild(bImage);
            node.setAttribute("style", buttonCss);
            node.setAttribute("href", links[i].getElementsByTagName('a')[0].href);
			node.setAttribute("id", "queueButton");
            node.onclick = function (event) { //add video to the queue 
                chrome.runtime.sendMessage({ greeting: "VideoAdded", link: this.getAttribute("href") }, function () { });
            }
            links[i].appendChild(node); 
        }
    }
}

//sends message to skip the current video 
function skipVideo(){
	chrome.runtime.sendMessage({greeting : "Pop"}, function(){});
}


//add a skip button to the youtube player
function addSkipButton(){ 
	var youtubeVideoPlayer = document.getElementsByClassName('style-scope ytd-watch-flexy');
	youtubeVideoPlayerLarge = youtubeVideoPlayer[6]; //6 theater and full screen viewer
    youtubeVideoPlayerSmall = youtubeVideoPlayer[11]; //11 normal sized viewer 
    youtubeVideoPlayerMini = youtubeVideoPlayer[14]; //14 is the mini player 
	
	//button 1 (large)
	if(youtubeVideoPlayerLarge != null){
		let bImageLarge = document.createTextNode(">>");
		let skipButtonLarge = document.createElement("button");
		skipButtonLarge.appendChild(bImageLarge);
		skipButtonLarge.setAttribute("style", skipButtonCss);
		skipButtonLarge.onclick = skipVideo;
		skipButtonLarge.onmouseenter = function(event) {skipButtonLarge.style.opacity = 1;}
		skipButtonLarge.onmouseleave = function(event) {skipButtonLarge.style.opacity = 0.15;}
		youtubeVideoPlayerLarge.appendChild(skipButtonLarge);
	}
	
	//button 2 (theater) 
	if(youtubeVideoPlayerSmall != null){
		let bImageSmall = document.createTextNode(">>");
		var skipButtonSmall = document.createElement("button");
		skipButtonSmall.appendChild(bImageSmall);
		skipButtonSmall.setAttribute("style", skipButtonCss);
		skipButtonSmall.onclick = skipVideo;
		skipButtonSmall.onmouseenter = function(event) {skipButtonSmall.style.opacity = 1;}
		skipButtonSmall.onmouseleave = function(event) {skipButtonSmall.style.opacity = 0.15;}
		youtubeVideoPlayerSmall.appendChild(skipButtonSmall);
	}
    
    //button 3 (mini)
	if(youtubeVideoPlayerMini != null){
		let bImageSmallx = document.createTextNode(">>");
		var skipButtonSmallx = document.createElement("button");
		skipButtonSmallx.appendChild(bImageSmallx);
		skipButtonSmallx.setAttribute("style", skipButtonCss);
		skipButtonSmallx.onclick = skipVideo;
		skipButtonSmallx.onmouseenter = function(event) {skipButtonSmallx.style.opacity = 1;}
		skipButtonSmallx.onmouseleave = function(event) {skipButtonSmallx.style.opacity = 0.15;}
		youtubeVideoPlayerMini.appendChild(skipButtonSmallx);
	}
    
    
}

//Wait for page to load before adding the skip buttons 
window.setTimeout(addSkipButton, playerload); 


//detects when a video ends 
var video = document.getElementsByTagName("video")[0];
if(video != null) {
  video.addEventListener("ended", function() {
  	chrome.runtime.sendMessage({greeting : "Pop"}, function(){});
  });
}

/*
    Protocol 

    1. Popup.js request queue from content.js
    2. Content.js responds with the queue and then clears the queue 
    3. Popup.js appends requested videos to internal queue 
*/