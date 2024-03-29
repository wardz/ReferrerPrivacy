const browser = this.browser || this.chrome;

// TODO: per-site basis (reddit.com -> exclude redditstatic.com)
const defaultConfig = {

    // Exclude all requests on a domain
    excludedInitiatorDomains: [
        'read.amazon.com',
        'icloud.com',
        'messages.google.com',
    ],

    // Exclude a specific request
    excludedRequestDomains: [
        'bin.bnbstatic.com',
        'redditstatic.com',
        'cdn.embedly.com',
        'static.crunchyroll.com',
        'codepen.io',
        'cdpn.io',
        'youtube.googleapis.com',
    ],

    // Selected resource types for filtering origin header
    originResourceTypes: ['font'],

    // Selected resource types for filtering referrer header
    referrerResourceTypes: [
        'main_frame',
        'sub_frame',
        'stylesheet',
        'script',
        'font',
        'ping',
        'beacon',
        'xmlhttprequest',
        'speculative',
        'other',
    ],
};

browser.runtime.onInstalled.addListener(async () => {
    const existingConfig = await browser.storage.sync.get(null);
    const config = { ...defaultConfig, ...existingConfig }; // note: not a deepmerge
    await browser.storage.sync.set(config);

    // Register or update content.js for modifying 'document.referrer' property
    const script = await browser.scripting.getRegisteredContentScripts();
    browser.scripting[script.length === 0 ? 'registerContentScripts' : 'updateContentScripts']([{
        id: 'document_referrer_overwrite',
        js: ['content.js'],
        world: 'MAIN',
        runAt: 'document_start',
        matches: ['*://*/*'],
        allFrames: false, // no point running for iframes due to 'ancestorOrigins' & other iframe shenanigans
        excludeMatches: [
            ...config.excludedRequestDomains.map((domain) => `*://*.${domain}/*`),
            ...config.excludedInitiatorDomains.map((domain) => `*://*.${domain}/*`),
        ],
    }]);

    // Register or update header modification rules
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
                    requestMethods: ['get'],
                    resourceTypes: config.originResourceTypes,
                    excludedInitiatorDomains: config.excludedInitiatorDomains,
                    excludedRequestDomains: config.excludedRequestDomains,
                },
            },
        ],
    });
});
