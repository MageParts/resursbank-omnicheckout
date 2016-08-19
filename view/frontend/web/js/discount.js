define([
    'jquery',
    'Resursbank_OmniCheckout/js/mediator',
    'Resursbank_OmniCheckout/js/ajax-q'
], function ($, mediator, ajaxQ) {
    /**
     * Discount factory.
     *
     * @param {Object} config
     * @return {Object}
     */
    var discount = function (config) {
        var i;
        var $this = {};

        /**
         * The discount coupon list.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * Takes a string and replaces the content of the discount element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {$this}
         */
        $this.updateHtml = function (content) {
            if ($this.element && typeof content === 'string') {
                $($this.element).html(content);
            }

            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'discount:update-content',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        MEDIATOR.listen({
            event: 'discount:update-content',
            identifier: $this,
            callback: function (data) {
                if (typeof data.content === 'string' && data.content !== '') {
                    $this.updateHtml(data.content);
                }
            }
        });

        // Applying configuration.
        for (i in config) {
            if ($this.hasOwnProperty(i)) {
                $this[i] = config[i];
            }
        }

        return $this;
    };

    return discount;
});