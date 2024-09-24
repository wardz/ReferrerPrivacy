export const defaultConfig = {
    /* Global Default Rules */
    globalRules: {
        // Allow all websites to send a referrer to *.codepen.io and *.jsfiddle.net
        excludedRequestDomains: ['codepen.io', 'cdpn.io', 'jsfiddle.net'],
        // Allow *.example.com to send a referrer to any URL it wants
        excludedInitiatorDomains: ['example.com'],
        // Strip cross-origin referrers only
        domainType: 'thirdParty',
        // Strip GET & HEAD request referrers only
        requestMethods: ['get', 'head'],
        // Strip 'origin' header for font requests
        stripFontOrigin: true,
        // Strip 'referer' header for these resource types
        resourceTypes: [
            'main_frame', // top level requests from website
            'sub_frame', // sub level requests from website (iframes, popups, about:*, data:*, blob:*)
            'object', // embedded html objects
            'font', // font files
            'stylesheet', // css files
            'script', // js files
            /* 'xmlhttprequest', // js CORS fetch requests, not recommended */
            /* 'image', // image files, causes a lot of breakage without adding siteRules exceptions */
            /* 'media', // audio & video files, causes a lot of breakage without adding siteRules exceptions */
        ],
    },

    /* Site specific rules */
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

/**
* Performs a deep merge of objects and returns new object. Does not modify
* objects (immutable) and merges arrays via concatenation.
* Source: https://stackoverflow.com/a/48218209
*
* @param {...object} objects - Objects to merge
* @returns {object} New object with merged key/values
*/
function mergeDeep(...objects) {
    const isObject = (obj) => obj && typeof obj === 'object';

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = [...pVal, ...oVal].filter((element, index, array) => array.indexOf(element) === index);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
}

export default async function SetupStorage() {
    const existingConfig = await chrome.storage.local.get(null);
    const config = mergeDeep(defaultConfig, existingConfig);
    await chrome.storage.local.set(config);

    return config;
}
