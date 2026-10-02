"use strict";


/* ==========================================================
   Mayday Protocol Assistant
   Service Worker
========================================================== */

const CACHE_NAME =
    "mayday-protocol-mobile-11";


const CORE_FILES = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/store.js",
    "./js/app.js",
    "./manifest.json"
];


/* ==========================================================
   インストール
========================================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {

                    return cache.addAll(
                        CORE_FILES
                    );

                })
                .then(() => {

                    return self.skipWaiting();

                })

        );

    }
);


/* ==========================================================
   有効化
========================================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(keys => {

                    return Promise.all(

                        keys.map(key => {

                            if (
                                key !== CACHE_NAME
                            ) {

                                return caches.delete(
                                    key
                                );
                            }

                            return null;

                        })

                    );

                })
                .then(() => {

                    return self.clients.claim();

                })

        );

    }
);


/* ==========================================================
   読み込み
========================================================== */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method
            !== "GET"
        ) {

            return;
        }


        event.respondWith(

            fetch(
                event.request
            )
                .then(response => {

                    const copy =
                        response.clone();

                    caches
                        .open(CACHE_NAME)
                        .then(cache => {

                            cache.put(
                                event.request,
                                copy
                            );

                        });

                    return response;

                })
                .catch(() => {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);