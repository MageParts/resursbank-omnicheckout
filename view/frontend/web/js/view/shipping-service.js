define(
    [
        'Magento_Checkout/js/model/shipping-service'
    ],
    function (
        shippingService
    ) {
        "use strict";
        return {
            init: function () {
                var orig = shippingService.setShippingRates;

                shippingService.setShippingRates = function(ratesData) {
                    orig(ratesData);

                    // custom code here
                    console.log('Yay');
                };
            }
        };
    }
);
