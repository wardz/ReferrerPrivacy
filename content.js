// TODO: fix iframe window bypass
// window[0].Reflect.getOwnPropertyDescriptor(window[0].Document.prototype, "referrer").get.call(document);

try {
    if (new URL(document.referrer).origin !== window.location.origin) {
        // Set 'document.referrer' in current window to empty string
        Reflect.defineProperty(Document.prototype, "referrer", {
            ...Reflect.getOwnPropertyDescriptor(Document.prototype, "referrer"),
            get: () => "",
        });

        // Set 'document.referrer' in iframe & object windows to empty string
        [HTMLIFrameElement, HTMLObjectElement, HTMLFrameElement].forEach((element) => {
            const windowPropDescriptor = Reflect.getOwnPropertyDescriptor(element.prototype, "contentWindow");

            Reflect.defineProperty(element.prototype, "contentWindow", {
                ...windowPropDescriptor,

                get: function() {
                    const contentWindow = windowPropDescriptor.get.call(this);

                    if (contentWindow) {
                        try {
                            Reflect.defineProperty(contentWindow.Document.prototype, "referrer", {
                                ...Reflect.getOwnPropertyDescriptor(contentWindow.Document.prototype, "referrer"),
                                get: () => "",
                            });
                        } catch {};
                    }

                    return contentWindow;
                }
            });
        });

        // set 'document.referrer' in window.open to empty string
        window.open = new Proxy(window.open, {
            apply: function(target, thisArg, argumentsList) {
                const contentWindow = target.apply(thisArg, argumentsList);
                if (contentWindow) {
                    try {
                        Reflect.defineProperty(contentWindow.Document.prototype, "referrer", {
                            ...Reflect.getOwnPropertyDescriptor(contentWindow.Document.prototype, "referrer"),
                            get: () => "",
                        });
                    } catch {};
                }

                return contentWindow;
              }
        });
    }
} catch {}
