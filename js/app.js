(function($) {
    "use strict";

    var $window,
        $html,
        $homeBlogFeed,
        $mobileToggle;

    function bindings() {
      $mobileToggle.on('click', toggleMobileMenu);
    }

    function toggleMobileMenu() {
      $('#header nav').toggleClass('open');
    }

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
