/**
 * Strip the Javascript 'document.referrer' value on cross-origin page navigations
 */
if (document.referrer && new URL(document.referrer).origin !== window.origin) { // eTLD+1 for now
    const getEmptyStr = () => '';

    // bind() our getter so it looks like native JS code (anti-fingerprinting)
    const boundGetterFn = getEmptyStr.call.apply(getEmptyStr.bind, [getEmptyStr]);
    Reflect.defineProperty(boundGetterFn, 'name', { value: 'get referrer' });

    // Set readonly 'document.referrer' to an empty string
    Reflect.defineProperty(Document.prototype, 'referrer', { get: boundGetterFn });
}
