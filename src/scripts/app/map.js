define([
    'jquery',
    'infobox',
    'app/google-map',
    'app/tpl/map/tooltip',
    'markerClusterer',
    'app/functions'
], function($, InfoBox, google, tpl, MarkerClusterer) {
    /***
     * Данные карты
     * @param {Object} $map - jQuery объект - карта
     * @constructor
     */
    class Map {
        constructor($map) {
            this.isMobile = $(window).width() < 768;

            if ($map.data('noinit') !== undefined && this.isMobile) {
                return;
            }

            let attributData  = $map.data();
            let scriptData    = window.map[$map[0].id];
            let data          = $.extend(scriptData, attributData);
            this.$map         = $map;
            this.data         = data || {};
            this.markers      = [];
            this.radiuses     = [];
            this.markerOpen   = -1;
            this.data.fit     = data.fit;
            this.data.minZoom = data.minzoom || 10;
            this.data.maxZoom = data.maxzoom || 18;

            if (data.center) {
                this.data.center = new google.maps.LatLng(
                    data.center[0],
                    data.center[1]
                );
            }

            this.options = {
                center: {
                    lat: 59.939552,
                    lng: 30.423428
                },
                zoom              : 12,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                streetViewControl: false,
                mapTypeControl   : false,
                styles           : false
            };

            this.options = $.extend(this.options, this.data);

            this.initCustomZoomControls($map);
            this.initMap();
            this.clickCustomZoomControls();
            this.initBounds();
            this.initMarkers();
            this.initRadiuses();
            this.imageBoundsInit();
            this.initInfoWindow();
            this.editor();
            this.initTabs();
            // this.initCluster();
        }

        /**
         * Инициализация карты
         */
        initMap() {
            this.map = new google.maps.Map(this.$map[0], this.options);
        }

        /**
         * Сбор данных маркеров
         */
        initMarkers() {
            let that = this;

            if (!this.data.markers) {
                return;
            }

            // Добавляем данные imageBounds в основной поток маркеров, если он есть
            //@todo нужно добавлять не один маркер с картинкой, а все, что перечислены
            if (this.data.imageBounds) {
                this.data.markers[this.data.markers.length] = {
                    coords: this.data.imageBounds.coords,
                    title : this.data.imageBounds.title,
                    text  : this.data.imageBounds.text,
                    image : this.data.imageBounds.icon
                };
            }

            $.each(this.data.markers, function(index, marker) {
                that.initMarker(index, marker);
            });
        }

        /**
         * Инициализация радиусов
         */
        initRadiuses() {
            let that = this;

            if (!this.data.radiuses) {
                return;
            }

            $.each(this.data.radiuses, function(index, radius) {
                new google.maps.Circle({
                    strokeColor  : radius.strokeColor,
                    strokeOpacity: radius.strokeOpacity,
                    strokeWeight : radius.strokeWeight,
                    fillColor    : radius.fillColor,
                    fillOpacity  : radius.fillOpacity,
                    map          : that.map,
                    center       : new google.maps.LatLng(
                        radius.center[0],
                        radius.center[1]
                    ),
                    radius: radius.radius
                })
            });
        }

        /**
         * Инициализация маркера на карте
         * @param {Number} index - номер маркера
         * @param {Object} data - данные маркера
         *
         */
        initMarker(index, data) {
            // если в массиве пришли строки, приводим их к integer
            function toInteger(array) {
                return array.map(function(item) {
                    return parseInt(item);
                });
            }

            let coords = new google.maps.LatLng(data.coords[0], data.coords[1]);
            let image = typeof data.image !== 'string' ?
                '/img/map/markers/marker.png' :
                data.image;
            // проверка на правильность данных из data.sizes = Array [Number, Number]
            let sizes = Array.isArray(data.sizes) && data.sizes.length === 2 ?
                toInteger(data.sizes) :
                [26, 26];

            let match = image.match(/^\.|\.svg$|\.gif$|.jpg$|\.png$/i);

            if (match[0] === '.svg') {
                image = {
                    url       : image,
                    scaledSize: new google.maps.Size(sizes[0], sizes[1])
                };
            }

            let options = {
                map      : this.map,
                position : coords,
                animation: google.maps.Animation.DROP,
                icon     : image,
                type     : data.type,
                optimized: false
            };

            let marker = new google.maps.Marker(options);
            this.markers.push(marker);
            marker.setMap(this.map);

            if (this.data.zoom === undefined || this.data.fit !== undefined) {
                this.bounds.extend(coords);
            }

            this.bindMarkerClick(index, marker, data);
        }

        /**
         * Клик по маркеру
         * @param {Number} index - номер маркера
         * @param {Object} marker - google marker
         * @param {Object} data - данные маркера
         */
        bindMarkerClick(index, marker, data) {
            let that = this;

            if (!data.title && !data.text && !data.url) {
                marker.setOptions({
                    clickable: false
                });
                return;
            }

            google.maps.event.addListener(marker, 'click', function() {
                if (data.url) {
                    that.markerLink(data.url);
                    return;
                }

                that.infoWindow.setContent(tpl(data));
                that.infoWindow.open(that.map, this);

                if (that.markerOpen !== -1) {
                    that.markerShow(that.markerOpen);
                }
                that.markerOpen = index;
                that.markerHide(index);
            });
        }

        /**
         * Скрыть маркер
         * @param {Number} index - порядковый номер маркера
         */
        markerHide(index) {
            this.markers[index].setVisible(false);
        }

        /**
         * Показать маркер
         * @param {Number} index - порядковый номер маркера
         */
        markerShow(index) {
            this.markers[index].setVisible(true);
        }

        markerToggle(type) {
            $.each(this.markers, function(index, marker) {
                if (!marker.type) {
                    return;
                }

                let isVisible = type === 0 || marker.type === type;
                marker.setVisible(isVisible);
            });
        }

        /**
         * Балун
         */
        initInfoWindow() {
            let that = this;

            // Стандартные настройки infoWindow
            this.infoWindow = new InfoBox({
                content               : '',
                disableAutoPan        : false,
                maxWidth              : 0,
                pixelOffset           : new google.maps.Size(-55, -83),
                zIndex                : null,
                closeBoxMargin        : '0px 0px 0px 0px',
                closeBoxURL           : '',
                infoBoxClearance      : new google.maps.Size(10, 10),
                isHidden              : false,
                pane                  : 'floatPane',
                enableEventPropagation: false,
                boxStyle              : {
                    width: 'auto'
                }
            });

            // Закрытие всех infoWindow при клике по карте
            google.maps.event.addListener(this.map, 'click', function() {
                that.closeInfoWindow();
            });

            this.infoWindow.addListener('domready', function() {
                let $infoBox         = $('.infoBox');
                let $width;
                let $height;
                let $arrow           = $infoBox.find('.b-map-tooltip__arrow');
                let $closeInfoWindow = $('.b-map-tooltip__close');

                let $image = $infoBox.find('img');

                if ($image.length) {
                    $image.load(function() {
                        $width  = $infoBox.width();
                        $height = $infoBox.height() + $arrow.outerHeight();

                        that.infoWindow.setOptions({
                            pixelOffset: new google.maps.Size(-$width / 2, -$height)
                        });
                    });
                } else {
                    $width  = $infoBox.width();
                    $height = $infoBox.height() + $arrow.outerHeight();
                    that.infoWindow.setOptions({
                        pixelOffset: new google.maps.Size(-$width / 2, -$height)
                    });
                }

                $closeInfoWindow.click(function() {
                    that.closeInfoWindow();
                });
            });
        }

        /**
         * Закрытие балуна
         */
        closeInfoWindow() {
            if (this.markerOpen !== -1) {
                this.markerShow(this.markerOpen);
            }

            this.markerOpen = -1;
            this.infoWindow.close();
        }

        /**
         * Маркер с ссылкой
         * @param {String} url - ссыллка
         */
        markerLink(url) {
            let isLocalLink = url.indexOf(window.location.origin) + 1;

            if (isLocalLink) {
                window.location.href = url;
            } else {
                window.open(url);
            }
        }

        /**
         * Инициализация картинки на карте
         */
        imageBoundsInit() {
            let data = this.data.imageBounds;

            if (!data) {
                return;
            }

            let that           = this;
            // Данные для infoWindow
            let dataInfoWindow = {
                coords: this.data.imageBounds.coords,
                text  : this.data.imageBounds.text,
                title : this.data.imageBounds.title
            };

            let index = that.markers.length - 1;

            let imageBounds = this.data.imageBounds;

            this.imageBounds = {
                north: imageBounds.north,
                west : imageBounds.west,
                south: imageBounds.south,
                east : imageBounds.east
            };

            this.historicalOverlay = new google.maps.GroundOverlay(
                imageBounds.image,
                this.imageBounds);

            this.historicalOverlay.setMap(this.map);

            google.maps.event.addListener(
                this.historicalOverlay,
                'click',
                function() {
                    that.infoWindow.setContent(tpl(dataInfoWindow));
                    that.infoWindow.open(that.map, that.markers[index]);
                    that.markerHide(index);
                });

            this.imageBoundsZoomChange();
        }

        /**
         * При изменении зума картинка imageBounds меняется на маркер,
         * т.к. при слишком большом зуме картинка уже не видна на карте.
         */
        imageBoundsZoomChange() {
            let that        = this;
            let currentZoom = this.map.getZoom();
            let changeView  = 14;

            function toggleView(zoom) {
                if (zoom <= changeView) {
                    that.historicalOverlay.setMap(null);
                    that.markerShow(that.markers.length - 1);
                } else {
                    that.historicalOverlay.setMap(that.map);
                    that.markerHide(that.markers.length - 1);
                }
            }

            toggleView(currentZoom);

            this.map.addListener('zoom_changed', function() {
                currentZoom = that.map.getZoom();
                toggleView(currentZoom);
            });
        }

        /**
         * Определение крайних позиций маркеров на карте
         */
        initBounds() {
            if (this.data.zoom !== undefined && this.data.fit === undefined) {
                return;
            }

            this.bounds = new google.maps.LatLngBounds();

            this.fitBounds(this.bounds);
        }

        /**
         * Изменение области отображения карты, так чтобы были видны все маркеры
         * @param {Object} bounds - границы карты
         */
        fitBounds(bounds) {
            this.map.fitBounds(bounds);
        }

        /**
         * Инициализация кастомного зума
         * @param {Object} $map - jQuery Object - разметка карты
         */
        initCustomZoomControls($map) {
            this.$zoomWrapper = $map.next('.b-map__zoom-wrapper');
            this.$zoomIn      = this.$zoomWrapper.find('.b-map__zoom-in');
            this.$zoomOut     = this.$zoomWrapper.find('.b-map__zoom-out');

            if (this.$zoomIn.length && this.$zoomOut.length) {
                this.options.zoomControl = false;
            }
        }

        /**
         * Клики по кастомным контролам зума
         */
        clickCustomZoomControls() {
            let that = this;
            let hide = 'is-hide';

            this.map.addListener('zoom_changed', function() {
                let currentZoom = that.map.getZoom();

                if (currentZoom === that.options.maxZoom) {
                    that.$zoomIn.addClass(hide);
                } else {
                    that.$zoomIn.removeClass(hide);
                }

                if (currentZoom === that.options.minZoom) {
                    that.$zoomOut.addClass(hide);
                } else {
                    that.$zoomOut.removeClass(hide);
                }
            });

            this.$zoomIn.click(function() {
                that.map.setZoom(that.map.getZoom() + 1);
                if (that.map.getZoom() === that.options.maxZoom) {
                    that.$zoomIn.addClass(hide);
                } else {
                    that.$zoomOut.removeClass(hide);
                }
            });

            this.$zoomOut.click(function() {
                that.map.setZoom(that.map.getZoom() - 1);

                if (that.map.getZoom() === that.options.minZoom) {
                    that.$zoomOut.addClass(hide);
                } else {
                    that.$zoomIn.removeClass(hide);
                }
            });
        }

        /**
         * Кластеризаци
         * @return {Object} MarkerClusterer объект к кластерами
         */
        initCluster() {
            this.clusterOptions = {
                styles: [
                    {
                        url: 'http://google-maps-utility-library-v3.' +
                        'googlecode.com/svn/trunk/markerclusterer/images/m1.png',
                        height: 52,
                        width : 52
                    }
                ]
            };

            this.clusterOptions = $.extend(
                this.clusterOptions,
                this.data.clusterOptions
            );

            return new MarkerClusterer(this.map, this.markers, this.clusterOptions);
        }

        /**
         * Табы для сортировки маркеров на карте.
         * Сортирует по свойству type у маркера.
         */
        initTabs() {
            let $tabsWrapper = this.$map.parents('.b-map__cnt').find('.b-map-tabs');
            if (!$tabsWrapper.length) {
                return;
            }

            let that                 = this;
            let $tabItems            = $tabsWrapper.find('.b-map-tabs__item');
            let active               = 'is-active';
            let $tabBtnToggleContent = $tabsWrapper.find('.b-map-tabs__btn');
            let $tabContent          = $tabsWrapper.find('.b-map-tabs__list');

            $tabItems.click(function(e) {
                e.preventDefault();
                $tabItems.removeClass(active);
                $(this).addClass(active);
                that.closeInfoWindow();
                that.markerToggle($(this).find('a').data('type'));
                $tabContent.removeClass(active);
            });

            $tabBtnToggleContent.click(function(e) {
                e.preventDefault();
                $tabContent.toggleClass(active);
            });

            if (this.isMobile) {
                google.maps.event.addListener(this.map, 'click', function() {
                    $tabContent.removeClass(active);
                });
            }
        }

        /**
         * Режим создания/редактирования карты
         */
        editor() {
            if (!this.data.editor) {
                return;
            }

            google.maps.event.addListener(this.map, 'click', function(e) {
                console.log('[' + // eslint-disable-line no-console
                    e.latLng.lat().toFixed(6) + ',' + // eslint-disable-line no-console
                    e.latLng.lng().toFixed(6) + ']'); // eslint-disable-line no-console
            });
        }
    }

    return Map;
});
