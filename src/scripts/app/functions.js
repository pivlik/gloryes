define('app/functions', ['jquery', 'modernizr'], function($, Modernizr) {
    'use strict';

    $.fn.swapContent = function(html, callback) {
        var $el = this;

        if (!Modernizr.cssanimations) {
            return $el.hide().html(html).fadeIn(200, callback);
        }

        $el.animatecss('zoomOut', function() {
            $el.html(html)
                .animatecss('fadeInDown', callback);
        });
    };

    $.fn.target = function() {
        var href  = this.data('target') || this.attr('href') || '';
        var id    = href.substr(1);
        var el    = document.getElementById(id); // jQuery может дать ошибку

        return $(el);
    };

    $.fn.scrollTo = function() {
        var $el   = this;

        if (!$el.length) {
            return $el;
        }

        var speed     = 2.5; // px / ms
        var offsetTop = $el.offset().top;
        var scrollTop = $(window).scrollTop();
        var distance  = Math.abs(offsetTop - scrollTop);
        var time      = Math.round(distance / speed);

        $('html, body').animate({
            scrollTop: offsetTop
        }, time);

        return $el;
    };

    $.getQueryString = function(url) {
        return url.split('?')[1] || '';
    };

    $.replaceUrl = function(url) {
        if (!window.history || !window.history.replaceState) {
            return false;
        }

        window.history.replaceState({}, document.title, url);
        return true;
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
            if (typeof callback  === 'function') {
                callback.apply(this);
            }
        });
    };

    $.fn.animatecssStop = function() {
        this.removeClass(this.data('animation'));
        this.data('animation', null);
    };

    return $.fn;
});
