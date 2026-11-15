(function() {
    var on = addEventListener,
    off = removeEventListener,
    $ = function(q) {
        return document.querySelector(q)
    },
    $$ = function(q) {
        return document.querySelectorAll(q)
    },
    $body = document.body,
    $inner = $('.inner'),
    client = (function() {
        var o = {
            browser:'other',
            browserVersion: 0,
            os:'other',
            osVersion: 0,
            mobile: false,
            canUse: null,
            flags: {
                lsdUnits: false,
            },
        },
        ua = navigator.userAgent,
        a,
        i;
        a = [['firefox',
        /Firefox\/([0-9\.]+)/],
        ['edge',
        /Edge\/([0-9\.]+)/],
        ['safari',
        /Version\/([0-9\.]+).+Safari/],
        ['chrome',
        /Chrome\/([0-9\.]+)/],
        ['chrome',
        /CriOS\/([0-9\.]+)/],
        ['ie',
        /Trident\/.+rv:([0-9]+)/]];
        for (i=0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(RegExp.$1);
                break;
            }
        }
        a = [['ios',
        /([0-9_]+) like Mac OS X/,
        function(v) {
            return v.replace('_','.').replace('_','');
        }],
        ['ios',
        /CPU like Mac OS X/,
        function(v) {
            return 0
        }],
        ['ios',
        /iPad; CPU/,
        function(v) {
            return 0
        }],
        ['android',
        /Android ([0-9\.]+)/,
        null],
        ['mac',
        /Macintosh.+Mac OS X ([0-9_]+)/,
        function(v) {
            return v.replace('_','.').replace('_','');
        }],
        ['windows',
        /Windows NT ([0-9\.]+)/,
        null],
        ['undefined',
        /Undefined/,
        null]];
        for (i=0; i < a.length; i++) {
            if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(a[i][2] ? (a[i][2])(RegExp.$1): RegExp.$1);
                break;
            }
        }
        if (o.os =='mac' && ('ontouchstart' in window)&& ((screen.width == 1024 && screen.height == 1366)|| (screen.width == 834 && screen.height == 1112)|| (screen.width == 810 && screen.height == 1080)|| (screen.width == 768 && screen.height == 1024)))o.os ='ios';
        o.mobile = (o.os =='android' || o.os =='ios');
        var _canUse = document.createElement('div');
        o.canUse = function(property, value) {
            var style;
            style = _canUse.style;
            if (!(property in style))return false;
            if (typeof value !=='undefined') {
                style[property] = value;
                if (style[property] =='')return false;
            }
            return true;
        };
        o.flags.lsdUnits = o.canUse('width','100dvw');
        return o;
    }()),
    ready = {
        list: [],
        add: function(f) {
            this.list.push(f);
        },
        run: function() {
            this.list.forEach((f) => {
                f();
            });
        },
    },
    trigger = function(t) {
        dispatchEvent(new Event(t));
    },
    cssRules = function(selectorText) {
        var ss = document.styleSheets,
        a = [],
        f = function(s) {
            var r = s.cssRules,
            i;
            for (i=0; i < r.length; i++) {
                if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches)(f)(r[i]);
                else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText)a.push(r[i]);
            }
        },
        x,
        i;
        for (i=0; i < ss.length; i++)f(ss[i]);
        return a;
    },
    escapeHtml = function(s) {
        if (s ==='' || s === null|| s === undefined)return'';
        var a = {
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#39;',
        };
        s = s.replace(/[&<>"']/g, function(x) {
            return a[x];
        });
        return s;
    },
    thisHash = function() {
        var h = location.hash ? location.hash.substring(1): null,
        a;
        if (!h)return null;
        if (h.match(/\?/)) {
            a = h.split('?');
            h = a[0];
            history.replaceState(undefined, undefined,'#' + h);
            window.location.search = a[1];
        }
        if (h.length > 0&& !h.match(/^[a-zA-Z]/))h ='x' + h;
        if (typeof h =='string')h = h.toLowerCase();
        return h;
    },
    scrollToElement = function(e, style, duration) {
        var y,
        cy,
        dy,
        start,
        easing,
        offset,
        f;
        if (!e)y = 0;
        else {
            offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset): 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
            switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior:'default') {
                case'default':default:y = e.offsetTop + offset;
                break;
                case'center':if (e.offsetHeight < window.innerHeight)y = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2) + offset;
                else y = e.offsetTop - offset;
                break;
                case'previous':if (e.previousElementSibling)y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
                else y = e.offsetTop + offset;
                break;
            }
        }
        if (!style)style ='smooth';
        if (!duration)duration = 750;
        if (style =='instant') {
            window.scrollTo(0, y);
            return;
        }
        start = Date.now();
        cy = window.scrollY;
        dy = y - cy;
        switch (style) {
            case'linear':easing = function (t) {
                return t
            };
            break;
            case'smooth':easing = function (t) {
                return t<.5 ? 4*t*t*t: (t-1)*(2*t-2)*(2*t-2)+1
            };
            break;
        }
        f = function() {
            var t = Date.now() - start;
            if (t >= duration)window.scroll(0, y);
            else {
                window.scroll(0, cy + (dy * easing(t / duration)));
                requestAnimationFrame(f);
            }
        };
        f();
    },
    scrollToTop = function() {
        scrollToElement(null);
    },
    loadElements = function(parent) {
        var a,
        e,
        x,
        i;
        a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
        for (i=0; i < a.length; i++) {
            a[i].contentWindow.location.replace(a[i].dataset.src);
            a[i].dataset.initialSrc = a[i].dataset.src;
            a[i].dataset.src ='';
        }
        a = parent.querySelectorAll('video[autoplay]');
        for (i=0; i < a.length; i++) {
            if (a[i].paused)a[i].play();
        }
        e = parent.querySelector('[data-autofocus="1"]');
        x = e ? e.tagName: null;
        switch (x) {
            case'FORM':e = e.querySelector('.field input, .field select, .field textarea');
            if (e)e.focus();
            break;
            default:break;
        }
        a = parent.querySelectorAll('unloaded-script');
        for (i=0; i < a.length; i++) {
            x = document.createElement('script');
            x.setAttribute('data-loaded','');
            if (a[i].getAttribute('src'))x.setAttribute('src', a[i].getAttribute('src'));
            if (a[i].textContent)x.textContent = a[i].textContent;
            a[i].replaceWith(x);
        }
        x = new Event('loadelements');
        a = parent.querySelectorAll('[data-unloaded]');
        a.forEach((element) => {
            element.removeAttribute('data-unloaded');
            element.dispatchEvent(x);
        });
    },
    unloadElements = function(parent) {
        var a,
        e,
        x,
        i;
        a = parent.querySelectorAll('iframe[data-src=""]');
        for (i=0; i < a.length; i++) {
            if (a[i].dataset.srcUnload ==='0')continue;
            if ('initialSrc' in a[i].dataset)a[i].dataset.src = a[i].dataset.initialSrc;
            else a[i].dataset.src = a[i].src;
            a[i].contentWindow.location.replace('about:blank');
        }
        a = parent.querySelectorAll('video');
        for (i=0; i < a.length; i++) {
            if (!a[i].paused)a[i].pause();
        }
        e = $(':focus');
        if (e)e.blur();
    };
    window._scrollToTop = scrollToTop;
    var thisUrl = function() {
        return window.location.href.replace(window.location.search,'').replace(/#$/,'');
    };
    var getVar = function(name) {
        var a = window.location.search.substring(1).split('&'),
        b,
        k;
        for (k in a) {
            b = a[k].split('=');
            if (b[0] == name)return b[1];
        }
        return null;
    };
    var errors = {
        handle: function(handler) {
            window.onerror = function(message, url, line, column, error) {
                (handler)(error.message);
                return true;
            };
        },
        unhandle: function() {
            window.onerror = null;
        }
    };
    var db = {
        open: function(objectStoreName, handler) {
            var request = indexedDB.open('carrd');
            request.onupgradeneeded = function(event) {
                event.target.result.createObjectStore(objectStoreName,{
                    keyPath:'id'
                });
            };
            request.onsuccess = function(event) {
                (handler)(event.target.result.transaction([objectStoreName],'readwrite').objectStore(objectStoreName));
            };
        },
        put: function(objectStore, values, handler) {
            var request = objectStore.put(values);
            request.onsuccess = function(event) {
                (handler)();
            };
            request.onerror = function(event) {
                throw new Error('db.put: error');
            };
        },
        get: function(objectStore, id, handler) {
            var request = objectStore.get(id);
            request.onsuccess = function(event) {
                if (!event.target.result)throw new Error('db.get: could not retrieve object with id "' + id +'"');
                (handler)(event.target.result);
            };
            request.onerror = function(event) {
                throw new Error('db.get: error');
            };
        },
        delete: function(objectStore, id, handler) {
            objectStore.delete(id).onsuccess = function(event) {
                (handler)(event.target.result);
            };
        },
    };
    var loadHandler = function() {
        setTimeout(function() {
            $body.classList.remove('is-loading');
            $body.classList.add('is-playing');
            setTimeout(function() {
                $body.classList.remove('is-playing');
                $body.classList.add('is-ready');
            }, 1000);
        }, 100);
    };
    on('load', loadHandler);
    (function() {
        var initialSection,
        initialScrollPoint,
        initialId,
        header,
        footer,
        name,
        hideHeader,
        hideFooter,
        disableAutoScroll,
        h,
        e,
        ee,
        k,
        locked = false,
        title = document.title,
        scrollPointParent = function(target) {
            while (target) {
                if (target.parentElement&& target.parentElement.tagName =='SECTION')break;
                target = target.parentElement;
            }
            return target;
        },
        scrollPointSpeed = function(scrollPoint) {
            let x = parseInt(scrollPoint.dataset.scrollSpeed);
            switch (x) {
                case 5:return 250;
                case 4:return 500;
                case 3:return 750;
                case 2:return 1000;
                case 1:return 1250;
                default:break;
            }
            return 750;
        },
        doNextScrollPoint = function(event) {
            var e,
            target,
            id;
            e = scrollPointParent(event.target);
            if (!e)return;
            while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                    break;
                }
            }
            if (!target|| !id)return;
            if (target.dataset.scrollInvisible =='1')scrollToElement(target,'smooth', scrollPointSpeed(target));
            else location.href ='#' + id;
        },
        doPreviousScrollPoint = function(e) {
            var e,
            target,
            id;
            e = scrollPointParent(event.target);
            if (!e)return;
            while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                    break;
                }
            }
            if (!target|| !id)return;
            if (target.dataset.scrollInvisible =='1')scrollToElement(target,'smooth', scrollPointSpeed(target));
            else location.href ='#' + id;
        },
        doFirstScrollPoint = function(e) {
            var e,
            target,
            id;
            e = scrollPointParent(event.target);
            if (!e)return;
            while (e && e.previousElementSibling) {
                e = e.previousElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                }
            }
            if (!target|| !id)return;
            if (target.dataset.scrollInvisible =='1')scrollToElement(target,'smooth', scrollPointSpeed(target));
            else location.href ='#' + id;
        },
        doLastScrollPoint = function(e) {
            var e,
            target,
            id;
            e = scrollPointParent(event.target);
            if (!e)return;
            while (e && e.nextElementSibling) {
                e = e.nextElementSibling;
                if (e.dataset.scrollId) {
                    target = e;
                    id = e.dataset.scrollId;
                }
            }
            if (!target|| !id)return;
            if (target.dataset.scrollInvisible =='1')scrollToElement(target,'smooth', scrollPointSpeed(target));
            else location.href ='#' + id;
        },
        doNextSection = function() {
            var section;
            section = $('#main > .inner > section.active').nextElementSibling;
            if (!section || section.tagName !='SECTION')return;
            location.href ='#' + section.id.replace(/-section$/,'');
        },
        doPreviousSection = function() {
            var section;
            section = $('#main > .inner > section.active').previousElementSibling;
            if (!section || section.tagName !='SECTION')return;
            location.href ='#' + (section.matches(':first-child') ?'': section.id.replace(/-section$/,''));
        },
        doFirstSection = function() {
            var section;
            section = $('#main > .inner > section:first-of-type');
            if (!section || section.tagName !='SECTION')return;
            location.href ='#' + section.id.replace(/-section$/,'');
        },
        doLastSection = function() {
            var section;
            section = $('#main > .inner > section:last-of-type');
            if (!section || section.tagName !='SECTION')return;
            location.href ='#' + section.id.replace(/-section$/,'');
        },
        resetSectionChangeElements = function(section) {
            var ee,
            e,
            x;
            ee = section.querySelectorAll('[data-reset-on-section-change="1"]');
            for (e of ee) {
                x = e ? e.tagName: null;
                switch (x) {
                    case'FORM':e.reset();
                    break;
                    default:break;
                }
            }
        },
        activateSection = function(section, scrollPoint) {
            var sectionHeight,
            currentSection,
            currentSectionHeight,
            name,
            hideHeader,
            hideFooter,
            disableAutoScroll,
            ee,
            k;
            if (!section.classList.contains('inactive')) {
                name = (section ? section.id.replace(/-section$/,''): null);
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll): false;
                if (scrollPoint)scrollToElement(scrollPoint,'smooth', scrollPointSpeed(scrollPoint));
                else if (!disableAutoScroll)scrollToElement(null);
                return false;
            } else {
                locked = true;
                if (location.hash =='#home')history.replaceState(null, null,'#');
                name = (section ? section.id.replace(/-section$/,''): null);
                disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll): false;
                currentSection = $('section:not(.inactive)');
                if (currentSection) {
                    currentSection.classList.add('inactive');
                    document.title = title;
                    unloadElements(currentSection);
                    resetSectionChangeElements(currentSection);
                    clearTimeout(window._sectionTimeoutId);
                    setTimeout(function() {
                        currentSection.style.display ='none';
                        currentSection.classList.remove('active');
                    }, 250);
                }
                if (section.dataset.title)document.title = section.dataset.title +' - ' + title;
                setTimeout(function() {
                    section.style.display ='';
                    trigger('resize');
                    if (!disableAutoScroll)scrollToElement(null,'instant');
                    setTimeout(function() {
                        section.classList.remove('inactive');
                        section.classList.add('active');
                        setTimeout(function() {
                            loadElements(section);
                            if (scrollPoint)scrollToElement(scrollPoint,'instant');
                            locked = false;
                        }, 500);
                    }, 75);
                }, 250);
            }
        },
        sections = {
        };
        window._nextScrollPoint = doNextScrollPoint;
        window._previousScrollPoint = doPreviousScrollPoint;
        window._firstScrollPoint = doFirstScrollPoint;
        window._lastScrollPoint = doLastScrollPoint;
        window._nextSection = doNextSection;
        window._previousSection = doPreviousSection;
        window._firstSection = doFirstSection;
        window._lastSection = doLastSection;
        window._scrollToTop = function() {
            var section,
            id;
            scrollToElement(null);
            if (!!(section = $('section.active'))) {
                id = section.id.replace(/-section$/,'');
                if (id =='home')id ='';
                history.pushState(null, null,'#' + id);
            }
        };
        if ('scrollRestoration' in history)history.scrollRestoration ='manual';
        header = $('#header');
        footer = $('#footer');
        h = thisHash();
        if (h&& !h.match(/^[a-zA-Z0-9\-]+$/))h = null;
        if (e = $('[data-scroll-id="' + h +'"]')) {
            initialScrollPoint = e;
            initialSection = initialScrollPoint.parentElement;
            initialId = initialSection.id;
        } else if (e = $('#' + (h ? h:'home') +'-section')) {
            initialScrollPoint = null;
            initialSection = e;
            initialId = initialSection.id;
        }
        if (!initialSection) {
            initialScrollPoint = null;
            initialSection = $('#' +'home' +'-section');
            initialId = initialSection.id;
            history.replaceState(undefined, undefined,'#');
        }
        name = (h ? h:'home');
        hideHeader = name ? ((name in sections) && ('hideHeader' in sections[name]) && sections[name].hideHeader): false;
        hideFooter = name ? ((name in sections) && ('hideFooter' in sections[name]) && sections[name].hideFooter): false;
        disableAutoScroll = name ? ((name in sections) && ('disableAutoScroll' in sections[name]) && sections[name].disableAutoScroll): false;
        if (header && hideHeader) {
            header.classList.add('hidden');
            header.style.display ='none';
        }
        if (footer && hideFooter) {
            footer.classList.add('hidden');
            footer.style.display ='none';
        }
        ee = $$('#main > .inner > section:not([id="' + initialId +'"])');
        for (k = 0; k < ee.length; k++) {
            ee[k].className ='inactive';
            ee[k].style.display ='none';
        }
        initialSection.classList.add('active');
        ready.add(() => {
            if (initialSection.dataset.title)document.title = initialSection.dataset.title +' - ' + title;
            loadElements(initialSection);
            if (header)loadElements(header);
            if (footer)loadElements(footer);
            if (!disableAutoScroll)scrollToElement(null,'instant');
        });
        on('load', function() {
            if (initialScrollPoint)scrollToElement(initialScrollPoint,'instant');
        });
        on('hashchange', function(event) {
            var section,
            scrollPoint,
            h,
            e;
            if (locked)return false;
            h = thisHash();
            if (h&& !h.match(/^[a-zA-Z0-9\-]+$/))return false;
            if (e = $('[data-scroll-id="' + h +'"]')) {
                scrollPoint = e;
                section = scrollPoint.parentElement;
            } else if (e = $('#' + (h ? h:'home') +'-section')) {
                scrollPoint = null;
                section = e;
            } else {
                scrollPoint = null;
                section = $('#' +'home' +'-section');
                history.replaceState(undefined, undefined,'#');
            }
            if (!section)return false;
            activateSection(section, scrollPoint);
            return false;
        });
        on('click', function(event) {
            var t = event.target,
            tagName = t.tagName.toUpperCase(),
            scrollPoint,
            section;
            switch (tagName) {
                case'IMG':case'SVG':case'USE':case'U':case'STRONG':case'EM':case'CODE':case'S':case'MARK':case'SPAN':while (!!(t = t.parentElement))if (t.tagName =='A')break;
                if (!t)return;
                break;
                default:break;
            }
            if (t.tagName =='A' && t.getAttribute('href') !== null&& t.getAttribute('href').substr(0, 1) =='#') {
                if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) +'"][data-scroll-invisible="1"]'))) {
                    event.preventDefault();
                    section = scrollPoint.parentElement;
                    if (section.classList.contains('inactive')) {
                        history.pushState(null, null,'#' + section.id.replace(/-section$/,''));
                        activateSection(section, scrollPoint);
                    } else {
                        scrollToElement(scrollPoint,'smooth', scrollPointSpeed(scrollPoint));
                    }
                } else if (t.hash == window.location.hash) {
                    event.preventDefault();
                    history.replaceState(undefined, undefined,'#');
                    location.replace(t.hash);
                }
            }
        });
    })();
    var style,
    sheet,
    rule;
    style = document.createElement('style');
    style.appendChild(document.createTextNode(''));
    document.head.appendChild(style);
    sheet = style.sheet;
    if (client.mobile) {
        (function() {
            if (client.flags.lsdUnits) {
                document.documentElement.style.setProperty('--viewport-height','100svh');
                document.documentElement.style.setProperty('--background-height','100lvh');
            } else {
                var f = function() {
                    document.documentElement.style.setProperty('--viewport-height', window.innerHeight +'px');
                    document.documentElement.style.setProperty('--background-height', (window.innerHeight + 250) +'px');
                };
                on('load', f);
                on('orientationchange', function() {
                    setTimeout(function() {
                        (f)();
                    }, 100);
                });
            }
        })();
    }
    if (client.os =='android') {
        (function() {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            var f = function() {
                rule.style.cssText ='height: ' + (Math.max(screen.width, screen.height)) +'px';
            };
            on('load', f);
            on('orientationchange', f);
            on('touchmove', f);
        })();
        $body.classList.add('is-touch');
    } else if (client.os =='ios') {
        if (client.osVersion <= 11)(function() {
            sheet.insertRule('body::after { }', 0);
            rule = sheet.cssRules[0];
            rule.style.cssText ='-webkit-transform: scale(1.0)';
        })();
        if (client.osVersion <= 11)(function() {
            sheet.insertRule('body.ios-focus-fix::before { }', 0);
            rule = sheet.cssRules[0];
            rule.style.cssText ='height: calc(100% + 60px)';
            on('focus', function(event) {
                $body.classList.add('ios-focus-fix');
            }, true);
            on('blur', function(event) {
                $body.classList.remove('ios-focus-fix');
            }, true);
        })();
        $body.classList.add('is-touch');
    }
    var scrollEvents = {
        items: [],
        add: function(o) {
            this.items.push({
                element: o.element,
                triggerElement: (('triggerElement' in o && o.triggerElement) ? o.triggerElement: o.element),
                enter: ('enter' in o ? o.enter: null),
                leave: ('leave' in o ? o.leave: null),
                mode: ('mode' in o ? o.mode: 4),
                threshold: ('threshold' in o ? o.threshold: 0.25),
                offset: ('offset' in o ? o.offset: 0),
                initialState: ('initialState' in o ? o.initialState: null),
                state: false,
            });
        },
        handler: function() {
            var height,
            top,
            bottom,
            scrollPad;
            if (client.os =='ios') {
                height = document.documentElement.clientHeight;
                top = document.body.scrollTop + window.scrollY;
                bottom = top + height;
                scrollPad = 125;
            } else {
                height = document.documentElement.clientHeight;
                top = document.documentElement.scrollTop;
                bottom = top + height;
                scrollPad = 0;
            }
            scrollEvents.items.forEach(function(item) {
                var elementTop,
                elementBottom,
                viewportTop,
                viewportBottom,
                bcr,
                pad,
                state,
                a,
                b;
                if (!item.enter&& !item.leave)return true;
                if (!item.triggerElement)return true;
                if (item.triggerElement.offsetParent === null) {
                    if (item.state == true&& item.leave) {
                        item.state = false;
                        (item.leave).apply(item.element);
                        if (!item.enter)item.leave = null;
                    }
                    return true;
                }
                bcr = item.triggerElement.getBoundingClientRect();
                elementTop = top + Math.floor(bcr.top);
                elementBottom = elementTop + bcr.height;
                if (item.initialState !== null) {
                    state = item.initialState;
                    item.initialState = null;
                } else {
                    switch (item.mode) {
                        case 1:default:state = (bottom > (elementTop - item.offset) && top < (elementBottom + item.offset));
                        break;
                        case 2:a = (top + (height * 0.5));
                        state = (a > (elementTop - item.offset) && a < (elementBottom + item.offset));
                        break;
                        case 3:a = top + (height * (item.threshold));
                        if (a - (height * 0.375) <= 0)a = 0;
                        b = top + (height * (1 - item.threshold));
                        if (b + (height * 0.375) >= document.body.scrollHeight - scrollPad)b = document.body.scrollHeight + scrollPad;
                        state = (b > (elementTop - item.offset) && a < (elementBottom + item.offset));
                        break;
                        case 4:pad = height * item.threshold;
                        viewportTop = (top + pad);
                        viewportBottom = (bottom - pad);
                        if (Math.floor(top) <= pad)viewportTop = top;
                        if (Math.ceil(bottom) >= (document.body.scrollHeight - pad))viewportBottom = bottom;
                        if ((viewportBottom - viewportTop) >= (elementBottom - elementTop)) {
                            state = ((elementTop >= viewportTop && elementBottom <= viewportBottom)|| (elementTop >= viewportTop && elementTop <= viewportBottom)|| (elementBottom >= viewportTop && elementBottom <= viewportBottom));
                        } else state = ((viewportTop >= elementTop && viewportBottom <= elementBottom)|| (elementTop >= viewportTop && elementTop <= viewportBottom)|| (elementBottom >= viewportTop && elementBottom <= viewportBottom));
                        break;
                    }
                }
                if (state != item.state) {
                    item.state = state;
                    if (item.state) {
                        if (item.enter) {
                            (item.enter).apply(item.element);
                            if (!item.leave)item.enter = null;
                        }
                    } else {
                        if (item.leave) {
                            (item.leave).apply(item.element);
                            if (!item.enter)item.leave = null;
                        }
                    }
                }
            });
        },
        init: function() {
            on('load', this.handler);
            on('resize', this.handler);
            on('scroll', this.handler);
            (this.handler)();
        }
    };
    scrollEvents.init();
    (function() {
        var items = $$('.deferred'),
        loadHandler,
        enterHandler;
        loadHandler = function() {
            var i = this,
            p = this.parentElement,
            duration = 375;
            if (i.dataset.src !=='done')return;
            if (Date.now() - i._startLoad < duration)duration = 175;
            i.style.transitionDuration = (duration / 1000.00) +'s';
            p.classList.remove('loading');
            i.style.opacity = 1;
            setTimeout(function() {
                i.style.backgroundImage ='none';
                i.style.transitionProperty ='';
                i.style.transitionTimingFunction ='';
                i.style.transitionDuration ='';
            }, duration);
        };
        enterHandler = function() {
            var i = this,
            p = this.parentElement,
            src;
            src = i.dataset.src;
            i.dataset.src ='done';
            p.classList.add('loading');
            i._startLoad = Date.now();
            i.src = src;
        };
        items.forEach(function(p) {
            var i = p.firstElementChild;
            if (!p.classList.contains('enclosed')) {
                p.style.backgroundImage ='url(' + i.src +')';
                p.style.backgroundSize ='100% 100%';
                p.style.backgroundPosition ='top left';
                p.style.backgroundRepeat ='no-repeat';
            }
            i.style.opacity = 0;
            i.style.transitionProperty ='opacity';
            i.style.transitionTimingFunction ='ease-in-out';
            i.addEventListener('load', loadHandler);
            scrollEvents.add({
                element: i,
                enter: enterHandler,
                offset: 250,
            });
        });
    })();
    function slideshowBackground(id, settings) {
        var _this = this;
        if (!('images' in settings)|| !('target' in settings))return;
        this.id = id;
        this.wait = ('wait' in settings ? settings.wait: 0);
        this.defer = ('defer' in settings ? settings.defer: false);
        this.navigation = ('navigation' in settings ? settings.navigation: false);
        this.order = ('order' in settings ? settings.order:'default');
        this.preserveImageAspectRatio = ('preserveImageAspectRatio' in settings ? settings.preserveImageAspectRatio: false);
        this.transition = ('transition' in settings ? settings.transition: {
            style:'crossfade',
            speed: 1000,
            delay: 6000,
            resume: 12000
        });
        this.images = settings.images;
        this.preload = true;
        this.locked = false;
        this.$target = $(settings.target);
        this.$wrapper = ('wrapper' in settings ? $(settings.wrapper): null);
        this.pos = 0;
        this.lastPos = 0;
        this.$slides = [];
        this.img = document.createElement('img');
        this.preloadTimeout = null;
        this.resumeTimeout = null;
        this.transitionInterval = null;
        if (window.CARRD_DISABLE_DEFER === true) {
            this.defer = false;
            this.preload = false;
        }
        if (this.preserveImageAspectRatio&& this.transition.style =='crossfade')this.transition.style ='fade';
        if (this.transition.delay !== false)switch (this.transition.style) {
            case'crossfade':this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 2);
            break;
            case'fade':this.transition.delay = Math.max(this.transition.delay, this.transition.speed * 3);
            break;
            case'instant':default:break;
        }
        if (!this.$wrapper)this.navigation = false;
        if (this.defer) {
            scrollEvents.add({
                element: this.$target,
                enter: function() {
                    _this.preinit();
                }
            });
        } else {
            this.preinit();
        }
    };
    slideshowBackground.prototype.speedClassName = function(speed) {
        switch (speed) {
            case 1:return'slow';
            default:case 2:return'normal';
            case 3:return'fast';
        }
    };
    slideshowBackground.prototype.preinit = function() {
        var _this = this;
        if (this.preload) {
            this.preloadTimeout = setTimeout(function() {
                _this.$target.classList.add('is-loading');
            }, this.transition.speed);
            setTimeout(function() {
                _this.init();
            }, 0);
        } else {
            this.init();
        }
    };
    slideshowBackground.prototype.init = function() {
        var _this = this,
        loaded = 0,
        hasLinks = false,
        dragStart = null,
        dragEnd = null,
        $slide,
        intervalId,
        i;
        this.$target.classList.add('slideshow-background');
        this.$target.classList.add(this.transition.style);
        if (this.navigation) {
            this.$next = document.createElement('div');
            this.$next.classList.add('nav','next');
            this.$next.addEventListener('click', function(event) {
                _this.stopTransitioning();
                _this.next('default');
            });
            this.$wrapper.appendChild(this.$next);
            this.$previous = document.createElement('div');
            this.$previous.classList.add('nav','previous');
            this.$previous.addEventListener('click', function(event) {
                _this.stopTransitioning();
                _this.previous('default');
            });
            this.$wrapper.appendChild(this.$previous);
            this.$wrapper.addEventListener('touchstart', function(event) {
                if (event.touches.length > 1)return;
                dragStart = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
            });
            this.$wrapper.addEventListener('touchmove', function(event) {
                var dx,
                dy;
                if (!dragStart|| event.touches.length > 1)return;
                dragEnd = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };
                dx = dragStart.x - dragEnd.x;
                dy = dragStart.y - dragEnd.y;
                if (Math.abs(dx) < 50)return;
                event.preventDefault();
                if (dx > 0) {
                    _this.stopTransitioning();
                    _this.next('default');
                } else if (dx < 0) {
                    _this.stopTransitioning();
                    _this.previous('default');
                }
            });
            this.$wrapper.addEventListener('touchend', function(event) {
                dragStart = null;
                dragEnd = null;
            });
        }
        for (i=0; i < this.images.length; i++) {
            if (this.preload) {
                this.$img = document.createElement('img');
                this.$img.src = this.images[i].src;
                this.$img.addEventListener('load', function(event) {
                    loaded++;
                });
            }
            $slide = document.createElement('div');
            $slide.style.backgroundImage ='url(\'' + this.images[i].src +'\')';
            $slide.style.backgroundPosition = this.images[i].position;
            $slide.style.backgroundRepeat ='no-repeat';
            $slide.style.backgroundSize = (this.preserveImageAspectRatio ?'contain':'cover');
            $slide.setAttribute('role','img');
            $slide.setAttribute('aria-label', this.images[i].caption);
            this.$target.appendChild($slide);
            if (this.images[i].motion !='none') {
                $slide.classList.add(this.images[i].motion);
                $slide.classList.add(this.speedClassName(this.images[i].speed));
            }
            if ('linkUrl' in this.images[i]) {
                $slide.style.cursor ='pointer';
                $slide._linkUrl = this.images[i].linkUrl;
                hasLinks = true;
            }
            this.$slides.push($slide);
        }
        if (hasLinks)this.$target.addEventListener('click', function(event) {
            var slide;
            if (!('_linkUrl' in event.target))return;
            slide = event.target;
            if ('onclick' in slide._linkUrl) {
                (slide._linkUrl.onclick)(event);
                return;
            }
            if ('href' in slide._linkUrl) {
                if (slide._linkUrl.href.charAt(0) =='#') {
                    window.location.href = slide._linkUrl.href;
                    return;
                }
                if ('target' in slide._linkUrl&& slide._linkUrl.target =='_blank')window.open(slide._linkUrl.href);
                else window.location.href = slide._linkUrl.href;
            }
        });
        switch (this.order) {
            case'random':this.pos = (Math.ceil(Math.random() * this.$slides.length) - 1);
            break;
            case'reverse':this.pos = this.$slides.length - 1;
            break;
            case'default':default:this.pos = 0;
            break;
        }
        this.lastPos = this.pos;
        if (this.preload)intervalId = setInterval(function() {
            if (loaded >= _this.images.length) {
                clearInterval(intervalId);
                clearTimeout(_this.preloadTimeout);
                _this.$target.classList.remove('is-loading');
                _this.start();
            }
        }, 250);
        else {
            this.start();
        }
    };
    slideshowBackground.prototype.move = function(direction, activeOrder) {
        var pos,
        order;
        if (!activeOrder)activeOrder = this.order;
        switch (direction) {
            case 1:order = activeOrder;
            break;
            case -1:switch (activeOrder) {
                case'random':order ='random';
                break;
                case'reverse':order ='default';
                break;
                case'default':default:order ='reverse';
                break;
            }
            break;
            default:return;
        }
        switch (order) {
            case'random':for (; ; ) {
                pos = (Math.ceil(Math.random() * this.$slides.length) - 1);
                if (pos != this.pos)break;
            }
            break;
            case'reverse':pos = this.pos - 1;
            if (pos < 0)pos = this.$slides.length - 1;
            break;
            case'default':default:pos = this.pos + 1;
            if (pos >= this.$slides.length)pos = 0;
            break;
        }
        this.show(pos);
    };
    slideshowBackground.prototype.next = function(activeOrder) {
        this.move(1, activeOrder);
    };
    slideshowBackground.prototype.previous = function(activeOrder) {
        this.move(-1, activeOrder);
    };
    slideshowBackground.prototype.show = function(pos) {
        var _this = this;
        if (this.locked)return;
        this.lastPos = this.pos;
        this.pos = pos;
        switch (this.transition.style) {
            case'instant':this.$slides[this.lastPos].classList.remove('top');
            this.$slides[this.pos].classList.add('top');
            this.$slides[this.pos].classList.add('visible');
            this.$slides[this.pos].classList.add('is-playing');
            this.$slides[this.lastPos].classList.remove('visible');
            this.$slides[this.lastPos].classList.remove('initial');
            this.$slides[this.lastPos].classList.remove('is-playing');
            break;
            case'crossfade':this.locked = true;
            this.$slides[this.lastPos].classList.remove('top');
            this.$slides[this.pos].classList.add('top');
            this.$slides[this.pos].classList.add('visible');
            this.$slides[this.pos].classList.add('is-playing');
            setTimeout(function() {
                _this.$slides[_this.lastPos].classList.remove('visible');
                _this.$slides[_this.lastPos].classList.remove('initial');
                _this.$slides[_this.lastPos].classList.remove('is-playing');
                _this.locked = false;
            }, this.transition.speed);
            break;
            case'fade':this.locked = true;
            this.$slides[this.lastPos].classList.remove('visible');
            setTimeout(function() {
                _this.$slides[_this.lastPos].classList.remove('is-playing');
                _this.$slides[_this.lastPos].classList.remove('top');
                _this.$slides[_this.pos].classList.add('top');
                _this.$slides[_this.pos].classList.add('is-playing');
                _this.$slides[_this.pos].classList.add('visible');
                _this.locked = false;
            }, this.transition.speed);
            break;
            default:break;
        }
    };
    slideshowBackground.prototype.start = function() {
        var _this = this;
        this.$slides[_this.pos].classList.add('visible');
        this.$slides[_this.pos].classList.add('top');
        this.$slides[_this.pos].classList.add('initial');
        this.$slides[_this.pos].classList.add('is-playing');
        if (this.$slides.length == 1)return;
        setTimeout(function() {
            _this.startTransitioning();
        }, this.wait);
    };
    slideshowBackground.prototype.startTransitioning = function() {
        var _this = this;
        if (this.transition.delay === false)return;
        this.transitionInterval = setInterval(function() {
            _this.next();
        }, this.transition.delay);
    };
    slideshowBackground.prototype.stopTransitioning = function() {
        var _this = this;
        clearInterval(this.transitionInterval);
        if (this.transition.resume !== false) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = setTimeout(function() {
                _this.startTransitioning();
            }, this.transition.resume);
        }
    };
    function form(id, settings) {
        var _this = this;
        this.id = id;
        this.mode = settings.mode;
        this.method = settings.method;
        this.code = ('code' in settings ? settings.code: null);
        this.success = settings.success;
        this.initHandler = ('initHandler' in settings ? settings.initHandler: null);
        this.presubmitHandler = ('presubmitHandler' in settings ? settings.presubmitHandler: null);
        this.failure = ('failure' in settings ? settings.failure: null);
        this.optional = ('optional' in settings ? settings.optional: []);
        this.events = ('events' in settings ? settings.events: {
        });
        this.recaptcha = ('recaptcha' in settings ? settings.recaptcha: null);
        this.collectTrackingParameters = ('collectTrackingParameters' in settings ? settings.collectTrackingParameters: false);
        this.exportVariables = ('exportVariables' in settings ? settings.exportVariables: false);
        this.$form = $('#' + this.id);
        this.$form.addEventListener('change', function(event) {
            if (event.target.tagName !='INPUT')return;
            _this.refreshInput(event.target);
        });
        this.$form.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            _this.triggerSubmit();
        });
        this.$form.addEventListener('reset', function(event) {
            setTimeout(function() {
                _this.refreshInputs();
            }, 0);
        });
        this.$form.addEventListener('keydown', function(event) {
            if (event.keyCode == 13 && event.ctrlKey) {
                event.preventDefault();
                event.stopPropagation();
                _this.triggerSubmit();
            }
        });
        var x = $('#' + this.id +' input[name="' + settings.hid +'"]');
        if (x) {
            x.disabled = true;
            x.parentNode.style.display ='none';
        }
        this.$submit = $('#' + this.id +' .actions button[type="submit"]');
        this.$submit.disabled = false;
        this.initInputs();
        if (this.initHandler) {
            errors.handle(function(message) {
                return _this.failureHandler(message);
            });
            if (!this.initHandler())errors.unhandle();
        }
        if (this.recaptcha) {
            grecaptcha.ready(function() {
                var id;
                id = grecaptcha.render(_this.$submit, {
                    sitekey: _this.recaptcha.key,
                    isolated: true,
                    theme: (_this.recaptcha.darkMode ?'dark':'light'),
                    callback: function(token) {
                        _this.submit({
                            recaptchaToken: token
                        },['g-recaptcha-response']);
                        grecaptcha.reset(id);
                    }
                });
            });
        }
    };
    form.prototype.completionHandler = function(properties, eventHandler, response) {
        if (eventHandler !== null)eventHandler.apply(this.$form, [response]);
        switch (properties.mode) {
            default:case 1:alert(this.expandVariables(properties.value));
            break;
            case 2:this.openUrlProperty(properties.value);
            break;
            case 3:properties.value.apply(this.$form, [response]);
            break;
            case 4:break;
        }
    };
    form.prototype.expandVariables = function(s) {
        if (typeof variables ==='undefined')return s;
        if (variables.hasVariables(s)) {
            for (input of this.$form.elements) {
                if (!this.isAllowedInput(input))continue;
                value ='';
                if (this.isValidInput(input)) {
                    switch (input.type) {
                        case'checkbox':value = input.checked ?'true':'false';
                        break;
                        case'email':case'select-one':case'number':case'tel':case'text':case'textarea':case'hidden':value = input.value;
                        break;
                        default:value ='';
                        break;
                    }
                } else value ='';
                if (!!(s.match(/^(#[a-zA-Z0-9\_\-]+|[a-z0-9\-\.]+:[a-zA-Z0-9\~\!\@\#$\%\&\-\_\+\=\;\,\.\?\/\:\{\}\|]+)$/)))value = encodeURIComponent(value);
                s = variables.expandVariable(s, input.name, value);
            }
        }
        s = variables.expandVariableString(this.$form, s);
        return s;
    };
    form.prototype.exportVariableValues = function(source, values, suffix) {
        if (typeof variables ==='undefined' || this.exportVariables !== true)return;
        variables.import(source + (suffix ? suffix:''), values);
        variables.purge('form' + (suffix ? suffix:''));
        variables.import('form' + (suffix ? suffix:''), values);
    };
    form.prototype.failureHandler = function(message) {
        var eventHandler;
        eventHandler = ('onfailure' in this.events) ? this.events.onfailure: null;
        if (message.charAt(0) =='*')this.completionHandler({
            mode: 1,
            value: message.substring(1)
        },eventHandler,null);
        else if (this.failure)this.completionHandler(this.failure,eventHandler,null);
        else this.completionHandler({
            mode: 1,
            value: message
        },eventHandler,null);
        this.waiting(false);
        errors.unhandle();
        return true;
    };
    form.prototype.finalizeInput = function(input) {
        try {
            if (!input|| typeof input !='object' || !('name' in input))throw'Not an input.';
            if (!('value' in input))throw'Missing "value" property.';
            if (input.type =='text' || input.type =='email' || input.type =='textarea' || input.type =='hidden')input.value = input.value.replace(/^\s+/,'').replace(/\s+$/,'');
        } catch (e) {
        }
    };
    form.prototype.formatDate = function(value, format) {
        var date,
        options,
        a,
        s;
        if (!value.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/))return'';
        a = value.split('-');
        date = new Date(a[0], parseInt(a[1]) - 1, parseInt(a[2]), 0, 0, 0, 0);
        switch (format) {
            default:case'short':break;
            case'medium':options = {
                dateStyle:'medium'
            };
            break;
            case'long':options = {
                dateStyle:'long'
            };
            break;
            case'full':options = {
                dateStyle:'full'
            };
            break;
        }
        s = new Intl.DateTimeFormat(undefined, options).format(date);
        return s;
    };
    form.prototype.getAmount = function() {
        var x;
        x = this.getRequiredInputValue('amount', ['select-one','number']);
        if (!x)return null;
        x = parseFloat(x);
        if (isNaN(x)|| x < 1.00|| x > 100000.00)return null;
        return x;
    };
    form.prototype.getEmail = function() {
        return this.getRequiredInputValue('email','email');
    };
    form.prototype.getQuantity = function() {
        var x;
        x = this.getRequiredInputValue('quantity', ['select-one','number']);
        if (!x)return null;
        x = parseInt(x);
        if (isNaN(x)|| x < 1|| x > 100000)return null;
        return x;
    };
    form.prototype.getRequiredInputValue = function(name, type) {
        var input;
        for (input of this.$form.elements) {
            if (((Array.isArray(type) && type.includes(input.type)) || input.type == type)&& input.name == name&& input.value !=='' && input.value !== null)return input.value;
        }
        return null;
    };
    form.prototype.initInputs = function() {
        var _this = this,
        i,
        input;
        for (i=0; i < this.$form.elements.length; i++) {
            input = this.$form.elements[i];
            switch (input.type) {
                case'number':(function(input) {
                    var p = input.parentNode,
                    decrement = p.querySelector('button.decrement'),
                    increment = p.querySelector('button.increment');
                    input.addEventListener('blur', function(event) {
                        _this.normalizeNumberInput(input);
                    });
                    if (decrement&& increment) {
                        decrement.addEventListener('click', function(event) {
                            event.preventDefault();
                            _this.normalizeNumberInput(input);
                            input.stepDown(1);
                            _this.normalizeNumberInput(input);
                        });
                        increment.addEventListener('click', function(event) {
                            event.preventDefault();
                            _this.normalizeNumberInput(input);
                            input.stepUp(1);
                            _this.normalizeNumberInput(input);
                        });
                    }
                })(input);
                break;
                case'file':(function(input) {
                    var p = input.parentNode,
                    select = p.querySelector('button.select');
                    select.addEventListener('click', function(event) {
                        event.preventDefault();
                        input.click();
                    });
                    input.addEventListener('focus', function(event) {
                        event.target.parentNode.classList.add('focus');
                    });
                    input.addEventListener('blur', function(event) {
                        event.target.parentNode.classList.remove('focus');
                    });
                })(input);
                break;
                case'date':(function(input) {
                    var p = input.parentNode,
                    select = p.querySelector('button.select'),
                    changeHandler,
                    x,
                    y,
                    z;
                    select.addEventListener('click', function(event) {
                        event.preventDefault();
                        input.click();
                        input.focus();
                    });
                    switch (client.browser) {
                        case'safari':input.addEventListener('keydown', function(event) {
                            switch (event.keyCode) {
                                case 9:event.preventDefault();
                                input.blur();
                                break;
                                case 27:event.preventDefault();
                                input.blur();
                                break;
                                case 33:break;
                                case 34:break;
                                case 37:break;
                                case 38:break;
                                case 39:break;
                                case 40:break;
                                default:event.preventDefault();
                                break;
                            }
                        });
                        break;
                        default:input.addEventListener('click', function(event) {
                            event.preventDefault();
                            input.focus();
                            input.showPicker();
                        });
                        break;
                    }
                    changeHandler = function() {
                        if (input.value)p.setAttribute('data-value', _this.formatDate(input.value, p.dataset.format));
                        else p.setAttribute('data-value','');
                    };
                    input.addEventListener('change', function(event) {
                        changeHandler();
                    });
                    changeHandler();
                })(input);
                break;
                case'text':case'textarea':case'email':input.addEventListener('blur', function(event) {
                    this.value = this.value.replace(/^\s+/,'').replace(/\s+$/,'');
                });
                break;
            }
            this.refreshInput(input);
        }
    };
    form.prototype.isAllowedInput = function(input, ignore) {
        try {
            if (!input|| typeof input !='object' || !('name' in input))throw'Not an input.';
            if (ignore&& ignore.indexOf(input.name) != -1)throw'Input is ignored.';
            if (input.disabled)throw'Input is disabled.';
            switch (input.type) {
                case'text':case'email':case'textarea':case'select-one':case'checkbox':case'number':case'tel':case'file':case'date':case'hidden':break;
                default:throw'Not an allowed input.';
            }
        } catch (e) {
            return false;
        }
        return true;
    };
    form.prototype.isValidInput = function(input) {
        var result = false;
        switch (input.type) {
            case'email':result = input.value.match(new RegExp("^([a-zA-Z0-9\\_\\-\\.\\+]+)@([a-zA-Z0-9\\-\\.]+)\\.([a-zA-Z]+)$"));
            break;
            case'select-one':result = input.value.match(new RegExp("^[^\\<\\>]+$"));
            break;
            case'checkbox':result = true;
            break;
            case'number':result = input.value.match(new RegExp("^[0-9\\-\\.]+$"));
            break;
            case'tel':result = input.value.match(new RegExp("^[0-9\\-\\+\\(\\)\\ \\#\\*]+$"));
            break;
            case'file':result = true;
            break;
            case'date':result = input.value.match(new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$"));
            break;
            default:case'text':case'textarea':case'hidden':result = true;
            break;
        }
        return result;
    };
    form.prototype.normalizeNumberInput = function(input) {
        var min = parseFloat(input.min),
        max = parseFloat(input.max),
        step = parseFloat(input.step),
        v = parseFloat(input.value);
        if (isNaN(v)) {
            if (!input.required) {
                input.value = null;
                return;
            }
            v = isNaN(min) ? 0: min;
        }
        if (!isNaN(min)&& v < min)v = min;
        if (!isNaN(max)&& v > max)v = max;
        if (!isNaN(step)&& (v % step) !== 0)v = Math.round(v / step) * step;
        switch (input.dataset.category) {
            case'currency':v = parseFloat(v).toFixed(2);
            break;
            default:case'decimal':v = parseFloat(v);
            break;
            case'integer':v = parseInt(v);
            break;
        }
        input.value = v;
    };
    form.prototype.openUrlProperty = function(p) {
        if ('onclick' in p) {
            (p.onclick)(event);
            return;
        }
        if ('href' in p) {
            let href = this.expandVariables(p.href);
            this.$form.reset();
            if (href.charAt(0) =='#') {
                window.location.href = href;
                return;
            }
            if ('target' in p&& p.target =='_blank')window.open(href);
            else window.location.href = href;
        }
    };
    form.prototype.pause = function(values, handler) {
        var _this = this;
        this.waiting(true);
        db.open('formData', function(objectStore) {
            db.delete(objectStore, _this.id, function() {
                db.put(objectStore, values, function() {
                    handler.call(_this);
                });
            });
        });
    };
    form.prototype.refreshInput = function(input) {
        var a = [],
        p;
        switch (input.type) {
            case'file':p = input.parentNode;
            if (input.files.length > 0)p.setAttribute('data-filename', input.files[0].name);
            else p.setAttribute('data-filename','');
            break;
            case'date':p = input.parentNode;
            if (input.value)p.setAttribute('data-value', this.formatDate(input.value, p.dataset.format));
            else p.setAttribute('data-value','');
            break;
            default:break;
        }
    };
    form.prototype.refreshInputs = function() {
        var i;
        for (i=0; i < this.$form.elements.length; i++)this.refreshInput(this.$form.elements[i]);
    };
    form.prototype.resume = function(handler) {
        var _this = this;
        this.waiting(true);
        this.scrollIntoView();
        db.open('formData', function(objectStore) {
            db.get(objectStore, _this.id, function(values) {
                db.delete(objectStore, _this.id, function() {
                    var e,
                    i,
                    v;
                    for (i in _this.$form.elements) {
                        e = _this.$form.elements[i];
                        if (!e.name)continue;
                        v = (e.name in values ? values[e.name]: null);
                        switch (e.type) {
                            case'checkbox':e.checked = (v =='checked' ? true: false);
                            break;
                            case'file':if (v)e.parentNode.setAttribute('data-filename', v.name);
                            break;
                            default:e.value = v;
                            break;
                        }
                    }
                    handler.call(_this, values);
                });
            });
        });
    };
    form.prototype.scrollIntoView = function() {
        window.scrollTo(0, this.$form.offsetTop);
    };
    form.prototype.submit = function(values, ignore) {
        var _this = this,
        input,
        result,
        _success,
        _failure,
        a,
        b,
        i,
        e,
        fd,
        k,
        x,
        usp;
        try {
            for (input of this.$form.elements) {
                if (!this.isAllowedInput(input, ignore))continue;
                if (this.optional.indexOf(input.name) !== -1&&(input.value ==='' || input.value === null|| (input.type =='checkbox' && !input.checked)))continue;
                this.finalizeInput(input);
                if (!this.isValidInput(input))throw'Not valid.';
            }
        } catch (e) {
            alert('Missing or invalid fields. Please try again.');
            return;
        }
        if ('onsubmit' in this.events) {
            if (this.events.onsubmit.apply(this.$form) === false)return;
        }
        a = this.values();
        if (values) {
            for (k in values)a[k] = values[k];
        }
        if (this.collectTrackingParameters) {
            usp = new URLSearchParams(window.location.search);
            b = ['utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content'];
            for (k of b) {
                x = usp.get(k);
                if (x) {
                    x = x.trim();
                    x = x.replace(/[^a-zA-Z0-9\-\_\%\+\s]/g,'');
                    x = x.replace(/\s+/g,'_');
                    if (x.length <= 256)a[k] = x;
                }
            }
        }
        switch (this.method) {
            default:case'ajax':break;
            case'get':case'post':for (k in a) {
                if (this.$form.elements[k])continue;
                e = document.createElement('input');
                e.setAttribute('type','hidden');
                e.setAttribute('name', k);
                this.$form.appendChild(e);
                e.value = a[k];
            }
            this.$form.submit();
            return;
            case'code':if (typeof this.code =='function') {
                this.waiting(true);
                _success = function() {
                    _this.exportVariableValues(_this.id, a);
                    _this.completionHandler(_this.success,('onsuccess' in _this.events) ? _this.events.onsuccess: null,null);
                    _this.waiting(false);
                };
                _failure = function() {
                    _this.completionHandler(_this.failure,('onfailure' in _this.events) ? _this.events.onfailure: null,null);
                    _this.waiting(false);
                };
                result = this.code.apply(this.$form, [_success, _failure]);
                if (result === true)_success();
                else if (result === false)_failure();
            }
            return;
        }
        if (x = $(':focus'))x.blur();
        errors.handle(function(message) {
            return _this.failureHandler(message);
        });
        if (this.presubmitHandler)this.presubmitHandler.call(this, a);
        else this.submitHandler(a);
    };
    form.prototype.submitHandler = function(values) {
        var _this = this,
        x,
        k,
        data;
        this.waiting(true);
        data = new FormData;
        for (k in values) {
            if (values[k]&& typeof values[k] =='object' && ('blob' in values[k]))data.append(k,values[k].blob,values[k].name);
            else data.append(k, values[k]);
        }
        x = new XMLHttpRequest();
        x.open('POST', ['','post', this.mode].join('/'));
        x.send(data);
        x.onreadystatechange = function() {
            var o;
            if (x.readyState != 4)return;
            if (x.status != 200)throw new Error('Failed server response (' + x.status +')');
            try {
                o = JSON.parse(x.responseText);
            } catch (e) {
                throw new Error('Invalid server response');
            }
            if (!('result' in o)|| !('message' in o))throw new Error('Incomplete server response');
            if (o.result !== true) {
                if ('response' in o)console.log(o.response);
                throw new Error(o.message);
            }
            _this.exportVariableValues(_this.id, values);
            if ('response' in o)_this.exportVariableValues(_this.id, o.response,'_response');
            _this.completionHandler(_this.success,('onsuccess' in _this.events) ? _this.events.onsuccess: null,'response' in o ? o.response: null);
            _this.$form.reset();
            _this.waiting(false);
            errors.unhandle();
        };
    };
    form.prototype.triggerSubmit = function() {
        if (this.recaptcha)this.$submit.click();
        else if (!this.$submit.disabled)this.submit();
    };
    form.prototype.values = function() {
        var a = {
        };
        for (i in this.$form.elements) {
            e = this.$form.elements[i];
            if (!e.name|| !e.value)continue;
            switch (e.type) {
                case'checkbox':a[e.name] = (e.checked ?'checked': null);
                break;
                case'file':a[e.name] = {
                    name: e.files[0].name,
                    blob: new Blob([e.files[0]], {
                        type: e.files[0].type
                    })
                };
                break;
                default:a[e.name] = e.value;
                break;
            }
        }
        a['id'] = this.id;
        return a;
    };
    form.prototype.waiting = function(x) {
        var _this = this;
        if (x) {
            $body.classList.add('is-instant');
            this.$submit.disabled = true;
            this.$submit.classList.add('waiting');
            if (this.recaptcha)setTimeout(function() {
                _this.$submit.disabled = true;
            }, 0);
        } else {
            $body.classList.remove('is-instant');
            this.$submit.classList.remove('waiting');
            this.$submit.disabled = false;
        }
    };
    new form('form02', {
        mode:'contact',
        method:'ajax',
        hid:'post-url',
        success: {
            mode: 2,
            value: {
                href:'#contact-done'
            },
        },
    });
    (function() {
        new slideshowBackground('slideshow01', {
            target:'#slideshow01 .bg',
            wrapper:'#slideshow01 .content',
            wait: 0,
            defer: true,
            navigation: false,
            order:'default',
            preserveImageAspectRatio: false,
            transition: {
                style:'crossfade',
                speed: 500,
                delay: 7000,
                resume: false,
            },
            images: [{
                src:'assets/images/slideshow01-f2a542f4.jpg?v=41b85f84',
                position:'bottom',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-59e1f077.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-b2bd2879.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-3116c518.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-500cc537.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-2e2f5a82.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-ca9c5a9a.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-79b2c0bd.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-7618d811.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-8b3d7a48.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-ed64daf8.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-3157dfa0.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-1134474d.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-7d6156fe.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-463c8e41.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-7e2cd90f.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-c161653f.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-e9b1c8c8.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-a28d6d7d.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-6084b389.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-dcc51158.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-f083e3b5.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-4211af37.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            {
                src:'assets/images/slideshow01-a9aa862d.jpg?v=41b85f84',
                position:'center',
                motion:'none',
                speed: 2,
                caption:'Untitled',
            },
            ]
        });
    })();
    function lightboxGallery() {
        var _this = this;
        this.id ='gallery';
        this.$wrapper = $('#' + this.id);
        this.$modal = null;
        this.$modalCaption = null;
        this.$modalImage = null;
        this.$modalNext = null;
        this.$modalPrevious = null;
        this.$links = null;
        this.locked = false;
        this.captions = null;
        this.current = null;
        this.delay = 375;
        this.navigation = null;
        this.mobile = null;
        this.protect = null;
        this.zoomIntervalId = null;
        this.initModal();
    };
    lightboxGallery.prototype.init = function(config) {
        var _this = this,
        $links = $$('#' + config.id +' .thumbnail'),
        navigation = config.navigation,
        captions = config.captions,
        mobile = config.mobile,
        mobileNavigation = config.mobileNavigation,
        scheme = config.scheme,
        protect = ('protect' in config ? config.protect: false),
        i,
        j;
        j = 0;
        for (i = 0; i < $links.length; i++) {
            if ($links[i].dataset.lightboxIgnore !='1')j++;
        }
        if (j < 2)navigation = false;
        for (i=0; i < $links.length; i++) {
            if ($links[i].dataset.lightboxIgnore =='1')continue;
            (function(index) {
                $links[index].addEventListener('click', function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    _this.show(index, {
                        $links: $links,
                        navigation: navigation,
                        captions: captions,
                        mobile: mobile,
                        mobileNavigation: mobileNavigation,
                        scheme: scheme,
                        protect: protect,
                    });
                });
            })(i);
        }
    };
    lightboxGallery.prototype.initModal = function() {
        var _this = this,
        dragStart = null,
        dragEnd = null,
        $modal,
        $modalInner,
        $modalImage,
        $modalNext,
        $modalPrevious;
        $modal = document.createElement('div');
        $modal.id = this.id +'-modal';
        $modal.tabIndex = -1;
        $modal.className ='gallery-modal';
        $modal.innerHTML ='<div class="inner"><img src="" /></div><div class="caption"></div><div class="nav previous"></div><div class="nav next"></div><div class="close"></div>';
        $body.appendChild($modal);
        $modalInner = $modal.querySelector('.inner');
        $modalImage = $modal.querySelector('img');
        $modalImage.addEventListener('load', function() {
            $modalImage.style.setProperty('--natural-width', $modalImage.naturalWidth +'px');
            $modalImage.style.setProperty('--natural-height', $modalImage.naturalHeight +'px');
            $modal.classList.add('done');
            setTimeout(function() {
                if (!$modal.classList.contains('visible'))return;
                $modal.classList.add('loaded');
                setTimeout(function() {
                    $modal.classList.remove('switching','from-left','from-right','done');
                }, _this.delay);
            }, ($modal.classList.contains('switching') ? 0: _this.delay));
        });
        $modalImage.addEventListener('contextmenu', function() {
            if (_this.protect)event.preventDefault();
        }, true);
        $modalImage.addEventListener('dragstart', function() {
            if (_this.protect)event.preventDefault();
        }, true);
        $modalCaption = $modal.querySelector('.caption');
        $modalNext = $modal.querySelector('.next');
        $modalPrevious = $modal.querySelector('.previous');
        switch (client.browser) {
            case'safari':case'firefox':$modalInner.style.boxShadow ='none';
            break;
            default:break;
        }
        $modal.show = function(index, offset, direction) {
            var item,
            i,
            j,
            found;
            if (_this.locked)return;
            if (typeof index !='number')index = _this.current;
            if (typeof offset =='number') {
                found = false;
                j = 0;
                for (j = 0; j < _this.$links.length; j++) {
                    index += offset;
                    if (index < 0)index = _this.$links.length - 1;
                    else if (index >= _this.$links.length)index = 0;
                    if (index == _this.current)break;
                    item = _this.$links.item(index);
                    if (!item)break;
                    if (item.dataset.lightboxIgnore !='1') {
                        found = true;
                        break;
                    }
                }
                if (!found)return;
            } else {
                if (index < 0)index = _this.$links.length - 1;
                else if (index >= _this.$links.length)index = 0;
                if (index == _this.current)return;
                item = _this.$links.item(index);
                if (!item)return;
                if (item.dataset.lightboxIgnore =='1')return;
            }
            if (client.mobile)_this.zoomIntervalId = setInterval(function() {
                _this.zoomHandler();
            }, 250);
            _this.locked = true;
            if (_this.current !== null) {
                $modal.classList.remove('loaded');
                $modal.classList.add('switching');
                switch (direction) {
                    case -1:$modal.classList.add('from-left');
                    break;
                    case 1:$modal.classList.add('from-right');
                    break;
                    default:break;
                }
                setTimeout(function() {
                    _this.current = index;
                    $modalImage.src = item.href;
                    if (_this.captions)$modalCaption.innerHTML = item.querySelector('[data-caption]').dataset.caption;
                    setTimeout(function() {
                        $modal.focus();
                        _this.locked = false;
                    }, _this.delay);
                }, _this.delay);
            } else {
                _this.current = index;
                $modalImage.src = item.href;
                if (_this.captions)$modalCaption.innerHTML = item.querySelector('[data-caption]').dataset.caption;
                $modal.classList.add('visible');
                setTimeout(function() {
                    $modal.focus();
                    _this.locked = false;
                }, _this.delay);
            }
        };
        $modal.hide = function() {
            if (_this.locked)return;
            if (!$modal.classList.contains('visible'))return;
            _this.locked = true;
            $modal.classList.remove('visible');
            $modal.classList.remove('loaded');
            $modal.classList.remove('switching','from-left','from-right','done');
            clearInterval(_this.zoomIntervalId);
            setTimeout(function() {
                $modalImage.src ='';
                _this.locked = false;
                $body.focus();
                _this.current = null;
            }, _this.delay);
        };
        $modal.next = function(direction) {
            $modal.show(null, 1, direction);
        };
        $modal.previous = function(direction) {
            $modal.show(null, -1, direction);
        };
        $modal.first = function() {
            $modal.show(0);
        };
        $modal.last = function() {
            $modal.show(_this.$links.length - 1);
        };
        $modalInner.addEventListener('touchstart', function(event) {
            if (!_this.navigation)return;
            if (event.touches.length > 1)return;
            dragStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        });
        $modalInner.addEventListener('touchmove', function(event) {
            var dx,
            dy;
            if (!_this.navigation)return;
            if (!dragStart|| event.touches.length > 1)return;
            dragEnd = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            dx = dragStart.x - dragEnd.x;
            dy = dragStart.y - dragEnd.y;
            if (Math.abs(dx) < 50)return;
            event.preventDefault();
            if (dx > 0)$modal.next(-1);
            else if (dx < 0)$modal.previous(1);
        });
        $modalInner.addEventListener('touchend', function(event) {
            if (!_this.navigation)return;
            dragStart = null;
            dragEnd = null;
        });
        $modal.addEventListener('click', function(event) {
            if (event.target&& (event.target.tagName =='A' || event.target.tagName =='SPOILER-TEXT'))return;
            $modal.hide();
        });
        $modal.addEventListener('keydown', function(event) {
            if (!$modal.classList.contains('visible'))return;
            switch (event.keyCode) {
                case 39:case 32:if (!_this.navigation)break;
                event.preventDefault();
                event.stopPropagation();
                $modal.next();
                break;
                case 37:if (!_this.navigation)break;
                event.preventDefault();
                event.stopPropagation();
                $modal.previous();
                break;
                case 36:if (!_this.navigation)break;
                event.preventDefault();
                event.stopPropagation();
                $modal.first();
                break;
                case 35:if (!_this.navigation)break;
                event.preventDefault();
                event.stopPropagation();
                $modal.last();
                break;
                case 27:event.preventDefault();
                event.stopPropagation();
                $modal.hide();
                break;
            }
        });
        $modalNext.addEventListener('click', function(event) {
            $modal.next();
        });
        $modalPrevious.addEventListener('click', function(event) {
            $modal.previous();
        });
        this.$modal = $modal;
        this.$modalImage = $modalImage;
        this.$modalCaption = $modalCaption;
        this.$modalNext = $modalNext;
        this.$modalPrevious = $modalPrevious;
    };
    lightboxGallery.prototype.show = function(href, config) {
        this.$links = config.$links;
        this.navigation = config.navigation;
        this.captions = config.captions;
        this.mobile = config.mobile;
        this.mobileNavigation = config.mobileNavigation;
        this.scheme = config.scheme;
        this.protect = config.protect;
        this.$modal.classList.remove('light','dark');
        switch (this.scheme) {
            case'light':this.$modal.classList.add('light');
            break;
            case'dark':this.$modal.classList.add('dark');
            break;
            case'auto':if (window.matchMedia('(prefers-color-scheme: light)').matches)this.$modal.classList.add('light');
            else this.$modal.classList.add('dark');
            break;
        }
        if (this.navigation) {
            this.$modalNext.style.display ='';
            this.$modalPrevious.style.display ='';
            if (client.mobile&& !this.mobileNavigation) {
                this.$modalNext.style.display ='none';
                this.$modalPrevious.style.display ='none';
            }
        } else {
            this.$modalNext.style.display ='none';
            this.$modalPrevious.style.display ='none';
        }
        if (this.captions)this.$modalCaption.style.display ='';
        else this.$modalCaption.style.display ='none';
        if (this.protect) {
            this.$modalImage.style.WebkitTouchCallout ='none';
            this.$modalImage.style.userSelect ='none';
        } else {
            this.$modalImage.style.WebkitTouchCallout ='';
            this.$modalImage.style.userSelect ='';
        }
        if (client.mobile && !this.mobile)return;
        this.$modal.show(href);
    };
    lightboxGallery.prototype.zoomHandler = function() {
        var threshold = window.matchMedia('(orientation: portrait)').matches ? 50: 100;
        if (window.outerWidth > window.innerWidth + threshold)this.$modal.classList.add('zooming');
        else this.$modal.classList.remove('zooming');
    };
    var _lightboxGallery = new lightboxGallery;
    _lightboxGallery.init({
        id:'gallery01',
        navigation: true,
        captions: false,
        mobile: true,
        mobileNavigation: true,
        scheme:'dark',
    });
    ready.run();
})();

/* Brief black-screen transition between the existing single-page sections. */ (function () {
    'use strict';
    var overlay;
    var hideTimer;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function getOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id ='section-transition-overlay';
        overlay.setAttribute('aria-hidden','true');
        document.body.appendChild(overlay);
        return overlay;
    }
    window.addEventListener('hashchange', function () {
        var targetId = window.location.hash.slice(1) ||'home';
        var targetSection = document.getElementById(targetId);
        // Only animate navigation to an actual page section. Ignore placeholder links.
        if (!targetSection || targetSection.tagName.toLowerCase() !=='section') return;
        if (reducedMotion) return;
        var screen = getOverlay();
        window.clearTimeout(hideTimer);
        screen.classList.add('is-visible');
        // Hold the black screen briefly, then reveal the section being activated.
        hideTimer = window.setTimeout(function () {
            screen.classList.remove('is-visible');
        }, 420);
    });
})();
