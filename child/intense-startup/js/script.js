/**
 * Global variables
 */
"use strict";

var userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $(document),
	$window = $(window),
	$html = $("html"),

	isDesktop = $html.hasClass("desktop"),
	isIE = userAgent.indexOf("msie") != -1 ? parseInt(userAgent.split("msie")[1]) : userAgent.indexOf("trident") != -1 ? 11 : userAgent.indexOf("edge") != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
	isNoviBuilder = false,
	isTouch = "ontouchstart" in window,
	c3ChartsArray = [],

	plugins = {
		pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
		responsiveTabs: $(".responsive-tabs"),
		rdNavbar: $(".rd-navbar"),
		owl: $(".owl-carousel"),
		scroller: $(".scroll-wrap"),
		viewAnimate: $('.animateItem'),
		sectionAnimate: $('.section-animate'),
		materialParallax: $(".parallax-container")
	};

$window.on('load', function () {
	// Material Parallax
	if (plugins.materialParallax.length) {
		if (!isNoviBuilder && !isIE && !isMobile) {
			plugins.materialParallax.parallax();
		} else {
			for (var i = 0; i < plugins.materialParallax.length; i++) {
				var $parallax = $(plugins.materialParallax[i]);

				$parallax.addClass('parallax-disabled');
				$parallax.css({"background-image": 'url(' + $parallax.data("parallax-img") + ')'});
			}
		}
	}
});

/**
 * Initialize All Scripts
 */
$document.ready(function () {
	isNoviBuilder = window.xMode;

	/**
	 * isScrolledIntoView
	 * @description  check the element whas been scrolled into the view
	 */
	function isScrolledIntoView(elem) {
		var $window = $(window);

		if (elem.outerHeight() == 0) {
			return false;
		}

		return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
	}

	/**
	 * addAnimation
	 * @description  add animation on item
	 */
	function addAnimation(item, activeClass) {
		item.addClass(activeClass);
		var delay = item.attr('data-delay') ? item.attr('data-delay') : 0,
			duration = item.attr('data-duration') ? item.attr('data-duration') : 1;
		item.css('animation-name', item.attr('data-animation'));
		item.css('animation-delay', delay + 's');
		item.css('animation-duration', duration + 's');
	}

	/**
	 * animateSection
	 * Create animate effects ob scroll section
	 */
	function animateSection() {
		var scrollTop = $(window).scrollTop(),
			windowHeight = window.innerHeight,
			windowWidth = $(window).width();

		for (var i = 0; i < plugins.sectionAnimate.length; i++) {
			var actualBlock = $(plugins.sectionAnimate[i]),
				childrenDiv = actualBlock.children('div'),
				offset = scrollTop - actualBlock.offset().top;

			var animationValues = setSectionAnimation(offset, windowHeight);

			//Scrollbar
			if (isDesktop) {
				windowWidth += 17;
			}

			if (windowWidth <= 991) {
				animationValues[0] = 0;
				animationValues[1] = 1;
			}

			childrenDiv.velocity({
				translateY: animationValues[0] + 'vh',
				opacity: animationValues[1],
				translateZ: 0,
			}, 0);

			(offset >= 0 && offset < windowHeight) ? actualBlock.addClass('visible') : actualBlock.removeClass('visible');
		}

		requestAnimationFrame(animateSection);
	}

	/**
	 * setSectionAnimation
	 * Calculate translate value for section animate
	 */
	function setSectionAnimation(sectionOffset, windowHeight) {
		// select section animation - normal scroll
		var translateY = 100,
			opacity = 1;

		if (sectionOffset >= -windowHeight && sectionOffset <= 0) {
			// section entering the viewport
			translateY = (-sectionOffset) * 100 / windowHeight;
			opacity = 1;
		} else if (sectionOffset > 0 && sectionOffset <= windowHeight) {
			//section leaving the viewport - still has the '.visible' class
			translateY = 0;
			opacity = 1;
		} else if (sectionOffset < -windowHeight) {
			//section not yet visible
			translateY = 100;
		} else {
			//section not visible anymore
			opacity = 0;
			translateY = 0;
		}
		return [translateY, opacity];
	}

	/**
	 * @desc Initialize owl carousel plugin
	 * @param {object} c - carousel jQuery object
	 */
	function initOwlCarousel(c) {
		var aliaces = ["-", "-xs-", "-sm-", "-md-", "-lg-", "-xl-"],
			values = [0, 480, 768, 992, 1200, 1600],
			responsive = {};

		for (var j = 0; j < values.length; j++) {
			responsive[values[j]] = {};
			for (var k = j; k >= -1; k--) {
				if (!responsive[values[j]]["items"] && c.attr("data" + aliaces[k] + "items")) {
					responsive[values[j]]["items"] = k < 0 ? 1 : parseInt(c.attr("data" + aliaces[k] + "items"), 10);
				}
				if (!responsive[values[j]]["stagePadding"] && responsive[values[j]]["stagePadding"] !== 0 && c.attr("data" + aliaces[k] + "stage-padding")) {
					responsive[values[j]]["stagePadding"] = k < 0 ? 0 : parseInt(c.attr("data" + aliaces[k] + "stage-padding"), 10);
				}
				if (!responsive[values[j]]["margin"] && responsive[values[j]]["margin"] !== 0 && c.attr("data" + aliaces[k] + "margin")) {
					responsive[values[j]]["margin"] = k < 0 ? 30 : parseInt(c.attr("data" + aliaces[k] + "margin"), 10);
				}
			}
		}

		c.owlCarousel({
			autoplay: isNoviBuilder ? false : c.attr("data-autoplay") === "true",
			loop: isNoviBuilder ? false : c.attr("data-loop") !== "false",
			items: 1,
			center: c.attr("data-center") === "true",
			dotsContainer: c.attr("data-pagination-class") || false,
			navContainer: c.attr("data-navigation-class") || false,
			mouseDrag: isNoviBuilder ? false : c.attr("data-mouse-drag") !== "false",
			nav: c.attr("data-nav") === "true",
			dots: (isNoviBuilder && c.attr("data-nav") !== "true") ? true : c.attr("data-dots") === "true",
			dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
			animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
			animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
			responsive: responsive,
			navText: c.attr("data-nav-text") ? $.parseJSON(c.attr("data-nav-text")) : [],
			navClass: c.attr("data-nav-class") ? $.parseJSON(c.attr("data-nav-class")) : ['owl-prev', 'owl-next'],
			onInitialized: function () {
				if (c.attr("data-active")) {
					c.trigger("to.owl.carousel", c.attr("data-active") - 1);
				}

				$(c).next().find('.current-counter').html((this._current + 1));
				c.trigger('resize');

				var length = $(c).find('.owl-item').length,
					activeLength = $(c).find('.active').length,
					slideCount = (length / activeLength) + (activeLength - 1);
				var outputCounter = $(this.$element).attr('data-output-counter');
				$(outputCounter).find('.carousel-count').html(length);
			},
			onTranslate: function () {
				var outputCounter = $(this.$element).attr('data-output-counter');
				$(outputCounter).find('.current-counter').html(this._current + 1);
			},
			onResize: function () {
				var _this = this;

				setTimeout(function () {
					var length = $(_this).find('.owl-item').length,
						activeLength = $(_this).find('.active').length,
						slideCount = (length / activeLength) + (activeLength - 1),
						outputCounter = $(_this).attr('data-output-counter');
					$(outputCounter).find('.carousel-count').html(slideCount);
				}, 200);
			}
		});
	}

	/**
	 * makeUniqueRandom
	 * @description  make random for gallery tabs
	 */
	function makeUniqueRandom(count) {
		if (!uniqueRandoms.length) {
			for (var i = 0; i < count; i++) {
				uniqueRandoms.push(i);
			}
		}
		var index = Math.floor(Math.random() * uniqueRandoms.length);
		var val = uniqueRandoms[index];
		uniqueRandoms.splice(index, 1);
		return val;
	}

	/**
	 * IE Polyfills
	 * @description  Adds some loosing functionality to IE browsers
	 */
	if (isIE) {
		if (isIE < 10) {
			$html.addClass("lt-ie-10");
		}

		if (isIE < 11) {
			if (plugins.pointerEvents) {
				$.getScript(plugins.pointerEvents)
					.done(function () {
						$html.addClass("ie-10");
						PointerEventsPolyfill.initialize({});
					});
			}
		}

		if (isIE === 11) {
			$("html").addClass("ie-11");
		}

		if (isIE === 12) {
			$("html").addClass("ie-edge");
		}
	}

	/**
	 * ViewPort Universal
	 * @description Add class in viewport
	 */
	if (plugins.viewAnimate.length && isDesktop) {
		var i,
			sectionAnimateContet = $('.animate-content'),
			sectionAnimateContetisAnimate = false;

		for (i = 0; i < plugins.viewAnimate.length; i++) {
			var $view = $(plugins.viewAnimate[i]);

			$document.on("scroll", $.proxy(function () {
				var _this = $(this);
				if (!_this.parents('.animate-content').length || sectionAnimateContetisAnimate) {
					if (isScrolledIntoView(_this)) {
						addAnimation(_this, 'animate');
					}
				}

			}, $view))
				.trigger("scroll");
		}


		//Custom animation on fixed section
		if (sectionAnimateContet.length) {
			sectionAnimateContetisAnimate = true;

			$document.on("scroll", function () {
				$window.scrollTop() + $window.height();
				if ($window.scrollTop() + $window.height() / 2 - 100 >= sectionAnimateContet.offset().top) {
					var animateItems = sectionAnimateContet.find('.animateItem');

					for (i = 0; i < animateItems.length; i++) {
						var item = $(animateItems[i]);
						addAnimation(item, 'active-animate');
					}
				}
			});
		}
	}

	/**
	 * Responsive Tabs
	 * @description Enables Responsive Tabs plugin
	 */
	if (plugins.responsiveTabs.length) {
		var i = 0;
		for (i = 0; i < plugins.responsiveTabs.length; i++) {
			var $this = $(plugins.responsiveTabs[i]);
			$this.easyResponsiveTabs({
				type: $this.attr("data-type"),
				tabidentify: $this.find(".resp-tabs-list").attr("data-group") || "tab"
			});
		}
	}


	/**
	 * Owl carousel
	 * @description Enables Owl carousel plugin
	 */
	if (plugins.owl.length) {
		for (var i = 0; i < plugins.owl.length; i++) {
			var c = $(plugins.owl[i]);
			plugins.owl[i] = c;

			//skip owl in bootstrap tabs
			if (!c.parents('.tab-content').length) {
				initOwlCarousel(c);
			}
		}
	}

	/**
	 * RD Navbar
	 * @description Enables RD Navbar plugin
	 */
	if (plugins.rdNavbar.length) {
		var
			navbar = plugins.rdNavbar,
			aliases = {'-': 0, '-sm-': 576, '-md-': 768, '-lg-': 992, '-xl-': 1200, '-xxl-': 1600},
			responsive = {};

		for (var alias in aliases) {
			var link = responsive[aliases[alias]] = {};
			if (navbar.attr('data' + alias + 'layout')) link.layout = navbar.attr('data' + alias + 'layout');
			if (navbar.attr('data' + alias + 'device-layout')) link.deviceLayout = navbar.attr('data' + alias + 'device-layout');
			if (navbar.attr('data' + alias + 'hover-on')) link.focusOnHover = navbar.attr('data' + alias + 'hover-on') === 'true';
			if (navbar.attr('data' + alias + 'auto-height')) link.autoHeight = navbar.attr('data' + alias + 'auto-height') === 'true';
			if (navbar.attr('data' + alias + 'stick-up-offset')) link.stickUpOffset = navbar.attr('data' + alias + 'stick-up-offset');
			if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
			if (isNoviBuilder) link.stickUp = false;
			else if (navbar.attr('data' + alias + 'stick-up')) link.stickUp = navbar.attr('data' + alias + 'stick-up') === 'true';
		}

		plugins.rdNavbar.RDNavbar({
			anchorNav: !isNoviBuilder,
			anchorNavOffset: -120,
			stickUpClone: (plugins.rdNavbar.attr("data-stick-up-clone") && !isNoviBuilder) ? plugins.rdNavbar.attr("data-stick-up-clone") === 'true' : false,
			responsive: responsive,
			callbacks: {
				onStuck: function () {
					var navbarSearch = this.$element.find('.rd-search input');

					if (navbarSearch) {
						navbarSearch.val('').trigger('propertychange');
					}
				},
				onDropdownOver: function () {
					return !isNoviBuilder;
				},
				onUnstuck: function () {
					if (this.$clone === null)
						return;

					var navbarSearch = this.$clone.find('.rd-search input');

					if (navbarSearch) {
						navbarSearch.val('').trigger('propertychange');
						navbarSearch.trigger('blur');
					}

				}
			}
		});
	}

	/**
	 * UI To Top
	 * @description Enables ToTop Button
	 */
	if (isDesktop && !isNoviBuilder) {
		$().UItoTop({
			easingType: 'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		});
	}

	/**
	 * JQuery mousewheel plugin
	 * @description  Enables jquery mousewheel plugin
	 */
	if (plugins.scroller.length) {
		var i;
		for (i = 0; i < plugins.scroller.length; i++) {
			var scrollerItem = $(plugins.scroller[i]);

			scrollerItem.mCustomScrollbar({
				scrollInertia: 0,
				axis: "x",
				theme: "dark-3",
				mouseWheel: {
					enable: false
				},
				callbacks: {
					onInit: function () {

						var _this = scrollerItem;
						setTimeout(function () {
							_this.mCustomScrollbar('scrollTo', '#right-position');
						}, 100);
					}
				},
				advanced: {
					updateOnImageLoad: false,
					autoExpandHorizontalScroll: true,
				}
			})
		}
	}

	/**
	 * Section animate
	 * @description  Enables animate section effect on scroll
	 */
	if (plugins.sectionAnimate.length && !isNoviBuilder) {
		if (isDesktop) {
			requestAnimationFrame(animateSection);
		}

		$(window).resize(function () {
			var windowWidth = $(window).width();

			if (isDesktop) {
				//Scrollbar
				windowWidth += 17;

				if (windowWidth <= 991) {
					plugins.sectionAnimate.removeClass('start');
				} else {
					if (!plugins.sectionAnimate.hasClass('start')) {
						plugins.sectionAnimate.addClass('start');
					}
				}
			}
		}).trigger('resize');
	}
});
