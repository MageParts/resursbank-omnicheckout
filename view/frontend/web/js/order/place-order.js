define([
    'Resursbank_OmniCheckout/js/mediator',
    'Magento_Checkout/js/action/place-order',
    'Magento_Checkout/js/model/quote',
    'Magento_Ui/js/model/messages'
], function (mediator, placeOrderAction, quote, Messages) {
    var initialized = false;

    var $this = {
        init: function () {
            if (!initialized) {
                mediator.listen({
                    event: 'book-order',
                    identifier: $this,
                    callback: function (data) {
                        $this.placeOrder(data);
                    }
                });

                initialized = true;
            }
        },

        /**
         * Attempts to place the order.
         *
         * @param data
         * @returns {Object} $this.
         */
        placeOrder: function (data) {
            placeOrderAction({
                'method': quote.paymentMethod()
            }, new Messages())
                .success(function () {
                    console.log('place order: success!');
                    mediator.broadcast('omnicheckout:booking-order', {isOrderReady: true});
                })
                .fail(function () {
                    console.log('place order: fail!');
                    mediator.broadcast('omnicheckout:booking-order', {isOrderReady: false});
                });

            return $this;
        },

        destroy: function () {
            var i;

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }

            mediator.ignore({
                event: 'book-order',
                identifier: $this
            });
        }
    };

    return $this;
});