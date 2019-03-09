let vidQueue = [];
let tabId = null;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.greeting == "VideoAdded"){
            vidQueue.push(request.link);
        } else if (request.greeting == "RequestingQueue"){
            sendResponse({farewell: "QueueSent", queue: vidQueue});
        } else if (request.greeting == "Pop") { //remove next video and play it 
            if(request.newTab) {
                chrome.tabs.create({'url': vidQueue[0]}, function(tab){tabId = tab.id});
            } else {
                chrome.tabs.update(tabId, {url: vidQueue[0]});
            }
            if(vidQueue.length != 0){
                sendResponse({farewell: "nextVideoExists", url: vidQueue[0]});
                vidQueue.shift();
            }
        } else if(request.greeting == "Purge"){ //delete entire queue 
            vidQueue = [];
        } else if(request.greeting == "Delete"){ //deletes specific video by url 
            for (vid = 0; vid < vidQueue.length; vid++){
                if(vidQueue[vid] == request.url)
                    vidQueue.splice(vid, 1);
            }
        } else if(request.greeting == "Move"){ //swap two adjacent videos 
            for(k = 0; k < vidQueue.length; k++) {
                if(request.link == vidQueue[k]){
                    if(request.dir == "Up" && k > 0) {
                        let temp = vidQueue[k];
                        vidQueue[k] = vidQueue[k-1];
                        vidQueue[k-1] = temp;
                        sendResponse({farewell: "Swapped"});
                    } else if(request.dir == "Down" && k < vidQueue.length-1){
                        let temp = vidQueue[k];
                        vidQueue[k] = vidQueue[k+1];
                        vidQueue[k+1] = temp;
                        sendResponse({farewell: "Swapped"});
                    }
                    else {
                        sendResponse({farewell: "NoSwap"});
                    }
                    break;
                }
            }
        }
});