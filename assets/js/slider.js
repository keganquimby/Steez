/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */

;(function ($) {

    $.Sombrero = function(el, options ) {
      this.element = el;
      var slider = $(el),
      options = $.extend( {}, $.Sombrero.defaults, options),
      methods = {},
      defaults = $.Sombrero.defaults,
      images = [],
      slides = [],
      reverse = false,
      touch = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch,
      eventType = (touch) ? "touchend" : "click",
      namespace = options.namespace;
      $.data(el, "sombrero", slider);


      methods = {
        init: function() {
          slider.animating = false;
          slider.slides = $(options.selector, slider);
          slider.count = slider.slides.length;
          slider.currentSlide = options.startAt;
          slider.animatingTo = slider.currentSlide;
          slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
          slider.pagingCount = slider.count;
          slider.currentOffset = 0;

          slider.prop = 0;
          slider.args = {};
          slider.transitions = (function() {
            var obj = document.createElement('div'),
            props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
            for (var i in props) {
              if ( obj.style[ props[i] ] !== undefined ) {
                slider.pfx = props[i].replace('Perspective','').toLowerCase();
                slider.prop = "-" + slider.pfx + "-transform";
                return true;
              }
            }
            return false;
          }());

          slider.containerSelector = options.selector.substr(0,options.selector.search(' '));
          slider.container = $(slider.containerSelector, slider);

          slider.doMath();

          slider.setup();

          methods.controlNav.setup();

          // Keyboard
          if (($(slider.containerSelector).length === 1)) {
            $(document).bind('keyup', function(event) {
              var keycode = event.keyCode;
              if (!slider.animating && (keycode === 39 || keycode === 37)) {
                var target = (keycode === 39) ? slider.getTarget('next') :
                (keycode === 37) ? slider.getTarget('prev') : false;
                slider.flexAnimate(target, false);
              }
            });
          }

          if (touch) methods.touch();
          $(window).bind("resize focus", methods.resize);
          $(slider).bind("click", function(e) {
            var $target = $(e.target);
            if (!$target.is("a")) {
              methods.next();
            }
          });

          setTimeout(function(){
            options.start(slider);
          }, 200);
        },

        next: function() {
          var target = slider.getTarget('next');
          if(target == 0) {
            slider.flexAnimate(0, false);
            return;
          }
          slider.flexAnimate(target, false);
        },

        touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          scrolling = false;
              
        el.addEventListener('touchstart', onTouchStart, false);
        function onTouchStart(e) {
          if (slider.animating) {
            e.preventDefault();
          } else if (e.touches.length === 1) {
            // CAROUSEL: 

            cwidth = slider.w;
            var carousel = true;
            startT = Number(new Date());
            // CAROUSEL:
            offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                     (carousel && reverse) ? slider.limit - (((slider.itemW) * slider.move) * slider.animatingTo) :
                     (carousel && slider.currentSlide === slider.last) ? slider.limit :
                     (carousel) ? ((slider.itemW) * slider.move) * slider.currentSlide : 
                     (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
            startX = e.touches[0].pageX;
            startY = e.touches[0].pageY;

            el.addEventListener('touchmove', onTouchMove, false);
            el.addEventListener('touchend', onTouchEnd, false);
          }
        }

        function onTouchMove(e) {
          dx = startX - e.touches[0].pageX;
          scrolling = (Math.abs(dx) < Math.abs(e.touches[0].pageY - startY));
          
          if (!scrolling || Number(new Date()) - startT > 500) {
            e.preventDefault();
            slider.setProps(offset + dx, "setTouch");
            
          }
        }
        
        function onTouchEnd(e) {

          if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
            var updateDx = (reverse) ? -dx : dx,
                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');
            
            if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
              slider.flexAnimate(target);
            } else {
              slider.flexAnimate(slider.currentSlide, false, true);
            }
          }
          // finish the touch by undoing the touch session
          el.removeEventListener('touchmove', onTouchMove, false);
          el.removeEventListener('touchend', onTouchEnd, false);
          startX = null;
          startY = null;
          dx = null;
          offset = null;
        }
      },
        // Called when viewport resizes
        resize: function() {
          slider.newSlides.css({"width": $(window).width(), "height": $(window).height()});
          slider.itemW = $(window).width();
          slider.doMath();

          // Fix the transform.

          slider.setProps($(window).width()*slider.currentSlide);
        },

        controlNav: {
          setup: function() {
            var type = 'control-paging',
                j = 1,
                item;
            

            slider.controlNavScaffold = $('<ol class="'+ namespace + '-nav ' + namespace + type + '">');
            var titles = [];
            slider.slides.each(function(i) {
              titles.push($(this).find("h2").text());
            });
            if (slider.pagingCount > 1) {
              for (var i = 0; i < slider.pagingCount; i++) {
                slider.controlNavScaffold.append('<li class="slide-'+j+'"></li>');
                j++;
              }
            }
            slider.controlNavScaffold.append('</ol>');
            slider.controlNavScaffold.find("li:first-child").addClass("active");
            
            if (options.navContainer.length > 0) {
              $(options.navContainer).append(slider.controlNavScaffold);
            } else {
              slider.append(slider.controlNavScaffold);
              slider.controlNavScaffold.hide();
            }
            methods.controlNav.set();
            
            methods.controlNav.active();
            
            slider.controlNavScaffold.delegate('li, a', eventType, function(event) {
              event.preventDefault();
              var $this = $(this),
                  target = $(slider.controlNavScaffold).find("li").index($(this));

              if (!$this.hasClass('active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target-1);
                methods.controlNav.update();
              }
            });

            // Prevent iOS click event bug
            if (touch) {
              slider.controlNavScaffold.delegate('a', "click touchstart", function(event) {
                event.preventDefault();
              });
            }
          },
          set: function() {
            slider.controlNav = $('.' + namespace + '-nav li', slider);
          },
          active: function() {
            slider.controlNav.removeClass("active").eq(slider.animatingTo).addClass("active");
          },
          update: function(action, pos) {
            if (slider.pagingCount > 1 && action === "add") {
              slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
            } else if (slider.pagingCount === 1) {
              slider.controlNavScaffold.find('li').remove();
            } else {
              slider.controlNav.eq(pos).closest('li').remove();
            }
            methods.controlNav.active();
          }
      }


      }



      slider.getTarget = function(dir) {
        slider.direction = dir; 
        if (dir === "next") {
          return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
        } else {
          return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
        }
      }
      
      // Method for calculating slide math
      slider.doMath = function(slide) {
        if(typeof(slide)==='undefined') {
          slide = slider.slides.first();
        }
        var slideMargin = 0,
        minItems = 0,
        maxItems = 0;

        slider.w = slider.width();
        slider.h = slider.getHeight();
        slider.itemW = $(document).width();
        slider.boxPadding = slide.outerWidth() - slide.width();



          slider.itemW = slider.w;
          slider.pagingCount = slider.count;
          slider.last = slider.count-1;
        
        slider.computedW = $(window).width();
      }

        //  Binds all together, and set's up the dom
        slider.setup = function() {
          var sliderOffset, arr;

          slider.viewport = $('<div class="' + namespace + '-viewport clearfix"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          slider.viewport.hide();
                slider.cloneCount = 0;
                slider.cloneOffset = 0;
                slider.itemW = $(window).width();

              slider.newSlides = $(options.selector, slider);
              
              sliderOffset = slider.currentSlide + slider.cloneOffset;
              slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
              slider.setProps(sliderOffset * slider.computedW, "init");
              setTimeout(function(){
                slider.setImages();
                slider.doMath();
                slider.newSlides.css({"width": slider.computedW, "height": slider.h, "float": "left"});
                if (false) methods.smoothHeight();
              }, 100);
              

            }

            slider.getHeight = function()
            {
              return $(window).height();
            }

            slider.setImages = function() {

              var preloader = $(".preloader");
              slider.newSlides.each(function() {
                var slide = this;
                var img = $("<img src='"+$(slide).data("image")+"' style='display:none;' />");
                img.on("load", function() {
                  $(slide).css({
                    "background-image":  "url("+$(slide).data("image")+")",
                    "background-size": "cover",
                    "background-position" : "center center",
                    "display": "block",
                  });
                  preloader.hide();
                  slider.viewport.show();
                  slider.controlNavScaffold.show();
                });
                slider.append(img);

                
              });


            }

            slider.canAdvance = function(target, fromNav) {
              var last = slider.last;
              return (fromNav) ? true :
             (slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide) ? false :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
            }

            slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
              if (slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

              if ((!slider.animating && slider.is(":visible")) && !(slider.currentSlide == 0 && target == slider.count-1)) {
                
                slider.animating = true;
                slider.animatingTo = target;

                slider.atEnd = target === 0 || target === slider.last;
                fade = false;     


                if (!fade) {
                  var dimension = slider.slides.filter(':first').width()
                  carousel = true;
                  reverse = false;

                  methods.controlNav.update();

                  if(target == 0 && slider.currentSlide == slider.last) { reverse=true; }

                  if (slider.currentSlide === 0 && target === slider.count - 1 && slider.direction !== "next") {
                    slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
                  } else if (slider.currentSlide === slider.last && target === 0 && slider.direction !== "prev") {

                    slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
                  } else {
                    slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
                  }
                  slider.setProps(slideString, "", options.animationSpeed);
                  if (slider.transitions) {
                    if (!options.animationLoop || !slider.atEnd) {
                      slider.animating = false;
                      slider.currentSlide = slider.animatingTo;
                    }
                    slider.container.unbind("webkitTransitionEnd transitionend");
                    slider.container.bind("webkitTransitionEnd transitionend", function() {
                      slider.wrapup(dimension);
                    });
                  } else {
                    slider.container.animate(slider.args, options.animationSpeed, options.easing, function(){
                      slider.wrapup(dimension);
                    });
                  }
                } else { 
                  slider.slides.eq(slider.currentSlide).fadeOut(options.animationSpeed, options.easing);
                  slider.slides.eq(target).fadeIn(options.animationSpeed, options.easing, slider.wrapup);
                }
                
                if (options.smoothHeight) methods.smoothHeight(options.animationSpeed);
              }
            } 

            slider.wrapup = function(dimension) {
              
              if (!fade) {
                if (slider.currentSlide === 0 && slider.animatingTo === slider.last && options.animationLoop) {
                  slider.setProps(dimension, "jumpEnd");
                } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && options.animationLoop) {
                  slider.setProps(dimension, "jumpStart");
                }
              }
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
              
            }

            slider.setProps = function(pos, special, dur) {
              var target = (function() {
                var posCheck = (pos) ? pos : (slider.itemW * 0) * slider.animatingTo,
                posCalc = (function() {
                  var carousel = true, reverse = true;
                  if (carousel) {
                    return (special === "setTouch") ? pos :
                    (reverse && slider.animatingTo === slider.last) ? 0 :
                    (reverse) ? slider.limit - (((slider.itemW + 0) * slider.move) * slider.animatingTo) :
                    (slider.animatingTo === slider.last) ? slider.limit : posCheck;
                  } else {
                    switch (special) {
                      case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                      case "setTouch": return (reverse) ? pos : pos;
                      case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                      case "jumpStart": return (reverse) ? slider.count * pos : pos;
                      default: return pos;
                    }
                  }
                }());
                slider.currentOffset = pos;
                return (pos*-1) + "px";
              }());


              target = "translate3d("+ target +",0,0)";
              dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
              slider.container.css("-" + slider.pfx + "-transition-duration", dur);
              slider.args[slider.prop] = target;

              if (slider.transitions || dur === undefined) slider.container.css(slider.args);
            }

            methods.init();
          }



    $.Sombrero.defaults = {
      selector: ".slides > div",
      namespace: "sombrero",
      startAt: 0,
      easing: "swing",
      navigation: false,
      navContainer: "",
      animationSpeed: 600,
      slideshowSpeed: 7000,
      animationLoop: false,
      smoothHeight: false,
      start: function() {}
    }

    $.fn.sombrero = function ( options ) {
      if (options === undefined) options = {};

      if (typeof options === "object") {
        return this.each(function() {
          var $this = $(this),
          selector = (options.selector) ? options.selector : ".slides > div",
          $slides = $this.find(selector);

          var $slider = $(this).data('sombrero');


          if ($slides.length === 1) {
            $slides.fadeIn(400);
            if (options.start) options.start($this);
          } else if ($this.data('sombrero') === undefined) {
            new $.Sombrero(this, options);
          }
        });
      }
    }

	var preloader = $(".preloader");
  preloader.css({ "width": $(window).width(), "height": $(window).height()});
	// Init. scaling
	function sizeHeader() {
		var header = $("section#work");
				var padding = $(".slider").height()-header.height();
				padding -= parseInt(header.css("padding-top"), 10) - parseInt(header.css("padding-bottom"), 10); //Total Padding Width
	
				header.css({"padding-bottom" : padding+'px'});
	}
	
	sizeHeader();

	




	$("#slider").sombrero({
		navigation: true,
		start: function() {
			sizeHeader();
		}
	});
	
  })( jQuery, window, document );
  
  
  