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