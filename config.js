export default {
    /* Global website rules */
    globalRules: {
        // Allow all websites to send a referrer to e.g *.codepen.io
        excludedRequestDomains: ['codepen.io', 'cdpn.io', 'jsfiddle.net'],

        // Allow *.edx.org to send a referrer to any URL it wants
        excludedInitiatorDomains: ['edx.org'],

        // Strip cross-origin referrers only
        domainType: 'thirdParty',

        // Strip GET & HEAD request referrers only
        requestMethods: ['get', 'head'],

        // Strip 'origin' header for cross-origin font requests
        stripFontOrigin: true,

        // Strip 'referer' header for these resource types
        resourceTypes: [
            'main_frame', // top level requests from website
            'sub_frame', // sub level requests from website (iframes, popups, about:*, data:*, etc)
            'object', // embedded html objects
            'font', // font files
            'stylesheet', // css files
            'script', // js files
            /* 'xmlhttprequest', // js fetch requests, not recommended enabling */
            /* 'image', // image files, causes a lot of breakage without adding siteRules exceptions */
            /* 'media', // audio & video files, causes a lot of breakage without adding siteRules exceptions */
        ],
    },

    /* Website specific rules */
    siteRules: [
        {
            // Allow *.reddit.com to send referrers to *.redditstatic.com and others listed, but NOT vice versa
            initiatorDomains: ['reddit.com'],
            excludedRequestDomains: ['redditstatic.com', 'redditmedia.com', 'cdn.embedly.com'],
            // setReferrerValue: 'example.com',
        },
        {
            // Allow *.sony.com to send referrers to *.playstation.com AND vice versa
            initiatorDomains: ['sony.com', 'playstation.com'],
            excludedRequestDomains: ['playstation.com', 'sony.com'],
        },
        {
            initiatorDomains: ['icloud.com', 'apple.com'],
            excludedRequestDomains: ['apple.com', 'cdn-apple.com', 'icloud.com'],
        },
        {
            initiatorDomains: ['binance.com'],
            excludedRequestDomains: ['bnbstatic.com'],
        },
        {
            initiatorDomains: ['google.com'],
            excludedRequestDomains: ['googleapis.com', 'gstatic.com'],
        },
    ],
};

/*export default async function SetupStorage() {
    const existingConfig = await chrome.storage.local.get(null);
    const config = mergeDeep(defaultConfig, existingConfig);
    await chrome.storage.local.set(config);

    return config;
}*/
