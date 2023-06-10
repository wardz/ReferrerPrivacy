# ReferrerPrivacy [Work in Progress]

Lightweight Chrome extension (manifest v3) that blocks referrers for cross origin GET requests.  
At the moment, only Chromium browsers are supported until Firefox fully implements manifest v3.

Images and videos are by default excluded to avoid breakage.

## About

Every time you visit a website that loads third-party CDN content like fonts, stylesheets & javascript, your browser is sending a `referer` or `origin` header from the original website you visited towards the third-party Content Delivery Network. (CDN)

This allows the CDN to easily track your browsing history over time. Let's say you visit `buy-paint-example.com` and that site embeds some custom fonts from Bootstrap aka Twitter's CDN. Twitter now automatically knows you visited `buy-paint-example.com` through the referrer. With this extension, the custom content will still be loaded, but the CDN won't be able to tell which website you're originating from since the referrer is blocked.

It also blocks sending the origin website when clicking outbound site links. For example, normally clicking `example.com` on a Search Engine result would tell `example.com` that you came from `your-search-engine.com`. With this extension it will prevent that and look like a direct visit instead.

## Install

TODO

## Limitations for Chromium

1. The real `document.referrer` Javascript property can still be retrieved using the `window[index]` object generated from iframes. This is not fully fixable unless the Chromium team decides to do something about it.  
However, HTTP request headers will still be blocked. If you see some JS analytics lib abusing this method you can just block the script URL with uBlock if it isn't already blocked.

2. Extensions modifying native Javascript functions can be detected/fingerprintable.  
If you change IP address regularly (i.e VPN), you might want to not use [content_scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) extensions as it may add to your browser fingerprint. For regular users this shouldn't matter.

## Privacy Policy

This extension does not collect any data.

## Permissions Required

| Permission | Reason |
| --- | --- |
| Block content on any page | Uses [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/) for modifying request headers |
| Read and change all your data on all websites | Uses [content_scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) for modifying website's [document.referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) property |
| Storage | Uses [chrome.storage.sync](https://developer.chrome.com/docs/extensions/reference/storage/) for saving & syncing options |

## License

Copyright (C) 2023 Wardz | [MIT No Attribution License](https://github.com/aws/mit-0/blob/master/MIT-0).
