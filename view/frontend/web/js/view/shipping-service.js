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

                shippingService.setShippingRates = function(ratesData) {
                    orig(ratesData);

                    // custom code here
                    mediator.broadcast('omnicheckout:init-shipping-methods');
                };
            }
        };
    }
);
