try {
    if (new URL(document.referrer).origin !== window.location.origin) {
        // Set document.referrer to empty string
        const get = () => '';
        Reflect.defineProperty(get, 'name', { value: 'get referrer' });
        Reflect.defineProperty(Document.prototype, 'referrer', { get });
    }
} catch {} // suppress new URL() TypeErrors
