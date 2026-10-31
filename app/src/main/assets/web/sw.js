/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "index.html",
    "revision": "e752036ae6826e73830ad55eb39fe60d"
  }, {
    "url": "icon.svg",
    "revision": "7d614e5f4484271276a9ba119e5bc476"
  }, {
    "url": "icon-512.png",
    "revision": "83dd037cb70f2684927b29880f185fb7"
  }, {
    "url": "icon-192.png",
    "revision": "48d8675471b521a66cca478d175eeb7f"
  }, {
    "url": "assets/index-BdhyXm11.css",
    "revision": null
  }, {
    "url": "assets/index-BSlaytTi.js",
    "revision": null
  }, {
    "url": "assets/aistudio/file_000000007b408207a59e8f5fe0c43dc6_b56b0429.png",
    "revision": null
  }, {
    "url": "icon-192.png",
    "revision": "48d8675471b521a66cca478d175eeb7f"
  }, {
    "url": "icon-512.png",
    "revision": "83dd037cb70f2684927b29880f185fb7"
  }, {
    "url": "icon.svg",
    "revision": "7d614e5f4484271276a9ba119e5bc476"
  }, {
    "url": "manifest.webmanifest",
    "revision": "363a05fac589cc8e1a0828c4970c0945"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
