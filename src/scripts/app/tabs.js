define(['jquery'], function() {
    'use strict';

    /**
     * Табы
     * @param {Object} $tabsContainer - Jquery объект, обератка всего блока
     * @constructor
     */
    class Tabs {
        constructor($tabsContainer) {
            this.$tabs     = $tabsContainer.find('.b-tabs__item');
            this.$contents = $tabsContainer.find('.b-tabs__content');
            this.active    = 'is-active';

            this.bindEvents();
        }

        /**
         * События
         */
        bindEvents() {
            this.$tabs.on('click', this.stateTabs.bind(this));
            $(window).on('popstate', this.changeStateOnLoad(this));
        };

        /**
         * Если в url есть название таба, то открываем этот таб
         * @param {event} e - Event
         */
        changeStateOnLoad(e) {
            if (e.state !== null) {
                this.changeStateContents(e.state);
                this.$tabs.removeClass(this.active);
                $('[data-tab="' + e.state + '"]').addClass(this.active);
            }
        }

        /**
         * Узнаем состояние таба
         * @param {event} e - Event
         */
        stateTabs(e) {
            e.preventDefault();

            this.$tab   = $(e.target);
            this.$tabId = this.$tab.data('tab');
            this.$tabUrl = this.$tab.attr('href');

            if (this.$tab.hasClass('is-disabled')) {
                return;
            }

            //если в href таба ссылка, то осуществляем переход
            if (this.$tabUrl !== 'javascript:;') {
                location.href = this.$tabUrl;
            }

            if (!this.$tab.hasClass(this.active)) {
                this.$tabs.removeClass(this.active);
                this.$tab.addClass(this.active);
            }

            this.changeStateContents(this.$tabId);
        };

        /**
         * Меняем состояние таба
         * @param {String} name - id таба
         */
        changeStateContents(name) {
            this.$contents.removeClass(this.active);

            this.$contents.filter(function() {
                return $(this).data('tab-content') === name;
            }).addClass(this.active);
            
            //подставляем в url название таба
            if (name) {
                window.history.pushState(name, null, '?tab-active=' + name);
            }
        };
    }

    return Tabs;
});

