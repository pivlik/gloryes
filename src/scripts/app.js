define('app', ['jquery'], function($) {
    'use strict';

    (function($substrate) {
        if (!$substrate.length) {
            return;
        }

        $(function() {
            require(['apartments/app'], function(app) {
                app.run(window.location.pathname);
            });
        });
    })($('#substrate'));

    (function($forms) {
        if (!$forms.length) {
            return;
        }

        var initForms = function initForms(Form) {
            $forms.each(function() {
                var form = new Form($(this));
                form.init();
            });
        };
        require(['app/form'], initForms);
    })($('form').filter(':not([data-noinit])'));

    //Подключение попапа
    //Так как кнопки с попапом иногда создаются динамически, вешаем на document.click
    $(document).on('click', '.j-popup', function(e) {
        let $popupLink = $(e.target);

        if (!$popupLink.length) {
            return;
        }

        require(['app/popup'], function(Popup) {
            let hash = window.location.hash;
            let popup = new Popup($popupLink);
            popup.initPopup();

            if ($popupLink.attr('href') === hash) {
                popup.showPopup($popupLink);
            }
        });
    });

    // Подключение галерей
    (function($gallerys) {
        if (!$gallerys.length) {
            return;
        }

        require(['app/gallery'], function(Gallery) {
            $gallerys.each(function() {
                return new Gallery($(this));
            });
        });
    })($('.j-gallery'));

    // Подключение галерей со сликом
    (function($gallerysSlick) {
        if (!$gallerysSlick.length) {
            return;
        }

        require(['app/gallery-slick'], function(GallerySlick) {
            $gallerysSlick.each(function() {
                let gallery = new GallerySlick($(this));
                gallery.initGallery();
            });
        });
    })($('.j-gallery-slick'));

    //Анимированный label
    (function($animLabels) {
        if (!$animLabels.length) {
            return;
        }

        require(['app/animated-label'], function(AnimatedLabel) {
            $animLabels.each(function() {
                var label = new AnimatedLabel($(this));
                label.init();
            });
        });
    })($('.j-anim-label'));

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

    // Табы
    (function($tabContainers) {
        if (!$tabContainers.length) {
            return;
        }

        require(['app/tabs'], function(Tabs) {
            $tabContainers.each(function() {
                return new Tabs($(this));
            });
        });
    })($('.j-tabs'));

    //Инициализация карты
    (function($maps) {
        if (!$maps.length) {
            return;
        }

        require(['app/map'], function(Map) {
            $maps.each(function() {
                return new Map($(this));
            });
        });
    })($('.j-map'));

    // Ход строительства
    (function($constructionProgress) {
        if (!$constructionProgress.length) {
            return;
        }

        require(['app/construction-progress'], function(ConstructionsProgress) {
            return new ConstructionsProgress($constructionProgress);
        });
    })($('.j-construction-progress'));

    // Range slider
    (function($sliders) {
        if (!$sliders.length) {
            return;
        }

        require(['app/range-slider'], function(RangeSlider) {
            $sliders.each(function() {
                return new RangeSlider($(this));
            });
        });
    })($('.j-range-sliders'));

    // Страница поиска
    (function($search) {
        if (!$search.length) {
            return;
        }

        require(['app/search-filter'], function(SearchFilter) {
            return new SearchFilter($search);
        });
    })($('.j-search-filter'));

    // Результаты поиска
    (function($searchResult) {
        if (!$searchResult.length) {
            return;
        }

        require(['app/search-result'], function(SearchResult) {
            return new SearchResult($searchResult);
        });
    })($('.j-search-result'));

    // Ипотека
    (function($mortgage) {
        if (!$mortgage.length) {
            return;
        }

        require(['app/mortgage'], function(Mortgage) {
            return new Mortgage($mortgage);
        });
    })($('.j-mortgage'));

    // Таблицы в WYSIWYG
    (function($table) {
        if (!$table.length) {
            return;
        }

        if (!$table.hasClass('b-table')) {
            $table.each(function() {
                $(this).wrap('<div class="b-table__content"></div>')
            })
        }
    })($('.b-typo-reset table'));

    // Избранное
    (function($favorite) {
        if (!$favorite.length) {
            return;
        }

        require(['app/favorite'], function(Favorite) {
            return new Favorite();
        });
    })($('.j-favorite'));

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
