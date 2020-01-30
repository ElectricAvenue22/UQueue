chrome.runtime.onInstalled.addListener(function () {

	//set initial storage values 
	chrome.storage.sync.set({
		fullscreen: false
	}, function () {});

	chrome.storage.sync.set({
		showskip: true
	}, function () {});

	//open thank you page 
	chrome.tabs.create({
		url: "uqueue/welcome.html"
	}, function (tab) {});

	chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				//pageUrl: { hostContains: "youtube" },
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});