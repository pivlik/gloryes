define('app', ['jquery', 'slick-carousel','magnific-popup' ], function($) {
    'use strict';


/// ПАША ДЕЛАЙ ПО АНАЛОГИИ
    (function ($toggler) {  // ТУТ МЫ ИНИЦИАЛИЗИРУЕМ ПЕРЕ
        if (!($toggler.length)) {
            return;
        }
        $($toggler).on('click', function () {
            $(this).toggleClass('active');
            $('.j-navigation').toggleClass('active');
        });
    })('.j-hamburger');


// СЛАЙДЕРЫ...............
    (function ($mygallery) {
        if (!$mygallery.length) {
            return;
        }
        $($mygallery).slick({
            autoplay: true,
            autoplaySpeed: 5500,
            dots: true,
            arrows: true,
            responsive: [
                {
            breakpoint: 1024,
            settings: {
                arrows: false
            }
        }]});
    })('.j-slick');
    (function ($partners) {
        // ТУТ МЫ ИНИЦИАЛИЗИРУЕМ ПЕРЕ
        if (!$partners.length) {
            return;
        }
        $($partners).slick({
            autoplay: true,
            autoplaySpeed: 5500,
            arrows: true,
            infinite: true,
            slidesToShow: 6,
            slidesToScroll: 2,
            responsive: [
                {
                    breakpoint: 768,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 1,
                        arrows: false,
                        dots: true
                    }
                },
                {
                    breakpoint: 1280,
                    settings: {
                        slidesToShow: 4,
                        slidesToScroll: 1
                    }
                },
                ]});
    })('.j-slick-partners');

    (function ($NavSlick) {
        if (!$NavSlick.length) {
            return;
        }
        $('.j-nav-main-slick').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.j-nav-little-slick'
        });
        $('.j-nav-little-slick').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: '.j-nav-main-slick',
            dots: false,
            arrows: false,
            centerMode: true,
            focusOnSelect: true,
            vertical: true
        });
    })('.j-nav-slick');

    function buildHeaderSlick($HeaderSlick) {
        if (!$HeaderSlick.length) {
            return;
        }
        $($HeaderSlick).slick({
            arrows: true,
            slidesToShow: 2,
        });
    };

    //ТАБЫ...................
    (function ($ReviewsTabs) {
        if (!($ReviewsTabs.length)) {
            return;
        }
        $('.tabgroup > div').hide();
        $('.tabgroup > div:first-of-type').show();
        $('.tabs a').click(function(e){
            e.preventDefault();
            var $this = $(this),
                tabgroup = '#'+$this.parents('.tabs').data('tabgroup'),
                others = $this.closest('li').siblings().children('a'),
                target = $this.attr('href');
            others.removeClass('active');
            $this.addClass('active');
            $(tabgroup).children('div').hide();
            $(target).show();

        })
    })('.b-reviews__tabs');

    // МЕНЮ выпадающее.............................................
    (function ($DropMenu) {
        if (!($DropMenu.length)) {
            return;
        }
        $('.j-drop-menu').click(function() {
            $( ".b-show-element" ).slideToggle( "duration: 200" );
            $( ".b-show-msk-element" ).slideUp( "duration: 200" );
            $( ".b-show-spb-element" ).slideUp( "duration: 200" );
            $( ".b-show-rus-element" ).slideUp( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-main-title');
    (function ($DropMenuKz) {
        if (!($DropMenuKz.length)) {
            return;
        }
        $('.j-kz-drop-menu').click(function() {
            $( ".b-kz-show-element" ).slideToggle( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-kz-title');
    (function ($DropMenuWorld) {
        if (!($DropMenuWorld.length)) {
            return;
        }
        $('.j-world-drop-menu').click(function() {
            $( ".b-world-show-element" ).slideToggle( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-world-title');
    (function ($DropMenuX) {
        if (!($DropMenuX.length)) {
            return;
        }
        $('.j-drop-msk-menu').click(function() {
            $( ".b-show-msk-element" ).slideToggle( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-msk-title');
    (function ($DropMenuSp) {
        if (!($DropMenuSp.length)) {
            return;
        }
        $('.j-drop-spb-menu').click(function() {
            $( ".b-show-spb-element" ).slideToggle( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-spb-title');
    (function ($DropMenuRus) {
        if (!($DropMenuRus.length)) {
            return;
        }
        $('.j-drop-rus-menu').click(function() {
            $( ".b-show-rus-element" ).slideToggle( "duration: 200" );
            $(this).toggleClass("active");
        })
    })('.b-delivery__tab-rus-title');
    (function ($DropMenuFAQ) {
        if (!$DropMenuFAQ.length) {
            return;
        }
        $($DropMenuFAQ).on('click', function () {
            $(this).next().slideToggle("duration: 200");
            $(this).toggleClass("active");
        });
    })('.b-faq__list-li');
    (function ($DropMenuHeader) {
        if (!$DropMenuHeader.length) {
            return;
        }
        $($DropMenuHeader).on('click', function () {
            if ($(this).hasClass('active')) {
                $(this).next('.b-header__drop-menu').slideUp("duration: 200");
                $(this).removeClass("active");
            } else {
                $('.b-header__site-sections_navigations-items').not(this).removeClass('active');
                $('.b-header__site-sections_navigations-items').not(this).next('.b-header__drop-menu').slideUp();
                $(this).next('.b-header__drop-menu').slideDown("duration: 200");
                $(this).addClass("active");
                var slickContainer = $(this).next('.b-header__drop-menu').find('.j-slick-header');
                if (!(slickContainer.hasClass('slick-initialized'))) {
                    buildHeaderSlick($(this).next('.b-header__drop-menu').find('.j-slick-header'));
                }
            }
        });
    })('.b-header__site-sections_navigations-items');
    (function ($HideHeader) {
        if (!$HideHeader.length) {
            return;
        }
        $($HideHeader).on('click', function () {
            $('.b-header__city-hide').hide("duration: 100");
        });
    })('.b-header__city-choice-close');
    (function ($ShowHeader) {
        if (!$ShowHeader.length) {
            return;
        }
        $($ShowHeader).on('click', function () {
            $('.b-header__city-hide').show("duration: 100");
        });
    })('.b-header__city-show');

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



    //Увеличение выбранной картинки.................................
    (function ($ImageZoom) {
        if (!($ImageZoom.length)) {
            return;
        }
        $($ImageZoom).magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            image: {
                verticalFit: false
            }
        });
    })('.image-popup-fit-width');

    $(document).ready(function() {
        $('.popup-with-zoom-anim').magnificPopup({
            type: 'inline',

            fixedContentPos: false,
            fixedBgPos: true,

            overflowY: 'auto',

            closeBtnInside: true,
            preloader: false,

            midClick: true,
            removalDelay: 300,
            mainClass: 'my-mfp-zoom-in'
        });
    });
    // Стилизация селекта
    (function($selects) {
        if (!$selects.length) {
            return;
        }

        require(['select'], function() {
            $selects.each(function() {
                var $select = $(this);
                $select.selectric({
                    disableOnMobile: false
                });
            });
        });
    })($('select'));

    (function($showBtnUp) {
        if (!$showBtnUp.length) {
            return;
        }

        var didScroll;
        var lastScrollTop = 0;
        var delta         = 10; // Когда скролл не считается
        var showPos       = 60; // when btn is show. offset of top window
        var scrollUp      = 'is-nav-up';

        $showBtnUp.click(function() {
            $('body, html').animate({scrollTop: 0}, 'slow');
        });

        $(window).scroll(function() { // jshint ignore:line
            didScroll = true;
        });

        function hasScrolled() {
            var curPos = $(window).scrollTop();
            if (Math.abs(lastScrollTop -
                    curPos) <= delta) {
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
        setInterval(function() {
            if (didScroll) {
                hasScrolled();
                didScroll = false;
            }
        }, 150);

        if ($('body').is(':visible')) {
            $(this)
                .parent()
                .parent()
                .addClass('is-active')
                .parent()
                .parent()
                .addClass('is-active')
            return false;
        }
    })($('.j-show-up'));

    // Убираем ховер у всех элементов во время скролла
    require(['app/disable-hover']);

    // Определяем есть ли скролл для фикса сетки
    (function ($scrollbar) {
        function scrollbarCheck() {
            let hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
            let method       =  !hasScrollbar ? 'addClass' : 'removeClass';

            $scrollbar[method]('no-scrollbar');
        }

        scrollbarCheck();

        require(['app/utils'], function() {
            $(window).on('resize', $.debounce(300, () => {
                scrollbarCheck();
            }));
        });
    })($('body'));

    return {};
});
