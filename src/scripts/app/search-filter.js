define('app/search-filter', ['autoNumeric'], function() {
    'use strict';

    class SearchFilter {
        constructor($wrap) {
            // Форма
            this.$form   = $wrap.find('form');
            // Все инпуты в фильтре
            this.$inputs = $wrap.find('input');

            // Кнопка "Показать результаты"
            this.$submit      = $wrap.find('.b-search-filter__submit-btn');
            // Цвет текста кнопки "Показать результаты"
            this.$submitColor = this.$submit.css('color');

            // Кнопка "Сбросить фильтр"
            this.$reset = $wrap.find('.j-search-reset');

            // Крестик "очистить поле"
            this.$btnClean = $wrap.find('.b-search-filter__clear-input');
            this.timer     = null;

            // Ajax разметка для кнопки
            this.$ajaxLoader = $wrap
            .find('.b-ajax-loader')
            .clone()
            .addClass('b-ajax-loader_theme_inside is-active');

            this.initMask();
            this.bindEvents();

        }

        bindEvents() {
            let _this = this;
            let timer;

            //Отслеживаение изменений в инпутах
            this.$inputs.on('change', this.updateInputs.bind(this));

            // Отправляем запрос какого-то времени спустя
            // после последнего нажатия в инпуте
            this.$inputs.filter(`[type="text"]`).off('change');
            this.$inputs.filter(`[type="text"]`).on('keyup', function(e) {
                clearTimeout(timer);

                timer = setTimeout(function() {
                    _this.updateInputs(e);
                }, 300);
            });

            // Отправка данных на сервер
            this.$form.on('submit', function(e) {
                e.preventDefault();
            });

            // Вызов события change при нажатии на enter в инпуте
            this.$form.on('keypress', function(e) {
                if (e.which === 13) {
                    _this.$inputs.trigger('change');
                }
            });

            // Клик по кнопки отправки формы скролит вниз к результатам
            this.$submit.on('click', this.bindClickSubmit.bind(this));
            // Клик по кнопки сброса фильтра
            this.$reset.on('click', this.bindClickReset.bind(this));

            this.cleanInput();
        };

        /**
         * Обновляем инпуты
         * @param {Event} e - событие
         */
        updateInputs(e) {
            let _this = this;
            e.preventDefault();

            clearTimeout(this.timer);
            this.timer = setTimeout(function() {
                _this.send();
            }, 300);
            //this.send();
        };

        /**
         * Отправяляем ajax-запрос
         */
        send() {
            let _this = this;

            $.ajax({
                url       : this.$form.attr('action') + '?getInfo=1',
                type      : this.$form.attr('method') || 'post',
                dataType  : 'json',
                data      : this.$form.serialize(),
                beforeSend: function() {
                    _this.disabledInputs();
                },
                success   : function(data) {
                    _this.unDisabledInputs(data);
                }
            });
        };

        /**
         * При запросе количества квартир, сначала блокируем все инпуты
         */
        disabledInputs() {
            // Вешаем на кнопку отправки (submit) ajax-loader
            this.$submit
            .css({
                color: 'transparent'
            })
            .append(this.$ajaxLoader)
            .addClass('is-disabled');

            // Выключаем (disabled) все инпуты, что бы во время запроса пользователь
            // не мог ничего больше поменять
            // TODO пока отключили "по просьбе" Славы
            // this.$inputs.prop('disabled', true);
        };

        /**
         * Показываем нужные инпуты, какие узнаем из пришедшего json
         * @param {Object} data - даныне о инпутах
         */
        unDisabledInputs(data) {
            let checkboxes = data.visible;

            // Перебираем чекбоекмы, узнаем с каких надо убрать disabled
            for (let i = checkboxes.length; i--;) {
                $('input[name="' + checkboxes[i] + '"]').prop('disabled', false);
            }

            //TODO ][ардкод для цены и жилой площади
            let inputs = ['price', 'area'];
            for (let j = inputs.length; j--;) {
                $('input[name="' + inputs[j] + '[min]"]')
                //.prop('placeholder', data[inputs[j]].min)
                .prop('disabled', false);
                $('input[name="' + inputs[j] + '[max]"]')
                //.prop('placeholder', data[inputs[j]].max)
                .prop('disabled', false);
            }

            // Добаляем GET в url
            window.history.pushState(null, null, '?' + this.$form.serialize());

            // Удаляем ajax-loader в кнопке отправки
            this.$ajaxLoader.remove();

            // Восстанавливаем работу кнопки, добавляем новое количество квартир
            this.$submit
            .html(data.count)
            .css({
                color: this.$submitColor
            })
            .removeClass('is-disabled');
        };

        /**
         * Клик по submit скролит нас к результатам
         */
        bindClickSubmit() {
            let targetPositon = $('#search-result').offset().top;

            $('body, html').animate({
                scrollTop: targetPositon
            }, 300);
        };

        /**
         * Обработка клика по кнопке "Сбросить фильтр"
         * @param {Event} e - Event
         */
        bindClickReset(e) {
            e.preventDefault();
            this.$form.trigger('reset');
            let _this = this;
            this.$inputs.removeAttr('checked');

            $.ajax({
                url     : this.$form.attr('action') + '?getInfo=1',
                type    : this.$form.attr('method') || 'post',
                dataType: 'json',
                success : function(data) {
                    _this.unDisabledInputs(data);
                    // Добаляем GET в url
                    window.history.pushState(null, null, '?');
                }
            });
        };

        /**
         * Маска для разрядов 1 000 000
         */
        initMask() {
            this.$inputs.filter('[type=text]').each(function() {
                $(this).autoNumeric('init', {
                    aSep  : ' ',
                    mDec  : 0,
                    wEmpty: 'empty',
                    lZero : 'keep'
                });
            });
        };

        /**
         * Крестик в инпуте, очищающий инпут
         */
        cleanInput() {
            let _this = this;

            // При загрузке странице, если поле заполненное, то показываем крестик
            this.$inputs.each(function() {
                if ($(this).val().length > 0) {
                    $(this).next(_this.$btnClean).addClass('is-active');
                }
            });

            this.$inputs.focus(function(e) {
                let $target = $(e.target);
                $target.next(_this.$btnClean).addClass('is-active');
            }).blur(function(e) {
                let $target = $(e.target);

                // Если поле заполнено, то не убирать крестик при blur
                if ($target.val().length > 0) {
                    return;
                }

                setTimeout(function() {
                    $target.next(_this.$btnClean).removeClass('is-active');
                }, 300);
            });

            this.$btnClean.on('click', function(e) {
                let $target = $(e.target);
                let lastVal = $target.prev('input').val();
                $target.prev('input').val('');
                $target.prev('input').data('autoNumeric').rawValue = '';
                $target.prev('input').focus();
                if (lastVal !== '') {
                    $target.prev('input').trigger('keyup');
                }
            });
        };

    }

    return SearchFilter;
});
