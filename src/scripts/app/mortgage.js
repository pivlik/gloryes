define('app/mortgage', function() {
    /**
     * Калькулято ипотеки
     * @param {Object} $mortgage - jQuery object
     * @constructor
     */
    class Mortgage {
        constructor($mortgage) {
            // Форма
            this.$form       = $mortgage.find('form');
            // Все инпуты
            this.$inputs     = $mortgage.find('input');
            // Ajax loader
            this.$ajaxLoader = $mortgage.find('.b-ajax-loader');
            // Контентная часть, для замены пришедшим от севера
            this.$content    = $mortgage.find('.l-mortgage__cnt');

            this.bindEvents();
        }

        /**
         * Биндинг всех событий
         */
        bindEvents() {
            let that = this;
            this.$inputs.on('change', this.send.bind(this));

            this.$inputs.on('keypress', function(e) {
                // Если нажали enter в инпуте
                if (e.which === 13) {
                    that.send();
                }
            });
        };

        /**
         * Отправка ajax-запроса на сервер
         */
        send() {
            let that = this;

            $.ajax({
                url       : this.$form.attr('action'),
                type      : this.$form.attr('method') || 'post',
                dataType  : 'json',
                data      : this.$form.serialize(),
                beforeSend: function() {
                    that.$ajaxLoader.show();
                },
                success   : function(data) {
                    // Очищаем контент и заполняем пришедшим от сервера
                    that.$content.empty().append(data.html);
                    // Скрываем ajax loader
                    that.$ajaxLoader.hide();
                }
            });
        };

    }

    return Mortgage;
});
