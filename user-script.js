/**
 * UserScript for modifying the JavaScript 'document.referrer' value on cross-origin page navigations.
 * Unlike content scripts, user scripts allow injecting JavaScript from a string, not just a file.
 * This makes it possible for us to pass a reference to our 'config' object into isolated code (world: 'MAIN').
 *
 * @param {object} config - The user configuration object.
 * @return string - A string containing the JavaScript code to inject into a page.
 */
export default function CreateUserScript(config) {
    const serializedConfig = JSON.stringify(config);

    return `
        if (document.referrer && window.origin && window.origin !== 'null') {
            const initiator = URL.parse(document.referrer)?.hostname;

            if (initiator && initiator !== window.origin) { // eTLD+1 for now
                const config = ${serializedConfig};
                const initiatorMatch = (hostname) => initiator == hostname || initiator.endsWith('.' + hostname);
                const requestMatch = (hostname) => window.location.hostname == hostname || window.location.hostname.endsWith('.' + hostname);

                // Skip if initiator origin is globally excluded
                if (!config.globalRules.excludedInitiatorDomains.some(initiatorMatch)) { // See also userscript's excludeMatches
                    const rule = config.siteRules.find((rule) => rule.initiatorDomains?.find(initiatorMatch));

                    // Skip if initiator origin is allowed to send referrer to current request's origin
                    if (rule && !(rule.excludedRequestDomains?.some(requestMatch))) {
                        const value = rule.setReferrerValue || '';

                        // Set readonly 'document.referrer' to a new value by overriding its getter
                        Reflect.defineProperty(Document.prototype, 'referrer', {
                            ...Object.getOwnPropertyDescriptor(Document.prototype, 'referrer'),
                            get: () => value
                        });
                    }
                }
            }
        }
    `;
}
