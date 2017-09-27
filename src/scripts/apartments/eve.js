/*
обработчики событий на масках модуля
 */
define('apartments/eve', [
    'eve',
    './config'
], function(
    eve,
    config
) {
    'use strict';

    eve.on('raphael.event.mouseenter', function() {
        this.attr({
            fill   : this.data('color-end'),
            opacity: this.data('opacity') || 0.3
        });

        this.stop().animate({
            fill   : this.data('color-end'),
            opacity: 1,
            easing : 'easeIn'
        }, config.visualStyles.speedAnimIn);
    });

    eve.on('raphael.event.mouseleave', function() {
        this.stop().animate({
            fill   : this.data('color-start'),
            opacity: this.data('opacity'),
            easing : 'easeOut'
        }, config.visualStyles.speedAnimOut);
    });

    eve.on('buildings.highlight', function(color, opct) {
        this.stop().animate({
            fill   : color,
            opacity: opct
        }, config.visualStyles.speedAnimInHighlight);
    });

    eve.on('buildings.highlightFilter_enter', function() {
        this.stop().animate({
            fill   : config.visualStyles.colorEnd,
            opacity: 1
        }, config.visualStyles.speedAnimInHighlight);
    });

    eve.on('buildings.highlightFilter_leave', function() {
        this.stop().animate({
            fill   : config.visualStyles.colorHighlight,
            opacity: 1
        }, config.visualStyles.speedAnimInHighlight);
    });

    return eve;
});
