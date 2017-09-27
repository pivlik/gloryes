define('app/popup', ['magnific-popup', 'app/map'], function(magnific, Map) {
    'use strict';

    /**
     * Попап
     * @param {Object} $link - jQuery object - ссылка на попапа
     * @constructor
     */
    class Popup {
        constructor($link) {
            this.$link     = $link;
            this.$body     = $('body');
            this.$closeBtn = $('.b-popup__close');

            this.popupOptions();
            this.bindEvents();
            this.initPopup();
        }

        popupOptions() {
            let that = this;
            let type = this.$link.data('type');

            this.options = {
                type           : type || 'inline',
                showCloseBtn   : false,
                fixedContentPos: true,
                mainClass      : that.collectMainClass(),
                removalDelay   : that.transitionDelay(),
                callbacks      : {
                    open : function() {
                        that.openPopup();
                        that.transitionDelay();

                        //условие для инициализации ion-slider'а в попапе
                        if (that.$link.data('slider') === 'ion-slider') {
                            require(['app/range-slider'], function(RangeSlider) {
                                $('.j-range-sliders').each(function() {
                                    let $slider = $(this);
                                    $slider.removeAttr('data-noinit');

                                    setTimeout(
                                        function() {
                                            return new RangeSlider($slider);
                                        }, 100);
                                });
                            });
                        }
                    },
                    close: function() {
                        that.closePopup();
                    }
                }
            };
        };

        /**
         *
         * @returns {string} - строка с модификаторами, которые навешиваются на
         * родительский блок попапа
         */
        collectMainClass() {
            let mainClass = [];

            if (this.$link.data('theme')) {
                mainClass.push('b-popup_theme_' + this.$link.data('theme'));
            }

            if (this.$link.data('fullsize') !== undefined) {
                mainClass.push('b-popup_full_size');
            }

            if (this.$link.data('toggle-time')) {
                mainClass.push('b-popup_theme_toggle');
            }

            return mainClass.join(' ');
        };

        /**
         /**
         * Инициализация попапа, подключение магнифика
         */
        initPopup() {
            this.$link.magnificPopup(this.options);
        };

        /**
         * События
         */
        bindEvents() {
            this.$closeBtn.on('click', this.hidePopup);
            $(window).on('popstate', this.hidePopup);
        };

        /**
         * Добавления transition на попап
         * @return {Number} - вермя трансофрмации
         */
        transitionDelay() {
            this.transitionTime = this.$link.data('toggle-time');

            if (!this.transitionTime) {
                return;
            }

            $('.mfp-bg, .mfp-wrap').css({
                'transition-duration': this.transitionTime + 'ms'
            });

            return this.transitionTime;
        };

        /**
         * При открытии попапа
         */
        openPopup() {
            if (!(this.$link.data('type') === 'image' ||
                this.$link.data('type') === 'iframe')) {
                window.history.pushState('forward', null, this.$link.attr('href'));
            }

            this.scrollPosition = $(window).scrollTop() ||
                this.$link.offset().top;

            this.$body.css({
                position: 'fixed',
                top     : -this.scrollPosition
            });

            this.popupTargetOpen();
        };

        /**
         * При закрытии попапа
         */
        closePopup() {
            let $content = $('.b-popup__cnt .b-gallery');

            history.pushState('',
                document.title,
                window.location.pathname);

            this.$body.css({
                position: '',
                top     : ''
            });

            $(window).scrollTop(this.scrollPosition);

            this.popupTargetClose();

            //TODO это должна уметь сама галерея
            $('.b-construction-progress__gallery').append($content);
        };

        /**
         * Закрытие попапа
         */
        hidePopup() {
            $.magnificPopup.close();
        };

        /**
         * Открытие попапа
         * @param {Object} $popup - jQuery Object - ссылка открывающася попап
         */
        showPopup($popup) {
            $popup.magnificPopup('open');
        };

        /**
         * Передайте Коле, чтобы он пофиксил эту хуйню
         * а ещё передайте, чтобы он следущий раз писал, что ни так
         * т.к. месяц спустя хз что ни так
         * @return {Object}  карта
         */
        popupTargetOpen() {
            let target = this.$link.data('target');

            if (
                target === undefined ||
                target === '') {
                return;
            }
            let $content = $(target).parent('.b-map__cnt').clone();
            let $map     = $content.find(target).removeAttr('data-noinit');
            $(this.$link.attr('href')).find('.b-popup__cnt').append($content);

            return new Map($map);
        };

        popupTargetClose() {
            $('#popup-map').find('.b-popup__cnt').empty();
        };

    }

    return Popup;
});
