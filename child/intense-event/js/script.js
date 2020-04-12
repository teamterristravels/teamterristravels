"use strict";

// Global variables
var
	userAgent = navigator.userAgent.toLowerCase(),
	initialDate = new Date(),

	$document = $( document ),
	$window = $( window ),
	$html = $( "html" ),

	isDesktop = $html.hasClass( "desktop" ),
	isIE = userAgent.indexOf( "msie" ) != -1 ? parseInt( userAgent.split( "msie" )[ 1 ] ) : userAgent.indexOf( "trident" ) != -1 ? 11 : userAgent.indexOf( "edge" ) != -1 ? 12 : false,
	isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test( navigator.userAgent ),
	isNoviBuilder,

	plugins = {
		bootstrapTabs:    $( ".tabs" ),
		responsiveTabs:   $( ".responsive-tabs" ),
		rdInputLabel:     $( ".form-label" ),
		rdNavbar:         $( ".rd-navbar" ),
		regula:           $( "[data-constraints]" ),
		owl:              $( ".owl-carousel" ),
		counter:          $( ".counter" ),
		twitterfeed:      $( ".twitter" ),
		flipClock:        $( ".flipClock" ),
		rdMailForm:       $( ".rd-mailform" ),
		materialParallax: $( ".parallax-container" ),
		copyrightYear:    $( "#copyright-year" )
	};


/**
 * isScrolledIntoView
 * @description  check the element whas been scrolled into the view
 */
function isScrolledIntoView ( elem ) {
	return elem.offset().top + elem.outerHeight() >= $window.scrollTop() && elem.offset().top <= $window.scrollTop() + $window.height();
}

/**
 * attachFormValidator
 * @description  attach form validation to elements
 */
function attachFormValidator ( elements ) {
	for ( var i = 0; i < elements.length; i++ ) {
		var o = $( elements[ i ] ), v;
		o.addClass( "form-control-has-validation" ).after( "<span class='form-validation'></span>" );
		v = o.parent().find( ".form-validation" );
		if ( v.is( ":last-child" ) ) {
			o.addClass( "form-control-last-child" );
		}
	}

	elements
		.on( 'input change propertychange blur', function ( e ) {
			var $this = $( this ), results;

			if ( e.type !== "blur" ) {
				if ( !$this.parent().hasClass( "has-error" ) ) {
					return;
				}
			}

			if ( $this.parents( '.rd-mailform' ).hasClass( 'success' ) ) {
				return;
			}

			if ( (results = $this.regula( 'validate' )).length ) {
				for ( i = 0; i < results.length; i++ ) {
					$this.siblings( ".form-validation" ).text( results[ i ].message ).parent().addClass( "has-error" )
				}
			} else {
				$this.siblings( ".form-validation" ).text( "" ).parent().removeClass( "has-error" )
			}
		} )
		.regula( 'bind' );

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

	for ( var i = 0; i < regularConstraintsMessages.length; i++ ) {
		var regularConstraint = regularConstraintsMessages[ i ];

		regula.override( {
			constraintType: regularConstraint.type,
			defaultMessage: regularConstraint.newMessage
		} );
	}
}

/**
 * isValidated
 * @description  check if all elemnts pass validation
 */
function isValidated ( elements ) {
	var results, errors = 0;

	if ( elements.length ) {
		for ( var j = 0; j < elements.length; j++ ) {

			var $input = $( elements[ j ] );
			if ( (results = $input.regula( 'validate' )).length ) {
				for ( var k = 0; k < results.length; k++ ) {
					errors++;
					$input.siblings( ".form-validation" ).text( results[ k ].message ).parent().addClass( "has-error" );
				}
			} else {
				$input.siblings( ".form-validation" ).text( "" ).parent().removeClass( "has-error" )
			}
		}

		return errors == 0;
	}
	return true;
}


// Initialize scripts that require loaded window
$window.on( 'load', function () {
	// jQuery Count To
	if ( plugins.counter.length ) {
		for ( var i = 0; i < plugins.counter.length; i++ ) {
			var
				counter = $( plugins.counter[ i ] ),
				initCount = function () {
					var counter = $( this );
					if ( !counter.hasClass( "animated-first" ) && isScrolledIntoView( counter ) ) {
						counter.countTo( {
							refreshInterval: 40,
							speed: counter.attr( "data-speed" ) || 1000
						} );
						counter.addClass( 'animated-first' );
					}
				};

			$.proxy( initCount, counter )();
			$window.on( "scroll", $.proxy( initCount, counter ) );
		}
	}
} );


// Initialize scripts that require ready document
$document.ready( function () {
	isNoviBuilder = window.xMode;

	// IE Classes
	if ( isIE ) {
		if ( isIE < 10 ) $html.addClass( "lt-ie-10" );
		if ( isIE < 11 ) $html.addClass( "ie-10" );
		if ( isIE === 11 ) $( "html" ).addClass( "ie-11" );
		if ( isIE >= 12 ) $( "html" ).addClass( "ie-edge" );
	}

	// Copyright Year
	if ( plugins.copyrightYear.length ) {
		plugins.copyrightYear.text( initialDate.getFullYear() );
	}

	// Bootstrap tabs
	if ( plugins.bootstrapTabs.length ) {
		var i;
		for ( i = 0; i < plugins.bootstrapTabs.length; i++ ) {
			var bootstrapTab = $( plugins.bootstrapTabs[ i ] );

			bootstrapTab.on( "click", "a", function ( event ) {
				event.preventDefault();
				$( this ).tab( 'show' );
			} );
		}
	}

	// Responsive Tabs
	if ( plugins.responsiveTabs.length ) {
		var i = 0;
		for ( i = 0; i < plugins.responsiveTabs.length; i++ ) {
			var $this = $( plugins.responsiveTabs[ i ] );
			$this.easyResponsiveTabs( {
				type: $this.attr( "data-type" ),
				closed: true,
				tabidentify: $this.find( ".resp-tabs-list" ).attr( "data-group" ) || "tab"
			} );
		}
	}

	// RD Twitter Feed
	if ( plugins.twitterfeed.length ) {
		var i;
		for ( i = 0; i < plugins.twitterfeed.length; i++ ) {
			var twitterfeedItem = plugins.twitterfeed[ i ];
			$( twitterfeedItem ).RDTwitter( {
				hideReplies: false,
				localTemplate: {
					avatar: "images/features/rd-twitter-post-avatar-48x48.jpg"
				},
				callback: function () {
					$window.trigger( "resize" );
				}
			} );
		}
	}

	// RD Input Label
	if ( plugins.rdInputLabel.length ) {
		plugins.rdInputLabel.RDInputLabel();
	}

	// FlipClock
	if ( plugins.flipClock.length ) {
		var flipItem = plugins.flipClock.FlipClock( {
			clockFace: 'DailyCounter',
			autoStart: false,
			showSeconds: false,
			callbacks: {
				stop: function () {
					console.log( 'The clock has stopped!' );
				}
			}
		} );

		flipItem.setTime( 220880 );
		flipItem.setCountdown( true );
		flipItem.start();
	}

	// Regula
	if ( plugins.regula.length ) {
		attachFormValidator( plugins.regula );
	}

	// WOW
	if ( !isNoviBuilder && $html.hasClass( 'desktop' ) && $html.hasClass( "wow-animation" ) && $( ".wow" ).length ) {
		new WOW().init();
	}

	// Owl carousel
	if ( plugins.owl.length ) {
		for ( var n = 0; n < plugins.owl.length; n++ ) {
			var carousel = $( plugins.owl[ n ] ),
				responsive = {},
				aliaces = [ "-xs-", "-sm-", "-md-", "-lg-", "-xl-", "-xxl-" ],
				values = [ 0, 480, 768, 992, 1200, 1600 ];

			for ( var i = 0; i < values.length; i++ ) {
				responsive[ values[ i ] ] = {};
				for ( var j = i; j >= -1; j-- ) {
					if ( !responsive[ values[ i ] ][ "items" ] && carousel.attr( "data" + aliaces[ j ] + "items" ) ) {
						responsive[ values[ i ] ][ "items" ] = j < 0 ? 1 : parseInt( carousel.attr( "data" + aliaces[ j ] + "items" ) );
					}
					if ( !responsive[ values[ i ] ][ "stagePadding" ] && responsive[ values[ i ] ][ "stagePadding" ] !== 0 && carousel.attr( "data" + aliaces[ j ] + "stage-padding" ) ) {
						responsive[ values[ i ] ][ "stagePadding" ] = j < 0 ? 0 : parseInt( carousel.attr( "data" + aliaces[ j ] + "stage-padding" ) );
					}
					if ( !responsive[ values[ i ] ][ "margin" ] && responsive[ values[ i ] ][ "margin" ] !== 0 && carousel.attr( "data" + aliaces[ j ] + "margin" ) ) {
						responsive[ values[ i ] ][ "margin" ] = j < 0 ? 30 : parseInt( carousel.attr( "data" + aliaces[ j ] + "margin" ) );
					}
					if ( !responsive[ values[ i ] ][ "dotsEach" ] && responsive[ values[ i ] ][ "dotsEach" ] !== 0 && carousel.attr( "data" + aliaces[ j ] + "dots-each" ) ) {
						responsive[ values[ i ] ][ "dotsEach" ] = j < 0 ? false : parseInt( carousel.attr( "data" + aliaces[ j ] + "dots-each" ) );
					}
				}
			}

			// Create custom Pagination
			if ( carousel.attr( 'data-dots-custom' ) ) {
				carousel.on( "initialized.owl.carousel", function ( event ) {
					var carousel = $( event.currentTarget ),
						customPag = $( carousel.attr( "data-dots-custom" ) ),
						active = 0;

					if ( carousel.attr( 'data-active' ) ) {
						active = parseInt( carousel.attr( 'data-active' ) );
					}

					carousel.trigger( 'to.owl.carousel', [ active, 300, true ] );
					customPag.find( "[data-owl-item='" + active + "']" ).addClass( "active" );

					customPag.find( "[data-owl-item]" ).on( 'click', function ( e ) {
						e.preventDefault();
						carousel.trigger( 'to.owl.carousel', [ parseInt( this.getAttribute( "data-owl-item" ) ), 300, true ] );
					} );

					carousel.on( "translate.owl.carousel", function ( event ) {
						customPag.find( ".active" ).removeClass( "active" );
						customPag.find( "[data-owl-item='" + event.item.index + "']" ).addClass( "active" )
					} );
				} );
			}

			// Create custom Navigation
			if ( carousel.attr( 'data-nav-custom' ) ) {
				carousel.on( "initialized.owl.carousel", function ( event ) {
					var carousel = $( event.currentTarget ),
						customNav = $( carousel.attr( "data-nav-custom" ) );

					customNav.find( "[data-owl-prev]" ).on( 'click', function ( e ) {
						e.preventDefault();
						carousel.trigger( 'prev.owl.carousel', [ 300 ] );
					} );

					customNav.find( "[data-owl-next]" ).on( 'click', function ( e ) {
						e.preventDefault();
						carousel.trigger( 'next.owl.carousel', [ 300 ] );
					} );
				} );
			}

			carousel.owlCarousel( {
				autoplay: !isNoviBuilder ? carousel.attr( "data-autoplay" ) === "true" : false,
				loop: !isNoviBuilder ? carousel.attr( "data-loop" ) === "true" : false,
				items: 1,
				autoplaySpeed: 600,
				autoplayTimeout: 3000,
				dotsContainer: carousel.attr( "data-pagination-class" ) || false,
				navContainer: carousel.attr( "data-navigation-class" ) || false,
				mouseDrag: !isNoviBuilder ? carousel.attr( "data-mouse-drag" ) === "true" : false,
				nav: carousel.attr( "data-nav" ) === "true",
				dots: carousel.attr( "data-dots" ) === "true",
				dotsEach: carousel.attr( "data-dots-each" ) ? parseInt( carousel.attr( "data-dots-each" ) ) : false,
				responsive: responsive,
				animateOut: carousel.attr( "data-animation-out" ) || false,
				navText: carousel.attr( "data-nav-text" ) ? $.parseJSON( carousel.attr( "data-nav-text" ) ) : [],
				navClass: carousel.attr( "data-nav-class" ) ? $.parseJSON( carousel.attr( "data-nav-class" ) ) : [ 'owl-prev', 'owl-next' ]
			} );
		}
	}

	// RD Navbar
	if ( plugins.rdNavbar.length ) {
		var
			navbar = plugins.rdNavbar,
			aliases = { '-': 0, '-sm-': 576, '-md-': 768, '-lg-': 992, '-xl-': 1200, '-xxl-': 1600 },
			responsive = {};

		for ( var alias in aliases ) {
			var link = responsive[ aliases[ alias ] ] = {};
			if ( navbar.attr( 'data'+ alias +'layout' ) )          link.layout        = navbar.attr( 'data'+ alias +'layout' );
			else link.layout = 'rd-navbar-fixed';
			if ( navbar.attr( 'data'+ alias +'device-layout' ) )   link.deviceLayout  = navbar.attr( 'data'+ alias +'device-layout' );
			else link.deviceLayout = 'rd-navbar-fixed';
			if ( navbar.attr( 'data'+ alias +'hover-on' ) )        link.focusOnHover  = navbar.attr( 'data'+ alias +'hover-on' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'auto-height' ) )     link.autoHeight    = navbar.attr( 'data'+ alias +'auto-height' ) === 'true';
			else link.autoHeight = false;
			if ( navbar.attr( 'data'+ alias +'stick-up-offset' ) ) link.stickUpOffset = navbar.attr( 'data'+ alias +'stick-up-offset' );
			if ( navbar.attr( 'data'+ alias +'stick-up' ) )        link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
			else link.stickUp = false;
			if ( isNoviBuilder ) link.stickUp = false;
			else if ( navbar.attr( 'data'+ alias +'stick-up' ) )   link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';

			if ( $.isEmptyObject( responsive[ aliases[ alias ] ] ) ) delete responsive[ aliases[ alias ] ];
		}

		navbar.RDNavbar( {
			stickUpClone:    ( !isNoviBuilder && navbar.attr( "data-stick-up-clone" ) ) ? navbar.attr( "data-stick-up-clone" ) === 'true' : false,
			stickUpOffset:   ( navbar.attr( "data-stick-up-offset" ) ) ? navbar.attr( "data-stick-up-offset" ) : 1,
			anchorNavOffset: -78,
			anchorNav:       !isNoviBuilder,
			anchorNavEasing: 'easeOutQuad',
			focusOnHover:    !isNoviBuilder,
			responsive:      responsive,
			onDropdownOver: function () {
				return !isNoviBuilder;
			}
		} );
	}

	// UI To Top
	if ( !isNoviBuilder && isDesktop ) {
		$().UItoTop( {
			easingType: 'easeOutQuart',
			containerClass: 'ui-to-top icon icon-xs icon-circle icon-darker-filled mdi mdi-chevron-up'
		} );
	}

	// RD Mailform
	if ( plugins.rdMailForm.length ) {
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

		for ( i = 0; i < plugins.rdMailForm.length; i++ ) {
			var $form = $( plugins.rdMailForm[ i ] ),
				formHasCaptcha = false;

			$form.attr( 'novalidate', 'novalidate' ).ajaxForm( {
				data: {
					"form-type": $form.attr( "data-form-type" ) || "contact",
					"counter": i
				},
				beforeSubmit: function ( arr, $form, options ) {

					var form = $( plugins.rdMailForm[ this.extraData.counter ] ),
						inputs = form.find( "[data-constraints]" ),
						output = $( "#" + form.attr( "data-form-output" ) ),
						captchaFlag = true;

					output.removeClass( "active error success" );

					if ( isValidated( inputs ) ) {
						form.addClass( 'form-in-process' );

						if ( output.hasClass( "snackbars" ) ) {
							output.html( '<p><span class="icon text-middle fa fa-circle-o-notch fa-spin icon-xxs"></span><span>Sending</span></p>' );
							output.addClass( "active" );
						}
					} else {
						return false;
					}
				},
				error: function ( result ) {

					var output = $( "#" + $( plugins.rdMailForm[ this.extraData.counter ] ).attr( "data-form-output" ) ),
						form = $( plugins.rdMailForm[ this.extraData.counter ] );

					output.text( msg[ result ] );
					form.removeClass( 'form-in-process' );

					if ( formHasCaptcha ) {
						grecaptcha.reset();
					}
				},
				success: function ( result ) {

					var form = $( plugins.rdMailForm[ this.extraData.counter ] ),
						output = $( "#" + form.attr( "data-form-output" ) ),
						select = form.find( 'select' );

					form
						.addClass( 'success' )
						.removeClass( 'form-in-process' );

					if ( formHasCaptcha ) {
						grecaptcha.reset();
					}

					result = result.length === 5 ? result : 'MF255';
					output.text( msg[ result ] );

					if ( result === "MF000" ) {
						if ( output.hasClass( "snackbars" ) ) {
							output.html( '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + msg[ result ] + '</span></p>' );
						} else {
							output.addClass( "active success" );
						}
					} else {
						if ( output.hasClass( "snackbars" ) ) {
							output.html( ' <p class="snackbars-left"><span class="icon icon-xxs mdi mdi-alert-outline text-middle"></span><span>' + msg[ result ] + '</span></p>' );
						} else {
							output.addClass( "active error" );
						}
					}

					form.clearForm();

					if ( select.length ) {
						select.select2( "val", "" );
					}

					form.find( 'input, textarea' ).trigger( 'blur' );

					setTimeout( function () {
						output.removeClass( "active error success" );
						form.removeClass( 'success' );
					}, 3500 );
				}
			} );
		}
	}

	// Material Parallax
	if ( plugins.materialParallax.length ) {
		if ( !isNoviBuilder && !isIE && !isMobile ) {
			plugins.materialParallax.parallax();
		} else {
			for ( var i = 0; i < plugins.materialParallax.length; i++ ) {
				var $parallax = $( plugins.materialParallax[ i ] );

				$parallax.addClass( 'parallax-disabled' );
				$parallax.css( { "background-image": 'url(' + $parallax.data( "parallax-img" ) + ')' } );
			}
		}
	}
} );
