const defaultConfig = {
    referrerResourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "font", "ping", "object", "xmlhttprequest", "other"],
    originResourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "font", "ping"],
    excludedInitiatorDomains: ["read.amazon.com"],
    excludedRequestDomains: [
        "bin.bnbstatic.com", // Binance App
        "www.redditstatic.com", // Reddit fonts
        "www.gstatic.com", // Google Messenger
        "cdn.embedly.com", // Reddit iframe embeds
        "static.crunchyroll.com", // Crunchyroll player embeds
        "read.amazon.com", // Kindle Reader
        "codepen.io", // Codepen iframe embeds
    ],
};

chrome.runtime.onInstalled.addListener(async () => {
    const existingConfig = await chrome.storage.sync.get(null);
    const config = { ...defaultConfig, ...existingConfig }
    await chrome.storage.sync.set(config);

    // Register content.js for modifying 'document.referrer'
    chrome.scripting.registerContentScripts([{
        id: "document_referrer_overwrite",
        world: "MAIN",
        js: ["content.js"],
        runAt: "document_start",
        matches: ["<all_urls>"],
        matchOriginAsFallback: true,
        //matchAboutBlank: true,
        allFrames: true,
        excludeMatches: [
            ...config.excludedRequestDomains.map(domain => `*://${domain}/*`),
            ...config.excludedInitiatorDomains.map(domain => `*://${domain}/*`),
        ]
    }]);

    // Register header modification rules
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],

        addRules: [
            {
                id: 1,
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [{ header: "referer", operation: "remove" }]
                },
                condition: {
                    domainType: "thirdParty",
                    requestMethods: ["get", "head"],
                    resourceTypes: config.referrerResourceTypes,
                    excludedInitiatorDomains: config.excludedInitiatorDomains,
                    excludedRequestDomains: config.excludedRequestDomains
                }
            },
            {
                id: 2,
                action: {
                    type: "modifyHeaders",
                    requestHeaders: [{ header: "origin", operation: "remove" }]
                },
                condition: {
                    domainType: "thirdParty",
                    requestMethods: ["get", "head"],
                    resourceTypes: config.originResourceTypes,
                    excludedInitiatorDomains: config.excludedInitiatorDomains,
                    excludedRequestDomains: config.excludedRequestDomains
                }
            }
        ]
    });
});
