try {
    if (new URL(document.referrer).origin !== window.location.origin) { // Throws TypeError on bad URLs
        const overrideReferrer = (target) => {
            try {
                Reflect.defineProperty(target.Document.prototype, 'referrer', {
                    ...Reflect.getOwnPropertyDescriptor(target.Document.prototype, 'referrer'),
                    get: () => '',
                });
            } catch {} // Suppress any CORS iframe errors
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

        // Set 'document.referrer' in window.open to empty string
        window.open = new Proxy(window.open, {
            apply(target, thisArg, argumentsList) {
                const contentWindow = target.apply(thisArg, argumentsList);
                overrideReferrer(contentWindow);

                return contentWindow;
            },
        });

        // Set 'document.referrer' in window.frames to empty string
        const origWindowFrames = window.frames;
        window.frames = new Proxy(window.frames, {
            get(target, prop) {
                const contentWindow = Reflect.get(origWindowFrames, prop);
                overrideReferrer(contentWindow);

                return contentWindow;
            },
        });
    }
} catch {}
