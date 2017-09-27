define('app/disable-hover', ['jquery'], function($) {
    let body = document.body;
    let disableClass = 'disable-hover';
    let timer = null;

    window.addEventListener('scroll', ()=> {
        clearTimeout(timer);

        if (!body.classList.contains(disableClass)) {
            body.classList.add(disableClass);
        }

        timer = setTimeout(() => {
            body.classList.remove(disableClass);
        }, 300);
    }, false);

    return {};
});
