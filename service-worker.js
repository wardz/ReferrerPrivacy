/* eslint-disable import/extensions */
import { SetupStorage } from './config.js';
import CreateUserScript from './user-script.js';

/**
 * Register or update our HTTP header modification rules.
 */
async function UpdateHeaderRules(config) {
    const newRules = [];

    // https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest
    [config.globalRules, ...config.siteRules].forEach((rule, index) => {
        newRules.push({
            id: index + 1,
            priority: index > 0 ? 2 : 1,

            action: {
                type: 'modifyHeaders',
                requestHeaders: [{
                    header: 'referer',
                    operation: rule.setReferrer ? 'set' : 'remove',
                    value: rule.setReferrer,
                }],
            },

            condition: {
                domainType: rule.domainType || config.globalRules.domainType,
                requestMethods: rule.requestMethods || config.globalRules.requestMethods,
                resourceTypes: rule.resourceTypes || config.globalRules.resourceTypes,
                initiatorDomains: rule.initiatorDomains || null, // specifically null for globalRules
                requestDomains: rule.requestDomains || null,

                excludedRequestDomains: [
                    ...config.globalRules.excludedRequestDomains, // Always ignore all global exceptions
                    ...rule.excludedRequestDomains, // Exceptions tied to this rule's initiatorDomains
                ],

                excludedInitiatorDomains: index > 0 ? rule.excludedInitiatorDomains : [ // skip if not globalRules
                    ...config.globalRules.excludedInitiatorDomains,
                    // Site-specific rules is checked through initiatorDomains, ignore them for globalRules
                    ...config.siteRules.map((obj) => obj.initiatorDomains.reduce((domain) => domain)),
                ],
            },
        });
    });

    // Strip font origin header if enabled
    // Font GET requests adds a origin header that is equal to referrer
    if (config.globalRules.stripFontOrigin) {
        const length = newRules.length + 1;
        newRules.forEach((rule, index) => {
            const copy = structuredClone(rule); // reuse user's referrer rules for same domain exceptions
            copy.id = length + index;
            copy.action.requestHeaders[0].header = 'origin';
            copy.condition.resourceTypes = ['font']; // make sure we only run for fonts this time
            newRules.push(copy);
        });
    }

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    return chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRules.map((rule) => rule.id),
        addRules: newRules,
    });
}

/**
 * Register or update our user script that handles modifying the 'document.referrer' value.
 *
 * Unlike content script, a user script allows us to pass the current config object to the world JS code
 * while still having the code ran at the 'document_start' event. (chrome.scripting.executeScript() alternative is too slow)
 */
async function UpdateUserScript(config) {
    const newScript = [{
        id: 'referrer_privacy',
        runAt: 'document_start',
        world: 'MAIN',
        matches: ['*://*/*'],
        allFrames: false, // iframes will only show parent origin as referrer & is impossible to fully strip JS-wise anyways
        js: [{ code: CreateUserScript(config) }],
        excludeMatches: config.globalRules.excludedRequestDomains.map((domain) => `*://*.${domain}/*`),
    }];

    const oldScript = await chrome.userScripts.getScripts();
    return chrome.userScripts[oldScript.length === 0 ? 'register' : 'update'](newScript);
}

/**
 * Initialize the extension.
 */
chrome.runtime.onInstalled.addListener(async () => {
    // try {
    const config = await SetupStorage();
    await UpdateHeaderRules(config);
    await UpdateUserScript(config);
    // catch (err) { console.log(err) };
});
