var CHECKOUT = (function () {
    /**
     * Whether or not CHECKOUT.init() has been run.
     *
     * @type {boolean}
     */
    var initialized = false;

    /**
     * Whether or not finalizeIframeSetup() has been called.
     *
     * @type {boolean}
     */
    var finalizedIframe = false;

    /**
     * The URL of the Omnicheckout iframe.
     *
     * @type {string}
     */
    var omnicheckoutDomain = OMNICHECKOUT_IFRAME_URL;

    /**
     * The Omnicheckout iframe element.
     *
     * @type {Element}
     */
    var omnicheckoutIframe = null;

    /**
     * When the iframe is done loading, this method will do some final work in order to make the checkout page and
     * the iframe communicate and work together as intended.
     *
     * NOTE: Should only be called once when the iframe has fully loaded. That is, when it has done all of its AJAX
     * requests and other preparations.
     */
    var finalizeIframeSetup = function () {
        if (!finalizedIframe) {
            // Post the booking rule to Omnicheckout. This post basically says that when a user presses the button
            // to finalize the order, check with the server if the order is ready to be booked.
            postMessage({
                eventType: 'omnicheckout:set-booking-rule',
                checkOrderBeforeBooking: true
            });

            finalizedIframe = true;
        }
    };

    /**
     * Receives and delegates messages from the Omnicheckout iframe when it uses window.postMessage(). This function
     * expects event.data to be a string which is an JSON encoded object. The string is then parsed with JSON and will
     * then check for an data.eventType property, which is also a string and tells the delegator how to handle the
     * message. If this data.eventType does not exists, the message will be ignored.
     *
     * NOTE: The event argument is an object with information about the message, where it came from and such. The data
     * that was passed along with the message will be under a event.data property.
     *
     * @param event
     */
    var postMessageDelegator = function (event) {
        var data;
        var origin = event.origin || event.originalEvent.origin;

        if (origin !== omnicheckoutDomain ||
            typeof event.data !== 'string' ||
            event.data === '[iFrameResizerChild]Ready') {
                return;
        }

        data = JSON.parse(event.data);

        if (data.hasOwnProperty('eventType') && typeof data.eventType === 'string') {
            switch (data.eventType) {
                case 'omnicheckout:user-info-change': MEDIATOR.broadcast('user-info:change', data); break;
                case 'omnicheckout:payment-method-change': MEDIATOR.broadcast('payment-method:change', data); break;
                case 'omnicheckout:booking-order': MEDIATOR.broadcast('book-order', data); break;
                case 'omnicheckout:loaded': finalizeIframeSetup(); break;
                default:;
            }
        }
    };

    /**
     * Posts a message to the iframe window with postMessage(). The data argument will be sent to the iframe window and
     * and it should have an eventType property set. The eventType property is a string and is used by the receiver to
     * determine how the message and its data should be handled.
     *
     * @param {Object} data - Information to be passed to the iframe.
     * @param {String} data.eventType - The event that the receiving end should handle.
     */
    var postMessage = function (data) {
        var iframeWindow;

        if (omnicheckoutIframe && typeof omnicheckoutDomain === 'string' && omnicheckoutDomain !== '') {
            iframeWindow = omnicheckoutIframe.contentWindow || omnicheckoutIframe.contentDocument;
            iframeWindow.postMessage(JSON.stringify(data), omnicheckoutDomain);
        }
    };

    /**
     * Handles error messages that are returned by AJAX calls.
     *
     * @param {Array} messages - An array of messages.
     */
    var handleAjaxErrors = function (messages) {
        messages.each(function (message) {
            alert(message);
        });
    };

    /**
     * Discount factory.
     *
     * @param {Object} config
     * @return {Object}
     */
    var discountFactory = function (config) {
        var i;
        var $this = {};

        /**
         * The discount coupon list.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * Takes a string, strips it of tags and replaces the content of the shipping element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {$this}
         */
        $this.updateHtml = function (content) {
            if ($this.element && typeof content === 'string') {
                $this.element.update(content.stripScripts());
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

    /**
     * Minicart factory.
     *
     * @param config
     * @return {Object}
     */
    var minicartFactory = function (config) {
        var i;
        var $this = {};

        /**
         * The product row.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * Takes a string, strips it of tags and replaces the content of the shipping element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {$this}
         */
        $this.updateHtml = function (content) {
            if ($this.element && typeof content === 'string') {
                $this.element.update(content.stripScripts());
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
                event: 'minicart:update-content',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        MEDIATOR.listen({
            event: 'minicart:update-content',
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

    /**
     * Shipping method factory.
     *
     * @param config
     * @returns {Object}
     */
    var shippingMethodFactory = function (config) {
        var i;
        var $this = {};
        var previousShippingMethod = null;

        /**
         * The product row.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * The selected radio button.
         *
         * @type {Element}
         */
        $this.selected = null;

        /**
         * Puts click handlers on the radio buttons. When clicking a radio button it will send the selected
         * shipping method to the server with an AJAX call.
         *
         * @returns {$this}
         */
        $this.setRadioHandlers = function () {
            var clickHandler = function () {
                if ($this.selected !== this) {
                    $this.select(this)
                        .pushShippingMethod();
                }
            };

            $this.getShippingMethodRadios()
                .each(function (radio) {
                    radio.observe('click', clickHandler);
                });

            return $this;
        };

        /**
         * Takes a string, strips it of tags and replaces the content of the shipping element with the html in the
         * string.
         *
         * @param {String} content
         * @returns {$this}
         */
        $this.updateHtml = function (content) {
            if ($this.element && typeof content === 'string') {
                $this.element.update(content);
            }

            return $this;
        };

        /**
         * Sets the selected radio.
         *
         * @param {Element} radio The radio button to select.
         * @returns {$this}
         */
        $this.select = function (radio) {
            if (radio.checked && radio !== $this.selected) {
                $this.selected = radio;
            }

            return $this;
        };

        /**
         * Fetches the
         * After an content update, this method selects the new radio button that has the same value as the old
         * radio button. If the option can't be found it will reset shipping.selected to null.
         *
         * @returns {$this}
         */
        $this.resetSelection = function () {
            var currentSelectedValue = null;

            if ($this.selected) {
                currentSelectedValue = $this.selected.value;
                $this.selected = null;

                $this.getShippingMethodRadios()
                    .each(function (radio) {
                        if (radio.checked || radio.value === currentSelectedValue) {
                            radio.checked = true;
                            $this.select(radio);
                            throw $break;
                        }
                    });
            }

            return $this;
        };

        /**
         * Returns an array of the shipping method radio buttons. If none are found, an empty array will be
         * returned.
         *
         * @returns {Array}
         */
        $this.getShippingMethodRadios = function () {
            return $this.element.select('input[name=shipping_method]') || [];
        };

        /**
         * Sends the selected shipping method to the server.
         *
         * @returns {$this}
         */
        $this.pushShippingMethod = function () {
            if ($this.selected && previousShippingMethod !== $this.selected.value) {
                $this.disable();

                previousShippingMethod = $this.selected.value;

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'index/saveShippingMethod',

                    parameters: {
                        shipping_method: $this.selected.value,
                        form_key: FORM_KEY
                    },

                    onSuccess: function (response) {
                        var data = response.responseJSON;

                        if (data.message.error.length) {
                            handleAjaxErrors(data.message.error);
                        }
                    },

                    onFailure: function (response) {
                        var data = response.responseJSON;
                    },

                    onComplete: function () {
                        $this.enable();
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        };

        /**
         * Disables the radio buttons.
         *
         * @returns {Object} $this.
         */
        $this.disable = function () {
            $this.getShippingMethodRadios().each(function (radio) {
                radio.disabled = true;
            });

            return $this;
        };

        /**
         * Enables the radio buttons.
         *
         * @returns {Object} $this.
         */
        $this.enable = function () {
            $this.getShippingMethodRadios().each(function (radio) {
                radio.disabled = false;
            });

            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'shipping:update-content',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        // Setting up mediator listeners.
        MEDIATOR.listen({
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

        // Applying configuration.
        for (i in config) {
            if ($this.hasOwnProperty(i)) {
                $this[i] = config[i];
            }
        }

        if ($this.element) {
            $this.setRadioHandlers();
        }

        return $this;
    };




    /**
     * User info factory.
     *
     * @param config
     * @return {object}
     */
    var userInfoFactory = function (config) {
        var i;
        var $this = {};
        var previousUserBilling = null;
        var previousUserShipping = null;

        /**
         * Sends the billing information to the server with an AJAX call.
         *
         * @param data {Object}
         * @return {$this}
         */
        $this.pushBillingInfo = function (data) {
            data.form_key = FORM_KEY;
            data.billing = JSON.stringify(data.billing);

            if (previousUserBilling !== data.billing) {
                previousUserBilling = data.billing;

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'index/saveBilling',
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
        };

        /**
         * Sends the shipping information to the server with an AJAX call. This method should only
         *
         * @param data {Object}
         * @return {$this}
         */
        $this.pushShippingInfo = function (data) {
            data.form_key = FORM_KEY;
            data.shipping = JSON.stringify(data.shipping);

            if (previousUserShipping !== data.shipping) {
                previousUserShipping = data.shipping;

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'index/saveShipping',

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
        };

        /**
         * Prepares the users billing information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} data
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        $this.prepareBillingInfo = function (data) {
            var info = {
                billing: {
                    street: [],
                    use_for_shipping: $this.useBillingForShipping(data) ? 1 : 0
                }
            };

            $H(data.address).each(function (pair) {
                switch (pair.key) {
                    case 'address': info.billing.street[0] = pair.value; break;
                    case 'addressExtra': info.billing.street[1] = pair.value; break;
                    default: info.billing[$this.getCorrectInfoName(pair.key)] = pair.value;
                }
            });

            return info;
        };

        /**
         * Prepares the users shipping information to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} data
         * @returns {Object} The corrected user information, ready to be sent to the server.
         */
        $this.prepareShippingInfo = function (data) {
            var info = {
                shipping: {
                    street: []
                }
            };

            $H(data.delivery).each(function (pair) {
                switch (pair.key) {
                    case 'address': info.shipping.street[0] = pair.value; break;
                    case 'addressExtra': info.shipping.street[1] = pair.value; break;
                    default: info.shipping[$this.getCorrectInfoName(pair.key)] = pair.value;
                }
            });

            return info;
        };

        /**
         * Check if a shipping address has been set.
         *
         * @param {Object} data
         * @returns {Boolean}
         */
        $this.useBillingForShipping = function (data) {
            return !data.hasOwnProperty('delivery');
        };

        /**
         * Takes a name of a property of user information and returns the corrected version of that property name.
         *
         * @param {String} name The name of the property to correct.
         * @returns {String}
         */
        $this.getCorrectInfoName = function (name) {
            var correctedName = '';

            switch (name) {
                case 'surname': correctedName = 'lastname'; break;
                case 'postal': correctedName = 'postcode'; break;
                case 'countryCode': correctedName = 'country_id'; break;
                default: correctedName = name;
            }

            return correctedName;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'user-info:change data',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        MEDIATOR.listen({
            event: 'user-info:change',
            identifier: $this,
            callback: function (data) {
                if ($this.useBillingForShipping(data)) {
                    $this.pushBillingInfo($this.prepareBillingInfo(data));
                }
                else {
                    $this.pushShippingInfo($this.prepareShippingInfo(data));
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

    /**
     * Payment method factory.
     *
     * @param {Object} config
     * @return {object}
     */
    var paymentMethodFactory = function (config) {
        var i;
        var $this = {};
        var previousPaymentData = null;

        /**
         * Sends the payment method to the server with an AJAX call.
         *
         * @param {Object} data
         * @return {$this}
         */
        $this.pushPaymentMethod = function (data) {
            data.form_key = FORM_KEY;
            data.payment = JSON.stringify(data.payment);

            if (previousPaymentData !== data.payment) {
                previousPaymentData = data.payment;

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'index/savePayment',
                    parameters: data,

                    onSuccess: function (response) {
                        var data = response.responseJSON;

                        if (data.message.error.length) {
                            handleAjaxErrors(data.message.error);
                        }
                    },

                    onFailure: function (response) {
                        var data = response.responseJSON;
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        };

        /**
         * Prepares the users payment method to be sent to the server. Can alter names and add properties
         * that the server expects to get.
         *
         * @param {Object} data
         * @returns {Object}
         */
        $this.preparePaymentInfo = function (data) {
            return {
                payment: {
                    method: data.method
                }
            };
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'payment-method:change',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        MEDIATOR.listen({
            event: 'payment-method:change',
            identifier: $this,
            callback: function (data) {
                $this.pushPaymentMethod($this.preparePaymentInfo(data));
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

    /**
     * Booking factory.
     *
     * @param config
     * @return {object}
     */
    var bookingFactory = function (config) {
        var i;
        var $this = {};

        /**
         * Returns the accepted terms and conditions. It will retrieve all checkboxes to see which are checked. If
         * a checkbox is checked they will have their value as key, and the number 1 as value. If a checkbox is not
         * checked, it will not be included in the returned object.
         *
         * @returns {Object} The accepted terms and conditions.
         */
        $this.getAcceptedTermsAndConditions = function () {
            var checkboxes = $$('#checkout-agreements input[type=checkbox]');
            var accepted = {};

            checkboxes.each(function (box) {
                if (box.checked) {
                    accepted[box.id.slice(-1)] = 1;
                }
            });

            return accepted;
        };

        /**
         * Checks with the server if the order is ready to be booked.
         *
         * @return {$this}
         */
        $this.bookOrder = function () {
            AJAX.queue({
                chain: 'omnicheckout',
                url: OMNICHECKOUT + 'index/saveOrder',

                parameters: {
                    agreement: JSON.stringify($this.getAcceptedTermsAndConditions()),
                    form_key: FORM_KEY
                },

                onSuccess: function (response) {
                    var data = response.responseJSON;

                    if (data.message.error.length) {
                        handleAjaxErrors(data.message.error);
                        postMessage({
                            eventType: 'omnicheckout:booking-order',
                            isOrderReady: false
                        });
                    }
                    else {
                        postMessage({
                            eventType: 'omnicheckout:booking-order',
                            isOrderReady: true
                        });
                    }
                },

                onFailure: function (response) {
                    var data = response.responseJSON;

                    postMessage({
                        eventType: 'omnicheckout:booking-order',
                        isOrderReady: false
                    });
                }
            })
                .run('omnicheckout');

            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'book-order',
                identifier: $this
            });

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        MEDIATOR.listen({
            event: 'book-order',
            identifier: $this,
            callback: function (data) {
                $this.bookOrder();
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

    /**
     * Creates Item instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var itemFactory = function (config) {
        var i;
        var $this = {};

        /**
         * The ID of the product.
         *
         * @type {String}
         */
        $this.id = null;

        /**
         * The product row.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * An ajax loader.
         *
         * @type {Object}
         */
        $this.ajaxLoader = null;

        /**
         * Removes the item element from the DOM and destroys the instance.
         */
        $this.remove = function () {
            MEDIATOR.broadcast('checkout:item-removed', {
                id: $this.id
            });

            $this.element.remove();

            $this.destroy();
        };

        /**
         * Disables the item row.
         *
         * @returns {Object} $this
         */
        $this.disable = function () {
            $this.element.style.opacity = 0.5;

            return $this;
        };

        /**
         * Enables the item row.
         *
         * @returns {Object} $this
         */
        $this.enable = function () {
            $this.element.style.opacity = 1;

            return $this;
        };

        /**
         * Updates the displayed price for the item.
         *
         * @param {String} content The new HTML for the price.
         * @returns {Object} $this
         */
        $this.updatePrice = function (content) {
            var priceEl;

            if (typeof content === 'string') {
                content = content.stripScripts();

                priceEl = !OMNICHECKOUT_LEGACY_SETUP ? $this.element.select('.product-cart-total .cart-price')[0] : $this.element.select('.cart-price')[1];

                if (priceEl) {
                    priceEl.update(content);
                }
            }

            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance, finally sets $this = null.
         */
        $this.destroy = function () {
            var i;

            MEDIATOR.ignore({
                event: 'checkout:item-remove-success',
                identifier: $this
            });

            MEDIATOR.ignore({
                event: 'checkout:item-quantity-update-pending',
                identifier: $this
            });

            MEDIATOR.ignore({
                event: 'checkout:item-remove-pending',
                identifier: $this
            });

            MEDIATOR.ignore({
                event: 'checkout:item-quantity-update-complete',
                identifier: $this
            });

            MEDIATOR.ignore({
                event: 'checkout:item-price-update',
                identifier: $this
            });

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

        $this.ajaxLoader = ajaxLoaderFactory({});

        MEDIATOR.listen({
            event: 'checkout:item-remove-success',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    $this.remove();
                }
            }
        });

        MEDIATOR.listen({
            event: 'checkout:item-quantity-update-pending',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    // $this.ajaxLoader.place($this.element);
                    $this.disable();
                }
            }
        });

        MEDIATOR.listen({
            event: 'checkout:item-remove-pending',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    // $this.ajaxLoader.place($this.element);
                    $this.disable();
                }
            }
        });

        MEDIATOR.listen({
            event: 'checkout:item-quantity-update-complete',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    $this.enable();
                }
            }
        });

        MEDIATOR.listen({
            event: 'checkout:item-price-update',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id && typeof data.element === 'string') {
                    $this.updatePrice(data.element);
                }
            }
        });

        return $this;
    };

    /**
     * Creates QuantityInput instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var quantityInputFactory = function (config) {
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
        $this.ajaxLoader = null;

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
                $this.ajaxLoader.place($this.element);

                MEDIATOR.broadcast('checkout:item-quantity-update-pending', {
                    id: $this.id
                });

                AJAX.queue({
                    url: OMNICHECKOUT + 'cart/update/id/' + $this.id + '/qty/' + quantity,
                    chain: 'omnicheckout',
                    parameters: {
                        itemId: $this.id,
                            itemQuantity: quantity,
                            form_key: FORM_KEY
                    },

                    onSuccess: function (response) {
                        var data = response.responseJSON;

                        if (data.message.error.length) {
                            handleAjaxErrors(data.message.error);
                        }
                        else {
                            if (data.item_total) {
                                MEDIATOR.broadcast('checkout:item-price-update', {
                                    id: $this.id,
                                    element: data.item_total
                                });
                            }

                            if (data.hasOwnProperty('elements')) {
                                MEDIATOR.broadcast('shipping:update-content', {
                                    content: data.elements['omnicheckout-shipping-methods-list']
                                });

                                MEDIATOR.broadcast('discount:update-content', {
                                    content: data.elements['current-coupon-code']
                                });

                                MEDIATOR.broadcast('minicart:update-content', {
                                    content: data.elements['header-cart']
                                });
                            }
                        }
                    },

                    onFailure: function (response) {
                        var data = response.responseJSON;

                        alert("Sorry, but we can't update quantity of the product at this moment. Please refresh and try again.");
                    },

                    onComplete: function () {
                        $this.enable();
                        $this.ajaxLoader.remove($this.element);

                        MEDIATOR.broadcast('checkout:item-quantity-update-complete', {
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
                $this.element.stopObserving('change', $this.pushQuantity);
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
                $this.element.observe('change', $this.pushQuantity);
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

            MEDIATOR.ignore({
                event: 'checkout:item-remove-pending',
                identifier: $this
            });

            MEDIATOR.ignore({
                event: 'checkout:item-removed',
                identifier: $this
            });

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
            $this.element.observe('change', $this.pushQuantity);
            $this.ajaxLoader = ajaxLoaderFactory({});
        }

        MEDIATOR.listen({
            event: 'checkout:item-remove-pending',
            identifier: $this,
            callback: function (data) {
                if (data.id === $this.id) {
                    $this.toggle(false);
                }
            }
        });

        MEDIATOR.listen({
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

    /**
     * Creates RemoveItemButton instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var removeItemButtonFactory = function (config) {
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
         * An click handler that blocks the event from reloading the page. It then disables the instance and
         * sends an AJAX request with information about the removed product.
         *
         * @param {Object} event
         */
        $this.preparePush = function (event) {
            $this
                .preventLink(event)
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

                    onSuccess: function (response) {
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

                    onFailure: function (response) {
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

    /**
     * Creates AjaxLoader instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var ajaxLoaderFactory = function (config) {
        var i;
        var $this = {};
        var placed = false;

        /**
         * The ajax loader element.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * Replaces the specified element with the ajax loader element.
         *
         * @param {Element} elementToReplace
         * @returns {Object} $this.
         */
        $this.place = function (elementToReplace) {
            if (!placed && elementToReplace) {
                elementToReplace.replace($this.element);
                placed = true;
            }

            return $this;
        };

        /**
         * Replaces the ajax loader element with the specified element.
         *
         * @param {Element} elementToInsert
         * @returns {Object} $this.
         */
        $this.remove = function (elementToInsert) {
            if (placed && elementToInsert) {
                $this.element.replace(elementToInsert);
                placed = false;
            }

            return $this;
        };

        /**
         * Destroys the instance. Removes any mediator events registered by this instance and sets all properties
         * of $this to null.
         */
        $this.destroy = function () {
            var i;

            $this.element.remove();

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

        if ($this.element === null) {
            $this.element = new Element('div', {
                className: 'omni-ajax-loader'
            });
        }

        return $this;
    };

    /**
     * Creates discountInput instances.
     *
     * @param {Object} config A configuration object.
     * @returns {Object}
     */
    var discountInputFactory = function (config) {
        var i;
        var $this = {};
        var disabled = false;

        /**
         * The discount input element.
         *
         * @type {Element}
         */
        $this.element = null;

        /**
         * An ajax loader.
         *
         * @type {Object}
         */
        $this.ajaxLoader = null;

        /**
         * Returns the value of the discount input element.
         *
         * @returns {Number}
         */
        $this.getCode = function () {
            return $this.element.value;
        };

        /**
         * Disables the discount input element and stops observing it of changes.
         *
         * @returns {Object} $this.
         */
        $this.disable = function () {
            if (!disabled) {
                disabled = true;
                $this.element.disabled = true;
                $this.element.stopObserving('blur', $this.pushCode);
            }

            return $this;
        },

        /**
         * Enables the discount input element and observes it of changes.
         *
         * @returns {Object} $this.
         */
        $this.enable = function () {
            if (disabled) {
                disabled = false;
                $this.element.disabled = false;
                $this.element.observe('blur', $this.pushCode);
            }

            return $this;
        },

        /**
         * Sends the discount code of the input element to the server with an AJAX call. On success, it will update the
         * mini cart with new HTML inside of #header-cart.
         *
         * @returns {Object} $this.
         */
        $this.pushCode = function () {
            var code;

            if (!disabled) {
                $this.disable();
                $this.ajaxLoader.place($this.element);

                code = $this.getCode();

                AJAX.queue({
                    chain: 'omnicheckout',
                    url: OMNICHECKOUT + 'cart/coupon/coupon_code/' + code,
                    parameters: {
                        coupon_code: code,
                        form_key: FORM_KEY
                    },

                    onSuccess: function (response) {
                        var data = response.responseJSON;

                        if (data.message.error.length) {
                            handleAjaxErrors(data.message.error);
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
                        }
                    },

                    onFailure: function (response) {
                        var data = response.responseJSON;
                    },

                    onComplete: function () {
                        $this.enable();
                        $this.ajaxLoader.remove($this.element);
                    }
                })
                    .run('omnicheckout');
            }

            return $this;
        }

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
            $this.element.observe('blur', $this.pushCode);
            $this.ajaxLoader = ajaxLoaderFactory({});
        }

        return $this;
    };

    return {
        /**
         * Initializes CHECKOUT.
         *
         * @returns {CHECKOUT}
         */
        init: function () {
            var $this = this;

            if (!initialized) {
                this.getQuantityInputs().each(function (input) {
                    var id = $this.getIdFromQuantityInput(input);
                    var itemElement = $this.getItemFromQuantityInput(input);

                    if (itemElement) {
                        itemFactory({
                            id: id,
                            element: itemElement
                        });
                    }

                    quantityInputFactory({
                        id: id,
                        element: input
                    });
                });

                this.getRemoveButtons().each(function (button) {
                    removeItemButtonFactory({
                        id: $this.getIdFromRemoveButton(button),
                        element: button
                    });
                });

                discountInputFactory({
                    element: $('coupon_code')
                });

                shippingMethodFactory({
                    element: $('omnicheckout-shipping-methods-list')
                });

                discountFactory({
                    element: $('current-coupon-code')
                });

                minicartFactory({
                    element: $('header-cart')
                });

                // Initialize user information instance, which handles incoming user information data from Omnicheckout.
                userInfoFactory({});

                // Initialize payment method instance, which handles incoming payment method data from Omnicheckout.
                paymentMethodFactory({});

                // Initialize booking instance, which handles incoming data about booking from Omnicheckout.
                bookingFactory({});

                // Add message listener.
                window.addEventListener('message', postMessageDelegator, false);

                omnicheckoutIframe = $$('#omni-checkout-container > iframe')[0];

                // Create the applications global AJAX queue.
                AJAX.createChain('omnicheckout');

                initialized = true;
            }

            return this;
        },

        /**
         * Returns an empty array or an array of the quantity inputs for every product in the cart.
         *
         * @returns {Array}
         */
        getQuantityInputs: function () {
            var qtyInputs = [];
            var regex = /cart\[\d+\]\[qty\]/g;
            var cartTable = $('shopping-cart-table');

            if (cartTable !== null) {
                qtyInputs = cartTable
                    .select('input[name*="qty"]')
                    .map(function (input) {
                        return input.name.match(regex) !== null ? input : null;
                    });
            }

            return qtyInputs;
        },

        /**
         * Returns an empty array or an array of the remove buttons for every product in the cart.
         *
         * @returns {Array}
         */
        getRemoveButtons: function () {
            var buttons = [];
            var cartTable = $('shopping-cart-table');

            if (cartTable !== null) {
                buttons = cartTable.select('td a.btn-remove.btn-remove2');
            }

            return buttons;
        },

        /**
         * Returns the id from a quantity input of a product.
         *
         * @param {Element} input
         * @returns {String}
         */
        getIdFromQuantityInput: function (input) {
            return input.name.match(/cart\[(\d+)\]/)[1];
        },

        /**
         * Returns the id from a remove button of a product.
         *
         * @param {Element} button
         * @returns {String}
         */
        getIdFromRemoveButton: function (button) {
            return button.href.match(/checkout\/cart\/delete\/id\/(\d+)/)[1];
        },

        /**
         * Get the product row element of a quantity input.
         *
         * @param {Element} input
         * @returns {Element}
         */
        getItemFromQuantityInput: function (input) {
            return input.up('tr') || null;
        }
    };
}());

var AJAX = (function () {
    var $this = {
        chains: {}
    };

    var ajaxChainFactory = function (config) {
        var $this = {};
        var running = false;
        var ongoingCall = null;

        /**
         * The onComplete callback for AJAX calls. Their callback gets replaced with this one but the original gets
         * fired inside of it.
         *
         * @param callObj
         * @returns {Function}
         */
        var onCallComplete = function (callObj) {
            var completeCallback = callObj.onComplete;

            return function () {
                var nextCall;

                if (typeof completeCallback === 'function') {
                    completeCallback();
                }

                $this.deleteCall(callObj.name);

                ongoingCall = null;

                if (running && $this.calls.queue.length > 0) {
                    nextCall = $this.calls.queue.shift();
                    nextCall.onComplete = onCallComplete(nextCall);
                    $this.call(nextCall);
                }
                else if ($this.calls.queue.length === 0) {
                    $this.stop();
                }
            };
        };

        /**
         * The queued calls.
         *
         * @type {Array}
         */
        $this.calls = {
            queue: []
        };

        /**
         * The name of the chain.
         *
         * @type {String}
         */
        $this.name = '';

        /**
         * Stops the queue from running.
         *
         * @returns {*} $this.
         */
        $this.stop = function () {
            running = false;

            return $this;
        };

        /**
         * Returns the call object with the specified callName. If an object can't be found, or the argument is missing,
         * it will return null.
         *
         * @param {String} callName
         * @return {Object|Null}
         */
        $this.getCall = function (callName) {
            return typeof callName === 'string' && $this.calls.hasOwnProperty(callName) ? $this.calls[callName] : null;
        };

        /**
         * Runs through the entire chain of calls.
         *
         * @return {Object} $this.
         */
        $this.run = function () {
            var nextCall;

            if ($this.calls.queue.length > 0 && !running) {
                running = true;
                nextCall = $this.calls.queue.shift();
                nextCall.onComplete = onCallComplete(nextCall);

                $this.call(nextCall);
            }

            return $this;
        };

        /**
         * Queues an AJAX call.
         *
         * @param {Object} obj
         * @param {String} obj.url - The URL to send the message to.
         * @param {Object} [obj.data] - An object with data to send with the call.
         * @param {Function} [obj.success] - A callback when the AJAX call has been successful.
         * @param {Function} [obj.failure] - A callback when the AJAX call has failed.
         * @param {Function} [obj.complete] - A callback when the AJAX call has completed.
         * @return {Object} $this.
         */
        $this.queue = function (obj) {
            if (obj.hasOwnProperty('url') && typeof obj.url === 'string') {
                if (obj.hasOwnProperty('name') && typeof obj.name === 'string') {
                    $this.saveCall(obj);
                }

                $this.calls.queue.push(obj);
            }

            return $this;
        };

        /**
         * Makes an AJAX call.
         *
         * @param {Object} callObj - The AJAX request. This object can hold any information relevant to the call.
         * @param {String} callObj.url - Where the call should be pointed to.
         * @param {*} [callObj.parameters] - Data that should be sent with the call.
         * @param {Function} [callObj.onSuccess] - A callback when the AJAX call has been successful.
         * @param {Function} [callObj.onFailure] - A callback when the AJAX call has failed.
         * @param {Function} [callObj.onComplete] - A callback when the AJAX call has completed.
         * @returns {Object} $this.
         */
        $this.call = function (callObj) {
            if (ongoingCall === null) {
                ongoingCall = {
                    call: callObj,
                    xhr: new Ajax.Request(callObj.url, callObj)
                };
            }

            return $this;
        };

        /**
         * Saves the call object for future use.
         *
         * @param {Object} callObj
         * @returns {*} $this.
         */
        $this.saveCall = function (callObj) {
            if ($this.calls.hasOwnProperty(callObj.name)) {
                throw Error('ajaxChainFactory saveCall(): The name [' + callObj.name + '] already exists in this chain.');
            }

            $this.calls[callObj.name] = callObj;

            return $this;
        };

        /**
         * Removes a saved call.
         *
         * @param callName
         * @returns {*} $this.
         */
        $this.deleteCall = function (callName) {
            if ($this.calls.hasOwnProperty(callName)) {
                delete $this.calls[callName];
            }

            return $this;
        };

        /**
         * Returns the running state of the chain.
         *
         * @returns {Boolean}
         */
        $this.isRunning = function () {
            return running;
        };

        /**
         * Destroys the AJAX-chain instance.
         */
        $this.destroy = function () {
            var i;

            running = null;
            ongoingCall = null;
            config = null;

            for (i in $this) {
                if ($this.hasOwnProperty(i)) {
                    $this[i] = null;
                }
            }
        };

        return $this;
    };

    /**
     * Creates a chain. A chain is a queue that you can add calls to.
     *
     * @param {String} name - The name of the chain.
     * @returns {Object} $this.
     */
    $this.createChain = function (name) {
        if ($this.chains.hasOwnProperty(name)) {
            throw Error('AJAX createChain(): Chain [' + name + '] is already created.');
        }

        $this.chains[name] = ajaxChainFactory({
            name: name
        });

        return $this;
    };

    /**
     * Removes a chain.
     *
     * @param {String} name
     * @returns {Object} $this.
     */
    $this.removeChain = function (name) {
        var chain;

        if (name === 'global') {
            throw Error('Toolbox [AJAX] removeChain(): The chain [global] may not be removed.');
        }

        chain = $this.chains[name];

        if (chain) {
            chain.destroy();

            delete $this.chains[name];
        }

        return $this;
    };

    /**
     * Returns a chain with the given name, the global chain if getGlobal is truthy and a chain can't be found, or
     * null if a chain can't be found at all.
     *
     * @param {String} name - The name of the chain.
     * @param {Boolean} [getGlobal] - Optional. If true, and if a chain with the given name can't be found, it will
     * return the global chain.
     * @returns {null|Object} - Null, if a chain can't be found, or either the chain with the given name or the
     * global chain depending on the value of the getGlobal argument.
     */
    $this.getChain = function (name, getGlobal) {
        var chain = $this.chains[name];

        if (getGlobal && !chain) {
            chain = $this.chains.global;
        }

        return chain ? chain : null;
    };

    /**
     * Queues an AJAX call.
     *
     * @param {Object} obj
     * @param {String} obj.url - The URL to send the message to.
     * @param {String} [obj.name] - The name of the call. This can be used later to perform actions on it.
     * @param {String} [obj.chain] - The queue to add to the call to. If not specified, the call will be put in the
     * default queue.
     * @param {Object} [obj.data] - An object with data to send with the call.
     * @param {Function} [obj.success] - A callback when the AJAX call has been successful.
     * @param {Function} [obj.failure] - A callback when the AJAX call has failed.
     * @param {Function} [obj.complete] - A callback when the AJAX call has completed.
     * @return {Object} $this.
     */
    $this.queue = function (obj) {
        var chain;

        if (obj.hasOwnProperty('url') && typeof obj.url === 'string') {
            if (obj.hasOwnProperty('chain') && typeof obj.chain === 'string') {
                chain = obj.chain;

                if (!$this.chains.hasOwnProperty(chain)) {
                    throw Error('AJAX queue(): Chain [' + chain + '] does not exist.');
                }

                delete obj.chain;

                $this.chains[chain].queue(obj);
            }
            else {
                $this.chains.global.queue(obj);
            }
        }

        return $this;
    };

    /**
     * Runs through an entire chain of calls.
     *
     * @param {String} chainName
     * @return {Object} $this.
     */
    $this.run = function (chainName) {
        var chain = $this.getChain(chainName);

        if (chain && !chain.isRunning()) {
            chain.run();
        }

        return $this;
    };

    /**
     * Returns the call object with the specified chainName and callName. If an object can't be found, or one of the
     * arguments are missing, it will return null.
     *
     * @param {String} chainName
     * @param {String} callName
     * @return {Object|Null}
     */
    $this.getCall = function (chainName, callName) {
        var call = null;
        var chain = null;

        if (typeof chainName === 'string' && typeof callName === 'string') {
            chain = $this.chains[chainName];

            if (chain) {
                call = chain.getCall(callName);
            }
        }

        return call;
    };

    // Creating the global chain.
    $this.createChain('global');

    return $this;
}());

/**
 * A mediator which delegates events to different parts of the application. You register events with
 * MEDIATOR.listen() and fire them with MEDIATOR.broadcast(). All events fire on a global scale.
 *
 * @type {Object}
 */
var MEDIATOR = (function () {
    var $this = {};

    /**
     * An object which holds all registered events and their callbacks. A callback will be stored like this:
     * listeners[event] = [{callback, identifier}]
     *
     * @type {Object}
     */
    $this.listeners = {};

    /**
     * Used to register events.
     *
     * @param {Object} obj An object with the event, an identifier and a callback.
     * @param {String} obj.event The name of the event.
     * @param {Function} obj.callback The callback for the event. It can take one argument of any value that
     * will be passed to it when fired with MEDIATOR.broadcast().
     * @param {*} obj.identifier An identifier of any value, but should be kept unique to whatever registered
     * the event. This is primarily used when removing events. Because several different objects can listen to
     * the same event, it is important that they can only remove the events they registered themselves. One good
     * way of keeping this value unique is to set it as an object, as they will always be unique.
     * @returns {Object} $this.
     */
    $this.listen = function (obj) {
        if (typeof obj.event === 'string' &&
            typeof obj.callback === 'function' &&
            obj.hasOwnProperty('identifier')) {
            if (!$this.listeners.hasOwnProperty(obj.event)) {
                $this.listeners[obj.event] = [];
            }

            $this.listeners[obj.event].push({
                callback: obj.callback,
                identifier: obj.identifier
            });
        }

        return $this;
    };

    /**
     * Broadcasts an event and passes an optional argument to the registered callbacks.
     *
     * @param {String} ev The name of the event to broadcast
     * @param {*} [arg] An optional argument to pass to the callbacks.
     * @returns {Object} $this.
     */
    $this.broadcast = function (ev, arg) {
        var listenerArr = $this.listeners[ev];

        if (listenerArr) {
            listenerArr.each(function (eventObj) {
                eventObj.callback(arg);
            });
        }

        return $this;
    };

    /**
     * Removes callbacks from registered events.
     *
     * @param {Object} obj
     * @param {String} obj.event The name of the event.
     * @param {Function} [obj.callback] Optional. A callback that was registered to the event.
     * @param {*} obj.identifier The identifier used to register the callback to the event.
     * @returns {Object} $this.
     */
    $this.ignore = function (obj) {
        var i, eventObj;
        var listenerArr = $this.listeners[obj.event];

        if (listenerArr) {
            for (i = 0; i < listenerArr.length; ++i) {
                eventObj = listenerArr[i];

                if (eventObj.identifier === obj.identifier) {
                    if (typeof obj.callback !== 'function') {
                        listenerArr.splice(i, 1);
                        i -= 1;
                    }
                    else if (obj.callback === eventObj.callback) {
                        listenerArr.splice(i, 1);
                        i -= 1;
                    }
                }
            }
        }

        return $this;
    };

    return $this;
}());

CHECKOUT.init();