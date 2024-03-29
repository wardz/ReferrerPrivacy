// Note: origin here includes subdomains and not just the main domain
if (document.referrer && new URL(document.referrer).origin !== window.origin) {
    const getEmptyStr = () => '';

    // Make our getter look like native JS code for anti-fingerprinting measures
    const boundGetter = getEmptyStr.call.apply(getEmptyStr.bind, [getEmptyStr]);
    Reflect.defineProperty(boundGetter, 'name', { value: 'get referrer' });

    // Set 'document.referrer' to empty string
    Reflect.defineProperty(Document.prototype, 'referrer', { get: boundGetter });
}
