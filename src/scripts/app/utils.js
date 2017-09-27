define('app/utils', [
    'jquery',
    'modernizr'
], function(
    $,
    Modernizr
) {
    'use strict';

    $.createCache = function(requestFunction) {
        var cache = {};
        return function(key, callback) {
            if (!cache[key]) {
                cache[key] = $.Deferred(function(defer) {
                    requestFunction(defer, key);
                }).promise();
            }
            return cache[key].done(callback);
        };
    };

    $.loadImage = $.createCache(function(defer, url) {
        var image = new Image();

        var cleanUp = function cleanUp() {
            image.onload = image.onerror = null;
        };

        defer.then(cleanUp, cleanUp);

        if (!url) {
            defer.reject();
            return;
        }

        image.onload = function() {
            defer.resolve(url, {
                width  : image.width,
                height : image.height
            });
        };

        image.onerror = defer.reject;
        image.src     = url;
    });

    $.formatCurrency = function(val) {
        var str = val + '';
        return str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1 ');
    };

    $.fn.animatecss = function(name, callback) {
        var $el = this;

        var classes = [
            'animated',
            name
        ];

        classes = classes.join(' ');

        $el.addClass(classes).data('animation', classes);

        var events = [
            'webkitAnimationEnd',
            'mozAnimationEnd',
            'MSAnimationEnd',
            'oanimationend',
            'animationend'
        ].join(' ');

        $el.one(events, function() {
            $el.animatecssStop();
            if ('function' === typeof callback) {
                callback.apply(this);
            }
        });

        return this;
    };

    $.fn.animatecssStop = function() {
        this.removeClass(this.data('animation'));
        this.data('animation', null);

        return this;
    };

    $.fn.toggleAnimated = function(isOn, animIn, animOut) {
        var $el      = this;
        var isHidden = !$el.is(':visible');
        animIn        = animIn  || 'zoomIn';
        animOut       = animOut || 'zoomOut';

        if ((isOn && !isHidden) || (!isOn && isHidden)) {
            return;
        }

        if (!Modernizr.cssanimations) {
            $el[isOn ? 'fadeIn' : 'fadeOut'](200);
            return $el;
        }

        $el.animatecss(isOn ? animIn : animOut, function() {
            if (isOn) {
                return;
            }

            $el.hide();
        });

        if (isOn) {
            $el.show();
        }

        return $el;
    };

    /* jshint ignore:start */
    // http://benalman.com/projects/jquery-throttle-debounce-plugin/
    $.throttle = function(delay, no_trailing, callback, debounce_mode) {
        var timeout_id;
        var last_exec = 0;

        if (typeof no_trailing !== 'boolean') {
            debounce_mode = callback;
            callback = no_trailing;
            no_trailing = undefined;
        }

        function wrapper() {
            var that = this;
            var elapsed = +new Date() - last_exec;
            var args = arguments;

            function exec() {
                last_exec = +new Date();
                callback.apply(that, args);
            }

            function clear() {
                timeout_id = undefined;
            }

            if (debounce_mode && !timeout_id) {
                exec();
            }

            timeout_id && clearTimeout(timeout_id);

            if (debounce_mode === undefined && elapsed > delay) {
                exec();
            } else if (no_trailing !== true) {
                timeout_id = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
            }
        }

        if ($.guid) {
            wrapper.guid = callback.guid = callback.guid || $.guid++;
        }

        return wrapper;
    };

    // http://benalman.com/projects/jquery-throttle-debounce-plugin/
    $.debounce = function(delay, at_begin, callback) {
        return callback === undefined ?
            $.throttle(delay, at_begin, false) :
            $.throttle(delay, callback, at_begin !== false);
    };

    // фикс бага с webshim
    // https://github.com/aFarkas/webshim/issues/560
    jQuery.swap = function(elem, options, callback, args) {
        var ret, name, old = {};
        // Remember the old values, and insert the new ones
        for (name in options) {
            old[ name ] = elem.style[ name ];
            elem.style[ name ] = options[ name ];
        }

        ret = callback.apply(elem, args || []);

        // Revert the old values
        for (name in options) {
            elem.style[ name ] = old[ name ];
        }
        return ret;
    };
    /* jshint ignore:end */

    return {};
});
