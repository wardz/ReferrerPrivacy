// TODO: fix iframe window bypass:
// window[0].Reflect.getOwnPropertyDescriptor(window[0].Document.prototype, "referrer").get.call(document);
// Although might not be possible to fix synchronously without doing something stupid like hooking every dom insert node call.
// Probably better off blocking the URL for the js script if you see some analytics lib abusing this.

try {
    if (new URL(document.referrer).origin !== window.location.origin) {
        const overrideReferrer = (target) => {
            try {
                Reflect.defineProperty(target.Document.prototype, 'referrer', {
                    ...Reflect.getOwnPropertyDescriptor(target.Document.prototype, 'referrer'),
                    get: () => '',
                });
            } catch {} // incase CORS iframe error, saves a lot of URL checking
        };

        // Set 'document.referrer' in current window to empty string
        overrideReferrer(window);

        // Set 'document.referrer' in iframe, frame & object contentWindow to empty string
        [HTMLIFrameElement, HTMLObjectElement, HTMLFrameElement].forEach((element) => {
            const windowPropDescriptor = Reflect.getOwnPropertyDescriptor(element.prototype, 'contentWindow');

            Reflect.defineProperty(element.prototype, 'contentWindow', {
                ...windowPropDescriptor,
                get() {
                    const contentWindow = windowPropDescriptor.get.call(this);
                    overrideReferrer(contentWindow);

                    return contentWindow;
                },
            });
        });

        // set 'document.referrer' in window.open to empty string
        window.open = new Proxy(window.open, {
            apply(target, thisArg, argumentsList) {
                const contentWindow = target.apply(thisArg, argumentsList);
                overrideReferrer(contentWindow);

                return contentWindow;
            },
        });
    }
} catch {}
