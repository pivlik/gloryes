/* jshint ignore:start */
//jscs:disable
define('apartments/app',
    [
        'jquery',
        './config',
        './templates',
        '../app/utils',
        './helpers',
        './eve',
        'sammy',
        'raphael',
        'scaleraphael',
        'modernizr',
        'videojs',
        'cookie'
    ],
    function(
        $,
         config,
         templates,
         utils,
         Handlebars,
         eve,
         Sammy,
         Raphael,
         ScaleRaphael,
         Modernizr,
         videojs,
         Cookies
    ) {
        const $body = $('body');

        /**
         * Визуальный выборщик
         * @param {Object} $wrapper - обертка всего выборщика
         * @constructor
         */
        const Visual = function($wrapper) {
            // Loader/spiner
            this.$ajaxLoader = $wrapper.find('.b-ajax-loader');
        };

        /**
         * Показать ajax loader
         */
        Visual.prototype.showAjaxLoader = function() {
            this.$ajaxLoader.show();
        };

        /**
         * Скрыть ajax loader
         */
        Visual.prototype.hideAjaxLoader = function() {
            this.$ajaxLoader.hide();
        };

        /**
         * Возвращает прозрачность маски по объекту
         * @param  {Object} obj данные от сервера (elements)
         * @return {Number} - степень прозрачности маски
         */
        Visual.prototype.getOpacity = function(obj) {
            obj = obj || {};

            if ('flat' === $form.data('view')) {
                if (obj.status) {
                    return 1;
                }

                return 0.5;
            }

            if ((isFilterShown() && isFilter) ||
                ('floor' === $form.data('view'))
            ) {
                return 0.3;
            }

            return 0.5;
        };

        var visual = new Visual($body);


        // что-то старое, что надо переписать
        var requireConf = require.s.contexts._.config;

        // @fixme via some lib
        $.browser        = {};
        $.browser.mobile = false;

        var styles = $.extend({}, config.visualStyles);

        var $win        = $(window);
        var $wrap       = $('#substrate');
        var $app        = $wrap.parent();
        var $filter     = $('.al-l-mini-filter');
        var $backLink   = $('#back-link');
        var $rotate     = $('#rotate');
        var $searchBtn  = $('#select-options');
        var $floors     = $('#floors-list');
        var $floorsList = $('#floor-number-list');
        var $floorNum   = $('#floor-number');

        // находимся в процессе поворота
        var isRotating = false;

        // кешируем главный блок приложения
        var $el = $(config.boxApp);
        /*
         флаг для идентификации перехода по прямой ссылке на квартиру
         (случай, когда переход на страницу осуществляется сразу на страницу
         квартиры, например по сохраненной ссылке)
         */
        var directLink = true;

        // флаг показа видео-анимации перехода между видами
        var showVideoAnim = config.showVideoAnim || false;

        if (navigator.platform === 'iPhone') {
            showVideoAnim = false;
        }

        // для кеширования объектов jquery
        var cacheElements = {};

        // опции конфига на текущей вьюхе
        var currentOptions = null;

        // данные, полученные от сервера для текущего шага
        var currentData = null;

        // набор объектов-масок рафаэль
        var elementsSet = null;


        // список этажей на вьюхе поэтажного плана
        var floorsList = $();

        var isFilter = 0;

        var filterExclude = [
            // 'homepage'
        ];

        var isFirst     = 1;
        var isLoadAnim  = 0;
        var isFadeIn    = 1;
        var isBackClick = false;


        // флаг игнорирования видео, играем его только на кликах
        var isVideoIgnored;

        // флаг показа видео-анимации перехода между видами
        if (navigator.platform === 'iPhone') {
            showVideoAnim = false;
        }

        // загрузка шаблона видеоанимации

        videojs.options.flash.swf = requireConf.baseUrl +
            requireConf.paths.videojs +
            '/video-js.swf';

        var vPlayer = videojs('video', {
            autoplay: false,
            preload : 'auto',
            width   : '100%',
            height  : '100%'
        });

        vPlayer.ready(function() {
            this.on('ended', function() {
                $('#video').fadeOut(180);
            });
        });

        // канвас
        var paper        = null;
        var paperInPopup = null;

        // контекст рендера
        var renderContext = null;

        // стэк настроек для видов
        var viewSide = window.location.hash.replace('#', '') || Cookies('view_side') || 'def';

        // размеры подложки
        var sizeCanvas  = {
            width : 0,
            height: 0
        };
        var ratio       = 0.5625;
        var resizePaper = function() {
        };
        var floorBtns   = $();

        var isSmooth = true;
        var xhr;

        config.startPath = window.startPath || config.startPath;

        //Меню
        (function($nav) {
            if (!$nav.length) {
                return;
            }

            var active = 'is-active';
            var $menu  = $('.al-l-nav');

            $nav.click(function() {
                $menu.toggleClass(active);
            });
        })($('.j-al-nav'));

        // ресайз канваса при фулскрине
        if (config.fullScreen) {
            resizePaper = function() {
                if (!paper) {
                    return;
                }

                var w = $body.width();
                var h = $body.height();
                var d = h / w;

                if (d > ratio) {
                    $wrap.css({
                        'width' : h / ratio,
                        'height': h,
                        'top'   : 0,
                        'left'  : 0.5 * (w - h / ratio)
                    });
                } else {
                    $wrap.css({
                        'width' : w,
                        'height': w * ratio,
                        'top'   : 0.5 * (h - w * ratio),
                        'left'  : 0
                    });
                }

                var c_w = $wrap.width();
                var c_h = $wrap.height();

                paper.changeSize(c_w, c_h, true, true);
            };

            $win.on('resize', resizePaper);
        }

        var $tooltip;

        // Кнопка назад
        $backLink.on('click', function() {
            abortXhr();
            visual.showAjaxLoader();

            isVideoIgnored = true;
            isFadeIn       = 1;
            isBackClick    = true;
        });

        // обработчик подсветки и выбора маски при взаимодествии с ее указателем
        $el.on(
            'mouseenter mouseleave click',
            '.al-b-pointer',
            function(e) {
                var $target = $(this);
                var href    = $target.data('href');

                switch (e.type) {
                    case 'mouseleave':
                    case 'mouseenter':
                        var id = parseInt($target.data('id'), 10) || 0;
                        if (id < 0) {
                            return;
                        }

                        var method = (e.type === 'mouseenter') ?
                            mouseEnterMask :
                            mouseLeaveMask;

                        elementsSet.forEach(function($mask) {
                            if ($mask.data('id') !== id) {
                                return;
                            }

                            method($mask);
                        });
                        break;
                    case 'click':
                        if (!href || !$target.data('status')) {
                            break;
                        }
                        isFadeIn = 1;
                        rApp.setLocation(config.homePath + href);
                        break;
                }
            }
        );


        // метод анимации наведения курсора на маску
        var mouseEnterMask = function(mask) {
            if (mask.data('on_filter') && !currentOptions.displayConstantly) {
                eve('buildings.highlightFilter_enter', mask);
            } else if (!currentOptions.displayConstantly) {
                eve('raphael.event.mouseenter', mask);
            }
        };

        // метод анимации затухания маски при удалении курсора
        var mouseLeaveMask = function(mask, isFilter) {
            if (mask.data('on_filter') && !currentOptions.displayConstantly) {
                eve('buildings.highlightFilter_leave', mask);
            } else if (!currentOptions.displayConstantly) {
                eve('raphael.event.mouseleave', mask);
            }
        };

        var getColors = function getColors(obj) {
            obj = obj || {};

            var colorStart = obj.colorStart ||
                config.visualStyles.colorStart;

            var colorEnd = obj.colorEnd ||
                config.visualStyles.colorEnd;

            if ('flat' === $form.data('view')) {
                if (!obj.status) {
                    return getFlatColors(obj);
                }

                if (obj.color) {
                    colorStart = colorEnd = obj.color;
                }
            }

            return [colorStart, colorEnd];
        };

        var getFlatColors = function getFlatColors(obj) {
            var rooms = obj.rooms;
            var colorStart;
            var colorEnd;

            switch (rooms) {
                case 0:
                    colorStart = '#95bfe7';
                    colorEnd   = '#95bfe7';
                    break;
                case 1:
                    colorStart = '#90c168';
                    colorEnd   = '#90c168';
                    break;
                case 2:
                    colorStart = '#e2bf00';
                    colorEnd   = '#e2bf00';
                    break;
                case 3:
                    colorStart = '#d577b8';
                    colorEnd   = '#b33e8e';
                    break;
                default:
                    colorStart = config.visualStyles.colorStart;
                    colorEnd   = config.visualStyles.colorEnd;
                    break;
            }

            return [colorStart, colorEnd];
        };

        var getFillOpacity = function getFillOpacity(obj) {
            obj = obj || {};

            var opacity = obj.fillOpacity || config.visualStyles.fillOpacity;

            return opacity;
        };

        // Тоже кнопка назад
        var buildBackNav = function(link, text) {
            var $parent = $backLink.parent();

            if ('undefined' === typeof link) {
                return $parent.toggleAnimated(false, false, 'fadeOutUp');
            }

            text = text || 'Назад';

            if (viewSide === 'alt') {
                link += '#alt';
            }
            $backLink
                .text(text)
                .attr('href', config.homePath + link);

            $parent.toggleAnimated(true, 'fadeInDown');
        };

        var buildFloors = function(floors, currentFloor) {

            $floorNum.text('этаж ' + currentFloor);
            if (floors) {
                var html = templates.floors({
                    floors  : floors,
                    current : currentFloor,
                    homePath: config.homePath
                });

                $floorsList.html(html);
            }

            var method = floors ? 'show' : 'hide';
            $floors[method]();
        };

        var getPointers = function getPointers(data) {
            if ('object' !== typeof(data)) {
                return [];
            }

            if ('object' !== typeof(data)) {
                return [];
            }

            return $.map(data, function(element) {
                var pointer = element.pointer;

                if (('object' !== typeof pointer) ||
                    ('string' !== typeof pointer.position) || !element.id

                ) {
                    return null;
                }

                var coords = pointer.position.split(',');

                return {
                    id     : parseInt(element.id, 10) || 0,
                    left   : coords[0] || 0,
                    top    : coords[1] || 0,
                    status : element.status,
                    link   : element.link,
                    header : pointer.header,
                    content: pointer.content
                }
            });
        };

        var getPointerByPath = function getPointerByPath(path) {
            return $('.al-b-pointer[data-id="' + path.data('id') + '"]');
        };

        var highlightPointer = function highlightPointer($pointer, isOn) {
            $pointer[isOn ? 'addClass' : 'removeClass']('al-b-pointer_is_hovered');
        };

        var highlightPointerByPath = function highlightPointerByPath(path, isOn) {
            highlightPointer(getPointerByPath(path), isOn);
        };


        var buildTooltip = function buildTooltip(path) {
            var data = path.data('tooltip');

            if ($tooltip) {
                $tooltip.remove();
            }

            if (!data || data.header === '') {
                return;
            }

            if ($form.data('view') == 'flat') {
                $tooltip = $(templates.tooltipFlat(data));
            } else {
                $tooltip = $(templates.tooltip(data));
            }

            $tooltip.insertAfter($wrap);
        };

        // @todo not full screen
        var repositionTooltip = function repositionTooltip(e) {
            if (!$tooltip) {
                return;
            }

            var x = e.pageX;
            var y = e.pageY -
                $tooltip.outerHeight() -
                15;

            $tooltip.css({
                left: x,
                top : y
            }).toggleAnimated(true, 'zoomIn');
        };

        var hideTooltip = function hideTooltip() {
            if (!$tooltip) {
                return;
            }

            $tooltip.hide();
        };

        var playVideo = function playVideo(sources, callback) {
            vPlayer.one('loadedmetadata', function() {
                var speed = config.speedAnimBetweenView;
                visual.hideAjaxLoader();
                vPlayer.play();

                $('#video').fadeIn(speed, callback);
            }).one('error', callback);
            vPlayer.src(sources);
        };

        var getVideoSources = function getVideoSources(list) {
            var ret = [];

            $.each(list, function(type, src) {
                if (!src) {
                    return;
                }

                ret.push({
                    type: 'video/' + type,
                    src : src
                });
            });

            return ret;
        };

        /*
         метод обработки для корпусов, секций...
         */
        var buildView = function(options, callback) {
            var skip = config.startPath !== '';

            var tpl     = templates.content;
            var tplData = {
                viewName  : currentData.viewName || '',
                rotateView: currentData.videoChangePosition &&
                currentOptions.rotateView,
                pointers  : getPointers(currentData.elements[viewSide]),
                backText  : currentData.backText,
                objPath   : currentData.backLink,
                floors    : currentData.floors || [],
                isSmooth  : isSmooth
            };


            // if ('undefined' !== typeof currentData.pano) {
            //     tplData.pano = getPano(currentData.pano[viewSide]);
            // }

            var content = tpl(tplData);

            var afterSwap = function afterSwap(html) {
                isBackClick = false;
                // создаем холст
                paper       = ScaleRaphael('svg_bottom', sizeCanvas.width, sizeCanvas.height);

                // внедряем в холст изображение плана
                paper.image(currentData.canvasImg[viewSide], 0, 0, sizeCanvas.width, sizeCanvas.height);

                // наносим маски
                paper.setStart();

                var type = currentData.elements[viewSide].length === 0 ?
                    'def' :
                    viewSide;

                var elements = currentData.elements[type];

                var loadAnim = function loadAnim(el, callback) {
                    el.animate({
                        fill   : '#fff',
                        opacity: 1,
                        easing : 'easeInOut'
                    }, 500, function() {
                        el.animate({
                            opacity: el.data('opacity'),
                            easing : 'easeOut'
                        }, 300);
                    });
                };

                if ($form.data('view') === 'flat') {
                    $('.j-logo').removeClass('b-logo_color_white');
                    $('#back-link').addClass('b-back-link_color_dark');
                } else {
                    $('.j-logo').addClass('b-logo_color_white');
                    $('#back-link').removeClass('b-back-link_color_dark');
                }

                for (var i = 0, l = elements.length; i < l; i++) {
                    var obj         = elements[i];
                    var opacity     = visual.getOpacity(obj);
                    var colors      = getColors(obj);
                    var fillOpacity = getFillOpacity(obj);
                    var colorStart  = colors[0];
                    var colorEnd    = colors[1];
                    var link        = obj.link ?
                    config.startPath + obj.link :
                        null;


                    var drawPath = function drawPath() {
                        var bPath = paper.path(obj.coords);

                        bPath
                            .attr({
                                stroke        : 'none',
                                fill          : colorStart,
                                'fill-opacity': fillOpacity,
                                opacity       : opacity,
                                cursor        : 'pointer'
                            })
                            .data('id', parseInt(obj.id, 10) || i)
                            .data('href', link)
                            .data('tooltip', obj.tooltip)
                            .data('color-end', colorEnd)
                            .data('color-start', colorStart)
                            .data('available', obj.available)
                            .data('opacity', opacity)
                            .data('toPage', obj.toPage || '');

                        var onEnter = function(e) {
                            mouseEnterMask(this);
                            highlightPointerByPath(this, true);
                            buildTooltip(this);
                            repositionTooltip(e);
                        };

                        var onLeave = function() {
                            mouseLeaveMask(this, isFilter);
                            highlightPointerByPath(this, false);
                            hideTooltip();
                        };

                        if (!$.browser.mobile) {
                            bPath.mouseover(onEnter);
                            bPath.mouseout(onLeave);
                        }

                        bPath.click(function() {
                            var self = this;

                            if (!self.data('href')) {
                                return false;
                            }

                            this.unmouseover(onEnter);
                            this.unmouseout(onLeave);
                            this.unmousemove(repositionTooltip);

                            hideTooltip();

                            isFadeIn = 1;

                            if ($.browser.mobile) {
                                mouseEnterMask(this);

                                setTimeout(function() {
                                    mouseLeaveMask(self);
                                }, 400);
                            } else {
                                mouseLeaveMask(this);
                            }

                            if (this.data('toPage') || options.toPage) {
                                if (!window.location.origin) {
                                    window.location.origin = window.location.protocol + "//" +
                                        window.location.hostname +
                                        (window.location.port ? ':' + window.location.port : '');
                                }
                                document.location = (this.data('toPage') ?
                                    this.data('toPage') :
                                window.location.origin + this.data('href'));
                            } else {
                                var link = config.homePath + this.data('href');
                                if (viewSide === 'alt') link += '#alt';

                                if (document.location.pathname === link) {
                                    rApp.runRoute('get', link);
                                } else {
                                    rApp.setLocation(link);
                                }
                            }
                        });

                        // если маска заблокирована для выбора
                        if (!obj.link) {
                            bPath.attr({cursor: 'default'}).unclick();
                        }

                        bPath.mousemove(repositionTooltip);

                        if (isLoadAnim && isFirst) {
                            setTimeout(function() {
                                loadAnim(bPath, function(bPath) {
                                });
                            }, 1000);
                        }
                    };

                    if (parseInt(obj.count) !== 0) {
                        drawPath();
                    }
                }

                isFirst = 0;

                elementsSet = paper.setFinish();
                floorBtns   = $('.js-floor-switch');

                hideTooltip();
                resizePaper();

                // bindPano();

                // вызываем функцию-callback если таковая передана
                if (callback) {
                    callback.apply();
                }
            };

            if ('partial' === options.renderType) {
                return renderContext.swap(content, afterSwap);
            }

            return afterSwap(content);
        };

        var $form       = $filter.find('form');
        var $checkboxes = $form.find('input[type="checkbox"]');

        var getDataUrl = function getDataUrl() {
            var ret = config.dataLocation;

            var formData = $form.serialize();
            if (formData) {
                ret += (ret.indexOf('?') > -1) ?
                    '&' :
                    '?';
                ret += formData;
            }

            return ret;
        };

        var abortXhr = function abortXhr() {
            if (!xhr) {
                return;
            }

            xhr.abort();
        };

        $checkboxes.on('change', function() {
            var url  = getDataUrl();
            isFilter = isFilterShown() && $form.serialize().length;
            isSmooth = false;
            visual.showAjaxLoader();
            abortXhr();

            xhr = $.getJSON(url, $form.data());
            xhr.done(function(data) {
                var configType = $form.data('view');
                var options    = {};

                if ('flat' === configType) {
                    options.toPage = true;
                }

                rApp.setEnvironment(data, config[configType], options);
            });
        });

        var isFilterShown = function isFilterShown() {
            return ($.inArray($form.data('division'), filterExclude) === -1);
        };

        var isRotatable = function isRotatable() {
            return ($form.data('view') !== 'flat' );
        };


        var getClone = function getClone($cont) {
            var $clone = $cont.clone()
                .removeAttr('id')
                .addClass('al-l-content_is_active');

            $clone.find('.animated')
                .removeClass('animated');
            return $clone;
        };

        var checkIsRotating = function checkIsRotating() {
            if (!isRotating) {
                return false;
            }
            isRotating = false;
            visual.hideAjaxLoader();
            return true;
        };

        var setRotateLocation = function setRotateLocation() {
            isRotating   = true;
            var location = rApp.getLocation();
            location     = viewSide === 'alt' ?
            location + '#alt' :
                location.replace('#alt', '');
            rApp.setLocation(location);
        };

        /*
         приложение Sammyjs
         */
        var rApp = Sammy(function() {
            var context = this;

            var failHandler = function() {
                visual.hideAjaxLoader();
                isSmooth = 0;
                context.swap(templates.error({
                    message: 'Ой, что-то пошло не так'
                }));
            };

            /*
             поворот вида
             */
            $rotate.find('a').on('click', function() {
                abortXhr();

                isSmooth = false;

                visual.showAjaxLoader();
                isFadeIn = 1;
                viewSide = ('alt' === viewSide) ?
                    'def' :
                    'alt';
                Cookies('view_side', viewSide, {
                    path: '/'
                });

                var hasVideo = currentData.videoChangePosition &&
                    currentData.videoChangePosition[viewSide].mp4 &&
                    showVideoAnim;

                $.loadImage(currentData.canvasImg[viewSide])
                    .done(function(imgSrc, sizeImg) {
                        if (hasVideo) {
                            return playVideo(
                                getVideoSources(currentData.videoChangePosition[viewSide]),
                                function() {
                                    paper.remove();

                                    sizeCanvas.width  = sizeImg.width;
                                    sizeCanvas.height = sizeImg.height;

                                    buildView({
                                        renderType: 'partial'
                                    });
                                }
                            );
                        }

                        visual.hideAjaxLoader();

                        sizeCanvas.width  = sizeImg.width;
                        sizeCanvas.height = sizeImg.height;

                        var $cont  = rApp.$element();
                        var $clone = getClone($cont);

                        $cont.after($clone);

                        buildView({
                            renderType: 'partial'
                        }, function() {
                            if (!Modernizr.cssanimations) {
                                $clone.fadeOut(config.speedAnimBetweenView, function() {
                                    $clone.remove();
                                });

                                return;
                            }

                            $clone.animatecss('fadeOut', function() {
                                $clone.remove();
                            });
                        });
                        setRotateLocation();
                    })
                    .fail(failHandler);
            }).on('mouseenter', function() {
                $(this).animatecss('rotate');
            });

            // главный блок в которое рендерится приложение
            context.element_selector = config.boxApp;

            // переопределяем дефолтную функцию Summy для случая ненайденного пути
            context.notFound = function(verb, path) {
                context.setLocation(config.homePath + config.startPath);
            };

            context.swap = function(content, callback) {
                $filter.toggleAnimated(isFilterShown(), 'fadeInUp', 'fadeOutDown');
                buildBackNav(currentData.backLink, currentData.backText);
                buildFloors(currentData.floors, currentData.viewName);
                $rotate.toggleAnimated(isRotatable(), 'fadeInLeft', 'fadeOutLeft');

                if (isFirst) {
                    $searchBtn.toggleAnimated(true, 'fadeInRight');
                }

                var plainSwap = function plainSwap() {
                    context.$element().html(content);
                    if (callback) {
                        callback.apply();
                    }
                };

                var hasVideo = currentData.videoFly &&
                    currentData.videoFly[viewSide].mp4 && !isVideoIgnored &&
                    showVideoAnim;

                isVideoIgnored = true;

                if (hasVideo) {
                    return playVideo(
                        getVideoSources(currentData.videoFly[viewSide]),
                        plainSwap
                    );
                }

                if (isSmooth) {
                    return context.smoothTransition(content, callback);
                }

                plainSwap();
            };

            // метод приведения текущих параметров даты и настроек
            context.setEnvironment = function(data, envConfig, options, callback) {
                options     = options || {};
                currentData = null;
                currentData = data;

                if (!currentData.status) {
                    failHandler();
                    return;
                }

                if (currentData.toStep) {
                    var link = config.homePath + currentData.toStep;
                    rApp.setLocation(link);
                    return;
                }

                if (viewSide === 'alt' && window.location.hash !== '#alt') {
                    setRotateLocation();
                }

                currentOptions     = envConfig || {};
                options.renderType = 'partial';
                /*
                 подгружаем изображение подложки, и когда оно загрузится
                 рендерим шаблон
                 */
                visual.showAjaxLoader();

                $.loadImage(currentData.canvasImg[viewSide])
                    .done(function(imgSrc, sizeImg) {
                        visual.hideAjaxLoader();

                        sizeCanvas.width  = sizeImg.width;
                        sizeCanvas.height = sizeImg.height;

                        buildView(options, callback);
                    })
                    .fail(failHandler);
            };


            // метод "мягкого" перехода между вьюхами
            context.smoothTransition = function(content, callback) {
                var $cont  = rApp.$element();
                var $clone = getClone($cont);

                if (!Modernizr.cssanimations) {
                    $cont.html(content).after($clone);

                    if ('function' === typeof callback) {
                        callback.apply(this, [content]);
                    }

                    $clone.fadeOut(config.speedAnimBetweenView, function() {
                        $clone.remove();
                    });
                    return;
                }

                var animation = isBackClick ? 'zoomOut' : 'zoomInFadeOut';

                $clone.animatecss(animation, function() {
                    $clone.remove();
                });

                $cont
                    .html(content)
                    // .animatecss('fadeIn')
                    .after($clone);

                if ('function' === typeof callback) {
                    callback.apply(this, [content]);
                }
            };


            let steps = config.buildings.steps;

            for (let index in steps) {
                if (steps.hasOwnProperty(index)) {
                    context.get(`${config.homePath}${steps[index].urlTemplate}(#alt)?`, function() {
                        if (checkIsRotating()) {
                            return;
                        }

                        var url      = getDataUrl();
                        let division = steps[index].division;
                        let view     = steps[index].view;
                        var objectId = config.objectId;

                        renderContext = this;
                        isSmooth      = true;

                        $form
                            .data('division', division)
                            .data('num', renderContext.params[division] || '')
                            .data('view', view)
                            .data('objectId', objectId || '');

                        visual.showAjaxLoader();

                        abortXhr();

                        xhr = $.getJSON(
                            url,
                            {
                                division: division,
                                num     : renderContext.params[division] || '',
                                objectId: objectId || ''
                            },
                            function(data, textStatus, jqXHR) {
                                switch (division) {
                                    case 'homepage':
                                        isLoadAnim = isFirst;
                                        context.setEnvironment(data, config.building, {});
                                        break;
                                    case 'building':
                                        // config.visualStyles.colorStart = (isFilter) ? '#4aa228' : '#fff';
                                        config.opacity                   = (isFilter) ? .5 : 0;
                                        config.visualStyles.startOpacity = .7;
                                        context.setEnvironment(data, config.section);
                                        break;
                                    case 'section':
                                        context.setEnvironment(data, config.floor);
                                        directLink = false;
                                        break;
                                    case 'floor':
                                        if (!data.status) {
                                            failHandler();
                                            return;
                                        }

                                        context.setEnvironment(data, config.flat, {
                                            toPage: true
                                        });
                                        break;
                                    default:
                                        isLoadAnim = isFirst;
                                        context.setEnvironment(data, config[view], {});
                                }
                            }
                        );
                    });
                }
            }

            context.setLocation = function(newLocation, params) {
                visual.showAjaxLoader();

                isVideoIgnored = ('undefined' === typeof isVideoIgnored);

                return this._location_proxy.setLocation(newLocation);
            };
        });

        return rApp;
    });

//jscs:enablex
/* jshint ignore:end */
