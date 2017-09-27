define(['jquery'], function() {
    'use strict';

    /**
     * Анимированный лейбл
     * @constructor
     * @param {Object} $animatedLabel - jQuery объект
     *
     */
    class AnimatedLabel {
        constructor($animatedLabel) {
            this.$el    = $animatedLabel;
            this.$input = this.$el.find('input');
            this.active = 'is-active';    
        }

        init() {
            this.bindEvent();
            this.changeState();
        };

        /**
         * events
         */
        bindEvent() {
            this.$input.on('change', this.changeState.bind(this));
        };

        /**
         * проверяет состояние инпута и создает состояние
         * ('removeClass' or 'addClass') для этого инпута
         */
        changeState() {
            let state = this.$input.val() === '' ? 'removeClass' : 'addClass';
            this.render(state);
        };

        /**
         * @param {string} state - состояние ипута -
         * удаляет или добавяет активный класс
         */
        render(state) {
            this.$input[state](this.active);
        };
    }
    return AnimatedLabel;
});
