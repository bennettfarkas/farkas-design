(function () {
    // Shared theme toggle — used by onclick="toggleTheme()" across all pages
    window.toggleTheme = function () {
        var current = document.documentElement.getAttribute('data-theme');
        var isDark = current === 'dark' || (!current && window.matchMedia('(prefers-color-scheme: dark)').matches);
        var next = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    };

    // Inject Google Fonts for display fonts (subset to headline characters)
    var fontsUrl = 'https://fonts.googleapis.com/css2?' +
        'family=Playfair+Display&family=Bodoni+Moda&family=DM+Serif+Display&family=Cormorant' +
        '&family=Instrument+Serif&family=Bebas+Neue&family=Anton&family=Oswald&family=Archivo+Black' +
        '&family=Space+Grotesk&family=Syne&family=Outfit&family=Bricolage+Grotesque' +
        '&family=Alfa+Slab+One&family=Zilla+Slab&family=Fraunces&family=Bungee' +
        '&family=Dela+Gothic+One&family=Rubik+Mono+One&family=Josefin+Sans&family=Raleway' +
        '&family=Space+Mono&family=Big+Shoulders+Display&family=Fjalla+One&family=Familjen+Grotesk' +
        '&family=Protest+Strike&family=Libre+Caslon+Display&family=Ultra&family=Righteous' +
        '&family=Abril+Fatface&family=Staatliches&family=Passion+One&family=Russo+One' +
        '&family=Orbitron&family=Cinzel&family=Poppins&family=Lexend&family=Bitter' +
        '&family=Pathway+Gothic+One&family=Crimson+Text' +
        '&text=Farkas.Design&display=swap';

    if (!document.querySelector('link[href*="Dela+Gothic+One"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontsUrl;
        document.head.appendChild(link);
    }

    // Inject animation CSS if not already present
    if (!document.querySelector('link[href*="farkas-animation.css"]')) {
        var script = document.currentScript;
        if (script && script.src) {
            var cssHref = script.src.replace('farkas-animation.js', 'farkas-animation.css');
            var cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = cssHref;
            document.head.appendChild(cssLink);
        }
    }

    // Fonts ordered heaviest → lightest
    var fonts = [
        'Dela Gothic One', 'Ultra', 'Bungee', 'Rubik Mono One',
        'Archivo Black', 'Alfa Slab One', 'Anton', 'Bebas Neue',
        'Righteous', 'Protest Strike', 'Abril Fatface', 'Staatliches',
        'Passion One', 'Big Shoulders Display', 'Oswald', 'Fjalla One',
        'Russo One', 'Zilla Slab', 'Syne', 'Orbitron',
        'DM Serif Display', 'Bodoni Moda', 'Cinzel', 'Fraunces',
        'Bitter', 'Outfit', 'Poppins', 'Space Grotesk',
        'Lexend', 'Bricolage Grotesque', 'Playfair Display', 'Familjen Grotesk',
        'Pathway Gothic One', 'Cormorant', 'Instrument Serif', 'Crimson Text',
        'Space Mono', 'Libre Caslon Display', 'Josefin Sans', 'Raleway'
    ];

    // Ping-pong: heavy → light → heavy
    var wave = fonts.concat(fonts.slice(1, -1).reverse());

    var emojis = [
        // red
        '🤯','🍁','🍄','🍕','👨🏼‍🎨','🃏',
        // orange
        '🔥','🎃','🦊','🌮','🎉',
        // gold
        '🍺','👍🏼','😂','🤔','👋🏼','🤙🏼','🌙','🌛','✨','🍳','💡','⚡️','🚴🏼‍♂️','🚐',
        // brown
        '🦤','🦥','🦔','🍄‍🟫','🪺','🥔','🧇','🥞','🥐','🌯','🫘','☕️',
        // green
        '🌲','🐢','🦖','🐊','🐉','🌵','🍀','🌱','🪴','🥑','🥏','👌🏼','👨🏼‍🔬',
        // blue
        '🐳','🌎','👨🏼‍💻','🦸🏼‍♂️','🐬','🦚','🏔️','💎',
        // purple
        '😈','🔮','💜','🧙🏼‍♂️',
        // pink
        '🥳','🫶🏻','🧠','🪸','🍦','🦩','🦄',
        // gray
        '👻','🐻‍❄️','💀','😶‍🌫️','🤘🏼','😑','🤖','🦾','🐺','🦛','🚲','⛰️',
        // dark
        '☠️','👀','♠️','🏴‍☠️'
    ];

    function randomEmoji() {
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function init(headlineEl, emojiEl) {
        var text = headlineEl.textContent;
        var paused = false;
        var emojiIdx = 0;
        var step = 0;
        var offset = 3;

        // Signature mode: only animate on hover
        var signature = headlineEl.closest('.farkas-signature');
        var sigActive = false;

        // Respect prefers-reduced-motion: show static text, no animation
        if (reducedMotion) {
            if (signature) {
                headlineEl.style.color = 'var(--color-muted, #888)';
            } else {
                headlineEl.style.color = 'var(--color-text)';
            }
            return;
        }

        // Split into per-character spans
        headlineEl.textContent = '';
        var spans = [];
        for (var i = 0; i < text.length; i++) {
            var span = document.createElement('span');
            span.textContent = text[i];
            headlineEl.appendChild(span);
            spans.push(span);
        }

        // Preload fonts with timeout, then start (or wait for hover in signature mode)
        var fontTimeout = new Promise(function (resolve) { setTimeout(resolve, 5000); });
        var fontLoad = Promise.allSettled(
            fonts.map(function (f) { return document.fonts.load('48px "' + f + '"', 'Farkas.Design'); })
        );
        Promise.race([fontLoad, fontTimeout]).then(function () {
            var targetWidth = headlineEl.getBoundingClientRect().width;
            if (!signature) headlineEl.style.color = 'var(--color-text)';

            // Update target width on resize so scale stays correct
            window.addEventListener('resize', function () {
                headlineEl.style.transform = 'none';
                targetWidth = headlineEl.getBoundingClientRect().width;
            });

            function compensate() {
                headlineEl.style.transform = 'none';
                var actual = headlineEl.getBoundingClientRect().width;
                headlineEl.style.transform = 'scale(' + (targetWidth / actual) + ')';
            }

            if (signature) {
                // ── Signature mode: ping-pong wave on hover ──
                function sigAdvance() {
                    spans.forEach(function (span, i) {
                        var idx = (step + (spans.length - 1 - i) * offset) % wave.length;
                        span.style.fontFamily = '"' + wave[idx] + '", serif';
                    });
                    step++;
                    if (emojiEl) {
                        var ei = emojiIdx % emojis.length;
                        emojiIdx = (emojiIdx + 1) % emojis.length;
                        emojiEl.textContent = emojis[ei];
                    }
                    compensate();
                }

                var rafId = 0;
                var lastTick = 0;
                function tick(now) {
                    if (!sigActive) { rafId = 0; return; }
                    if (!now || now - lastTick >= 150) {
                        sigAdvance();
                        lastTick = now || 0;
                    }
                    rafId = requestAnimationFrame(tick);
                }

                var hitTarget = signature.querySelector('.farkas-emoji-hit') || emojiEl;
                hitTarget.addEventListener('mouseenter', function () {
                    sigActive = true;
                    signature.classList.add('active');
                    if (!rafId) tick();
                });
                hitTarget.addEventListener('mouseleave', function () {
                    sigActive = false;
                    signature.classList.remove('active');
                    if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
                    emojiEl.textContent = randomEmoji();
                    spans.forEach(function (s) { s.style.fontFamily = ''; });
                    headlineEl.style.color = '';
                    headlineEl.style.transform = '';
                    step = 0;
                    emojiIdx = 0;
                });
            } else {
                // ── Normal mode: Dissolve & Reconverge ──
                var indices = Array.from({length: spans.length}, function (_, i) { return i; });
                var steps = [];
                var autoTimer = null;

                function shuffle(arr) {
                    var a = arr.slice();
                    for (var i = a.length - 1; i > 0; i--) {
                        var j = Math.floor(Math.random() * (i + 1));
                        var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
                    }
                    return a;
                }

                function randomFont() {
                    return fonts[Math.floor(Math.random() * fonts.length)];
                }

                function setFont(span, font) {
                    span.style.fontFamily = '"' + font + '", serif';
                }

                function setAll(font) {
                    for (var i = 0; i < spans.length; i++) setFont(spans[i], font);
                    compensate();
                }

                function buildCycle() {
                    var font = randomFont();
                    var order = shuffle(indices);

                    // Snap to unified font + emoji
                    steps.push({ fn: function () {
                        setAll(font);
                        if (emojiEl) emojiEl.textContent = randomEmoji();
                    }, delay: 2000 });

                    // Dissolve each character
                    order.forEach(function (idx, k) {
                        steps.push({ fn: function () {
                            setFont(spans[idx], randomFont());
                            if (emojiEl) emojiEl.textContent = randomEmoji();
                            compensate();
                        }, delay: k === order.length - 1 ? 1200 : 100 });
                    });
                }

                function advance() {
                    if (steps.length === 0) buildCycle();
                    var s = steps.shift();
                    s.fn();
                    return s.delay;
                }

                function autoRun() {
                    if (paused) return;
                    var delay = advance();
                    autoTimer = setTimeout(autoRun, delay);
                }

                // Track which letter's font the cursor is over
                var hoveredFont = null;
                spans.forEach(function (span) {
                    span.addEventListener('mouseenter', function () {
                        hoveredFont = span.style.fontFamily;
                    });
                });

                // Hover to pause, click to advance, mouseleave snaps to hovered font
                var hoverEls = emojiEl ? [headlineEl, emojiEl] : [headlineEl];
                var touchPause = false;
                hoverEls.forEach(function (el) {
                    el.addEventListener('touchstart', function () {
                        touchPause = true;
                    }, { passive: true });
                    el.addEventListener('mouseenter', function () {
                        paused = true;
                        clearTimeout(autoTimer);
                    });
                    el.addEventListener('mouseleave', function () {
                        paused = false;
                        touchPause = false;
                        clearTimeout(autoTimer);
                        if (hoveredFont) {
                            for (var i = 0; i < spans.length; i++) {
                                spans[i].style.fontFamily = hoveredFont;
                            }
                            compensate();
                            hoveredFont = null;
                            // Skip unify snap — build dissolve-only steps
                            steps.length = 0;
                            var order = shuffle(indices);
                            order.forEach(function (idx, k) {
                                steps.push({ fn: function () {
                                    setFont(spans[idx], randomFont());
                                    if (emojiEl) emojiEl.textContent = randomEmoji();
                                    compensate();
                                }, delay: k === order.length - 1 ? 1200 : 100 });
                            });
                            autoTimer = setTimeout(autoRun, 2000);
                        } else {
                            autoRun();
                        }
                    });
                    el.addEventListener('click', function () {
                        if (touchPause) {
                            // Mobile: pause, advance, auto-resume after 2s
                            touchPause = false;
                            if (!paused) {
                                paused = true;
                                clearTimeout(autoTimer);
                            }
                            advance();
                            clearTimeout(autoTimer);
                            autoTimer = setTimeout(function () {
                                paused = false;
                                autoRun();
                            }, 2000);
                        } else if (paused) {
                            // Desktop: advance one step while hovering
                            advance();
                        }
                    });
                });

                autoRun();
            }
        });
    }

    // Inject signature element if the script tag has data-signature
    function injectSignature() {
        var script = document.currentScript || document.querySelector('script[data-signature]');
        if (!script || !script.hasAttribute('data-signature')) return;

        var sig = document.createElement('a');
        sig.className = 'farkas-signature';
        sig.href = 'https://farkas.design';

        var emojiZone = document.createElement('span');
        emojiZone.className = 'farkas-emoji-zone';

        var emoji = document.createElement('span');
        emoji.className = 'farkas-emoji';
        emoji.textContent = randomEmoji();
        emojiZone.appendChild(emoji);

        // Stable hit target — never changes DOM, so Safari always fires click
        var hit = document.createElement('span');
        hit.className = 'farkas-emoji-hit';
        emojiZone.appendChild(hit);

        sig.appendChild(emojiZone);

        // Inject critical hiding rule before element exists to prevent FOUC
        var style = document.createElement('style');
        style.textContent = '.farkas-signature .farkas-wrap{opacity:0;transition:opacity .25s ease}';
        document.head.appendChild(style);

        var wrap = document.createElement('span');
        wrap.className = 'farkas-wrap';
        var headline = document.createElement('span');
        headline.className = 'farkas-headline';
        headline.textContent = 'Farkas.Design';
        wrap.appendChild(headline);
        sig.appendChild(wrap);

        document.body.appendChild(sig);

        // Click background to randomize emoji
        document.addEventListener('click', function (e) {
            if (!e.target.closest('a, button, input, select, textarea, [onclick]')) {
                var next;
                do { next = randomEmoji(); } while (next === emoji.textContent);
                emoji.textContent = next;
            }
        });

        // Ensure body is a flex column so signature sticks to bottom
        document.body.style.minHeight = '100vh';
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
    }

    // Auto-init: finds .farkas-headline and optional .farkas-emoji
    function autoInit() {
        injectSignature();
        var headlines = document.querySelectorAll('.farkas-headline');
        headlines.forEach(function (h) {
            var container = h.closest('.farkas-signature') || h.closest('main, section, body');
            var emojiEl = container ? container.querySelector('.farkas-emoji') : null;
            init(h, emojiEl);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
})();
