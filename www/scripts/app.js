'use strict';

define('app', ['jquery', 'slick-carousel'], function ($) {
    'use strict';

    //Подключение попапа
    //Так как кнопки с попапом иногда создаются динамически, вешаем на document.click

    $(document).on('click', '.j-popup', function (e) {
        var $popupLink = $(e.target);

        if (!$popupLink.length) {
            return;
        }

        require(['app/popup'], function (Popup) {
            var hash = window.location.hash;
            var popup = new Popup($popupLink);
            popup.initPopup();

            if ($popupLink.attr('href') === hash) {
                popup.showPopup($popupLink);
            }
        });
    });

    /// ПАША ДЕЛАЙ ПО АНАЛОГИИ
    (function ($toggler) {
        // ТУТ МЫ ИНИЦИАЛИЗИРУЕМ ПЕРЕ
        if (!$toggler.length) {
            return;
        }
        $($toggler).on('click', function () {
            $(this).toggleClass('active');
            $('.j-navigation').toggleClass('active');
        });
    })('.j-hamburger');

    (function ($mygallery) {
        // ТУТ МЫ ИНИЦИАЛИЗИРУЕМ ПЕРЕ
        if (!$mygallery.length) {
            return;
        }
        $($mygallery).slick();
    })('.j-slick');

    (function (a) {
        a = a + 2;
        return a;
    })(2);

    // // Подключение галерей со сликом
    // (function($gallerysSlick) {
    //     if (!$gallerysSlick.length) {
    //         return;
    //     }
    //
    //     require(['app/gallery-slick'], function(GallerySlick) {
    //         $gallerysSlick.each(function() {
    //             let gallery = new GallerySlick($(this));
    //             gallery.initGallery();
    //         });
    //     });
    // })($('.j-gallery-slick'));

    // //Анимированный label
    // (function($animLabels) {
    //     if (!$animLabels.length) {
    //         return;
    //     }
    //
    //     require(['app/animated-label'], function(AnimatedLabel) {
    //         $animLabels.each(function() {
    //             var label = new AnimatedLabel($(this));
    //             label.init();
    //         });
    //     });
    // })($('.j-anim-label'));

    // Стилизация селекта
    (function ($selects) {
        if (!$selects.length) {
            return;
        }

        require(['select'], function () {
            $selects.each(function () {
                var $select = $(this);
                $select.selectric({
                    disableOnMobile: false
                });
            });
        });
    })($('select'));

    (function ($showBtnUp) {
        if (!$showBtnUp.length) {
            return;
        }

        var didScroll;
        var lastScrollTop = 0;
        var delta = 10; // Когда скролл не считается
        var showPos = 60; // when btn is show. offset of top window
        var scrollUp = 'is-nav-up';

        $showBtnUp.click(function () {
            $('body, html').animate({ scrollTop: 0 }, 'slow');
        });

        $(window).scroll(function () {
            // jshint ignore:line
            didScroll = true;
        });

        function hasScrolled() {
            var curPos = $(window).scrollTop();
            if (Math.abs(lastScrollTop - curPos) <= delta) {
                return; // Return the absolute value of a number
            }
            // если упирается вниз, то появляется кнопка
            if (curPos + $(window).height() + showPos >= $(document).height()) {
                $showBtnUp.addClass(scrollUp);
            } else if (curPos > lastScrollTop || curPos < showPos) {
                // Скролл вниз
                $showBtnUp.removeClass(scrollUp);
            } else {
                //Скролл вверх
                if (curPos + $(window).height() < $(document).height()) {
                    $showBtnUp.addClass(scrollUp);
                }
            }
            lastScrollTop = curPos;
        }

        // Функция проверки скроллинга каждые 250ms, уменьшает
        // нагрузку, как если бы при проверки каждого пикселя.
        setInterval(function () {
            if (didScroll) {
                hasScrolled();
                didScroll = false;
            }
        }, 150);

        if ($('body').is(':visible')) {
            $(this).parent().parent().addClass('is-active').parent().parent().addClass('is-active');
            return false;
        }
    })($('.j-show-up'));

    // Убираем ховер у всех элементов во время скролла
    require(['app/disable-hover']);

    // Определяем есть ли скролл для фикса сетки
    (function ($scrollbar) {
        function scrollbarCheck() {
            var hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
            var method = !hasScrollbar ? 'addClass' : 'removeClass';

            $scrollbar[method]('no-scrollbar');
        }

        scrollbarCheck();

        require(['app/utils'], function () {
            $(window).on('resize', $.debounce(300, function () {
                scrollbarCheck();
            }));
        });
    })($('body'));

    return {};
});