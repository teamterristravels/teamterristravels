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

	plugins = {
		pointerEvents: isIE < 11 ? "js/pointer-events.min.js" : false,
		rdInputLabel: $(".form-label"),
		rdNavbar: $(".rd-navbar"),
		regula: $("[data-constraints]"),
		radio: $("input[type='radio']"),
		checkbox: $(".checkbox-custom"),
		owl: $(".owl-carousel"),
		customWaypoints: $('[data-custom-scroll-to]'),
		pageLoader: $(".page-loader"),
		rdMailForm: $(".rd-mailform"),
		captcha: $('.recaptcha'),
		materialParallax: $(".parallax-container"),
		copyrightYear: $(".copyright-year")
	};

// Initialize scripts that require a loaded window
$window.on('load', function () {
	// Material Parallax
	if ( plugins.materialParallax.length ) {
		if ( !isNoviBuilder && !isIE && !isMobile) {
			plugins.materialParallax.parallax();
		} else {
			for ( var i = 0; i < plugins.materialParallax.length; i++ ) {
				var $parallax = $(plugins.materialParallax[i]);

				$parallax.addClass( 'parallax-disabled' );
				$parallax.css({ "background-image": 'url('+ $parallax.data("parallax-img") +')' });
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

		// Enable custom pagination
		if (c.attr('data-dots-custom')) {
			c.on("initialized.owl.carousel", function (event) {
				var carousel = $(event.currentTarget),
					customPag = $(carousel.attr("data-dots-custom")),
					active = 0;

				if (carousel.attr('data-active')) {
					active = parseInt(carousel.attr('data-active'), 10);
				}

				carousel.trigger('to.owl.carousel', [active, 300, true]);
				customPag.find("[data-owl-item='" + active + "']").addClass("active");

				customPag.find("[data-owl-item]").on('click', function (e) {
					e.preventDefault();
					carousel.trigger('to.owl.carousel', [parseInt(this.getAttribute("data-owl-item"), 10), 300, true]);
				});

				carousel.on("translate.owl.carousel", function (event) {
					customPag.find(".active").removeClass("active");
					customPag.find("[data-owl-item='" + event.item.index + "']").addClass("active")
				});
			});
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
			dots: ( isNoviBuilder && c.attr("data-nav") !== "true" ) ? true : c.attr("data-dots") === "true",
			dotsEach: c.attr("data-dots-each") ? parseInt(c.attr("data-dots-each"), 10) : false,
			animateIn: c.attr('data-animation-in') ? c.attr('data-animation-in') : false,
			animateOut: c.attr('data-animation-out') ? c.attr('data-animation-out') : false,
			responsive: responsive,
			navText: c.attr("data-nav-text") ? $.parseJSON( c.attr("data-nav-text") ) : [],
			navClass: c.attr("data-nav-class") ? $.parseJSON( c.attr("data-nav-class") ) : ['owl-prev', 'owl-next']
		});
	}

	/**
	 * @desc Attach form validation to elements
	 * @param {object} elements - jQuery object
	 */
	function attachFormValidator(elements) {
		// Custom validator - phone number
		regula.custom({
			name: 'PhoneNumber',
			defaultMessage: 'Invalid phone number format',
			validator: function() {
				if ( this.value === '' ) return true;
				else return /^(\+\d)?[0-9\-\(\) ]{5,}$/i.test( this.value );
			}
		});

		for (var i = 0; i < elements.length; i++) {
			var o = $(elements[i]), v;
			o.addClass("form-control-has-validation").after("<span class='form-validation'></span>");
			v = o.parent().find(".form-validation");
			if (v.is(":last-child")) o.addClass("form-control-last-child");
		}

		elements.on('input change propertychange blur', function (e) {
			var $this = $(this), results;

			if (e.type !== "blur") if (!$this.parent().hasClass("has-error")) return;
			if ($this.parents('.rd-mailform').hasClass('success')) return;

			if (( results = $this.regula('validate') ).length) {
				for (i = 0; i < results.length; i++) {
					$this.siblings(".form-validation").text(results[i].message).parent().addClass("has-error");
				}
			} else {
				$this.siblings(".form-validation").text("").parent().removeClass("has-error")
			}
		}).regula('bind');

		var regularConstraintsMessages = [
			{
				type: regula.Constraint.Required,
				newMessage: "The text field is required."
			},
			{
				type: regula.Constraint.Email,
				newMessage: "The email is not a valid email."
			},
			{
				type: regula.Constraint.Numeric,
				newMessage: "Only numbers are required"
			},
			{
				type: regula.Constraint.Selected,
				newMessage: "Please choose an option."
			}
		];


		for (var i = 0; i < regularConstraintsMessages.length; i++) {
			var regularConstraint = regularConstraintsMessages[i];

			regula.override({
				constraintType: regularConstraint.type,
				defaultMessage: regularConstraint.newMessage
			});
		}
	}

	/**
	 * @desc Check if all elements pass validation
	 * @param {object} elements - object of items for validation
	 * @param {object} captcha - captcha object for validation
	 * @return {boolean}
	 */
	function isValidated(elements, captcha) {
		var results, errors = 0;

		if (elements.length) {
			for (var j = 0; j < elements.length; j++) {

				var $input = $(elements[j]);
				if ((results = $input.regula('validate')).length) {
					for (k = 0; k < results.length; k++) {
						errors++;
						$input.siblings(".form-validation").text(results[k].message).parent().addClass("has-error");
					}
				} else {
					$input.siblings(".form-validation").text("").parent().removeClass("has-error")
				}
			}

			if (captcha) {
				if (captcha.length) {
					return validateReCaptcha(captcha) && errors === 0
				}
			}

			return errors === 0;
		}
		return true;
	}

	/**
	 * @desc Validate google reCaptcha
	 * @param {object} captcha - captcha object for validation
	 * @return {boolean}
	 */
	function validateReCaptcha(captcha) {
		var captchaToken = captcha.find('.g-recaptcha-response').val();

		if (captchaToken.length === 0) {
			captcha
				.siblings('.form-validation')
				.html('Please, prove that you are not robot.')
				.addClass('active');
			captcha
				.closest('.form-wrap')
				.addClass('has-error');

			captcha.on('propertychange', function () {
				var $this = $(this),
					captchaToken = $this.find('.g-recaptcha-response').val();

				if (captchaToken.length > 0) {
					$this
						.closest('.form-wrap')
						.removeClass('has-error');
					$this
						.siblings('.form-validation')
						.removeClass('active')
						.html('');
					$this.off('propertychange');
				}
			});

			return false;
		}

		return true;
	}

	/**
	 * @desc Initialize Google reCaptcha
	 */
	window.onloadCaptchaCallback = function () {
		for (var i = 0; i < plugins.captcha.length; i++) {
			var $capthcaItem = $(plugins.captcha[i]);

			grecaptcha.render(
				$capthcaItem.attr('id'),
				{
					sitekey: $capthcaItem.attr('data-sitekey'),
					size: $capthcaItem.attr('data-size') ? $capthcaItem.attr('data-size') : 'normal',
					theme: $capthcaItem.attr('data-theme') ? $capthcaItem.attr('data-theme') : 'light',
					callback: function (e) {
						$('.recaptcha').trigger('propertychange');
					}
				}
			);
			$capthcaItem.after("<span class='form-validation'></span>");
		}
	};

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
	 * Copyright Year
	 * @description  Evaluates correct copyright year
	 */
	if (plugins.copyrightYear.length) {
		plugins.copyrightYear.text(initialDate.getFullYear());
	}

	/**
	 * RD Input Label
	 * @description Enables RD Input Label Plugin
	 */
	if (plugins.rdInputLabel.length) {
		plugins.rdInputLabel.RDInputLabel();
	}

	// Add custom styling options for input[type="radio"]
	if (plugins.radio.length) {
		for (var i = 0; i < plugins.radio.length; i++) {
			$(plugins.radio[i]).addClass("radio-custom").after("<span class='radio-custom-dummy'></span>")
		}
	}

	// Add custom styling options for input[type="checkbox"]
	if (plugins.checkbox.length) {
		for (var i = 0; i < plugins.checkbox.length; i++) {
			$(plugins.checkbox[i]).addClass("checkbox-custom").after("<span class='checkbox-custom-dummy'></span>")
		}
	}

	// Regula
	if (plugins.regula.length) {
		attachFormValidator(plugins.regula);
	}

	/**
	 * WOW
	 * @description Enables Wow animation plugin
	 */
	if ($html.hasClass('desktop') && $html.hasClass("wow-animation") && $(".wow").length && !isNoviBuilder) {
		new WOW().init();
	}

	/**
	 * RD Navbar
	 * @description Enables RD Navbar plugin
	 */
	if ( plugins.rdNavbar.length ) {
		var
			navbar = plugins.rdNavbar,
			aliases = { '-': 0, '-sm-': 576, '-md-': 768, '-lg-': 992, '-xl-': 1200, '-xxl-': 1600 },
			responsive = {};

		for ( var alias in aliases ) {
			var link = responsive[ aliases[ alias ] ] = {};
			if ( navbar.attr( 'data'+ alias +'layout' ) )          link.layout        = navbar.attr( 'data'+ alias +'layout' );
			if ( navbar.attr( 'data'+ alias +'device-layout' ) )   link.deviceLayout  = navbar.attr( 'data'+ alias +'device-layout' );
			if ( navbar.attr( 'data'+ alias +'hover-on' ) )        link.focusOnHover  = navbar.attr( 'data'+ alias +'hover-on' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'auto-height' ) )     link.autoHeight    = navbar.attr( 'data'+ alias +'auto-height' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'stick-up-offset' ) ) link.stickUpOffset = navbar.attr( 'data'+ alias +'stick-up-offset' );
			if ( navbar.attr( 'data'+ alias +'stick-up' ) )        link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
			if ( isNoviBuilder ) link.stickUp = false;
			else if ( navbar.attr( 'data'+ alias +'stick-up' ) )   link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
		}

		plugins.rdNavbar.RDNavbar({
			anchorNav: !isNoviBuilder,
			anchorNavOffset: -120,
			anchorNavEasing: 'linear',
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
	 * Page loader
	 * @description Enables Page loader
	 */
	if (plugins.pageLoader.length > 0) {

		$window.on("load", function () {
			var loader = setTimeout(function () {
				plugins.pageLoader.addClass("loaded");
				$window.trigger("resize");
			}, 200);
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
	 * Google ReCaptcha
	 * @description Enables Google ReCaptcha
	 */
	if (plugins.captcha.length) {
		var i;
		$.getScript("//www.google.com/recaptcha/api.js?onload=onloadCaptchaCallback&render=explicit&hl=en");
	}

	// RD Mailform
	if (plugins.rdMailForm.length) {
		var i, j, k,
			msg = {
				'MF000': 'Successfully sent!',
				'MF001': 'Recipients are not set!',
				'MF002': 'Form will not work locally!',
				'MF003': 'Please, define email field in your form!',
				'MF004': 'Please, define type of your form!',
				'MF254': 'Something went wrong with PHPMailer!',
				'MF255': 'Aw, snap! Something went wrong.'
			};

		for (i = 0; i < plugins.rdMailForm.length; i++) {
			var $form = $(plugins.rdMailForm[i]),
				formHasCaptcha = false;

			$form.attr('novalidate', 'novalidate').ajaxForm({
				data: {
					"form-type": $form.attr("data-form-type") || "contact",
					"counter": i
				},
				beforeSubmit: function (arr, $form, options) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						inputs = form.find("[data-constraints]"),
						output = $("#" + form.attr("data-form-output")),
						captcha = form.find('.recaptcha'),
						captchaFlag = true;

					output.removeClass("active error success");

					if (isValidated(inputs, captcha)) {

						// veify reCaptcha
						if (captcha.length) {
							var captchaToken = captcha.find('.g-recaptcha-response').val(),
								captchaMsg = {
									'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
									'CPT002': 'Something wrong with google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax({
								method: "POST",
								url: "bat/reCaptcha.php",
								data: {'g-recaptcha-response': captchaToken},
								async: false
							})
								.done(function (responceCode) {
									if (responceCode !== 'CPT000') {
										if (output.hasClass("snackbars")) {
											output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[responceCode] + '</span></p>')

											setTimeout(function () {
												output.removeClass("active");
											}, 3500);

											captchaFlag = false;
										} else {
											output.html(captchaMsg[responceCode]);
										}

										output.addClass("active");
									}
								});
						}

						if (!captchaFlag) {
							return false;
						}

						form.addClass('form-in-process');

						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>');
							output.addClass("active");
						}
					} else {
						return false;
					}
				},
				error: function (result) {
					if (isNoviBuilder)
						return;

					var output = $("#" + $(plugins.rdMailForm[this.extraData.counter]).attr("data-form-output")),
						form = $(plugins.rdMailForm[this.extraData.counter]);

					output.text(msg[result]);
					form.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}
				},
				success: function (result) {
					if (isNoviBuilder)
						return;

					var form = $(plugins.rdMailForm[this.extraData.counter]),
						output = $("#" + form.attr("data-form-output")),
						select = form.find('select');

					form
						.addClass('success')
						.removeClass('form-in-process');

					if (formHasCaptcha) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text(msg[result]);

					if (result === "MF000") {
						if (output.hasClass("snackbars")) {
							output.html('<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active success");
						}
					} else {
						if (output.hasClass("snackbars")) {
							output.html(' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[result] + '</span></p>');
						} else {
							output.addClass("active error");
						}
					}

					form.clearForm();

					if (select.length) {
						select.select2("val", "");
					}

					form.find('input, textarea').trigger('blur');

					setTimeout(function () {
						output.removeClass("active error success");
						form.removeClass('success');
					}, 3500);
				}
			});
		}
	}

	/**
	 * Custom Waypoints
	 */
	if (plugins.customWaypoints.length) {
		var i;
		$document.delegate("[data-custom-scroll-to]", "click", function (e) {
			e.preventDefault();
			$("body, html").stop().animate({
				scrollTop: $("#" + $(this).attr('data-custom-scroll-to')).offset().top
			}, 1000, function () {
				$(window).trigger("resize");
			});
		});
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
});
