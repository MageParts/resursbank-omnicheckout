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
    'mage/storage',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q',
    'Magento_Checkout/js/model/shipping-rate-registry',
    'Magento_Checkout/js/model/resource-url-manager',
    'Magento_Checkout/js/model/shipping-service',
    'Magento_Checkout/js/model/error-processor',
    'Magento_Checkout/js/model/quote'
], function ($, storage, mediator, ajaxQ, rateRegistry, resourceUrlManager, shippingService, errorProcessor, quote) {
    var previousShippingMethod = null;
    var initialized = false;

    var radioClickHandler = function () {
        if ($this.selected !== this) {
            $this.select(this);
        }
    };

    var $this = {
        /**
         * The element containing shipping methods.
         *
         * @type {Element}
         */
        element: null,

        /**
         * The selected radio button.
         *
         * @type {Element}
         */
        selected: null,

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
                for (i in config) {
                    if ($this.hasOwnProperty(i)) {
                        $this[i] = config[i];
                    }
                }

                // Setting up mediator listeners.
                mediator.listen({
                    event: 'shipping:update-content',
                    identifier: $this,
                    callback: function (data) {
                        if (typeof data.content === 'string' && data.content !== '') {
                            $this.updateHtml(data.content)
                                .setRadioHandlers()
                                .resetSelection();
                        }
                    }
                });

                mediator.listen({
                    event: 'checkout:item-quantity-update-complete',
                    identifier: $this,
                    callback: $this.reload
                });

                $this.setRadioHandlers();

                initialized = true;
            }
        },

        /**
         * Puts click handlers on the radio buttons. When clicking a radio button it will send the selected
         * shipping method to the server with an AJAX call.
         *
         * @returns {Object} $this.
         */
        setRadioHandlers: function () {
            $.each($this.getShippingMethodRadios(), function (i, radio) {
                $(radio).on('click', radioClickHandler);
            });

            return $this;
        },

        /**
         * Takes a string, strips it of tags and replaces the content of the shipping element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {Object} $this.
         */
        updateHtml: function (content) {
            if ($this.element && typeof content === 'string') {
                $($this.element).html(content);
            }

            return $this;
        },

        /**
         * Sets the selected radio.
         *
         * @param {Element} radio The radio button to select.
         * @returns {Object} $this.
         */
        select: function (radio) {
            if (radio.checked && radio !== $this.selected) {
                $this.selected = radio;
            }

            return $this;
        },

        /**
         * Fetches the
         * After an content update, this method selects the new radio button that has the same value as the old
         * radio button. If the option can't be found it will reset shipping.selected to null.
         *
         * @returns {Object} $this.
         */
        resetSelection: function () {
            var currentSelectedValue = null;

            if ($this.selected) {
                currentSelectedValue = $this.selected.value;
                $this.selected = null;

                $.each($this.getShippingMethodRadios(), function (radio) {
                    if (radio.checked || radio.value === currentSelectedValue) {
                        radio.checked = true;
                        $this.select(radio);

                        return false;
                    }
                });
            }

            return $this;
        },

        /**
         * Returns an array of the shipping method radio buttons. If none are found, an empty array will be
         * returned.
         *
         * @returns {Array}
         */
        getShippingMethodRadios: function () {
            return $($this.element).find('input[type="radio"]').toArray();
        },

        /**
         * Disables the radio buttons.
         *
         * @returns {Object} $this.
         */
        disable: function () {
            $.each($this.getShippingMethodRadios(), function (radio) {
                radio.disabled = true;
            });

            return $this;
        },

        /**
         * Enables the radio buttons.
         *
         * @returns {Object} $this.
         */
        enable: function () {
            $.each($this.getShippingMethodRadios(), function (radio) {
                radio.disabled = false;
            });

            return $this;
        },

        /**
         * Updates the shipping methods with an AJAX call.
         *
         * @return {Object} $this.
         */
        reload: function () {
            var shippingAddress = quote.shippingAddress();
            var payload = JSON.stringify({
                    address: {
                        'street': shippingAddress.street,
                        'city': shippingAddress.city,
                        'region_id': shippingAddress.regionId,
                        'region': shippingAddress.region,
                        'country_id': shippingAddress.countryId,
                        'postcode': shippingAddress.postcode,
                        'email': shippingAddress.email,
                        'customer_id': shippingAddress.customerId,
                        'firstname': shippingAddress.firstname,
                        'lastname': shippingAddress.lastname,
                        'middlename': shippingAddress.middlename,
                        'prefix': shippingAddress.prefix,
                        'suffix': shippingAddress.suffix,
                        'vat_id': shippingAddress.vatId,
                        'company': shippingAddress.company,
                        'telephone': shippingAddress.telephone,
                        'fax': shippingAddress.fax,
                        'custom_attributes': shippingAddress.customAttributes,
                        'save_in_address_book': shippingAddress.saveInAddressBook
                    }
                }
            );

            shippingService.isLoading(true);
            storage.post(
                resourceUrlManager.getUrlForEstimationShippingMethodsForNewAddress(quote)
                , payload, false
            ).done(
                function (result) {
                    rateRegistry.set(shippingAddress.getKey(), result);
                    shippingService.setShippingRates(result);
                }
            ).fail(
                function (response) {
                    shippingService.setShippingRates([]);
                }
            ).always(
                function () {
                    $this.setRadioHandlers();
                    shippingService.isLoading(false);
                }
            );

            return $this;
        },

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        destroy: function () {
            var i;

            mediator.ignore({
                event: 'shipping:update-content',
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
