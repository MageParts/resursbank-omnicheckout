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

define(['jquery', 'Resursbank_OmniCheckout/js/mediator'], function ($, mediator) {
    var price = function (config) {
        var i;
        var $this = {};

        /**
         * The item row the price belongs to.
         *
         * @type {Element}
         */
        $this.item = null;

        /**
         * The ID-number associated with the price element.
         *
         * @type {Number}
         */
        $this.id = null;

        /**
         * Receives an object with price elements, which elements it will then delegate to the appropriate functions.
         *
         * @param {Object} data
         * @return {Object} $this.
         */
        $this.itemPriceUpdate = function (data) {
            if (data.id === $this.id && data.subtotal) {
                $this.updateSubtotal(data.subtotal);
            }

            if (data.id === $this.id && data.subtotalExcl) {
                $this.updateSubtotalExcl(data.subtotalExcl);
            }

            return $this;
        };

        /**
         * Replaces the subtotal element.
         *
         * @param {Element} element
         * @return {Object} $this.
         */
        $this.updateSubtotal = function (element) {
            $($this.getSubtotalElement()).replaceWith(element);

            return $this;
        };

        /**
         * Replaces the subtotal excluding tax element.
         *
         * @param {Element} element
         * @return {Object} $this.
         */
        $this.updateSubtotalExcl = function (element) {
            $($this.getSubtotalExclElement()).replaceWith(element);

            return $this;
        };

        /**
         * Returns the subtotal element of the item.
         *
         * @return {Element}
         */
        $this.getSubtotalElement = function () {
            return $($this.item).find('td[data-th="Subtotal"] span[data-label="Incl. Tax"] span.price')[0];
        };

        /**
         * Returns the subtotal element of the item.
         *
         * @return {Element}
         */
        $this.getSubtotalExclElement = function () {
            return $($this.item).find('td[data-th="Subtotal"] span[data-label="Excl. Tax"] span.price')[0];
        };

        for (i in config) {
            if ($this.hasOwnProperty(i)) {
                $this[i] = config[i];
            }
        }

        mediator.listen({
            event: 'checkout:item-price-update',
            identifier: $this,
            callback: $this.itemPriceUpdate
        });
    };

    return price;
});
