(function () {
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

    var emojiColors = [
        // red
        '#e53e3e','#c53030','#e53e3e','#e53e3e','#e53e3e','#e53e3e',
        // orange
        '#dd6b20','#dd6b20','#dd6b20','#dd6b20','#dd6b20',
        // gold
        '#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e','#d69e2e',
        // brown
        '#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f','#b7791f',
        // green
        '#276749','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169','#38a169',
        // blue
        '#3182ce','#3182ce','#3182ce','#3182ce','#4299e1','#4299e1','#4299e1','#4299e1',
        // purple
        '#805ad5','#805ad5','#805ad5','#6b46c1',
        // pink
        '#ed64a6','#ed64a6','#ed64a6','#ed64a6','#ed64a6','#ed64a6','#b83280',
        // gray
        '#a0aec0','#a0aec0','#a0aec0','#a0aec0','#718096','#718096','#718096','#718096','#718096','#718096','#718096','#718096',
        // dark
        '#2d3748','#2d3748','#2d3748','#2d3748'
    ];

    function init(headlineEl, emojiEl) {
        var text = headlineEl.textContent;
        var paused = false;
        var emojiIdx = 0;
        var step = 0;
        var offset = 3;

        // Signature mode: only animate on hover
        var signature = headlineEl.closest('.farkas-signature');
        var sigActive = false;

        // Split into per-character spans
        headlineEl.textContent = '';
        var spans = [];
        for (var i = 0; i < text.length; i++) {
            var span = document.createElement('span');
            span.textContent = text[i];
            headlineEl.appendChild(span);
            spans.push(span);
        }

        if (!signature) {
            // Normal mode: hover to pause + color
            spans.forEach(function (span) {
                span.addEventListener('mouseenter', function () {
                    paused = true;
                    var ei = (emojiIdx - 1 + emojis.length) % emojis.length;
                    headlineEl.style.color = emojiColors[ei];
                });
            });
            headlineEl.addEventListener('mouseleave', function () { paused = false; });
        }

        // Preload fonts, then start (or wait for hover in signature mode)
        Promise.allSettled(
            fonts.map(function (f) { return document.fonts.load('48px "' + f + '"', 'Farkas.Design'); })
        ).then(function () {
            var targetWidth = headlineEl.getBoundingClientRect().width;

            function tick() {
                if (signature && !sigActive) return;

                if (!paused) {
                    spans.forEach(function (span, i) {
                        var idx = (step + (spans.length - 1 - i) * offset) % wave.length;
                        span.style.fontFamily = '"' + wave[idx] + '", serif';
                    });
                    step++;
                    if (emojiEl) {
                        var ei = emojiIdx++ % emojis.length;
                        emojiEl.textContent = emojis[ei];
                    }

                    if (!signature) {
                        headlineEl.style.color = '#2a2a2a';
                    }
                    headlineEl.style.transform = 'none';
                    var actual = headlineEl.getBoundingClientRect().width;
                    headlineEl.style.transform = 'scale(' + (targetWidth / actual) + ')';
                }

                setTimeout(tick, 150);
            }

            if (signature) {
                // Signature mode: animate only on hover
                signature.addEventListener('mouseenter', function () {
                    sigActive = true;
                    signature.classList.add('active');
                    tick();
                });
                signature.addEventListener('mouseleave', function () {
                    sigActive = false;
                    signature.classList.remove('active');
                    if (emojiEl) emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    spans.forEach(function (s) { s.style.fontFamily = ''; });
                    headlineEl.style.color = '';
                    headlineEl.style.transform = '';
                    step = 0;
                    emojiIdx = 0;
                });
            } else {
                tick();
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

        var emoji = document.createElement('span');
        emoji.className = 'farkas-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        sig.appendChild(emoji);

        var wrap = document.createElement('span');
        wrap.className = 'farkas-wrap';
        var headline = document.createElement('span');
        headline.className = 'farkas-headline';
        headline.textContent = 'Farkas.Design';
        wrap.appendChild(headline);
        sig.appendChild(wrap);

        document.body.appendChild(sig);

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
