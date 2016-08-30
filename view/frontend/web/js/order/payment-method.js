define([
    'Resursbank_OmniCheckout/js/mediator',
    'Magento_Checkout/js/action/select-payment-method'
], function (mediator, selectPaymentMethod) {
    var initialized = false;

    var $this = {
        init: function () {
            if (!initialized) {
                mediator.listen({
                    event: 'payment-method:change',
                    identifier: $this,
                    callback: function (data) {
                        $this.selectPaymentMethod(data.method);
                    }
                });

                initialized = true;
            }
        },

        /**
         * Corrects the name of the payment method that is sent by the iframe.
         *
         * @param method {String} The payment method.
         * @returns {String}
         */
        correctPaymentMethod: function (method) {
            var correction = '';

            switch (method) {
                case 'CARD': correction = 'resursbank_card'; break;
                case 'NEWCARD': correction = 'resursbank_newcard'; break;
                case 'INVOICE': correction = 'resursbank_invoice'; break;
                case 'PARTPAYMENT': correction = 'resursbank_partpayment'; break;
                case 'NETSCARD': correction = 'resursbank_netscard'; break;
                default: correction = 'resursbank_default';
            }

            return correction;
        },

        /**
         * Sets the payment method on the quote object.
         *
         * @param method
         * @returns {Object} $this
         * @todo We should perhaps push the data to the server as well. But it doesn't seem necessary at the moment.
         */
        selectPaymentMethod: function (method) {
            selectPaymentMethod($this.correctPaymentMethod(method));

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
                event: 'payment-method:change',
                identifier: $this
            });
        }
    };

    return $this;
});