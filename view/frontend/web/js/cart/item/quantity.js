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
    'Magento_Checkout/js/model/quote',
    'Magento_Customer/js/customer-data'
], function ($, storage, mediator, ajaxQ, rateRegistry, resourceUrlManager, shippingService, errorProcessor, quote, customerData) {
    /**
     * Creates QuantityInput instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var quantityInput= function (config) {
        var i;
        var $this = {};
        var disabled = false;

        /**
         * The ID of the product.
         *
         * @type {String}
         */
        $this.id = null;

        /**
         * The quantity input.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * An ajax loader.
         *
         * @type {Object}
         */
        // $this.ajaxLoader = null;

        /**
         * A form key for the AJAX request of changing the quantity.
         *
         * @type {string}
         */
        $this.formKey = '';

        /**
         * The base URL to send the AJAX request.
         *
         * @type {string}
         */
        $this.baseUrl = '';

        /**
         * Parses and returns the value of the quantity input element.
         *
         * @returns {Number}
         */
        $this.getQuantity = function () {
            return parseFloat($this.element.value);
        };

        /**
         * Makes an AJAX request, sending the current quantity and updates the HTML of any returned elements.
         *
         * @returns {Object} $this.
         */
        $this.pushQuantity = function () {
            var quantity = $this.getQuantity();

            if (!disabled && !isNaN(quantity)) {
                $this.disable();

                mediator.broadcast('checkout:item-quantity-update-pending', {
                    id: $this.id
                });

                ajaxQ.queue({
                    url: $this.baseUrl + 'omnicheckout/cart/setItemQty',
                    chain: 'omnicheckout',
                    method: 'POST',

                    data: {
                        id: $this.id,
                        qty: quantity,
                        form_key: $this.formKey
                    },

                    success: function (data) {
                        if (data.item_total) {
                            mediator.broadcast('checkout:item-price-update', {
                                id: $this.id,
                                subtotal: data.item_total
                            });
                        }

                        if (data.hasOwnProperty('elements')) {
                            mediator.broadcast('shipping:update-content', {
                                content: data.elements['omnicheckout-shipping-methods-list']
                            });

                            mediator.broadcast('discount:update-content', {
                                content: data.elements['current-coupon-code']
                            });

                            mediator.broadcast('minicart:update-content', {
                                content: data.elements['header-cart']
                            });
                        }

                        customerData.reload(['cart', 'messages'], true);
                    },

                    error: function (data) {
                        alert("The requested quantity may not be available or something else went wrong.");
                    },

                    complete: function () {
                        $this.enable();

                        mediator.broadcast('checkout:item-quantity-update-complete', {
                            id: $this.id
                        });
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        };

        /**
         * Disables the quantity input element and stops observing it of changes.
         *
         * @returns {Object} $this.
         */
        $this.disable = function () {
            if (!$this.element.disabled) {
                disabled = true;
                $this.element.disabled = true;

                $($this.element).off('change', $this.pushQuantity);
            }

            return $this;
        };

        /**
         * Enables the quantity input element and observes it of changes.
         *
         * @returns {Object} $this.
         */
        $this.enable = function () {
            if ($this.element.disabled) {
                disabled = false;
                $this.element.disabled = false;
                $($this.element).on('change', $this.pushQuantity);
            }

            return $this;
        };

        /**
         * Toggles the disabled / enabled state of the instance.
         *
         * @param {Boolean} state
         * @returns {Object} $this.
         */
        $this.toggle = function (state) {
            return state ? $this.enable() : $this.disable();
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;
            var el = $($this.element);

            mediator.ignore({
                event: 'checkout:item-remove-pending',
                identifier: $this
            });

            mediator.ignore({
                event: 'checkout:item-removed',
                identifier: $this
            });

            $($this.element).off();

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        // Applying configuration.
        for (i in config) {
            if ($this.hasOwnProperty(i)) {
                $this[i] = config[i];
            }
        }

        if ($this.element) {
            $($this.element).on('change', $this.pushQuantity);
            $($this.element).on('keypress', function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $this.element.blur();
                }
            });
        }

        mediator.listen({
            event: 'checkout:item-remove-pending',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    $this.toggle(false);
                }
            }
        });

        mediator.listen({
            event: 'checkout:item-removed',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    $this
                        .disable()
                        .destroy();
                }
            }
        });

        return $this;
    };

    return quantityInput;
});
