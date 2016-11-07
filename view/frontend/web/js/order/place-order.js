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
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Magento_Checkout/js/action/place-order',
    'Magento_Checkout/js/model/quote',
    'Magento_Ui/js/model/messages',
    'mage/translate'
], function (
    $,
    mediator,
    placeOrderAction,
    quote,
    Messages,
    $t
) {
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
            if ($this.validateCheckoutAgreements() && $this.validateShippingMethod()) {
                placeOrderAction({
                    'method': quote.paymentMethod()
                }, new Messages())
                    .success(function () {
                        mediator.broadcast('omnicheckout:order-status', {orderReady: true});
                    })
                    .fail(function () {
                        mediator.broadcast('omnicheckout:order-status', {orderReady: false});
                    });
            } else {
                mediator.broadcast('omnicheckout:order-status', {orderReady: false});
            }

            return $this;
        },

        /**
         * Confirm that all checkout agreements have been accepted by client before placing order.
         *
         * @returns {boolean}
         */
        validateCheckoutAgreements: function() {
            var result = true;

            $('.checkout-agreements input[type="checkbox"]').each(function (i, box) {
                if (!box.checked) {
                    alert($t('Please confirm all checkout agreements before proceeding.'));
                    result = false;
                }
            });

            return result;
        },

        /**
         * Confirm that a shipping method has been selected.
         *
         * @returns {boolean}
         */
        validateShippingMethod: function() {
            var result = false;

            $('#co-shipping-method-form input[type="radio"]').each(function (i, box) {
                result = box.checked;

                if (result) {
                    return false;
                }
            });

            if (!result) {
                alert($t('Please select a shipping method.'));
            }

            return result;
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
