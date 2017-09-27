define('app/gallery-slick', ['jquery', 'slick-carousel'], function($) {
    'use strict';

    class GallerySlick {
        constructor($galleryWrap) {
            //_____________________________________
            // НАСТРОЙКИ ИЗ HTML
            this.$galleryWrap = $galleryWrap;
            this.$gallery = $galleryWrap.find('.b-gallery-slick__base');
            //Стрелочки
            this.arrows = this.$gallery.data('arrows') ?
                this.$gallery.data('arrows') :
                false;
            this.$prev = this.arrows ?
                $galleryWrap.find('.j-gallery__prev') :
                null;
            this.$next = this.arrows ?
                $galleryWrap.find('.j-gallery__next') :
                null;
            //Точки
            this.dots = this.$gallery.data('dots') ?
                this.$gallery.data('dots') :
                false;
            this.dotsClass = this.$gallery.data('dotsclass');
            //Замкнутость
            this.isLoop = this.$gallery.data('loop');
            //Автоплей
            this.autoPlay = this.$gallery.data('autoplay') ?
                this.$gallery.data('autoplay') :
                false;
            //Скорость автоплэя
            this.autoPlaySpeed = this.$gallery.data('autoplayspeed') ?
                this.$gallery.data('autoplayspeed') :
                3000;
            //_____________________________________
            //НАСТРОЙКИ РУКАМИ
            //Адаптивная высота (чтобы контейнер менял высоту
            //В соответствии с высотой слайдов
            this.adaptiveHeight = true;
            this.labels = this.$gallery.data('labels');
            this.disabled = 'is-disabled';
        }

        initGallery() {
            this.$gallery.slick({
                arrows        : this.arrows,
                prevArrow     : this.$prev,
                nextArrow     : this.$next,
                autoplay      : this.autoPlay,
                autoplaySpeed : this.autoPlaySpeed,
                dots          : this.dots,
                dotsClass     : this.dots ? this.dotsClass : 'slick-dots',
                infinite      : this.isLoop,
                speed         : 300,
                slidesToShow  : 1,
                adaptiveHeight: this.adaptiveHeight
            });
        }
    }

    return GallerySlick;
});
