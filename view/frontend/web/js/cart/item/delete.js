/**
 * Created by Bossehasse on 16/08/16.
 */
define([
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q'
], function ($, mediator, ajaxQ) {
    /**
     * Creates deleteItemButton instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var deleteItemButton = function (config) {
        var i;
        var $this = {};
        var disabled = false;
        var href = '';

        /**
         * The ID of the product.
         *
         * @type {String}
         */
        $this.id = null;

        /**
         * The button element.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * A form key for the AJAX request of removing the item.
         *
         * @type {string}
         */
        $this.formKey = '';

        /**
         * The URL to send the AJAX request to that removes the item.
         *
         * @type {string}
         */
        $this.requestUrl = '';

        /**
         * An click handler that blocks the event from reloading the page. It then disables the instance and
         * sends an AJAX request with information about the removed product.
         *
         * @param {Object} event
         */
        $this.preparePush = function (event) {
            $this.preventLink(event)
                .pushRemoveItem();
        };

        /**
         * Sends and AJAX request about removing an item.
         *
         * @returns {Object} $this.
         */
        $this.pushRemoveItem = function () {
            if (!disabled) {
                $this.disable();

                MEDIATOR.broadcast('checkout:item-remove-pending', {
                    id: $this.id
                });

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'cart/delete/id/' + $this.id,

                    parameters: {
                        itemId: $this.id,
                        form_key: FORM_KEY
                    },

                    success: function (response) {
                        var data = response.responseJSON;

                        if (data.message.error.length) {
                            handleAjaxErrors(data.message.error);
                        }
                        else if (data.cart_qty === 0) {
                            location.href = OMNICHECKOUT;
                        }
                        else if (data.hasOwnProperty('elements')) {
                            MEDIATOR.broadcast('shipping:update-content', {
                                content: data.elements['omnicheckout-shipping-methods-list']
                            });

                            MEDIATOR.broadcast('discount:update-content', {
                                content: data.elements['current-coupon-code']
                            });

                            MEDIATOR.broadcast('minicart:update-content', {
                                content: data.elements['header-cart']
                            });

                            MEDIATOR.broadcast('checkout:item-remove-success', {
                                id: $this.id
                            });
                        }
                    },

                    error: function (response) {
                        var data = response.responseJSON;

                        alert("Sorry, but we can't remove the product at this moment. Please refresh and try again.");

                        $this.enable();
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        };

        /**
         * Disables the button element and stops observing it of clicks.
         *
         * @returns {Object} $this.
         */
        $this.disable = function () {
            if (!disabled) {
                disabled = true;

                $this.element.stopObserving('click', $this.preparePush);
                $this.element.observe('click', $this.preventLink);
            }

            return $this;
        };

        /**
         * Enables the button element and observes it of clicks.
         *
         * @returns {Object} $this.
         */
        $this.enable = function () {
            if (disabled) {
                disabled = false;

                $this.element.observe('click', $this.preparePush);
                $this.element.stopObserving('click', $this.preventLink);
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
         * Prevents the link for going anywhere. This method expects an event object as an argument.
         *
         * @param event
         * @returns {Object} $this
         */
        $this.preventLink = function (event) {
            event.preventDefault();
            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

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
            $this.element.observe('click', $this.preparePush);
        }

        return $this;
    };

    return deleteItemButton;
});