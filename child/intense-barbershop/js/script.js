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
	isTouch = "ontouchstart" in window,
	perspectiveMenu = $( '#perspective' ),
	isNoviBuilder,

	plugins = {
		bootstrapTooltip:     $( "[data-toggle='tooltip']" ),
		bootstrapModalDialog: $( '.modal' ),
		bootstrapTabs:        $( ".tabs" ),
		rdNavbar:             $( ".rd-navbar" ),
		rdMailForm:           $( ".rd-mailform" ),
		rdInputLabel:         $( ".form-label" ),
		regula:               $( "[data-constraints]" ),
		owl:                  $( ".owl-carousel" ),
		isotope:              $( ".isotope-wrap" ),
		radio:                $( "input[type='radio']" ),
		checkbox:             $( "input[type='checkbox']" ),
		customToggle:         $( "[data-custom-toggle]" ),
		selectFilter:         $( "select" ),
		slick:                $( '.slick-slider' ),
		stepper:              $( "input[type='number']" ),
		materialTabs:         $( '.rd-material-tabs' ),
		maps:                 $( '.google-map-container' ),
		wow:                  $( '.wow' ),
		pageWrapper:          $( "#wrapper" ),
		copyrightYear:        $( "#copyright-year" ),
		counter:              document.querySelectorAll( '.counter' ),
		progressLinear:       document.querySelectorAll( '.progress-linear' ),
		progressCircle:       document.querySelectorAll( '.progress-circle' )
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
function isValidated ( elements, captcha ) {
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

		if ( captcha ) {
			if ( captcha.length ) {
				return validateReCaptcha( captcha ) && errors == 0
			}
		}

		return errors == 0;
	}
	return true;
}

/**
 * validateReCaptcha
 * @description  validate google reCaptcha
 */
function validateReCaptcha ( captcha ) {
	var captchaToken = captcha.find( '.g-recaptcha-response' ).val();

	if ( captchaToken.length === 0 ) {
		captcha
			.siblings( '.form-validation' )
			.html( 'Please, prove that you are not robot.' )
			.addClass( 'active' );
		captcha
			.closest( '.form-group' )
			.addClass( 'has-error' );

		captcha.on( 'propertychange', function () {
			var $this = $( this ),
				captchaToken = $this.find( '.g-recaptcha-response' ).val();

			if ( captchaToken.length > 0 ) {
				$this
					.closest( '.form-group' )
					.removeClass( 'has-error' );
				$this
					.siblings( '.form-validation' )
					.removeClass( 'active' )
					.html( '' );
				$this.off( 'propertychange' );
			}
		} );

		return false;
	}

	return true;
}

/**
 * onloadCaptchaCallback
 * @description  init google reCaptcha
 */
window.onloadCaptchaCallback = function () {
	for ( i = 0; i < plugins.captcha.length; i++ ) {
		var $capthcaItem = $( plugins.captcha[ i ] );

		grecaptcha.render(
			$capthcaItem.attr( 'id' ),
			{
				sitekey: $capthcaItem.attr( 'data-sitekey' ),
				size: $capthcaItem.attr( 'data-size' ) ? $capthcaItem.attr( 'data-size' ) : 'normal',
				theme: $capthcaItem.attr( 'data-theme' ) ? $capthcaItem.attr( 'data-theme' ) : 'light',
				callback: function ( e ) {
					$( '.recaptcha' ).trigger( 'propertychange' );
				}
			}
		);
		$capthcaItem.after( "<span class='form-validation'></span>" );
	}
};

/**
 * Init Bootstrap tooltip
 * @description  calls a function when need to init bootstrap tooltips
 */
function initBootstrapTooltip ( tooltipPlacement ) {
	if ( window.innerWidth < 599 ) {
		plugins.bootstrapTooltip.tooltip( 'destroy' );
		plugins.bootstrapTooltip.tooltip( {
			placement: 'bottom'
		} );
	} else {
		plugins.bootstrapTooltip.tooltip( 'destroy' );
		plugins.bootstrapTooltip.tooltipPlacement;
		plugins.bootstrapTooltip.tooltip();
	}
}

/**
 * @desc Google map function for getting latitude and longitude
 */
function getLatLngObject(str, marker, map, callback) {
	var coordinates = {};
	try {
		coordinates = JSON.parse(str);
		callback(new google.maps.LatLng(
			coordinates.lat,
			coordinates.lng
		), marker, map)
	} catch (e) {
		map.geocoder.geocode({'address': str}, function (results, status) {
			if (status === google.maps.GeocoderStatus.OK) {
				var latitude = results[0].geometry.location.lat();
				var longitude = results[0].geometry.location.lng();

				callback(new google.maps.LatLng(
					parseFloat(latitude),
					parseFloat(longitude)
				), marker, map)
			}
		})
	}
}

/**
 * @desc Initialize Google maps
 */
function initMaps() {
	var key;

	for ( var i = 0; i < plugins.maps.length; i++ ) {
		if ( plugins.maps[i].hasAttribute( "data-key" ) ) {
			key = plugins.maps[i].getAttribute( "data-key" );
			break;
		}
	}

	$.getScript('//maps.google.com/maps/api/js?'+ ( key ? 'key='+ key + '&' : '' ) +'sensor=false&libraries=geometry,places&v=quarterly', function () {
		var head = document.getElementsByTagName('head')[0],
			insertBefore = head.insertBefore;

		head.insertBefore = function (newElement, referenceElement) {
			if (newElement.href && newElement.href.indexOf('//fonts.googleapis.com/css?family=Roboto') !== -1 || newElement.innerHTML.indexOf('gm-style') !== -1) {
				return;
			}
			insertBefore.call(head, newElement, referenceElement);
		};
		var geocoder = new google.maps.Geocoder;
		for (var i = 0; i < plugins.maps.length; i++) {
			var zoom = parseInt(plugins.maps[i].getAttribute("data-zoom"), 10) || 11;
			var styles = plugins.maps[i].hasAttribute('data-styles') ? JSON.parse(plugins.maps[i].getAttribute("data-styles")) : [];
			var center = plugins.maps[i].getAttribute("data-center") || "New York";

			// Initialize map
			var map = new google.maps.Map(plugins.maps[i].querySelectorAll(".google-map")[0], {
				zoom: zoom,
				styles: styles,
				scrollwheel: false,
				center: {lat: 0, lng: 0}
			});

			// Add map object to map node
			plugins.maps[i].map = map;
			plugins.maps[i].geocoder = geocoder;
			plugins.maps[i].keySupported = true;
			plugins.maps[i].google = google;

			// Get Center coordinates from attribute
			getLatLngObject(center, null, plugins.maps[i], function (location, markerElement, mapElement) {
				mapElement.map.setCenter(location);
			});

			// Add markers from google-map-markers array
			var markerItems = plugins.maps[i].querySelectorAll(".google-map-markers li");

			if (markerItems.length){
				var markers = [];
				for (var j = 0; j < markerItems.length; j++){
					var markerElement = markerItems[j];
					getLatLngObject(markerElement.getAttribute("data-location"), markerElement, plugins.maps[i], function(location, markerElement, mapElement){
						var icon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
						var activeIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active");
						var info = markerElement.getAttribute("data-description") || "";
						var infoWindow = new google.maps.InfoWindow({
							content: info
						});
						markerElement.infoWindow = infoWindow;
						var markerData = {
							position: location,
							map: mapElement.map
						}
						if (icon){
							markerData.icon = icon;
						}
						var marker = new google.maps.Marker(markerData);
						markerElement.gmarker = marker;
						markers.push({markerElement: markerElement, infoWindow: infoWindow});
						marker.isActive = false;
						// Handle infoWindow close click
						google.maps.event.addListener(infoWindow,'closeclick',(function(markerElement, mapElement){
							var markerIcon = null;
							markerElement.gmarker.isActive = false;
							markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon");
							markerElement.gmarker.setIcon(markerIcon);
						}).bind(this, markerElement, mapElement));


						// Set marker active on Click and open infoWindow
						google.maps.event.addListener(marker, 'click', (function(markerElement, mapElement) {
							if (markerElement.infoWindow.getContent().length === 0) return;
							var gMarker, currentMarker = markerElement.gmarker, currentInfoWindow;
							for (var k =0; k < markers.length; k++){
								var markerIcon;
								if (markers[k].markerElement === markerElement){
									currentInfoWindow = markers[k].infoWindow;
								}
								gMarker = markers[k].markerElement.gmarker;
								if (gMarker.isActive && markers[k].markerElement !== markerElement){
									gMarker.isActive = false;
									markerIcon = markers[k].markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")
									gMarker.setIcon(markerIcon);
									markers[k].infoWindow.close();
								}
							}

							currentMarker.isActive = !currentMarker.isActive;
							if (currentMarker.isActive) {
								if (markerIcon = markerElement.getAttribute("data-icon-active") || mapElement.getAttribute("data-icon-active")){
									currentMarker.setIcon(markerIcon);
								}

								currentInfoWindow.open(map, marker);
							}else{
								if (markerIcon = markerElement.getAttribute("data-icon") || mapElement.getAttribute("data-icon")){
									currentMarker.setIcon(markerIcon);
								}
								currentInfoWindow.close();
							}
						}).bind(this, markerElement, mapElement))
					})
				}
			}
		}
	});
}

/**
 * @desc Initialize owl carousel plugin
 * @param {object} carousel - carousel jQuery object
 */
function initOwlCarousel ( carousel ) {
	var
		aliaces = [ '-', '-xs-', '-sm-', '-md-', '-lg-', '-xl-' ],
		values = [ 0, 480, 768, 992, 1200, 1600 ],
		responsive = {};

	for ( var j = 0; j < values.length; j++ ) {
		responsive[ values[ j ] ] = {};
		for ( var k = j; k >= -1; k-- ) {
			if ( !responsive[ values[ j ] ][ 'items' ] && carousel.attr( 'data' + aliaces[ k ] + 'items' ) ) {
				responsive[ values[ j ] ][ 'items' ] = k < 0 ? 1 : parseInt( carousel.attr( 'data' + aliaces[ k ] + 'items' ), 10 );
			}
			if ( !responsive[ values[ j ] ][ 'stagePadding' ] && responsive[ values[ j ] ][ 'stagePadding' ] !== 0 && carousel.attr( 'data' + aliaces[ k ] + 'stage-padding' ) ) {
				responsive[ values[ j ] ][ 'stagePadding' ] = k < 0 ? 0 : parseInt( carousel.attr( 'data' + aliaces[ k ] + 'stage-padding' ), 10 );
			}
			if ( !responsive[ values[ j ] ][ 'margin' ] && responsive[ values[ j ] ][ 'margin' ] !== 0 && carousel.attr( 'data' + aliaces[ k ] + 'margin' ) ) {
				responsive[ values[ j ] ][ 'margin' ] = k < 0 ? 30 : parseInt( carousel.attr( 'data' + aliaces[ k ] + 'margin' ), 10 );
			}
		}
	}

	// Enable custom pagination
	if ( carousel.attr( 'data-dots-custom' ) ) {
		carousel.on( 'initialized.owl.carousel', function ( event ) {
			var
				carousel = $( event.currentTarget ),
				customPag = $( carousel.attr( 'data-dots-custom' ) ),
				active = 0;

			if ( carousel.attr( 'data-active' ) ) {
				active = parseInt( carousel.attr( 'data-active' ), 10 );
			}

			carousel.trigger( 'to.owl.carousel', [ active, 300, true ] );
			customPag.find( '[data-owl-item="' + active + '"]' ).addClass( 'active' );

			customPag.find( '[data-owl-item]' ).on( 'click', function ( event ) {
				event.preventDefault();
				carousel.trigger( 'to.owl.carousel', [ parseInt( this.getAttribute( 'data-owl-item' ), 10 ), 300, true ] );
			} );

			carousel.on( 'translate.owl.carousel', function ( event ) {
				customPag.find( '.active' ).removeClass( 'active' );
				customPag.find( '[data-owl-item="' + event.item.index + '"]' ).addClass( 'active' )
			} );
		} );
	}

	carousel.owlCarousel( {
		autoplay:           isNoviBuilder ? false : carousel.attr( 'data-autoplay' ) !== 'false',
		autoplayTimeout:    carousel.attr( "data-autoplay" ) ? Number( carousel.attr( "data-autoplay" ) ) : 3000,
		autoplayHoverPause: true,
		loop:               isNoviBuilder ? false : carousel.attr( 'data-loop' ) !== 'false',
		items:              1,
		center:             carousel.attr( 'data-center' ) === 'true',
		dotsContainer:      carousel.attr( 'data-pagination-class' ) || false,
		navContainer:       carousel.attr( 'data-navigation-class' ) || false,
		mouseDrag:          isNoviBuilder ? false : carousel.attr( 'data-mouse-drag' ) !== 'false',
		nav:                carousel.attr( 'data-nav' ) === 'true',
		dots:               carousel.attr( 'data-dots' ) === 'true',
		dotsEach:           carousel.attr( 'data-dots-each' ) ? parseInt( carousel.attr( 'data-dots-each' ), 10 ) : false,
		animateIn:          carousel.attr( 'data-animation-in' ) ? carousel.attr( 'data-animation-in' ) : false,
		animateOut:         carousel.attr( 'data-animation-out' ) ? carousel.attr( 'data-animation-out' ) : false,
		responsive:         responsive,
		navText:            carousel.attr( 'data-nav-text' ) ? $.parseJSON( carousel.attr( 'data-nav-text' ) ) : [],
		navClass:           carousel.attr( 'data-nav-class' ) ? $.parseJSON( carousel.attr( 'data-nav-class' ) ) : [ 'owl-prev', 'owl-next' ]
	} );
}


// Initialize All Scripts
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

	// Bootstrap Tooltips
	if ( plugins.bootstrapTooltip.length ) {
		var resizeHandler = initBootstrapTooltip.bind( null, plugins.bootstrapTooltip.attr( 'data-placement' ) );

		resizeHandler();
		$( window ).on( 'resize orientationchange', resizeHandler );
	}

	// bootstrapModalDialog
	if ( plugins.bootstrapModalDialog.length > 0 ) {
		for ( var i = 0; i < plugins.bootstrapModalDialog.length; i++ ) {
			var modalItem = $( plugins.bootstrapModalDialog[ i ] );

			modalItem.on( 'hidden.bs.modal', $.proxy( function () {
				var activeModal = $( this ),
					rdVideoInside = activeModal.find( 'video' ),
					youTubeVideoInside = activeModal.find( 'iframe' );

				if ( rdVideoInside.length ) {
					rdVideoInside[ 0 ].pause();
				}

				if ( youTubeVideoInside.length ) {
					var videoUrl = youTubeVideoInside.attr( 'src' );

					youTubeVideoInside
						.attr( 'src', '' )
						.attr( 'src', videoUrl );
				}
			}, modalItem ) )
		}
	}

	// Google maps
	if( plugins.maps.length ) {
		initMaps();
	}

	// Radio
	if ( plugins.radio.length ) {
		var i;
		for ( i = 0; i < plugins.radio.length; i++ ) {
			var $this = $( plugins.radio[ i ] );
			$this.addClass( "radio-custom" ).after( "<span class='radio-custom-dummy'></span>" )
		}
	}

	// Checkbox
	if ( plugins.checkbox.length ) {
		var i;
		for ( i = 0; i < plugins.checkbox.length; i++ ) {
			var $this = $( plugins.checkbox[ i ] );
			$this.addClass( "checkbox-custom" ).after( "<span class='checkbox-custom-dummy'></span>" )
		}
	}

	// RD Navbar
	if ( plugins.rdNavbar.length ) {
		var
			navbar = plugins.rdNavbar,
			aliases = { '-': 0,  '-xs-': 480,  '-sm-': 768,  '-md-': 992,  '-lg-': 1200 },
			responsive = {};

		for ( var alias in aliases ) {
			var link = responsive[ aliases[ alias ] ] = {};
			if ( navbar.attr( 'data'+ alias +'layout' ) )          link.layout        = navbar.attr( 'data'+ alias +'layout' );
			else link.layout = 'rd-navbar-fixed';
			if ( navbar.attr( 'data'+ alias +'device-layout' ) )   link.deviceLayout  = navbar.attr( 'data'+ alias +'device-layout' );
			else link.deviceLayout = 'rd-navbar-fixed';
			if ( navbar.attr( 'data'+ alias +'hover-on' ) )        link.focusOnHover  = navbar.attr( 'data'+ alias +'hover-on' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'auto-height' ) )     link.autoHeight    = navbar.attr( 'data'+ alias +'auto-height' ) === 'true';
			if ( navbar.attr( 'data'+ alias +'stick-up-offset' ) ) link.stickUpOffset = navbar.attr( 'data'+ alias +'stick-up-offset' );
			if ( isNoviBuilder ) link.stickUp = false;
			else if ( navbar.attr( 'data'+ alias +'stick-up' ) )   link.stickUp       = navbar.attr( 'data'+ alias +'stick-up' ) === 'true';
		}

		navbar.RDNavbar({
			stickUpClone:    ( !isNoviBuilder && navbar.attr( "data-stick-up-clone" ) ) ? navbar.attr( "data-stick-up-clone" ) === 'true' : false,
			stickUpOffset:   ( navbar.attr( "data-stick-up-offset" ) ) ? navbar.attr( "data-stick-up-offset" ) : 1,
			anchorNavOffset: -78,
			anchorNav:       !isNoviBuilder,
			anchorNavEasing: 'linear',
			focusOnHover:    !isNoviBuilder,
			responsive:      responsive,
			onDropdownOver: function () {
				return !isNoviBuilder;
			}
		});
	}

	// Owl carousel
	if ( plugins.owl.length ) {
		for ( var i = 0; i < plugins.owl.length; i++ ) {
			var carousel = $( plugins.owl[ i ] );
			plugins.owl[ i ].owl = carousel;
			initOwlCarousel( carousel );
		}
	}

	// Isotope
	if ( plugins.isotope.length ) {
		for ( var i = 0; i < plugins.isotope.length; i++ ) {
			var
				wrap = plugins.isotope[ i ],
				filterHandler = function ( event ) {
					event.preventDefault();
					for ( var n = 0; n < this.isoGroup.filters.length; n++ ) this.isoGroup.filters[ n ].classList.remove( 'active' );
					this.classList.add( 'active' );
					this.isoGroup.isotope.arrange( { filter: this.getAttribute( "data-isotope-filter" ) !== '*' ? '[data-filter*="' + this.getAttribute( "data-isotope-filter" ) + '"]' : '*' } );
				},
				resizeHandler = (function () {
					this.isoGroup.isotope.layout();
				}).bind( wrap );

			wrap.isoGroup = {};
			wrap.isoGroup.filters = wrap.querySelectorAll( '[data-isotope-filter]' );
			wrap.isoGroup.node = wrap.querySelector( '.isotope' );
			wrap.isoGroup.layout = wrap.isoGroup.node.getAttribute( 'data-isotope-layout' ) ? wrap.isoGroup.node.getAttribute( 'data-isotope-layout' ) : 'masonry';
			wrap.isoGroup.isotope = new Isotope( wrap.isoGroup.node, {
				itemSelector: '.isotope-item',
				layoutMode: wrap.isoGroup.layout,
				filter: '*',
				columnWidth: ( function() {
					if ( wrap.isoGroup.node.hasAttribute('data-column-class') ) return wrap.isoGroup.node.getAttribute('data-column-class');
					if ( wrap.isoGroup.node.hasAttribute('data-column-width') ) return parseFloat( wrap.isoGroup.node.getAttribute('data-column-width') );
				}() )
			} );

			for ( var n = 0; n < wrap.isoGroup.filters.length; n++ ) {
				var filter = wrap.isoGroup.filters[ n ];
				filter.isoGroup = wrap.isoGroup;
				filter.addEventListener( 'click', filterHandler );
			}

			window.addEventListener( 'resize', resizeHandler );

			if ( isNoviBuilder ) {
				// Init mutation observer for isotope
				var observer = new MutationObserver( function ( mutations ) {
					mutations.forEach( function () {
						wrap.isoGroup.isotope.reloadItems();
						wrap.isoGroup.isotope.arrange();
					} );
				} );

				// Start observe
				observer.observe( wrap.isoGroup.node, { childList: true } );
			}
		}
	}

	// WOW
	if ( !isNoviBuilder && isDesktop && $html.hasClass("wow-animation") && plugins.wow.length ) {
		new WOW().init();
	}

	// Bootstrap tabs
	if ( plugins.bootstrapTabs.length ) {
		for ( var i = 0; i < plugins.bootstrapTabs.length; i++ ) {
			plugins.bootstrapTabs[i].querySelectorAll( '.nav li a' ).forEach( function( tab, index ) {
				if ( index === 0 ) $( tab ).tab( 'show' );

				tab.addEventListener( 'click', function( event ) {
					event.preventDefault();
					$( this ).tab( 'show' );
				});
			});
		}
	}

	// RD Input Label
	if ( plugins.rdInputLabel.length ) {
		plugins.rdInputLabel.RDInputLabel();
	}

	// Regula
	if ( plugins.regula.length ) {
		attachFormValidator( plugins.regula );
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
						if (isNoviBuilder)
							return;

					var form = $( plugins.rdMailForm[ this.extraData.counter ] ),
						inputs = form.find( "[data-constraints]" ),
						output = $( "#" + form.attr( "data-form-output" ) ),
						captcha = form.find( '.recaptcha' ),
						captchaFlag = true;

					output.removeClass( "active error success" );

					if ( isValidated( inputs, captcha ) ) {

						// veify reCaptcha
						if ( captcha.length ) {
							var captchaToken = captcha.find( '.g-recaptcha-response' ).val(),
								captchaMsg = {
									'CPT001': 'Please, setup you "site key" and "secret key" of reCaptcha',
									'CPT002': 'Something wrong with google reCaptcha'
								};

							formHasCaptcha = true;

							$.ajax( {
								method: "POST",
								url: "bat/reCaptcha.php",
								data: { 'g-recaptcha-response': captchaToken },
								async: false
							} )
								.done( function ( responceCode ) {
									if ( responceCode !== 'CPT000' ) {
										if ( output.hasClass( "snackbars" ) ) {
											output.html( '<p><span class="icon text-middle mdi mdi-check icon-xxs"></span><span>' + captchaMsg[ responceCode ] + '</span></p>' )

											setTimeout( function () {
												output.removeClass( "active" );
											}, 3500 );

											captchaFlag = false;
										} else {
											output.html( captchaMsg[ responceCode ] );
										}

										output.addClass( "active" );
									}
								} );
						}

						if ( !captchaFlag ) {
							return false;
						}

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
						if (isNoviBuilder)
							return;

					var output = $( "#" + $( plugins.rdMailForm[ this.extraData.counter ] ).attr( "data-form-output" ) ),
						form = $( plugins.rdMailForm[ this.extraData.counter ] );

					output.text( msg[ result ] );
					form.removeClass( 'form-in-process' );

					if ( formHasCaptcha ) {
						grecaptcha.reset();
					}
				},
				success: function ( result ) {
						if (isNoviBuilder)
							return;

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

	// Custom Toggles
	if ( plugins.customToggle.length ) {
		var i;

		for ( i = 0; i < plugins.customToggle.length; i++ ) {
			var $this = $( plugins.customToggle[ i ] );

			$this.on( 'click', $.proxy( function ( event ) {
				event.preventDefault();
				var $ctx = $( this );
				$( $ctx.attr( 'data-custom-toggle' ) ).add( this ).toggleClass( 'active' );
			}, $this ) );

			if ( $this.attr( "data-custom-toggle-disable-on-blur" ) === "true" ) {
				$( "body" ).on( "click", $this, function ( e ) {
					if ( e.target !== e.data[ 0 ]
						&& $( e.data.attr( 'data-custom-toggle' ) ).find( $( e.target ) ).length
						&& e.data.find( $( e.target ) ).length == 0 ) {
						$( e.data.attr( 'data-custom-toggle' ) ).add( e.data[ 0 ] ).removeClass( 'active' );
					}
				} )
			}

			if ( $this.attr( "data-custom-toggle-hide-on-blur" ) === "true" ) {
				$( "body" ).on( "click", $this, function ( e ) {
					if ( e.target !== e.data[ 0 ] && $( e.data.attr( 'data-custom-toggle' ) ).find( $( e.target ) ).length == 0 && e.data.find( $( e.target ) ).length == 0 ) {
						$( e.data.attr( 'data-custom-toggle' ) ).add( e.data[ 0 ] ).removeClass( 'active' );
					}
				} )
			}
		}
	}

	// Perspective menu
	if ( perspectiveMenu.length ) {
		var nav = $( '.rd-navbar-wrap' ),
			perspective = $( '#perspective' );
		$( '#perspective-open-menu' ).on( 'click', function () {
			nav.addClass( 'active' );
			perspective.addClass( 'active modalView' );
		} );
		$( '#perspective-content-overlay' ).on( 'click', function () {
			nav.removeClass( 'active' );
			perspective.removeClass( 'active' );
			setTimeout( function () {
				perspective.removeClass( 'modalView' );
			}, 400 );
		} );
	}

	// Header Stuck
	if ( plugins.pageWrapper ) {
		plugins.pageWrapper.scroll( function () {
			if ( $(this).scrollTop() >= 76 ) $( '.page-header' ).addClass( "stuck-page-header" );
			else $( '.page-header' ).removeClass( "stuck-page-header" );
		} );
	}

	// Counter
	if ( plugins.counter ) {
		for ( var i = 0; i < plugins.counter.length; i++ ) {
			var
				node = plugins.counter[i],
				counter = aCounter({
					node: node,
					duration: node.getAttribute( 'data-duration' ) || 1000
				}),
				scrollHandler = (function() {
					if ( Util.inViewport( this ) && !this.classList.contains( 'animated-first' ) ) {
						this.counter.run();
						this.classList.add( 'animated-first' );
					}
				}).bind( node ),
				blurHandler = (function() {
					this.counter.params.to = parseInt( this.textContent, 10 );
					this.counter.run();
				}).bind( node ),
				resizeHandler = (function( scrollHandler ) {
					if ( window.matchMedia('(min-width: 992px)').matches ) {
						window.removeEventListener( 'scroll', scrollHandler );
						plugins.pageWrapper[0].addEventListener( 'scroll', scrollHandler );
					} else {
						plugins.pageWrapper[0].removeEventListener( 'scroll', scrollHandler );
						window.addEventListener( 'scroll', scrollHandler );
					}
				}).bind( null, scrollHandler );

			if ( isNoviBuilder ) {
				node.counter.run();
				node.addEventListener( 'blur', blurHandler );
			} else {
				scrollHandler();

				if ( plugins.pageWrapper.length ) {
					resizeHandler();
					window.addEventListener( 'resize', resizeHandler );
				} else {
					window.addEventListener( 'scroll', scrollHandler );
				}
			}
		}
	}

	// Progress Linear
	if ( plugins.progressLinear ) {
		for ( var i = 0; i < plugins.progressLinear.length; i++ ) {
			var
				container = plugins.progressLinear[i],
				counter = aCounter({
					node: container.querySelector( '.progress-linear-counter' ),
					duration: container.getAttribute( 'data-duration' ) || 1000,
					onStart: function() {
						this.custom.bar.style.width = this.params.to + '%';
					}
				});

			counter.custom = {
				container: container,
				bar: container.querySelector( '.progress-linear-bar' ),
				onScroll: (function() {
					if ( Util.inViewport( this.custom.container ) && !this.custom.container.classList.contains( 'animated' ) ) {
						this.run();
						this.custom.container.classList.add( 'animated' );
					}
				}).bind( counter ),
				onBlur: (function() {
					this.params.to = parseInt( this.params.node.textContent, 10 );
					this.run();
				}).bind( counter ),
				onResize: (function() {
					if ( window.matchMedia('(min-width: 992px)').matches ) {
						window.removeEventListener( 'scroll', this.custom.onScroll );
						plugins.pageWrapper[0].addEventListener( 'scroll', this.custom.onScroll );
					} else {
						plugins.pageWrapper[0].removeEventListener( 'scroll', this.custom.onScroll );
						window.addEventListener( 'scroll', this.custom.onScroll );
					}
				}).bind( counter )
			};

			if ( isNoviBuilder ) {
				counter.run();
				counter.params.node.addEventListener( 'blur', counter.custom.onBlur );
			} else {
				counter.custom.onScroll();

				if ( plugins.pageWrapper.length ) {
					counter.custom.onResize();
					window.addEventListener( 'resize', counter.custom.onResize );
				} else {
					window.addEventListener( 'scroll', counter.custom.onScroll );
				}
			}
		}
	}

	// Progress Circle
	if ( plugins.progressCircle ) {
		for ( var i = 0; i < plugins.progressCircle.length; i++ ) {
			var
				container = plugins.progressCircle[i],
				counter = aCounter({
					node: container.querySelector( '.progress-circle-counter' ),
					duration: 1000,
					refresh: 10,
					onUpdate: function( value ) {
						this.custom.bar.render( value * 3.6 );
					}
				});

			counter.params.onComplete = counter.params.onUpdate;

			counter.custom = {
				container: container,
				bar: aProgressCircle({ node: container.querySelector( '.progress-circle-bar' ) }),
				onScroll: (function() {
					if ( Util.inViewport( this.custom.container ) && !this.custom.container.classList.contains( 'animated' ) ) {
						this.run();
						this.custom.container.classList.add( 'animated' );
					}
				}).bind( counter ),
				onBlur: (function() {
					this.params.to = parseInt( this.params.node.textContent, 10 );
					this.run();
				}).bind( counter ),
				onResize: (function() {
					if ( window.matchMedia('(min-width: 992px)').matches ) {
						window.removeEventListener( 'scroll', this.custom.onScroll );
						plugins.pageWrapper[0].addEventListener( 'scroll', this.custom.onScroll );
					} else {
						plugins.pageWrapper[0].removeEventListener( 'scroll', this.custom.onScroll );
						window.addEventListener( 'scroll', this.custom.onScroll );
					}
				}).bind( counter )
			};

			if ( isNoviBuilder ) {
				counter.run();
				counter.params.node.addEventListener( 'blur', counter.custom.onBlur );
			} else {
				counter.custom.onScroll();

				if ( plugins.pageWrapper.length ) {
					counter.custom.onResize();
					window.addEventListener( 'resize', counter.custom.onResize );
				} else {
					window.addEventListener( 'scroll', counter.custom.onScroll );
				}
			}
		}
	}

	// Select2
	if ( plugins.selectFilter.length ) {
		var i;
		for ( i = 0; i < plugins.selectFilter.length; i++ ) {
			var select = $( plugins.selectFilter[ i ] );

			select.select2( {
				theme: select.attr( 'data-custom-theme' ) ? select.attr( 'data-custom-theme' ) : "bootstrap"
			} ).next().addClass( select.attr( "class" ).match( /(input-sm)|(input-lg)|($)/i ).toString().replace( new RegExp( ",", 'g' ), " " ) );
		}
	}

	// Slick carousel
	if ( plugins.slick.length ) {
		var i;
		for ( i = 0; i < plugins.slick.length; i++ ) {
			var $slickItem = $( plugins.slick[ i ] );

			$slickItem.slick( {
				slidesToScroll: parseInt( $slickItem.attr( 'data-slide-to-scroll' ) ) || 1,
				asNavFor: $slickItem.attr( 'data-for' ) || false,
				dots: $slickItem.attr( "data-dots" ) == "true",
				infinite: $slickItem.attr( "data-loop" ) == "true",
				focusOnSelect: true,
				arrows: $slickItem.attr( "data-arrows" ) == "true",
				swipe: $slickItem.attr( "data-swipe" ) == "true",
				autoplay: $slickItem.attr( "data-autoplay" ) == "true",
				vertical: $slickItem.attr( "data-vertical" ) == "true",
				centerMode: $slickItem.attr( "data-center-mode" ) == "true",
				centerPadding: $slickItem.attr( "data-center-padding" ) ? $slickItem.attr( "data-center-padding" ) : '0.50',
				mobileFirst: true,
				responsive: [
					{
						breakpoint: 0,
						settings: {
							slidesToShow: parseInt( $slickItem.attr( 'data-items' ) ) || 1,
						}
					},
					{
						breakpoint: 479,
						settings: {
							slidesToShow: parseInt( $slickItem.attr( 'data-xs-items' ) ) || 1,
						}
					},
					{
						breakpoint: 767,
						settings: {
							slidesToShow: parseInt( $slickItem.attr( 'data-sm-items' ) ) || 1,
						}
					},
					{
						breakpoint: 991,
						settings: {
							slidesToShow: parseInt( $slickItem.attr( 'data-md-items' ) ) || 1,
						}
					},
					{
						breakpoint: 1199,
						settings: {
							slidesToShow: parseInt( $slickItem.attr( 'data-lg-items' ) ) || 1,
							swipe: false
						}
					}
				]
			} )
				.on( 'afterChange', function ( event, slick, currentSlide, nextSlide ) {
					var $this = $( this ),
						childCarousel = $this.attr( 'data-child' );

					if ( childCarousel ) {
						$( childCarousel + ' .slick-slide' ).removeClass( 'slick-current' );
						$( childCarousel + ' .slick-slide' ).eq( currentSlide ).addClass( 'slick-current' );
					}
				} );
		}
	}

	// Stepper
	if ( plugins.stepper.length ) {
		plugins.stepper.stepper( {
			labels: {
				up: "",
				down: ""
			}
		} );
	}

	// RD MaterialTabs
	if ( plugins.materialTabs.length ) {
		var i;
		for ( i = 0; i < plugins.materialTabs.length; i++ ) {
			var materialTabsItem = plugins.materialTabs[ i ],
				responsive = {},
				c = $( materialTabsItem );

			var aliaces = [ "-", "-xs-", "-sm-", "-md-", "-lg-" ],
				values = [ 0, 480, 768, 992, 1200 ],
				j, k;

			for ( j = 0; j < values.length; j++ ) {
				responsive[ values[ j ] ] = {};
				for ( k = j; k >= -1; k-- ) {
					if ( !responsive[ values[ j ] ][ "items" ] && c.attr( "data" + aliaces[ k ] + "items" ) ) {
						responsive[ values[ j ] ][ "items" ] = k < 0 ? 1 : parseInt( c.attr( "data" + aliaces[ k ] + "items" ) );
					}
					if ( !responsive[ values[ j ] ][ "stagePadding" ] && responsive[ values[ j ] ][ "stagePadding" ] !== 0 && c.attr( "data" + aliaces[ k ] + "stage-padding" ) ) {
						responsive[ values[ j ] ][ "stagePadding" ] = k < 0 ? 0 : parseInt( c.attr( "data" + aliaces[ k ] + "stage-padding" ) );
					}
					if ( !responsive[ values[ j ] ][ "margin" ] && responsive[ values[ j ] ][ "margin" ] !== 0 && c.attr( "data" + aliaces[ k ] + "margin" ) ) {
						responsive[ values[ j ] ][ "margin" ] = k < 0 ? 30 : parseInt( c.attr( "data" + aliaces[ k ] + "margin" ) );
					}
				}
			}

			$( materialTabsItem ).RDMaterialTabs( {
				responsive: responsive,
				dragContent: true,
				speed: 800
			} );
		}
	}
} );
