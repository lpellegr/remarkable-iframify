'use strict';

(function () {
        const VIDEO_PROVIDERS = {
            'vimeo': {
                pattern: /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/,
                groupIndex: 5,
                iframeOpen: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://player.vimeo.com/video/' + videoId + '?byline=0&badge=0&portrait=0&title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no">',
                iframeClose: () => '</iframe></div>'
            },
            'youtube': {
                pattern: /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|\?vi?=|\&vi?=)([^#\&\?]*).*/,
                groupIndex: 2,
                iframeOpen: (videoId) => '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;"><iframe src="https://www.youtube.com/embed/' + videoId + '?rel=0&showinfo=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no">',
                iframeClose: () => '</iframe></div>'
            }
        };

        function parseVideoId(url, pattern, groupIndex) {

            const match = url.match(pattern);

            if (match && match[groupIndex]) {
                return match[groupIndex];
            }

            return null;
        }

        function iframify(md, options) {
            const originalLinkOpenRenderer = md.renderer.rules.link_open;
            const originalLinkCloseRenderer = md.renderer.rules.link_close;

            md.renderer.rules.link_open = (tokens, idx, options, env) => {
                const href = tokens[idx].href;

                for (let key in VIDEO_PROVIDERS) {
                    const videoProvider = VIDEO_PROVIDERS[key];

                    const videoId = parseVideoId(href, videoProvider.pattern, videoProvider.groupIndex);

                    if (videoId) {
                        env.iframe_link = key;
                        return videoProvider.iframeOpen(videoId);
                    }
                }

                return originalLinkOpenRenderer(tokens, idx, options, env);
            };

            md.renderer.rules.link_close = (tokens, idx, options, env) => {
                if (env.iframe_link) {
                    const result = VIDEO_PROVIDERS[env.iframe_link].iframeClose();
                    env.iframe_link = null;
                    return result;
                }

                return originalLinkCloseRenderer(tokens, idx, options, env);
            };
        }

        if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = iframify
            }
            exports.iframify = iframify
        }
        else {
            window.iframify = iframify
        }
    })();
