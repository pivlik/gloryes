define('app/construction-progress', [
    'jquery',
    'app/tpl/construction-progress/select',
    'app/tpl/construction-progress/gallery',
    'app/gallery'
], function($, tplSelect, tplGallery, Gallery) {
    /**
     * Блок "Ход строительства"
     * @param {Object} $wrap - jQuery object - обертка всего блока
     * @constructor
     */
    class ConstructionProgress {
        constructor($wrap) {
            // Обёртка селекта
            this.$wrapSelects = $wrap.find('.b-construction-progress__select');
            // Все селекты блока
            this.$selects = $wrap.find('select');
            // Контентная часть блока
            this.$content = $wrap.find('.b-construction-progress__content');
            // Галерея
            this.$gallery = $wrap.find('.b-construction-progress__gallery');
            // Форма <form>
            this.$form = $wrap.find('form');
            // Разметка ajax loader
            this.$ajaxLoader = $('.b-ajax-loader');
            //id объекта ЖК
            this.objectId = this.$form.find('input[name=object_id]').val();

            this.bindEvents();
        }

        /**
         * События
         */
        bindEvents() {
            // При изменения в селекте отсылаем запрос на сервер
            this.$selects.on('change', this.send.bind(this));
        };

        /**
         * Получение данных от сервера
         */
        send() {
            let that = this;
    
            $.ajax({
                url       : this.$form.attr('action'),
                type      : this.$form.attr('method') || 'post',
                data      : this.$form.serialize(),
                dataType  : 'json',
                beforeSend: function() {
                    that.$ajaxLoader.show();
                },
                success: function(data) {
                    that.createSelect(data.selects);
                    that.progressBar(data.progressBar);
                    that.createText(data.text);
                    that.createGallery(data.gallery);
                    that.changeLink(data.selects);
                    that.$ajaxLoader.hide();
                }
            });
        };

        /**
         * Пересборка всех селектов
         * @param {Object} data - json данные всех селектов с сервера
         */
        createSelect(data) {
            let that = this;
            let counter = 0;
            this.$wrapSelects.empty();
    
            $.each(data, function(index, val) {
                let html = tplSelect(val);
                that.$wrapSelects.eq(counter).append(html);
                let select = that.$wrapSelects.eq(counter).find('select');
                select.on('change');
                select
                .prop('name', index)
                .on('change', that.send.bind(that))
                .selectric('init');
                counter++;
            });
        };

        /**
         * Создание текста
         * @param {Object} data - json данные текста с сервера
         */
        createText(data) {
            this.$content.empty().append(data);
        };

        /**
         * Создание галереи
         * @param {Object} data - json данные галереи с сервера
         */
        createGallery(data) {
            if (data === undefined) {
                this.$gallery.empty().append('&nbsp;');
            } else {
                let html = tplGallery(data);
                this.$gallery.empty().append(html);
                this.initGallery();
            }
        };

        /**
         * Прогресс бар
         * @param {Object} data - данные о прогресс баре из json
         */
        progressBar(data) {
            if (!data) {
                return;
            }
    
            let $progressWrap = $('.b-progress-bar');
            let $progressBase = $progressWrap.find('.b-progress-bar__base');
            let $progressDone = $progressWrap.find('.b-progress-bar__done');
            let $progressLine = $progressWrap.find('.b-progress-bar__current');
            let $progressText = $progressWrap.find('.b-progress-bar__text');
            let $progressDeadline = $('.b-construction-progress__deadline');
    
            data['ready_date'] = data['ready_date'] || '';
    
            if (data['is_ready']) {
                $progressDone.show();
                $progressBase.hide();
                $progressDeadline.hide();
            } else {
                $progressDone.hide();
                $progressBase.css('display', 'flex');
                $progressDeadline.text(data['ready_date']).show();
                $progressText.text(data['progress'] + '%');
                $progressLine.css('width', data['progress'] + '%');
    
                if (!data['progress']) {
                    $progressBase.hide();
                }
            }
        };

        /**
         * Инициализация галереи пришедшей из json
         * @returns {Object} гарелея
         */
        initGallery() {
            return new Gallery(this.$gallery.find('.b-gallery'));
        };

        /**
         * Смена url на основе пришедшего json
         * @param {Object} data - данные
         */
        changeLink(data) {
            // Создаем объект json для урла
            let dataUrl = {};
    
            // Собираем объект для урла
            $.each(data, function(index, val) {
                $.each(val, function(index2, value2) {
                    if (value2.isSelect === true) {
                        dataUrl[index] = value2.value;
                    }
                });
            });
    
            dataUrl['object_id'] = this.objectId;
            // Превращаем в настоящий url
            let parseUrl = '?'  + decodeURIComponent($.param(dataUrl));
            window.history.pushState(null, null, parseUrl);
        };

    }
    return ConstructionProgress;
});
