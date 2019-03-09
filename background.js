//Required by the chrome API to be present, this is not important to the function of the app 
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({}, function () {
    });
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                //pageUrl: { hostContains: "youtube" },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});