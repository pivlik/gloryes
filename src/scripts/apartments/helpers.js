define('apartments/helpers', [
    'handlebars',
    './config'
], function(
    Handlebars,
    config
) {
    'use strict';

    Handlebars.registerHelper('createPathBack', function(obj) {
        return config.homePath + obj;
    });

    return Handlebars;
});
