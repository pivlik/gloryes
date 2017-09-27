define('app/form', ['jquery', 'polyfiller', 'app/tpl/form/error', 'app/tpl/form/success', 'app/functions',
        'masked-inputs', 'app/utils'],
    function($, webshim, errorTpl, successTpl) {
        'use strict';

        webshim.setOptions('waitReady', false);
        webshim.setOptions('forms', {
            lazyCustomMessages : true,
            replaceValidationUI: true,
            addValidators      : true
        });

        webshim.setOptions({
            wspopover: {
                appendTo: 'element'
            }
        });

        webshim.polyfill('forms forms-ext');

        /**

         * @constructor
         * @param {Object|String} $form объект jQuery или строка-селектор
         * @param {Object|Void}   opts  объект параметров
         */
        class Form {
            constructor($form, opts) {
                this.onSuccess = null;
                this.onError   = null;

                this.opts = {
                    successTpl   : successTpl,
                    successText  : 'Форма успешно отправлена',
                    successHeader: 'Заявка отправлена',
                    errorText    : 'Внутренняя ошибка, пожалуйста, ' +
                    'повторите запрос позднее'
                };

                $.extend(this.opts, opts || {});

                this.$el = $form instanceof $ ? $form : $($form);

                this.$cont   = this.$el;
                this.$submit = this.$el.find('[type=submit]');

            }

            /**
             * Отменяет обычный submit формы, на событии valid осуществляет свой submit
             */
            init() {
                let form = this;

                let $hidden = $('<input type="hidden" name="__s">');
                $hidden.val(window.__s || '');

                form.$el.find('[type="tel"]').each(function() {
                    $(this).mask('+7 (999) 999-9999', {autoclear: false});
                });

                form.$el
                .append($hidden)
                .submit(function(e) {
                    e.preventDefault();
                    form.send();
                });
            };

            /**
             * Отправка формы и обработчик ответа от сервера
             */
            send() {
                let form = this;

                $(':focus').blur();
                form.$submit.prop('disabled', true);

                $.ajax({
                    url     : form.$el.attr('action') || location,
                    data    : form.$el.serialize(),
                    type    : form.$el.attr('method') || 'post',
                    dataType: 'json'
                }).always(function always() {
                    form.$submit.prop('disabled', false);
                }).done(function done(data) {
                    let method = data.ret ?
                        'handleSuccess' :
                        'handleError';
                    form[method](data);
                }).fail(function fail(data) {
                    form.handleError(data);
                });
            };

            /**
             * Обработчик ошибки ответа
             * @param  {Object|undefined} data ответ сервера, если был, или undefined
             */
            handleError(data) {
                let form = this;

                /**
                 * Если в параметры конструктора был передан callback - вызываем.
                 * Если при этом callback вернет true, то стандартный обработчик
                 * будет отменен
                 */
                if (typeof form.onError === 'function') {
                    let ret = form.onError(data);
                    if (ret) {
                        return;
                    }
                }

                form.$cont.swapContent(errorTpl({
                    header : 'Ошибка',
                    message: data.message || form.opts.errorText
                }));
            };

            /**
             * Обработчик положительного ответа сервера
             * @param  {Object} data ответ сервера
             */
            handleSuccess(data) {
                let form           = this;
                let defaultHeader  = form.opts.successHeader;
                let defaultReply   = form.opts.successText;
                let headerSuccess  = form.$el.data('header');
                let messageSuccess = form.$el.data('message');

                if (data.redirect) {
                    location.href = data.redirect;
                    return;
                }

                if (typeof form.onSuccess === 'function') {
                    let ret = form.onSuccess(data);
                    if (ret) {
                        return;
                    }
                }

                let tplData = $.extend({
                    header : headerSuccess || defaultHeader,
                    message: messageSuccess || defaultReply
                }, data);

                let html = form.opts.successTpl(tplData);

                form.$cont.swapContent(html);
            };
        }

        return Form;
    });
