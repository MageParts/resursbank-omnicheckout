/**
 * Copyright 2016 Resurs Bank AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
