/**
 * Userscript for stripping the JavaScript 'document.referrer' value on cross-origin page navigations.
 *
 * @param {object} config - The current loaded user configuration object.
 * @return string - A string containing the JavaScript code to inject.
 */
export default function CreateUserScript(config) {
    // TODO: domain exceptions can be pre-merged into 1 object if performance ever becomes an issue

    return `
        if (document.referrer && window.origin && window.origin !== 'null') {
            const initiatorOrigin = URL.parse(document.referrer)?.origin;

            if (initiatorOrigin && initiatorOrigin !== window.origin) { // eTLD+1 for now
                const config = ${JSON.stringify(config)};
                const initiatorMatch = (domain) => initiatorOrigin.endsWith('.' + domain) || initiatorOrigin.endsWith('://' + domain);
                const requestMatch = (domain) => window.origin.endsWith('.' + domain) || window.origin.endsWith('://' + domain);

                // Skip if initiator origin is globally excluded
                if (!config.globalRules.excludedInitiatorDomains.some(initiatorMatch)) { // see also excludeMatches option
                    // Skip if initiator origin is allowed to send referrer to current request's origin
                    if (!config.siteRules.find((rule) => rule.initiatorDomains.find(initiatorMatch))?.excludedRequestDomains.some(requestMatch)) {
                        // Set readonly 'document.referrer' to an empty string by overriding its getter
                        Reflect.defineProperty(Document.prototype, 'referrer', { get: () => '' });
                    }
                }
            }
        }
    `;
}
