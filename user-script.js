/**
 * UserScript for modifying the JavaScript 'document.referrer' value on cross-origin page navigations.
 *
 * @param {object} config - The current loaded user configuration object.
 * @return string - A string containing the JavaScript code to inject.
 */
export default function CreateUserScript(config) {
    // TODO: might be worth pre-merging all domain exceptions into 1 hashtable

    return `
        if (document.referrer && window.origin && window.origin !== 'null') {
            const initiatorOrigin = URL.parse(document.referrer)?.origin;

            if (initiatorOrigin && initiatorOrigin !== window.origin) { // eTLD+1 for now
                const config = ${JSON.stringify(config)};
                const initiatorMatch = (domain) => initiatorOrigin.endsWith('.' + domain) || initiatorOrigin.endsWith('://' + domain);
                const requestMatch = (domain) => window.origin.endsWith('.' + domain) || window.origin.endsWith('://' + domain);

                // Skip if initiator origin is globally excluded
                if (!config.globalRules.excludedInitiatorDomains.some(initiatorMatch)) { // see also userscript excludeMatches
                    const rule = config.siteRules.find((rule) => rule.initiatorDomains.find(initiatorMatch));

                    // Skip if initiator origin is allowed to send referrer to current request's origin
                    if (!rule?.excludedRequestDomains?.some(requestMatch)) {
                        const value = rule?.setReferrerValue || '';

                        // Set readonly 'document.referrer' to a new value by overriding its getter
                        Reflect.defineProperty(Document.prototype, 'referrer', { get: () => value });
                    }
                }
            }
        }
    `;
}
