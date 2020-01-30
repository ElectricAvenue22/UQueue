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

const TIME_INTERVAL = 1000; //update interval between button checks 
const PLAYER_LOAD = 1000; //time we wait before attempting to add skip button to player, required so the player is loaded before we add it 

addButtons(); //add buttons on page load 

//every time out interval check for new buttons 
function timeOutEvent() {
	addButtons();
	window.setTimeout(timeOutEvent, TIME_INTERVAL);
}

let full = true;

window.setTimeout(timeOutEvent, TIME_INTERVAL);

//if fullscreen mode is active cleanup URL to point to embeded player 
function createLink(fullScreenLink, node) {
	let link = "";
	if (fullScreenLink) {
		link = node.getAttribute("href").replace('watch?v=', 'embed/')
		//if there is still an equal sign delete it 
		if (link.indexOf('=') != -1) {
			link = link.substr(0, link.indexOf('&t='));
		}
		link += '?rel=0&amp;autoplay=1;fs=1;autohide=1;hd=1;' //full screen modifiers
	} else {
		link = node.getAttribute("href");
	}
	return link;
}

//Adds the '+' buttons to all the currently visible youtube videos 
function addButtons() {
	let links = document.getElementsByTagName('ytd-thumbnail');
	for (i in links) {

		if (links[i].id == null) continue;

		let videoLink = links[i].getElementsByTagName('a')[0].href;
		if (videoLink.length == 0) continue; //bad url 

		let children = links[i].childNodes;
		let foundChild = false;

		for (child in children) {
			//This video already has a button, update the href and move on 
			if (children[child].id == 'queueButton') {
				children[child].setAttribute("href", videoLink);
				foundChild = true;
				break;
			}
		}
		//A button does not yet exist so add one 
		if (!foundChild) {

			//Get full screen status 
			let forceFullScreen = false;
			chrome.storage.sync.get(['fullscreen'], function (result) {
				forceFullScreen = result.fullscreen
			});

			let node = document.createElement("button");
			let bImage = document.createTextNode("+");
			node.appendChild(bImage);
			node.setAttribute("style", buttonCss);
			node.setAttribute("href", videoLink);
			node.setAttribute("id", "queueButton");
			node.onclick = function (event) { //add video to the queue 
				chrome.runtime.sendMessage({
					greeting: "VideoAdded",
					link: createLink(forceFullScreen, node)
				}, function () {});
			}
			links[i].appendChild(node);
		}
	}
}

//sends message to skip the current video 
function skipVideo() {
	chrome.runtime.sendMessage({
		greeting: "Pop"
	}, function () {});
}

//returns a new instance of a skip button 
function createNewSkipButton() {

	let bImageLarge = document.createTextNode(">>");
	let skipButton = document.createElement("button");

	skipButton.appendChild(bImageLarge);
	skipButton.setAttribute("style", skipButtonCss);
	skipButton.onclick = skipVideo;
	skipButton.onmouseenter = function (event) {
		skipButton.style.opacity = 1;
	}
	skipButton.onmouseleave = function (event) {
		skipButton.style.opacity = 0.15;
	}
	return skipButton;
}

//add a skip button to the youtube player
function addSkipButton() {
	var youtubeVideoPlayer = document.getElementsByClassName('style-scope ytd-watch-flexy');
	youtubeVideoPlayerLarge = youtubeVideoPlayer[6]; //6 theater and full screen viewer
	youtubeVideoPlayerSmall = youtubeVideoPlayer[11]; //11 normal sized viewer 
	youtubeVideoPlayerMini = youtubeVideoPlayer[14]; //14 is the mini player 
	yotubeVideoPlayerTheater = document.getElementById('player');

	//button 1 (large)
	if (youtubeVideoPlayerLarge != null) {
		skipButtonLarge = createNewSkipButton()
		youtubeVideoPlayerLarge.appendChild(skipButtonLarge);
	}

	//button 2 (small) 
	if (youtubeVideoPlayerSmall != null) {
		skipButtonSmall = createNewSkipButton()
		youtubeVideoPlayerSmall.appendChild(skipButtonSmall);
	}

	//button 3 (mini)
	if (youtubeVideoPlayerMini != null) {
		skipButtonMini = createNewSkipButton()
		youtubeVideoPlayerMini.appendChild(skipButtonMini);
	}

	//button 4 (theater)
	if (yotubeVideoPlayerTheater != null) {
		skipButtonTheater = createNewSkipButton()
		yotubeVideoPlayerTheater.appendChild(skipButtonTheater);
	}


}

//Wait for page to load before adding the skip buttons 
chrome.storage.sync.get(['showskip'], function (result) {
	if (result.showskip) {
		window.setTimeout(addSkipButton, PLAYER_LOAD);
	}
});

//detects when a video ends 
var video = document.getElementsByTagName("video")[0];
if (video != null) {
	video.addEventListener("ended", function () {
		chrome.runtime.sendMessage({
			greeting: "Pop"
		}, function () {});
	});
}

/*
    Protocol 

    1. Popup.js request queue from content.js
    2. Content.js responds with the queue and then clears the queue 
    3. Popup.js appends requested videos to internal queue 
*/