# ReferrerPrivacy

Lightweight Chrome extension (manifest v3) that blocks referrers for most cross origin GET requests.
Also works with `document.referrer`.  

Images and videos are by default excluded to avoid breakage.

## Why?

Every time you visit a website that loads third-party CDN content like fonts, stylesheets & javascript, your browser is sending a `referer` or `origin` header from the original website you visited to the third-party Content Delivery Network. (CDN)

This allows the CDN to easily track your browsing history over time. Let's say you visit "buy-paint-example.com" and that site embeds some custom fonts from Bootstrap/Twitter's CDN. Twitter now automatically knows you visited "buy-paint-example.com" through the referrer. With this extension the custom content will still be loaded, but the CDN wont be able to tell which website you're originating from since the referrer is blocked.

It also blocks sending the origin website when clicking outbound links. For example, normally clicking url "example.com" on i.e a Search Engine result would tell "example.com" that you came from "your-search-engine.com". With this extension it will prevent that and look like a direct visit instead.

## Privacy Policy

This extension does not collect any data.

## Permissions Required

| Permission | Reason |
| --- | --- |
| Block content on any page | Uses [chrome.declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/) for modifying request headers |
| Read and change all your data on all websites | Uses [content_scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) for modifying website's [document.referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) variable |
| Storage | Uses [chrome.storage.sync](https://developer.chrome.com/docs/extensions/reference/storage/) for saving & syncing options |

## License

Copyright (C) 2023 Wardz | [MIT License](https://opensource.org/licenses/mit-license.php).
