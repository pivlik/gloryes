define('app/favorite', ['jquery'], function($) {
    /**
     * Избранное
     * @constructor
     */
    class Favorite {
        constructor() {
            // Все поля со звездами
            this.$el            = '.j-favorite';
            // Класс для активного состояния
            this.active         = 'is-active';
            // Элемент к которому надо сделать анимацию подлета звездочки
            this.$target        = $('.j-favorite-target');
            // Количество выбранного
            this.numberFavorite = this.$target.find('.b-favorite__num');

            this.bindClick();
        }

        /**
         * Биндим события
         */
        bindClick() {
            let that = this;

            $(document).on('click', this.$el, function() {
                that.changeActiveClass($(this));
                that.opacityRow($(this));
            });
        };

        /**
         * Вешаем или убираем активный класс
         * @param {Object} $el - звездочка по которой кликнули
         */
        changeActiveClass($el) {
            $el[$el.hasClass(this.active) ?
                'removeClass' : 'addClass'](this.active);

            this.send($el);
        };

        send($el) {
            let that   = this;
            // id квартиры
            let id     = $el.data('flat-id');
            // Определяем добавлям мы квартиру в избранное или удаляем
            let action = $el.hasClass(this.active) ? 'add' : 'del';
            // ES6 синтаксис
            let data   = {id, action};

            $.ajax({
                url     : '/ajax/favorite.php',
                type    : 'post',
                dataType: 'json',
                data    : data,
                success : function(data) {
                    that.animateAddInFavorite($el, data.ret);
                    that.changeStateTargetBlock(data.ret);
                }
            });
        };

        /**
         * Анимируем добавление в избранное
         * @param {Object} $el - звездочка по которой кликнули
         */
        animateAddInFavorite($el) {
            if (!this.$target.length) {
                return;
            }

            if ($el.hasClass(this.active)) {
                $el.clone().offset({
                    top : $el.offset().top,
                    left: $el.offset().left
                })
                .css({
                    opacity  : '0.5',
                    position : 'absolute',
                    'z-index': '100'
                })
                .appendTo($('body'))
                .animate({
                    top   : this.$target.offset().top + 10,
                    left  : this.$target.offset().left + 10,
                    width : 75,
                    height: 75
                }, 1000, function() {
                    $(this).detach();
                });
            }
        };

        /**
         * Запись количества выбранного в блок
         * @param {Number} data - данные от сервера, количество избранного
         */
        changeStateTargetBlock(data) {
            data = parseInt(data, 10);

            if (data === 0) {
                this.$target.removeClass(this.active);
            } else {
                this.$target.addClass(this.active);
                this.numberFavorite.text(data);
            }
        };

        /**
         * Если находимся на странице избранного, то
         * при клике затемняем ряд в таблице
         * @param {Object} $el - элемент таблицы
         */
        opacityRow($el) {
            if (!$el.hasClass('j-favorite-page')) {
                return;
            }

            let row = $el.parents('tr');
            row[row.hasClass(this.active) ?
                'removeClass' : 'addClass'](this.active);
        };
    }

    return Favorite;
});
