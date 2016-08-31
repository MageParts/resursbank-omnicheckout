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
    'Resursbank_OmniCheckout/js/ajax-q',
    'Magento_Customer/js/customer-data'
], function ($, mediator, ajaxQ, customerData) {
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
         * The base URL to send the AJAX request to that removes the item.
         *
         * @type {string}
         */
        $this.baseUrl = '';

        /**
         * An click handler that blocks the event from reloading the page. It then disables the instance and
         * sends an AJAX request with information about the removed product.
         *
         * @param {Object} event
         */
        $this.preparePush = function (event) {
            $this.preventLink(event)
                .pushDeleteItem();
        };

        /**
         * Sends and AJAX request about deleting an item.
         *
         * @returns {Object} $this.
         */
        $this.pushDeleteItem = function () {
            if (!disabled) {
                $this.disable();

                mediator.broadcast('checkout:item-remove-pending', {
                    id: $this.id
                });

                ajaxQ.queue({
                    chain: 'omnicheckout',
                    url: $this.baseUrl + 'omnicheckout/cart/removeItem',
                    method: 'POST',

                    data: {
                        id: $this.id,
                        form_key: $this.formKey
                    },

                    success: function (data) {
                        var row = $this.getItemRow();

                        customerData.reload();

                        if (row) {
                            row.remove();
                        }

                        if (data.cart_qty === 0) {
                            location.href = $this.baseUrl;
                        }
                        else if (data.hasOwnProperty('elements')) {
                            mediator.broadcast('shipping:update-content', {
                                content: data.elements['omnicheckout-shipping-methods-list']
                            });

                            mediator.broadcast('discount:update-content', {
                                content: data.elements['current-coupon-code']
                            });

                            mediator.broadcast('minicart:update-content', {
                                content: data.elements['header-cart']
                            });

                            mediator.broadcast('checkout:item-remove-success', {
                                id: $this.id
                            });
                        }

                        $this.destroy();
                    },

                    error: function (data) {
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

                $($this.element).off('click', $this.preparePush);
                $($this.element).on('click', $this.preventLink);
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

                $($this.element).on('click', $this.preparePush);
                $($this.element).off('click', $this.preventLink);
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
            event.stopPropagation();
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

        $this.getItemRow = function () {
            return $($this.element).closest('tbody.cart.item')[0];
        };

        // Applying configuration.
        for (i in config) {
            if ($this.hasOwnProperty(i)) {
                $this[i] = config[i];
            }
        }

        if ($this.element) {
            $($this.element).on('click', $this.preparePush);
        }

        return $this;
    };

    return deleteItemButton;
});
