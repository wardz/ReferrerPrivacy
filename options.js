chrome.storage.sync.get(null, (data) => {
    //document.write(JSON.stringify(data));

    /*
    chrome.scripting.updateContentScripts([{
        id: "document_referrer_overwrite",
        excludeMatches: [
            ...config.excludedRequestDomains.map(hostname => "*://" + hostname + "/*"),
            ...config.excludedInitiatorDomains.map(hostname => "*://" + hostname + "/*")
        ]
    }]);
    */
});
