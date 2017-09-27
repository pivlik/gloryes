"use strict";define("app/disable-hover",["jquery"],function(e){var s=document.body,i=null;return window.addEventListener("scroll",function(){clearTimeout(i),s.classList.contains("disable-hover")||s.classList.add("disable-hover"),i=setTimeout(function(){s.classList.remove("disable-hover")},300)},!1),{}});
//# sourceMappingURL=../sourcemaps/app/disable-hover.js.map
