/*
 *  ------------------------------
 *  Load/Page Events
 *  ------------------------------
 *
 *  Events and listeners associated with the page load or window events such as
 *  scrolling, etc.
 *
 */

(function($) {
    "use strict";

    var $window,
        $html,
        $pushHeader;

    /*
    * Watch for the scrolling and tint the common header
    */

    function headerTint() {
        var $header = $('#header');

        if($header.offset().top > ($header.height() / 4)) {
            $header.addClass('tinted');
        } else {
            $header.removeClass('tinted');
        }
    }

    /*
    * Automatically calculate the padding-top for pushed elements
    */

    function init() {
      if($pushHeader.length) {
        $pushHeader.css('padding-top', $('header').height());
      }
    }

    /*
    * Fade out the site preloader
    */

    function preloader() {
      $(".preloader").delay(500).fadeOut();
    }

    $(document).ready(function() {
      $html = $('html');
      $window = $(window);
      $pushHeader = $('.push-header');

      init();
      preloader();
      $html.removeClass('no-js');
    });

    $(window).on('scroll', function() {
        headerTint();
    });
})(jQuery);

/*
 *  ------------------------------
 *  UI Events
 *  ------------------------------
 *
 *  Handle UI events such as form submissions, button clicks, etc
 *
 */

(function($) {
    "use strict";

    var $window,
        $html,
        $homeBlogFeed,
        $mobileToggle;

    /*
    * Bind functions to event listeners
    */

    function bindings() {
      $mobileToggle.on('click', toggleMobileMenu);
    }

    /*
    * Toggle the mobile menu display
    */

    function toggleMobileMenu() {
      $('#header nav').toggleClass('open');
    }

    /**
    * Initialize the sliders
    *
    * @TODO: Move this to another module
    */

    function sliders() {
      if($homeBlogFeed.length) {
        $homeBlogFeed.slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            infinite: false,
            responsive: [{
              breakpoint: 980,
              settings: {
                slidesToShow: 2
              }
            }, {
              breakpoint: 690,
              settings: {
                slidesToShow: 1
              }
            }, {
              breakpoint: 350,
              settings: {
                arrows: false
              }
            }]
        });
      }
    }

    $(document).ready(function() {
      $html = $('html');
      $window = $(window);
      $mobileToggle = $('.mobile-toggle');
      $homeBlogFeed = $('#home-blog-feed');

      sliders();
      bindings();
    });
})(jQuery);
