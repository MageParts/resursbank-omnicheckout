/**
 * Created by Bossehasse on 30/08/16.
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
         * Returns the subtotal element of the item.
         *
         * @return {Element}
         */
        $this.getSubtotalElement = function () {
            return $($this.item).find('td[data-th="Subtotal"] span.price')[0];
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