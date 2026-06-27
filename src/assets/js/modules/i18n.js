/**
 * Módulo i18n — Turismo Cómbita
 * Soporta: data-i18n (textContent), data-i18n-html (innerHTML),
 *          data-i18n-attr="placeholder:key;title:key" (attrs).
 * Idioma persistido en localStorage.lang. API global: window.i18n.
 */
(function () {
    'use strict';

    var SUPPORTED = ['es', 'en'];
    var DEFAULT_LANG = 'es';
    var STORAGE_KEY = 'lang';
    var DICT_BASE = null;

    function resolveDictBase() {
        if (DICT_BASE) return DICT_BASE;
        var path = window.location.pathname;
        if (path.indexOf('/treks/') !== -1) {
            DICT_BASE = '../../assets/i18n/';
        } else if (path.indexOf('/admin') === 0) {
            DICT_BASE = '/assets/i18n/';
        } else {
            DICT_BASE = '/assets/i18n/';
        }
        return DICT_BASE;
    }

    function detectLang() {
        var stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
        var nav = (navigator.language || navigator.userLanguage || DEFAULT_LANG).toLowerCase().split('-')[0];
        return SUPPORTED.indexOf(nav) !== -1 ? nav : DEFAULT_LANG;
    }

    var state = {
        lang: detectLang(),
        dict: {},
        ready: false,
        listeners: []
    };

    function getNested(obj, key) {
        if (!obj || !key) return undefined;
        var parts = key.split('.');
        var cur = obj;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null) return undefined;
            cur = cur[parts[i]];
        }
        return cur;
    }

    function t(key, fallback) {
        var v = getNested(state.dict, key);
        if (v === undefined || v === null) return fallback !== undefined ? fallback : key;
        return v;
    }

    function applyAttrSpec(el, spec) {
        if (!spec) return;
        var pairs = spec.split(';');
        for (var i = 0; i < pairs.length; i++) {
            var p = pairs[i].trim();
            if (!p) continue;
            var idx = p.indexOf(':');
            if (idx === -1) continue;
            var attr = p.substring(0, idx).trim();
            var key = p.substring(idx + 1).trim();
            var value = getNested(state.dict, key);
            if (value !== undefined && value !== null) {
                el.setAttribute(attr, value);
            }
        }
    }

    function apply(root) {
        root = root || document;
        document.documentElement.setAttribute('lang', state.lang);

        var textNodes = root.querySelectorAll('[data-i18n]');
        for (var i = 0; i < textNodes.length; i++) {
            var el = textNodes[i];
            var key = el.getAttribute('data-i18n');
            var v = getNested(state.dict, key);
            if (v !== undefined && v !== null) {
                if (el.tagName === 'TITLE') {
                    document.title = v;
                } else {
                    el.textContent = v;
                }
            }
        }

        var htmlNodes = root.querySelectorAll('[data-i18n-html]');
        for (var j = 0; j < htmlNodes.length; j++) {
            var el2 = htmlNodes[j];
            var key2 = el2.getAttribute('data-i18n-html');
            var v2 = getNested(state.dict, key2);
            if (v2 !== undefined && v2 !== null) {
                el2.innerHTML = v2;
            }
        }

        var attrNodes = root.querySelectorAll('[data-i18n-attr]');
        for (var k = 0; k < attrNodes.length; k++) {
            applyAttrSpec(attrNodes[k], attrNodes[k].getAttribute('data-i18n-attr'));
        }

        var switches = document.querySelectorAll('[data-lang-switch]');
        for (var s = 0; s < switches.length; s++) {
            var sw = switches[s];
            if (sw.getAttribute('data-lang-switch') === state.lang) {
                sw.classList.add('active');
            } else {
                sw.classList.remove('active');
            }
        }
    }

    function loadDict(lang) {
        var url = resolveDictBase() + lang + '.json';
        return fetch(url, { cache: 'no-cache' })
            .then(function (r) { if (!r.ok) throw new Error('No se pudo cargar ' + url); return r.json(); });
    }

    function setLanguage(lang) {
        if (SUPPORTED.indexOf(lang) === -1) return Promise.resolve(false);
        return loadDict(lang).then(function (dict) {
            state.dict = dict;
            state.lang = lang;
            state.ready = true;
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
            apply(document);
            document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: lang } }));
            for (var i = 0; i < state.listeners.length; i++) {
                try { state.listeners[i](lang); } catch (e) {}
            }
            return true;
        }).catch(function (err) {
            console.warn('[i18n] Error cargando idioma', lang, err);
            return false;
        });
    }

    function onChange(fn) {
        if (typeof fn === 'function') state.listeners.push(fn);
    }

    function bindSwitches() {
        var switches = document.querySelectorAll('[data-lang-switch]');
        for (var i = 0; i < switches.length; i++) {
            switches[i].addEventListener('click', function (e) {
                e.preventDefault();
                var lang = this.getAttribute('data-lang-switch');
                setLanguage(lang);
            });
        }
    }

    window.i18n = {
        t: t,
        setLanguage: setLanguage,
        getLang: function () { return state.lang; },
        isReady: function () { return state.ready; },
        onChange: onChange,
        apply: apply
    };

    function init() {
        bindSwitches();
        setLanguage(state.lang);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
