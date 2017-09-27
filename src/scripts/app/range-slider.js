define('app/range-slider', ['jquery', 'autoNumeric', 'rangeSlider'], function() {
    'use strict';

    /**
     * @param {Object} $slider - jquery обеъект, обёртка всего блока слайдера
     * @constructor
     */
    class RangeSlider {
        constructor($slider) {
            //не инициализируем слайдер, если у него есть атрибут data-noinit="true"
            if ($slider.attr('data-noinit') === 'true') {
                return;
            }

            //Обёртка для сладера и инупутов
            this.$wrap    = $slider;
            // Проверяем на каком устройстве показываем слайдер
            this.isMobile = window.innerWidth < 1025;
            // На j-slider навешиваем iondenslider
            this.$slider  = this.$wrap.find('.j-slider');
            // Инпуты сладера для отправки на сервер
            this.$inputs  = this.$wrap.find('input');
            // Определяем сколько пинов надо показывать
            this.type     = this.$inputs.length === 1 ? 'single' : 'double';

            this.options();
            this.initMask();
            this.bindEvents();
        }

        /**
         * Настройки iondenslider
         */
        options() {
            let _this   = this;
            // Данные из data-атрибутов
            let data    = this.$slider.data();
            // Минимальное значение
            this.min    = data.min;
            // Максимальное значение
            this.max    = data.max;
            // Положение левого пина
            this.from   = data.from;
            // Положение правого пина
            this.to     = data.to;
            //
            this.values = [this.from, this.to];

            this.options = {
                type            : this.type,
                min             : this.min,
                max             : this.max,
                from            : this.from,
                to              : this.to,
                min_interval    : this.mathInterval(), // eslint-disable-line camelcase
                decorate_both   : false, // eslint-disable-line camelcase
                prettify_enabled: true, // eslint-disable-line camelcase
                onChange        : function(data) {
                    _this.eventChange(data);
                },
                onStart         : function(data) {
                    _this.eventStart(data);
                },
                onFinish        : function() {
                    _this.setEventInputChange();
                }
            };

            this.init();
        };

        /**
         * Подписка на события
         */
        bindEvents() {
            let _this = this;
            // Change на инпутах (не работает с двумя пинами)
            // this.$inputs.on('change', this.inputsChangesValue.bind(this));
            // Keypress в инпуте, при enter вызывает inputsChangesValue
            this.$inputs.on('keypress', function(e) {
                if (e.which === 13) {
                    _this.inputsChangesValue(e);
                }
            });
        };

        /**
         * Инициализация iondenslider
         */
        init() {
            this.$slider.ionRangeSlider(this.options);
            this.slider = this.$slider.data('ionRangeSlider');
        };

        /**
         * Событие срабатывает при загрузке слайдера
         */
        eventStart() {
            let _this = this;
            // Выставляем всем инпутам значения - value
            this.$inputs.each(function(index) {
                _this.$inputs[index].value = _this.digit(_this.values[index]);
            });
        };

        /**
         * Событие происходит во время изменение положения пина
         * @param {Object} data - данные для слайдера (min, max, from, to)
         */
        eventChange(data) {
            this.from             = data.from;
            this.to               = data.to;
            this.$inputs[0].value = this.digit(data.from);
            $(this.$inputs[0]).autoNumeric('set', data.from);

            if (this.$inputs[1]) {
                $(this.$inputs[1]).autoNumeric('set', data.to);
                this.$inputs[1].value = this.digit(data.to);
            }
        };

        /**
         * Некоторое кол-во математики, которая не дает ползункам
         * разбегаться/пересекаться
         * @param {Event} e - Event
         */
        inputsChangesValue(e) {
            let data = {};
            let value;

            //TODO переписать, нихуя не понятно
            if (this.$inputs[1] !== 'undefined') {
                value = parseInt(this.undigit(e.target.value, 10));

                if (value < this.min) {
                    data.from             = this.min;
                    this.$inputs[0].value = this.digit(this.min);
                } else if (value > this.to) {
                    data.from             = this.to;
                    this.$inputs[0].value = this.digit(this.to);
                } else {
                    data.from = value;
                }

                if (value > this.max) {
                    data.from             = this.max;
                    this.$inputs[0].value = this.digit(this.max);
                }
            } else if (e.target === this.$inputs[0]) {
                value = parseInt(this.undigit(e.target.value, 10));

                if (value < this.min) {
                    data.from             = this.min;
                    this.$inputs[0].value = this.digit(this.min);
                } else if (value > this.to - this.interval) {
                    data.from             = this.to - this.interval;
                    this.$inputs[0].value = this.digit(this.to - this.interval);
                } else {
                    data.from = value;
                }

                this.from = data.from;
            } else {
                value = parseInt(this.undigit(e.target.value, 10));

                if (value > this.max) {
                    data.to               = this.max;
                    this.$inputs[1].value = this.digit(this.max);
                } else if (value < this.from + this.interval) {
                    data.to               = this.from + this.interval;
                    this.$inputs[1].value =
                        this.digit(this.from + this.interval);
                } else {
                    data.to = value;
                }

                this.to = data.to;
            }

            this.update(data);
        };

        /**
         * Обновление значений слайдера
         * @param {Object} data - данные о слайдере
         */
        update(data) {
            this.slider.update(data);
        };

        /**
         * Определение интервала между пинами 0----0
         * @return {Number} - размер интервала
         */
        mathInterval() {
            let sliderWidth = this.$slider.width();
            let pinWidth    = 20;
            let medium      = this.max - this.min;
            let pxInStep    = medium / sliderWidth;
            let coefficient = this.isMobile ? 2.5 : 2;

            if (pxInStep > 1) {
                this.interval = Math.floor(pinWidth * coefficient * pxInStep);
            } else {
                let stepInPx  = 1 / pxInStep;
                this.interval = Math.floor(pinWidth * coefficient / stepInPx);
            }

            return this.interval;
        };

        /**
         * Добавление разрядов к цифрам
         * @param {Number} number - число для конвертации
         * @returns {String} - число с разрядами в виже строки
         */
        digit(number) {
            return String(number).replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g, '\$1 ');
        };

        /**
         * Конвертация из числа с разрядами, обратно в число
         * @param {String} number - Число с разрядами
         * @return {Number} - число
         */
        undigit(number) {
            return number.replace(/\s/g, '');
        };

        /**
         * Маска для разрядов 1 000 000
         */
        initMask() {
            this.$inputs.each(function() {
                $(this).autoNumeric('init', {
                    aSep: ' ',
                    mDec: 0
                });
            });
        };

        /**
         * При отпускании пина создаем на инпутах событие change
         * понадобится при интеграции с другими частями кода
         */
        setEventInputChange() {
            this.$inputs.change();
        };

    }

    return RangeSlider;
});
