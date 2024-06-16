const browser = this.browser || this.chrome;

// Exclude all requests on a specific domain
const excludedInitiatorDomains = [
    'messages.google.com',
    'read.amazon.com',
    'icloud.com',
];

// Exclude a specific request
const excludedRequestDomains = [
    'bin.bnbstatic.com',
    'redditstatic.com',
    'cdn.embedly.com',
    'static.crunchyroll.com',
    'codepen.io',
    'cdpn.io',
    'youtube.googleapis.com',
    'static.playstation.com',
];

browser.runtime.onInstalled.addListener(async () => {
    // Register or update our 'document.referrer' script handler
    const script = await browser.scripting.getRegisteredContentScripts();
    browser.scripting[script.length === 0 ? 'registerContentScripts' : 'updateContentScripts']([{
        id: 'document_referrer_strip',
        world: 'MAIN',
        runAt: 'document_start',
        js: ['content-script.js'],
        matches: ['http://*/*', 'https://*/*'], // <all_urls> would include wss etc
        allFrames: false, // iframes shows origin host only, and impossible to fully strip JS-wise anyways
        excludeMatches: [
            ...excludedRequestDomains.map((domain) => `*://*.${domain}/*`),
            ...excludedInitiatorDomains.map((domain) => `*://*.${domain}/*`),
        ],
    }]);

    // Register or update our HTTP header filters
    browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1, 2],

        addRules: [
            {
                id: 1,
                action: {
                    type: 'modifyHeaders',
                    requestHeaders: [{ header: 'referer', operation: 'remove' }],
                },
                condition: {
                    domainType: 'thirdParty',
                    requestMethods: ['get', 'head'],
                    resourceTypes: [
                        'main_frame',
                        'sub_frame',
                        'object',
                        'stylesheet',
                        'script',
                        'font',
                    ],
                    excludedInitiatorDomains,
                    excludedRequestDomains,
                },
            },
            {
                id: 2,
                action: {
                    type: 'modifyHeaders',
                    requestHeaders: [{ header: 'origin', operation: 'remove' }],
                },
                condition: {
                    domainType: 'thirdParty',
                    requestMethods: ['get'],
                    resourceTypes: ['font'], // font GET requests adds a origin header which is similar to referrer
                    excludedInitiatorDomains,
                    excludedRequestDomains,
                },
            },
        ],
    });
});
