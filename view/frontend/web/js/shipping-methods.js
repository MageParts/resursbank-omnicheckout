/**
 * Created by Bossehasse on 16/08/16.
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
        console.log('radio button selected');
        if ($this.selected !== this) {
            $this.select(this)
                .pushShippingMethod();
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

                console.log('shipping methods element:', $this.element);
                console.log('shipping methods config:', config);
            }
        },

        /**
         * Puts click handlers on the radio buttons. When clicking a radio button it will send the selected
         * shipping method to the server with an AJAX call.
         *
         * @returns {$this}
         */
        setRadioHandlers: function () {
            $.each($this.getShippingMethodRadios(), function (radio) {
                $(radio).on('click', radioClickHandler);
            });

            return $this;
        },

        /**
         * Takes a string, strips it of tags and replaces the content of the shipping element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {$this}
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
         * @returns {$this}
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
         * @returns {$this}
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
         * Sends the selected shipping method to the server.
         *
         * @returns {$this}
         */
        pushShippingMethod: function () {
            if ($this.selected && previousShippingMethod !== $this.selected.value) {
                $this.disable();

                previousShippingMethod = $this.selected.value;

                ajaxQ.queue({
                    chain: 'omnicheckout',
                    url: $this.baseUrl + 'omnicheckout/cart/saveShippingMethod',
                    method: 'POST',

                    data: {
                        shipping_method: $this.selected.value,
                        form_key: $this.formKey
                    },

                    complete: function () {
                        $this.enable();
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
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
                , null, false
            ).done(
                function (result) {
                    console.log('result:', result);
                    rateRegistry.set(shippingAddress.getKey(), result);
                    shippingService.setShippingRates(result);
                }
            ).fail(
                function (response) {
                    shippingService.setShippingRates([]);
                    // errorProcessor.process(response);
                }
            ).always(
                function () {
                    shippingService.isLoading(false);
                }
            );
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
