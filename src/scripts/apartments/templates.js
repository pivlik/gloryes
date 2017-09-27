define('apartments/templates', [
    './tpl/content',
    './tpl/tooltip',
    './tpl/tooltipFlat',
    './tpl/error',
    './tpl/floors'
], function(
    content,
    tooltip,
    tooltipFlat,
    error,
    floors
) {
    'use strict';

    var templates = {
        content    : content,
        tooltip    : tooltip,
        tooltipFlat: tooltipFlat,
        error      : error,
        floors     : floors
    };

    return templates;
});
