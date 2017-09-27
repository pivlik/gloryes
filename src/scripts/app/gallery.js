define('app/gallery', [
    'jquery',
    'fotorama',
    'app/tpl/gallery/labels',
    'app/popup',
    'app/utils'
], function($,
            fotorama,
            tplLabels,
            Popup) {
    'use strict';

    /**
     * Галерея
     * @param {Object} $galleryWrap - jQery object
     * @constructor
     */
    class Gallery {
        constructor($galleryWrap) {
            this.$galleryWrap = $galleryWrap;
            this.$gallery     = $galleryWrap.find('.b-gallery__base');
            this.$prev        = $galleryWrap.find('.j-gallery__prev');
            this.$next        = $galleryWrap.find('.j-gallery__next');
            this.isLoop       = this.$gallery.data('loop');
            this.labels       = this.$gallery.data('labels');
            this.disabled     = 'is-disabled';

            this.eventShow();
            this.eventReady();
            this.initGallery();
            this.increase();
        }

        /**
         * Инициализация галереи, подключение фоторамы
         */
        initGallery() {
            this.$gallery.fotorama();
        };

        /**
         * Кастомное событие фоторамы - show - срабатывает при каждом показе слайда
         */
        eventShow() {
            this.$gallery.on('fotorama:show', (e, fotorama) => {
                this.toggleArrowView(fotorama);
            });
        };

        /**
         * Кастомное событие фоторамы - ready - срабатывает, когда фоторама
         * полностью загружена
         */
        eventReady() {
            this.$galleryWrap.css('opacity', 1);

            this.$gallery.on('fotorama:ready', (e, fotorama) => {
                this.bindArrowClick(fotorama);
                this.arrowView(fotorama);
                this.labelsCreate(fotorama);
                this.centerArrowsVertically(fotorama);

                this.onWindowResize(fotorama);
            });
        };

        /**
         * Обработка клика по стрелкам
         * @param {Object} fotorama - конструктор фоторамы
         */
        bindArrowClick(fotorama) {
            this.$prev.click(function() {
                fotorama.show('<');
            });

            this.$next.click(function() {
                fotorama.show('>');
            });
        };

        /**
         * Показ стрелок, только когда есть слайды и их больше одного
         * @param {Object} fotorama - конструктор фоторомы
         */
        arrowView(fotorama) {
            if (fotorama.size === 1) {
                this.$prev.addClass(this.disabled);
                this.$next.addClass(this.disabled);
            }
        };

        /**
         * Смена вида у стрелок, у первого и последнего слайда
         * @param {Object} fotorama - конструктор фоторомы
         */
        toggleArrowView(fotorama) {
            let prevMethod = fotorama.activeIndex === 0 ?
                'addClass' :
                'removeClass';

            let nextMethod = fotorama.size -
            fotorama.activeIndex === 1 ?
                'addClass' :
                'removeClass';

            if (!this.isLoop) {
                this.$prev[prevMethod](this.disabled);
                this.$next[nextMethod](this.disabled);
            }
        };

        /**
         * Позиционирование стрелок: они должны находиться на середине высоты
         * картинок
         * @param {Object} fotorama
         */

        centerArrowsVertically(fotorama) {
            let $stageHeight = $(fotorama.activeFrame.$stageFrame[0]).height();
            let $arrowPos    = $stageHeight / 2 - this.$prev.height() / 2;

            this.$prev.css({
                top: $arrowPos
            });

            this.$next.css({
                top: $arrowPos
            });
        };

        /**
         * Событие, происходящее на ресайз окна
         * @param {Object} fotorama - конструктор фоторомы
         */
        onWindowResize(fotorama) {
            $(window).on('resize', $.debounce(300, () => {
                this.centerArrowsVertically(fotorama);
            }));
        };

        /**
         * Создание лейблов у тумбочек
         */
        labelsCreate() {
            if (this.labels && typeof this.labels === 'object') {
                const $container  = this.$gallery.find('.fotorama__nav__shaft');
                const $thumbWidth = this.$gallery.data('thumbwidth');
                const thumbMargin = this.$gallery.data('thumbmargin') || 2;
                const data        = {
                    elements: []
                };

                $.each(this.labels, function(item, text) {
                    data.elements.push(
                        {
                            position: (parseInt($thumbWidth) + thumbMargin) * item,
                            text    : text
                        }
                    );
                });

                $container.append(tplLabels(data));
            }
        };

        increase() {
            this.$zoom = this.$galleryWrap.find('.b-gallery__increase');

            if (!this.$zoom) {
                return;
            }

            this.$galleryContainer = $('.b-construction-progress__gallery');

            const $gallery = this.$zoom.parent(this.$galleryWrap);

            this.$zoom.on('click', () => {
                $('.b-popup__cnt').append($gallery);
                this.$galleryContainer.html('&nbsp;');
            });

            return new Popup(this.$zoom);
        };
    }

    return Gallery;
});
