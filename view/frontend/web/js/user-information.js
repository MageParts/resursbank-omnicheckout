define([
    'jquery',
    'Resursbank_OmniCheckout/js/ajax-q',
    'Resursbank_OmniCheckout/js/mediator',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/action/create-billing-address',
    'Magento_Checkout/js/action/create-shipping-address',
    'Magento_Checkout/js/action/select-shipping-address',
    'Magento_Checkout/js/model/shipping-save-processor/default'
], function ($, ajaxQ, mediator, quote, createBillingAddress, createShippingAddress, selectShippingAddress, defaultProcessor) {
    var initialized = false;
    var previousUserBilling = null;
    var previousUserShipping = null;

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
                        // if ($this.useBillingForShipping(data)) {
                        //     $this.pushBillingInfo($this.prepareBillingInfo(data));
                        // }
                        // else {
                        //     $this.pushShippingInfo($this.prepareShippingInfo(data));
                        // }

                        if (data.hasOwnProperty('delivery')) {
                            data.delivery = $this.prepareShippingInfo(data);
                        }

                        data.address = $this.prepareBillingInfo(data);

                        $this.pushBillingInfo(data);
                    }
                });
            }

            return $this;
        },

        /**
         * Sends the billing information to the server with an AJAX call.
         *
         * @param data {Object}
         * @return {$this}
         */
        pushBillingInfo: function (data) {
            data.form_key = $this.formKey;
            // data.billing = JSON.stringify(data.billing);

            if (data.hasOwnProperty('delivery')) {
                selectShippingAddress(createShippingAddress(data.delivery));
            }
            else {
                selectShippingAddress(createShippingAddress(data.billing));
            }

            defaultProcessor.saveShippingInformation();

            // console.log('pushShippingInfo data:', data);
            // // console.log('createBillingAddress:', createBillingAddress(data.billing));
            // console.log('createShippingAddress:', createShippingAddress(data.billing));
            // console.log('quote shipping method:', quote.shippingMethod());
            //
            // selectShippingAddress(createShippingAddress(data.billing));
            // console.log('quote.shippingAddress:', quote.shippingAddress());
            //
            // defaultProcessor.saveShippingInformation();

            // if (previousUserBilling !== data.billing) {
            //     previousUserBilling = data.billing;

                // ajaxQ.queue({
                //     chain: 'omnicheckout',
                //     url: $this.baseUrl + 'index/saveBilling',
                //     parameters: data,
                //
                //     onSuccess: function (response) {
                //         var data = response.responseJSON;
                //     },
                //
                //     onFailure: function (response) {
                //         var data = response.responseJSON;
                //     }
                // })
                //     .run('omnicheckout');
            // }

            return $this;
        },

        /**
         * Sends the shipping information to the server with an AJAX call. This method should only
         *
         * @param data {Object}
         * @return {$this}
         */
        pushShippingInfo: function (data) {
            data.form_key = $this.formKey;
            data.shipping = JSON.stringify(data.shipping);

            if (previousUserShipping !== data.shipping) {
                previousUserShipping = data.shipping;

                ajaxQ.queue({
                    chain: 'omnicheckout',
                    url: $this.baseUrl + 'index/saveShipping',

                    parameters: data,

                    onSuccess: function (response) {
                        var data = response.responseJSON;
                    },

                    onFailure: function (response) {
                        var data = response.responseJSON;
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        },

        /**
         * Prepares the users billing information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} data
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        prepareBillingInfo: function (data) {
            var info = {
                billing: {
                    street: [],
                    use_for_shipping: $this.useBillingForShipping(data) ? 1 : 0
                }
            };

            $.each(data.address, function (key, value) {
                switch (key) {
                    case 'address': info.billing.street[0] = value; break;
                    case 'addressExtra': info.billing.street[1] = value; break;
                    default: info.billing[$this.getCorrectInfoName(key)] = value;
                }
            });

            return info;
        },

        /**
         * Prepares the users shipping information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} data
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        prepareShippingInfo: function (data) {
            var info = {
                shipping: {
                    street: []
                }
            };

            $.each(data.delivery, function (key, value) {
                switch (key) {
                    case 'address': info.shipping.street[0] = value; break;
                    case 'addressExtra': info.shipping.street[1] = value; break;
                    default: info.shipping[$this.getCorrectInfoName(key)] = value;
                }
            });

            return info;
        },

        /**
         * Check if a shipping address has been set.
         *
         * @param {Object} data
         * @returns {Boolean}
         */
        useBillingForShipping: function (data) {
            return !data.hasOwnProperty('delivery');
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