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
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/action/create-billing-address',
    'Magento_Checkout/js/action/create-shipping-address',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/action/select-billing-address',
    'Magento_Checkout/js/model/shipping-save-processor/default'
], function (
    $,
    mediator,
    quote,
    createBillingAddress,
    createShippingAddress,
    selectShippingAddress,
    selectBillingAddress,
    defaultProcessor
) {
    var initialized = false;

    // When the shippingMethod changes value.
    quote.shippingMethod.subscribe(function () {
        defaultProcessor.saveShippingInformation();
    });

    var $this = {
        /**
         * A form key for the AJAX request
         *
         * @type {string}
         */
        formKey: '',

        /**
         * The base URL to send the AJAX request.
         *
         * @type {string}
         */
        baseUrl: '',

        init: function (config) {
            var i;

            if (!initialized) {
                // Applying configuration.
                for (i in config) {
                    if ($this.hasOwnProperty(i)) {
                        $this[i] = config[i];
                    }
                }

                mediator.listen({
                    event: 'user-info:change',
                    identifier: $this,
                    callback: function (data) {
                        if (data.hasOwnProperty('delivery')) {
                            data.shipping = $this.prepareShippingInfo(data.address, data.delivery);
                        }

                        data.billing = $this.prepareBillingInfo(data.address);

                        $this.setGuestEmail(data.billing.email)
                            .pushUserInfo(data);
                    }
                });

                initialized = true;
            }

            return $this;
        },

        /**
         * Sets the [guestEmail] property of the quote object.
         *
         * @param email
         * @returns {Object} $this
         */
        setGuestEmail: function (email) {
            quote.guestEmail = email;

            return $this;
        },

        /**
         * Sends the billing information to the server with an AJAX call.
         *
         * @param data {Object}
         * @return {Object} $this.
         */
        pushUserInfo: function (data) {
            var address;

            data.form_key = $this.formKey;

            if (data.hasOwnProperty('delivery')) {
                selectShippingAddress(createShippingAddress(data.shipping));
                selectBillingAddress(createBillingAddress(data.billing));
            }
            else {
                address = createBillingAddress(data.billing);

                selectShippingAddress(address);
                selectBillingAddress(address);
            }

            return $this;
        },

        /**
         * Prepares the users billing information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} billingData
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        prepareBillingInfo: function (billingData) {
            return $this.correctAddressObject(billingData);
        },

        /**
         * Prepares the users shipping information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} billingData
         * @param {Object} shippingData
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        prepareShippingInfo: function (billingData, shippingData) {
            shippingData.telephone = billingData.telephone;
            shippingData.email = billingData.email;

            return $this.correctAddressObject(shippingData);
        },

        /**
         * Prepares either the shipping or billing address, depending which object was passed to this method.
         *
         * @param addressData
         * @return {Object} The new address object.
         */
        correctAddressObject: function (addressData) {
            return function (obj) {
                $.each(addressData, function (key, value) {
                    switch (key) {
                        case 'address': obj.street[0] = value; break;
                        case 'addressExtra': obj.street[1] = value; break;
                        default: obj[$this.getCorrectInfoName(key)] = value;
                    }
                });

                return obj;
            }({street: []});
        },

        /**
         * Takes a name of a property of user information and returns the corrected version of that property name.
         *
         * @param {String} name The name of the property to correct.
         * @returns {String}
         */
        getCorrectInfoName: function (name) {
            var correctedName = '';

            switch (name) {
                case 'surname': correctedName = 'lastname'; break;
                case 'postal': correctedName = 'postcode'; break;
                case 'countryCode': correctedName = 'country_id'; break;
                default: correctedName = name;
            }

            return correctedName;
        },

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        destroy: function () {
            var i;

            mediator.ignore({
                event: 'user-info:change data',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        }
    };

    return $this;
});
