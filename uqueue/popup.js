//thumbnail style sheet 
const cssT = `
      height: 75px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 10px;
      position: relative;
      left: 50px;`

//Arrow button style sheet
const upStyle = `
      width: 22px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 2px;
      position: relative;
      right: 50px;
      bottom: 62px;
      opacity: 0.75;`

//Arrow button style sheet
const downStyle = `
      width: 22px;
      margin-left: auto;
      margin-right: auto;
      margin-bottom: 2px;
      position: relative;
      right: 72px;
      bottom: 40px;
      opacity: 0.75;`

//get button references 
let play = document.getElementById('play');
let deleteQueue = document.getElementById('deleteQueue');
let skip = document.getElementById('skip');
let settings = document.getElementById('settings');

//get settings referncesS
let settingsClicked = false;
let settingsWindow = document.getElementById('settingsWindow')
let fullscreenMode = document.getElementById('fullscreen')
let showSkipButton = document.getElementById('showSkip')

//get settings from storage 
chrome.storage.sync.get(['showskip'], function (result) {
	showSkipButton.checked = result.showskip
});
chrome.storage.sync.get(['fullscreen'], function (result) {
	fullscreenMode.checked = result.fullscreen
});

requestQueue(true); //get video queue from VideoManager


//determine the right function to call for the settings page 
settings.onclick = function (elemment) {
	if (settingsClicked) {
		settingsWindow.setAttribute("class", "hide")
		settingsClicked = false
	} else {
		settingsWindow.setAttribute("class", "show")
		settingsClicked = true
	}
};

//play the queue
play.onclick = function (element) {
	if (videoQueue.length > 0) {
		chrome.runtime.sendMessage({
			greeting: "Pop",
			newTab: true
		}, function () { })
	}
};

//delete the entire queue
deleteQueue.onclick = function (element) {
	chrome.runtime.sendMessage({
		greeting: "Purge"
	}, function () { })
	close();
};

//skip to the next video in the queue
skip.onclick = function (element) {
	if (videoQueue.length > 0) {
		chrome.runtime.sendMessage({
			greeting: "Pop",
			newTab: false
		}, function () { })
		close();
	}
}

//set skip state
showSkipButton.onclick = function (element) {
	chrome.storage.sync.set({
		showskip: showSkipButton.checked
	}, function () { });
}

//set full screen state
fullscreenMode.onclick = function (element) {
	chrome.storage.sync.set({
		fullscreen: fullscreenMode.checked
	}, function () { });
}

//get queue from VideoManager
function requestQueue(repopQueue) {
	chrome.runtime.sendMessage({
		greeting: "RequestingQueue"
	}, function (response) {
		if (response.farewell == "QueueSent") {
			videoQueue = response.queue;
			if (repopQueue)
				populateVideoScroller(videoQueue);
		}
	});
}

//add youtube thumbnails to the video scroller div 
function populateVideoScroller(videoQueue) {

	//clear the current contents 
	let vidScroller = document.getElementById("videoBox");
	vidScroller.innerHTML = "";

	for (videoURL in videoQueue) {

		//Creating video thumbnail button
		let elem = document.createElement("input");
		elem.setAttribute("style", cssT);
		elem.setAttribute("type", "image");
		elem.setAttribute("href", videoQueue[videoURL]);
		elem.src = urlToThumbnail(videoQueue[videoURL]);

		//show delete icon when hovered 
		elem.onmouseenter = function (event) {
			elem.style.filter = "grayscale(100%)";
		}

		//reset image on mouse leave 
		elem.onmouseleave = function (event) {
			elem.style.filter = "";
		}

		//delete the clicked video from the queue 
		elem.onclick = function (event) {
			chrome.runtime.sendMessage({
				greeting: "Delete",
				url: elem.getAttribute("href")
			}, function () { });
			elem.parentElement.remove();
			requestQueue(false);
		}

		//Creating up and down arrow buttons
		let upArr = document.createElement("input");
		upArr.setAttribute("style", upStyle);
		upArr.setAttribute("type", "image");
		upArr.src = "../images/Up.png";
		let downArr = document.createElement("input");
		downArr.setAttribute("style", downStyle);
		downArr.setAttribute("type", "image");
		downArr.src = "../images/Down.png";

		//changing opacities when hovering over arrows
		upArr.onmouseenter = function (event) {
			upArr.style.opacity = 1;
		}
		upArr.onmouseleave = function (event) {
			upArr.style.opacity = 0.75;
		}
		downArr.onmouseenter = function (event) {
			downArr.style.opacity = 1;
		}
		downArr.onmouseleave = function (event) {
			downArr.style.opacity = 0.75;
		}

		//Moving video in queue when clicking an arrow
		upArr.onclick = function (event) {
			chrome.runtime.sendMessage({
				greeting: "Move",
				dir: "Up",
				link: elem.getAttribute("href")
			}, function (response) {
				if (response.farewell == "Swapped") {
					requestQueue(true);
				}
			});
		}

		downArr.onclick = function (event) {
			chrome.runtime.sendMessage({
				greeting: "Move",
				dir: "Down",
				link: elem.getAttribute("href")
			}, function (response) {
				if (response.farewell == "Swapped") {
					requestQueue(true);
				}
			});
		}

		//Appending elements to the video scroller
		let vidCont = document.createElement("VideoCont");
		vidCont.appendChild(elem);
		vidCont.appendChild(upArr);
		vidCont.appendChild(downArr);
		vidScroller.appendChild(vidCont);
	}
}

//converts a youtube video url to a url that references the thumbnail image 
//used so we are able to display the thumbnail in the popup 
function urlToThumbnail(youtubeUrl) {

	let head = "http://img.youtube.com/vi/"
	let tail = "/0.jpg";
	let link = ""

	if (youtubeUrl.indexOf('watch?v=') != -1) {
		let numEquals = 0;
		for (i = 0; i < youtubeUrl.length && numEquals < 2; i++) {
			if (youtubeUrl[i] == "=" || youtubeUrl[i] == "&") {
				numEquals++;
			} else if (numEquals == 1) {
				link += youtubeUrl[i];
			}
		}
	} else if (youtubeUrl.indexOf('embed/') != -1) {
		let end = youtubeUrl.indexOf('?rel=0&Samp;autoplay=1;fs=1;autohide=1;hd=1;') //find the added full screen text
		let start = youtubeUrl.indexOf('embed/')
		link = youtubeUrl.substring(start + 'embed/'.length, end);
	}

	return head + link + tail;
}