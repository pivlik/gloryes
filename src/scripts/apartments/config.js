define('apartments/config', [], function() {
    'use strict';

    var config = {
        /*
         задаем блок в который будет рендерится приложение
         */
        boxApp              : '#content',
        /*
         путь для обращения за данными json
         */
        dataLocation        : window.dataLocation || window.location.href,
        /*
         корневой хеш-путь приложения
         */
        homePath            : window.homePath || window.location.href,
        /*
         стартовый путь, используется в случае отказа от некоторых шагов
         сценария,
         например обойтись без выбора корпуса
         для этого установить в 'building/0'
         */
        startPath           : window.startPath || '',
        /*
         показывать видео-анимацию перехода между видами выборщика
         */
        showVideoAnim       : false,
        /*
         скорость анимации затухания между видами выборщика
         */
        speedAnimBetweenView: 300,
        /*
         выборщик в фуллскрин
         */
        fullScreen          : true,
        /*
         визуальные настройки масок
         */
        visualStyles        : {
            colorFilter         : '#000000',
            colorStart          : '#e2bf00',
            colorEnd            : '#e2bf00',
            colorHighlight      : '#6ac42f',
            colorDisabled       : '#F3E7BC',
            fillOpacity         : 0.6,
            speedAnimIn         : 200,
            speedAnimOut        : 150,
            speedAnimInHighlight: 100
        },
        /*
         ID объекта ЖК
         */
        objectId : window.customConfig.objectId || '',
        /*
         шаги в ЖК
         */
        buildings: window.customConfig.buildings || {
            steps: [
                {
                    division   : 'homepage',
                    view       : 'building',
                    urlTemplate: ''
                },
                {
                    division   : 'building',
                    view       : 'section',
                    urlTemplate: 'building/:building/'
                },
                {
                    division   : 'section',
                    view       : 'floor',
                    urlTemplate: 'building/:building/section/:section/'
                },
                {
                    division   : 'floor',
                    view       : 'flat',
                    urlTemplate: 'building/:building/floor/:floor/'
                }
            ]
        }
    };

    return config;
});
