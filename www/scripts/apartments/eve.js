"use strict";define("apartments/eve",["eve","./config"],function(i,t){return i.on("raphael.event.mouseenter",function(){this.attr({fill:this.data("color-end"),opacity:this.data("opacity")||.3}),this.stop().animate({fill:this.data("color-end"),opacity:1,easing:"easeIn"},t.visualStyles.speedAnimIn)}),i.on("raphael.event.mouseleave",function(){this.stop().animate({fill:this.data("color-start"),opacity:this.data("opacity"),easing:"easeOut"},t.visualStyles.speedAnimOut)}),i.on("buildings.highlight",function(i,e){this.stop().animate({fill:i,opacity:e},t.visualStyles.speedAnimInHighlight)}),i.on("buildings.highlightFilter_enter",function(){this.stop().animate({fill:t.visualStyles.colorEnd,opacity:1},t.visualStyles.speedAnimInHighlight)}),i.on("buildings.highlightFilter_leave",function(){this.stop().animate({fill:t.visualStyles.colorHighlight,opacity:1},t.visualStyles.speedAnimInHighlight)}),i});
//# sourceMappingURL=../sourcemaps/apartments/eve.js.map