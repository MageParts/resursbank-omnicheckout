define(
    [
        'Resursbank_OmniCheckout/js/mediator',
        'Magento_Checkout/js/model/shipping-service'
    ],
    function (
        mediator,
        shippingService
    ) {
        "use strict";
        return {
            init: function () {
                var orig = shippingService.setShippingRates;

                // Overwrite the setShippingRates() method with our own. We need to initialize the shipping methods
                // after they have been loaded with AJAX which happens after setShippingRates() is completed. This
                // solution should (if we're able to) be revised in the future.
                shippingService.setShippingRates = function(ratesData) {
                    orig(ratesData);
                    mediator.broadcast('omnicheckout:init-shipping-methods');
                };
            }
        };
    }
);
