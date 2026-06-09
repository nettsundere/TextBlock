![Logo](/reference_material/tile440x280.png)

# TextBlock
Browser extension for Chrome (and Safari, kind of) that allows you to hide all this boring text from the internet

# Download from the google webstore
https://chrome.google.com/webstore/detail/textblock/cbjhcabimjmeokngojdenfdpiccgekmd

# Backstory
https://medium.com/@nettsundere/a-text-is-not-that-important-b586eb0e6087

# How it works

* Click on the app logo (letter A in the toolbar) and by making so - hide all text from your internet. 
* Click again to make it show up again.
* Have fun

![How it works](/reference_material/screenshot.png)

# Development / Testing

The extension source lives in `src/` (Manifest V3, service-worker background).

End-to-end tests use Playwright with a real Chromium + the extension loaded,
and report Istanbul coverage collected from the service worker.

```
npm install
npx playwright install chromium
npm run test:coverage
```

`test:coverage` builds an instrumented copy under `dist-test/`, runs the e2e
suite, then prints coverage and fails if it drops below 60% (lines/stmts/funcs).

# Safari (macOS) - only unsigned and local for now (I dont have whatever subscription price is)

Requires Safari 16+ (the extension relies on dynamic content-script
registration — `chrome.scripting.registerContentScripts`) and Xcode.

The Xcode wrapper project lives in `safari/TextBlock/` and references `src/`
directly — there is no copy step; edit `src/` and rebuild.

Build and run:

1. Safari -> Settings -> Advanced -> enable "Show features for web developers".
2. Develop -> Developer Settings -> check "Allow unsigned extensions"
   (this resets every time Safari quits).
3. Open `safari/TextBlock/TextBlock.xcodeproj` in Xcode and Run (or
   `xcodebuild -project safari/TextBlock/TextBlock.xcodeproj -scheme TextBlock build`).
4. Launch the TextBlock app once so macOS registers the extension with Safari.
5. Safari -> Settings -> Extensions -> enable TextBlock, then grant website
   access ("Always Allow on Every Website") — Safari gates host permissions
   behind per-user consent.

Kinda temporary: the extension is not signed, so it only works until Safari
closes — once Safari quits, "Allow unsigned extensions" resets and you have to
repeat the steps above.

Note: on Safari `storage.sync` is device-local, so the on/off flag does not
sync across devices.

If you add a new file under `src/`, also add it to the Xcode project
(the converter references files individually).

# Privacy / Data collection

TextBlock collects **no data**. It does not gather, store, transmit, or sell any
personal or browsing information. Everything runs locally in your browser; the
only stored value is a single on/off flag (`enabled`) kept in browser storage so
the extension remembers its toggle state. No analytics, no tracking, no network
requests to any server.

# License (MIT)
Copyright (c) 2017 Vladimir `nettsundere` Kiselev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


