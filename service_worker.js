const browser = this.browser || this.chrome;

// TODO: per-site basis?
const defaultConfig = {
    referrerResourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'font', 'ping', 'object', 'xmlhttprequest', 'other'],
    originResourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'font', 'ping'],
    excludedInitiatorDomains: ['read.amazon.com', 'icloud.com', 'messages.google.com'],
    excludedRequestDomains: [
        'bin.bnbstatic.com', // Binance SPA
        'redditstatic.com', // Reddit fonts
        'cdn.embedly.com', // Reddit iframe embeds
        'static.crunchyroll.com', // Crunchyroll player embeds
        'codepen.io', // Codepen iframe embeds
        'cdpn.io', // Codepen iframe embeds
        'youtube.googleapis.com', // Google Photos fullscreen videos
    ],
};

browser.runtime.onInstalled.addListener(async () => {
    const existingConfig = await browser.storage.sync.get(null);
    const config = { ...defaultConfig, ...existingConfig };
    await browser.storage.sync.set(config);

    // Register content.js for modifying 'document.referrer'
    browser.scripting.registerContentScripts([{
        id: 'document_referrer_overwrite',
        world: 'MAIN',
        js: ['content.js'],
        runAt: 'document_start',
        matches: ['<all_urls>'],
        matchOriginAsFallback: true,
        // matchAboutBlank: true,
        allFrames: true,
        excludeMatches: [
            ...config.excludedRequestDomains.map((domain) => `*://*.${domain}/*`),
            ...config.excludedInitiatorDomains.map((domain) => `*://*.${domain}/*`),
        ],
    }]);

    // Register header modification rules
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
                    resourceTypes: config.referrerResourceTypes,
                    excludedInitiatorDomains: config.excludedInitiatorDomains,
                    excludedRequestDomains: config.excludedRequestDomains,
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
                    requestMethods: ['get', 'head'],
                    resourceTypes: config.originResourceTypes,
                    excludedInitiatorDomains: config.excludedInitiatorDomains,
                    excludedRequestDomains: config.excludedRequestDomains,
                },
            },
        ],
    });
});
