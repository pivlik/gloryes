define('app/search-result', [
    'jquery',
    'app/tpl/search/table-apartment'
], function($, tableTpl) {
    'use strict';

    class SearchResult {
        constructor($content) {
            // Формы всех ЖК
            this.$forms               = $content.find('form');
            // Показать квартиры комплекса (первые 10)
            this.$submit              = $content.find('.j-btn-more');
            // Блок с результатами
            this.$results             = $content.find('.b-building__results');
            // Загрузить ещё квартир комплекса
            this.$moreApartments      = $content.find('.j-building-more');
            // Текст сколько квартир показано
            this.$shownApartmentsText = $content.find('.b-building__shown-text');
            // Таблица с результатами
            this.$table               = $content.find('.b-building__table');
            // Ajax loader
            this.$ajaxLoader          = $('.b-ajax-loader');
            // Ajax loader для добавки внутрь кнопки
            this.$ajaxLoaderInBtn     = this.$ajaxLoader
            .clone()
            .addClass('b-ajax-loader_theme_inside is-active');

            // Кнопки сортировки
            this.$sorts      = $content.find('.j-sort');
            // Форма поиска
            this.$searchForm = $('.j-search-filter').find('form');
            // Поле сортировки
            this.$sortInput  = this.$searchForm.find('input[name=sort]');
            // Направление сортировки
            this.$orderInput = this.$searchForm.find('input[name=order]');
            // Кнопка "Показать результаты"
            this.$resultBtn  = this.$searchForm
            .find('.b-search-filter__submit-btn');
            // Селект сортировки
            this.$selectSort = $content.find('.j-select-sort');

            this.bindEvents();
        }

        bindEvents() {
            this.$submit.on('click', this.openResult.bind(this));
            this.$resultBtn.on('click', this.showResults.bind(this));
            this.$moreApartments.on(
                'click',
                this.bindClickMoreApartments.bind(this)
            );
            this.$sorts.on('click', this.sort.bind(this));

            this.$selectSort.on('change', this.sort.bind(this));
        };

        showResults(e) {
            e.preventDefault();
            let that  = this;
            let $data = this.$searchForm.serialize();
            let objectId;

            $.ajax({
                url       : this.$searchForm.attr('action'),
                type      : this.$searchForm.attr('method') || 'post',
                dataType  : 'json',
                data      : $data,
                beforeSend: function() {
                    that.$ajaxLoader.show();
                },
                success   : function(data) {
                    that.$forms.each(function(indx, element) {
                        objectId = $(element).find('input[name=object]').val();
                        objectId = parseInt(objectId);

                        let $el             = $(element);
                        let $results        = data.building[objectId];
                        let $target         = $el.find('.b-building__table');
                        let page            = $el.find('input[name=page]');
                        let BtnText         = $results['results_show_text'];
                        let $shownApText    = $el.find('.b-building__shown-text');
                        let $moreApartments = $el.find('.j-building-more');
                        let $submit         = $el.find('.j-btn-more');
                        // Устанавливаем текст для кнопки
                        // $submit.data('text', $results['toggle_btn_text']);

                        if ($submit.hasClass('is-active')) {
                            $submit.empty().text('Скрыть');
                        } else {
                            $submit.empty()
                            .text($results['toggle_btn_text']);
                        }
                        // Обновляем таблицу с результатами
                        that.updateApartments($target, $results);
                        if ($results['next_page'] === 0) {
                            $moreApartments.hide();
                        } else {
                            page.val($results['page']);
                            page.attr('data-next', $results['next_page']);
                        }
                        $shownApText.text(BtnText);
                    });

                    that.$ajaxLoader.hide();
                    // Добаляем GET в url
                    window.history.pushState(null, null, '?' + $data);
                }
            });
            // Добаляем GET в url
            window.history.pushState(null, null, '?' + $data);
        };

        openResult(e) {
            let $this        = $(e.target);
            let $currentForm = $this.closest('form');
            let $data        = this.$searchForm.serialize() + '&' +
                $currentForm.serialize();
            e.preventDefault();
            $this.next().slideToggle();

            if ($this.hasClass('is-active')) {
                $this.removeClass('is-active')
                .empty()
                .text($this.data('text'));
            } else {
                $this.addClass('is-active').empty().text('Скрыть');
            }

            // Добаляем GET в url
            window.history.pushState(null, null, '?' + $data);
        };

        bindClickMoreApartments(e) {
            e.preventDefault();
            let that                 = this;
            let $target              = $(e.target);
            let $currentForm         = $target.closest('form');
            let objectId             = parseInt($currentForm
            .find('input[name=object]').val());
            let page                 = $currentForm.find('input[name=page]');
            let nextPage             = page.attr('data-next');
            let $shownApartmentsText = $currentForm.find('.b-building__shown-text');
            // Текст на кнопке - "показать ещё"
            let textBtn              = $target.text();

            // Устанавливаем значение следующей страницы
            if (nextPage) {
                page.val(nextPage);
            }

            let $data = this.$searchForm.serialize() + '&' +
                $currentForm.serialize();

            $.ajax({
                url       : this.$searchForm.attr('action'),
                type      : this.$searchForm.attr('method') || 'post',
                dataType  : 'json',
                data      : $data,
                beforeSend: function() {
                    that.$moreApartments
                    .empty()
                    .prop('disabled', true)
                    .append(that.$ajaxLoaderInBtn)
                    .addClass('is-disabled');
                },
                success   : function(data) {
                    that.$moreApartments
                    .empty()
                    .prop('disabled', false)
                    .removeClass('is-disabled')
                    .text(textBtn);

                    let $results = data.building[objectId];
                    that.downloadApartment($target, $results);
                    if ($results['next_page'] === 0) {
                        that.$moreApartments.hide();
                    } else {
                        page.val($results['page']);
                        page.attr('data-next', $results['next_page']);
                    }
                    $shownApartmentsText.text($results['results_show_text']);

                    // Добаляем GET в url
                    window.history.pushState(null, null, '?' + $data);
                }
            });
        };

        downloadApartment($target, data) {
            let html    = tableTpl(data);
            let parents = $target.parents('.b-building__results');
            parents.find('tbody').append(html);
        };

        updateApartments($target, data) {
            let html    = tableTpl(data);
            let parents = $target.parents('.b-building__results');
            parents.find('tbody').empty().append(html);
        };

        /**
         * Сортировка
         * @param {Event} e - Event
         */
        sort(e) {
            e.preventDefault();
            let that         = this;
            // По какой ссылки кликнули
            let $target      = $(e.target);
            //По какому полю сортировать
            let sort         = $target.data('sort') ||
                $target.find('option:selected').data('sort');
            // Направление сортировки
            let direction    = $target.attr('data-direction') ||
                $target.find('option:selected').data('direction');
            let $currentForm = $target.closest('form');
            let objectId     = parseInt($currentForm
            .find('input[name=object]').val());

            $target.parents('tr').find('.j-sort').each(function() {
                delete $(this)[0].dataset.direction;
                $(this)
                .removeClass('b-building__sort_style_asc')
                .removeClass('b-building__sort_style_desc');
            });

            if (direction === 'asc' || direction === undefined) {
                $target
                .attr('data-direction', 'desc')
                .removeClass('b-building__sort_style_asc')
                .addClass('b-building__sort_style_desc');
                //Присваиваем значение, если direction = undefined
                direction = 'asc';
            } else {
                $target
                .attr('data-direction', 'asc')
                .removeClass('b-building__sort_style_desc')
                .addClass('b-building__sort_style_asc');
            }
            // Устанавливаем направление сортировки
            this.$sortInput.val(sort);
            this.$orderInput.val(direction);

            let $data = this.$searchForm.serialize() + '&' +
                $target.closest('form').serialize();

            $.ajax({
                url       : this.$searchForm.attr('action'),
                type      : this.$searchForm.attr('method') || 'post',
                dataType  : 'json',
                data      : $data + '&no_offset=1',
                beforeSend: function() {
                    that.$ajaxLoader.show();
                },
                success   : function(data) {
                    let $results = data.building[objectId];
                    that.updateApartments($target, $results);
                    that.$ajaxLoader.hide();
                    // Добаляем GET в url
                    window.history.pushState(null, null, '?' + $data);
                }
            });
        };

    }

    return SearchResult;
});
